import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { updateUserData } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  const userData = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    if (userData) {
      setValue("fullname", userData.fullname || "");
      setValue("email", userData.email || "");
      setValue("phone", userData.phone || "");
      setValue("address.street", userData.address?.street || "");
      setValue("address.city", userData.address?.city || "");
      setValue("address.state", userData.address?.state || "");
      setValue("address.postalCode", userData.address?.postalCode || "");
    }
  }, [userData, setValue]);

  const onSubmit = async (data) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/users/update-profile`,
        data,
        { withCredentials: true }
      );
      if (response.status === 200) {
        dispatch(updateUserData(response.data));
        navigate("/profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 p-4">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Edit Profile</h1>
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

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;