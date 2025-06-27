import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { motion } from "framer-motion";
import {login} from '../store/authSlice.js'
import { useDispatch } from 'react-redux';

const Login = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      phone: "",
      email: "",
      password: ""
    }
  });
  const dispatch = useDispatch();
  const [loginMethod, setLoginMethod] = useState("email"); // 'email' or 'phone'
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Handle email/password login
  const onSubmit = async (data) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/users/login`, data, {
        withCredentials: true,
      });
      
      if (response.status === 200) {
        dispatch(login(response))
        //console.log(response)
        // After successful login
        console.log(response.data.data.accessToken)
        localStorage.setItem('token', response.data.data.accessToken); // Store the token in localStorage
        navigate("/"); // Redirect to home after successful login
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Login failed. Please try again.");
    }
  };

  // Handle phone login (send OTP)
  const handlePhoneLogin = async (phone) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/users/login/send-otp`, {
        phone,
      },{withCredentials: true});
      if (response.status === 200) {
        setOtpSent(true); // Show OTP input field
        setErrorMessage("");
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to send OTP. Please try again.");
    }
  };
  
  // Handle OTP verification
  const handleOtpVerification = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/users/login/verify-otp`, {
        phone: watch("phone"),
        otp,
      },{withCredentials: true});
      console.log(response)
      if (response.status === 200) {
        dispatch(login(response))
        // After successful login
        localStorage.setItem('token', response.data.token); // Store the token in localStorage
        navigate("/"); // Redirect to home after successful login
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Invalid OTP. Please try again.");
    }
  };

  // Handle Google login
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/users/google-login`, {
        token: credentialResponse.credential,
      });
      if (response.status === 200) {
        dispatch(login(response))
        // After successful login
        localStorage.setItem('token', response.data.data.accessToken); // Store the token in localStorage
        navigate("/"); // Redirect to home after successful login
      }
    } catch (error) {
      setErrorMessage("Failed to sign in with Google. Please try again.");
    }
  };

  const handleGoogleLoginFailure = () => {
    setErrorMessage("Google login failed. Please try again.");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-md mx-auto"
    >
      <h2 className="text-3xl font-bold mb-8 text-center">Welcome Back</h2>

      {/* Toggle between email and phone login */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setLoginMethod("email")}
          className={`px-4 py-2 rounded-l-lg ${
            loginMethod === "email" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Email
        </button>
        <button
          onClick={() => setLoginMethod("phone")}
          className={`px-4 py-2 rounded-r-lg ${
            loginMethod === "phone" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Phone
        </button>
      </div>

      {/* Email/Password Login Form */}
      {loginMethod === "email" && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              {...register("email", { required: "Email is required" })}
              className="w-full p-3 border rounded-lg"
              type="email"
              value={watch("email") || ""}
            />
            {errors.email && (
              <p className="text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              {...register("password", { required: "Password is required" })}
              className="w-full p-3 border rounded-lg"
              type="password"
              value={watch("password") || ""}
            />
            {errors.password && (
              <p className="text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Sign In
          </button>
        </form>
      )}

      {/* Phone Login Form */}
      {loginMethod === "phone" && (
        <div className="space-y-6">
          {!otpSent ? (
            <>
              <div>
                <label className="block text-gray-700 mb-2">Phone Number</label>
                <input
                  {...register("phone", { required: "Phone number is required" })}
                  className="w-full p-3 border rounded-lg"
                  type="text"
                  value={watch("phone") || ""}
                />
                {errors.phone && (
                  <p className="text-red-500 mt-1">{errors.phone.message}</p>
                )}
              </div>

              <button
                onClick={handleSubmit((data) => handlePhoneLogin(data.phone))}
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300"
              >
                Send OTP
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-gray-700 mb-2">Enter OTP</label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  type="text"
                />
              </div>

              <button
                onClick={handleOtpVerification}
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300"
              >
                Verify OTP
              </button>
            </>
          )}
        </div>
      )}

      {/* Google Login */}
      <div className="mt-6">
        <div className="flex items-center justify-center mb-4">
          <div className="border-t border-gray-300 flex-grow"></div>
          <span className="mx-4 text-gray-500">OR</span>
          <div className="border-t border-gray-300 flex-grow"></div>
        </div>
        <div className="flex justify-center">
          <GoogleOAuthProvider clientId="481669871535-2dh0do2vbu9scttfnmp56l8c2chguca0.apps.googleusercontent.com">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginFailure}
            />
          </GoogleOAuthProvider>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <p className="text-red-500 text-center mt-4">{errorMessage}</p>
      )}

      {/* Sign Up Link */}
      <div className="mt-6 text-center">
        <span className="text-gray-600">Don't have an account? </span>
        <button
          onClick={() => navigate("/signup")}
          className="text-blue-500 hover:underline"
        >
          Sign Up
        </button>
      </div>
    </motion.div>
  );
};

export default Login;
