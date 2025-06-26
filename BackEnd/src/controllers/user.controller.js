import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "./../models/user.model.js";
import crypto from "crypto";
import { sendOtp, verifyOtp } from "../utils/otpService.js";
import { Property } from "./../models/property.model.js";

// Generates access and refresh tokens for a user
const generateAccessandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

// Use an object for OTP storage (instead of an array)
let otpStorage = {};

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, password, phone, address } = req.body;

  if ([fullname, email, password, phone].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { phone }],
  });
  if (existedUser) throw new ApiError(400, "User already exist");

  // Upload avatar only if a file was provided
  let avatarUrl = "";
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  if (avatarLocalPath) {
    const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
    avatarUrl = uploadedAvatar?.url || "";
  }

  const user = await User.create({
    fullname,
    email,
    password,
    phone,
    avatar: avatarUrl,
    address,
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser)
    throw new ApiError(400, "Something went wrong during user registration");

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, phone, password, otp } = req.body;

  if (!email && !phone) {
    throw new ApiError(400, "Email or phone is required to login");
  }

  // Handle Phone-based OTP Login
  if (phone) {
    const user = await User.findOne({ phone });
    if (!user) {
      throw new ApiError(400, "Invalid phone number.");
    }

    if (otp) {
      // Verify the provided OTP
      const otpEntry = otpStorage[phone];
      if (!otpEntry) {
        throw new ApiError(400, "OTP not sent or expired.");
      }
      if (otpEntry.otp !== otp) {
        throw new ApiError(400, "Invalid OTP.");
      }
      if (otpEntry.expiresAt < Date.now()) {
        delete otpStorage[phone];
        throw new ApiError(400, "OTP has expired.");
      }
      // OTP verified – remove it and log the user in
      delete otpStorage[phone];

      const { accessToken, refreshToken } = await generateAccessandRefreshToken(user._id);
      const loggedInUser = await User.findById(user._id).select("-password");
      const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      };


      user.lastLogin = new Date();
      user.isActive = true;
      await user.save({ validateBeforeSave: false });

      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
          new ApiResponse(
            200,
            { user: loggedInUser, accessToken, refreshToken },
            "User logged in successfully"
          )
        );
    } else {
      // No OTP provided – send one
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      otpStorage[phone] = { otp: generatedOtp, expiresAt: Date.now() + 5 * 60 * 1000 };
      await sendOtp(phone, generatedOtp);
      return res
        .status(200)
        .json(new ApiResponse(200, null, "OTP sent successfully."));
    }
  }

  // Handle Email/Password Login
  if (email) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(400, "Invalid credentials");
    }

    const isValid = await user.isPasswordCorrect(password);
    if (!isValid) {
      throw new ApiError(400, "Password not correct");
    }

    const { accessToken, refreshToken } = await generateAccessandRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password");
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };


    user.lastLogin = new Date();
    user.isActive = true;
    await user.save({ validateBeforeSave: false });
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { user: loggedInUser, accessToken, refreshToken },
          "User logged in successfully"
        )
      );
  }

  throw new ApiError(400, "Either email or phone is required");
});

import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new ApiError(400, "Google token is required");
  }

  try {
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Check if the user already exists; if not, create one
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        fullname: name,
        email,
        avatar: picture,
        isGoogleUser: true,
      });
    }

    const { accessToken, refreshToken } = await generateAccessandRefreshToken(user._id);
    const options = { httpOnly: true, secure: true };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { user, accessToken, refreshToken },
          "Google login successful"
        )
      );
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw new ApiError(400, "Invalid Google token");
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  //if user is not attached
  if (!req.user) {
    return res.status(401).json(new ApiResponse(401, {}, "User not authenticated"));
}//

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: null } },
    { new: true }
  );
  const options = { httpOnly: true, secure: true };

  user.isActive = false;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!newPassword || !oldPassword)
    throw new ApiError(404, "Both passwords are required");

  const user = await User.findById(req.user?._id);
  if (!user) throw new ApiError(404, "User not found");

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) throw new ApiError(402, "Invalid old password");

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  console.log("hi");
  console.log(req.file)
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar || !avatar.url) {
    throw new ApiError(400, "Avatar upload failed");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { avatar: avatar.url } },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated"));
});

const updateUser = asyncHandler(async (req, res) => {
  const { fullname, phone, role, otp } = req.body;
  const userId = req.user._id;
  if (!userId) throw new ApiError(404, "Unauthorized access");

  const user = await User.findById(userId);
  if (!user) throw new ApiError(400, "User not found");

  if (role && req.user.role !== "admin")
    throw new ApiError(402, "Access denied");

  if (phone) {
    if (otp) {
      const otpEntry = otpStorage[phone];
      if (!otpEntry) {
        throw new ApiError(400, "OTP not sent or expired.");
      }
      if (otpEntry.otp !== otp) {
        throw new ApiError(400, "Invalid OTP.");
      }
      if (otpEntry.expiresAt < Date.now()) {
        delete otpStorage[phone];
        throw new ApiError(400, "OTP has expired.");
      }
      delete otpStorage[phone];
      user.phone = phone;
    } else {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      otpStorage[phone] = { otp: generatedOtp, expiresAt: Date.now() + 5 * 60 * 1000 };
      await sendOtp(phone, generatedOtp);
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            null,
            "OTP sent successfully. Please verify."
          )
        );
    }
  }

  user.fullname = fullname || user.fullname;
  if (role && user.role === "admin") user.role = role;
  const savedUser = await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, savedUser, "Updated successfully"));
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
    .select("-password -refreshToken")
    .exec();

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully."));
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Only admin can delete users.");
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) throw new ApiError(404, "User not found.");

  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User deleted successfully."));
});

const getProfile = asyncHandler(async (req, res) => {
  const {userId} = (req.params);
  const user = await User.findById(userId)
    .select("-password -refreshToken -lastLogin")
    .exec();
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // const boughtProperties = await Property.find({ owner: userId, status: "bought" })
  //   .select("title price location status");
  // const soldProperties = await Property.find({ owner: userId, status: "sold" })
  //   .select("title price location status");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          ...user.toObject(),
          // lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleString() : null,
          // isActive: user.isActive,
        },
        // boughtProperties,
        // soldProperties,
      },
      "User fetched successfully"
    )
  );
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"));
});

const updateProfile = asyncHandler(async (req, res) => {
  const { fullname, phone, address } = req.body;
  const userId = req.user._id;
  
  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Handle text fields
  if (fullname) user.fullname = fullname;
  if (phone) user.phone = phone;
  
  // Handle address
  if (address) {
    user.address = {
      street: address.street || (user.address?.street || ''),
      city: address.city || (user.address?.city || ''),
      state: address.state || (user.address?.state || ''),
      postalCode: address.postalCode || (user.address?.postalCode || ''),
    };
  }

  // Handle avatar upload if file exists
  if (req.file) {
    // Delete old avatar if exists
    if (user.avatar) {
      await cloudinary.uploader.destroy(user.avatar);
    }
    
    // Upload new avatar to Cloudinary
    const result = await uploadOnCloudinary(req.file.path, {
      folder: 'avatars',
      width: 150,
      height: 150,
      crop: 'fill',
    });

    user.avatar = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  await user.save({ validateBeforeSave: false });
  
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile updated successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getAllUsers,
  deleteUser,
  updateUser,
  updatePassword,
  updateUserAvatar,
  getProfile,
  generateAccessandRefreshToken,
  getCurrentUser,
  googleLogin,
  updateProfile,
};
