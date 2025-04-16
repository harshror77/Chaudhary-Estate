import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Camera } from "lucide-react";
import axios from "axios";
import { updateUserData } from "../store/authSlice.js";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
const Profile = () => {
  const navigate = useNavigate()
  const { avatar } = useSelector((state) => state.auth.userData);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const dispatch = useDispatch();

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedAvatar(e.target.files[0]);
    }
  };

  const handleSaveAvatar = async () => {
    if (!selectedAvatar) {
      alert("Please select an avatar to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", selectedAvatar);

    try {
      const response = await axios.put("http://localhost:3000/users/avatar", formData, {
        withCredentials: true,
      });
      dispatch(updateUserData(response.data.data));
      alert("Avatar updated successfully");
      navigate("/")
    } catch (error) {
      console.log("Failed to update avatar:", error);
    }
  };

  return (
    <motion.div
      className="max-w-md mx-auto p-6 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white shadow-lg rounded-lg mt-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-center mb-6">Update Your Avatar</h2>
      <div className="flex flex-col items-center">
        <div className="relative">
          <motion.img
            src={selectedAvatar ? URL.createObjectURL(selectedAvatar) : avatar}
            alt="User Avatar"
            className="w-32 h-32 rounded-full border-4 border-white shadow-md"
            whileHover={{ scale: 1.1 }}
          />
          <label
            htmlFor="avatar-input"
            className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-indigo-700"
          >
            <Camera className="w-6 h-6" />
          </label>
          <input
            id="avatar-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <motion.button
          className="mt-6 px-6 py-2 bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 transition duration-300 shadow-lg"
          onClick={handleSaveAvatar}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Save New Avatar
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Profile;