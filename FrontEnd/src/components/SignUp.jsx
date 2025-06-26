import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const Signup = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("fullname", data.fullname);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("phone", data.phone);
    if (data.address.street) formData.append("address[street]", data.address.street);
    if (data.address.city) formData.append("address[city]", data.address.city);
    if (data.address.state) formData.append("address[state]", data.address.state);
    if (data.address.postalCode) formData.append("address[postalCode]", data.address.postalCode);
    if (avatar) formData.append("avatar", avatar);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/users/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        navigate("/login");
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Error during registration:", err);
      setError(err.response?.data?.message || "An error occurred during registration. Please try again.");
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) setAvatar(file);
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/users/google-login`, {
        token: credentialResponse.credential,
      });

      if (response.status === 200) {
        navigate("/profile/edit"); // Redirect to edit profile page
      }
    } catch (error) {
      console.error("Error during Google login:", error);
      setError("Failed to sign in with Google. Please try again.");
    }
  };

  const handleGoogleLoginFailure = () => {
    setError("Google login failed. Please try again.");
  };

  return (
    <GoogleOAuthProvider clientId="481669871535-2dh0do2vbu9scttfnmp56l8c2chguca0.apps.googleusercontent.com">
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-lg rounded-lg w-full max-w-md overflow-hidden"
        >
          <div className="p-8">
            <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Sign Up</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Fullname Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  {...register("fullname", { required: "Full name is required" })}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    errors.fullname ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter your full name"
                />
                {errors.fullname && <p className="text-red-500 text-sm mt-1">{errors.fullname.message}</p>}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  {...register("email", { required: "Email is required" })}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter your email"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  {...register("phone", { required: "Phone number is required" })}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter your phone number"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
              </div>

              {/* Address Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  {...register("address.street")}
                  className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Street"
                />
                <input
                  type="text"
                  {...register("address.city")}
                  className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                  placeholder="City"
                />
                <input
                  type="text"
                  {...register("address.state")}
                  className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                  placeholder="State"
                />
                <input
                  type="text"
                  {...register("address.postalCode")}
                  className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                  placeholder="Postal Code"
                />
              </div>

              {/* Avatar Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Avatar</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {avatar && (
                  <img
                    src={URL.createObjectURL(avatar)}
                    alt="Avatar Preview"
                    className="w-16 h-16 rounded-full mt-2"
                  />
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password", { required: "Password is required" })}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-gray-500 hover:text-blue-500"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
              </div>

              {/* Error Message */}
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
                >
                  Sign Up
                </button>
              </div>
            </form>

            {/* Google Sign-In Button */}
            <div className="mt-6">
              <div className="flex items-center justify-center">
                <div className="border-t border-gray-300 flex-grow"></div>
                <span className="mx-4 text-gray-500">OR</span>
                <div className="border-t border-gray-300 flex-grow"></div>
              </div>
              <div className="mt-4 flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginFailure}
                />
              </div>
            </div>

            {/* Redirect to Login */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-500 hover:text-blue-600">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Signup;