import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUserData } from "../store/authSlice";
import { motion } from "framer-motion";
import axios from "axios";

const Settings = () => {
  const userData = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();
  
  // Initialize formData with proper fallbacks for all fields
  const [formData, setFormData] = useState({
    fullname: userData?.fullname || "",
    email: userData?.email || "",
    phone: userData?.phone || "",
    profileImage: userData?.avatar || "",
    address: {
      street: userData?.address?.street || "",
      city: userData?.address?.city || "",
      state: userData?.address?.state || "",
      postalCode: userData?.address?.postalCode || "",
    },
  });

  console.log(userData)

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        alert("File size should be less than 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, profileImage: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formPayload = new FormData();
      
      // Append all fields to formData
      formPayload.append("fullname", formData.fullname);
      formPayload.append("email", formData.email);
      formPayload.append("phone", formData.phone);
      formPayload.append("address", JSON.stringify(formData.address));
      
      // Handle image upload if exists
      if (formData.profileImage && typeof formData.profileImage !== "string") {
        const blob = await fetch(formData.profileImage).then(r => r.blob());
        formPayload.append("avatar", blob, "profile.jpg");
      } else if (formData.profileImage === "") {
        formPayload.append("removeAvatar", "true");
      }

      const response = await axios.patch(
        "http://localhost:3000/users/update-profile", 
        formPayload, 
        {
          withCredentials: true,
          headers: { 
            "Content-Type": "multipart/form-data",
          },
        }
      );

      dispatch(updateUserData(response.data.data));
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(error.response?.data?.message || "Error updating profile");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Account Settings</h1>
        
        {/* Profile Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Profile Picture */}
          <div className="lg:col-span-1">
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Profile Picture</h2>
              
              <div className="flex flex-col items-center">
                <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg mb-4">
                  {formData.profileImage ? (
                    <img
                      src={formData.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                      <span className="text-4xl font-bold text-gray-400 dark:text-gray-300">
                        {userData?.fullname?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 mt-4">
                  <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200">
                    <span>Change</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {formData.profileImage && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-lg transition duration-200"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
                  JPG, GIF or PNG. Max size of 2MB
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Profile Form */}
          <div className="lg:col-span-2">
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Profile Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullname"
                      value={formData.fullname || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                      placeholder="Your email address"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Address Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={formData.address.street || ""}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                        placeholder="123 Main St"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.address.city || ""}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                        placeholder="New York"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        State/Province
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.address.state || ""}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                        placeholder="California"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        ZIP/Postal Code
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.address.postalCode || ""}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-200"
                        placeholder="10001"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;