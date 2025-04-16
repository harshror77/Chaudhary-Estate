import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Login from "./Login"; // Your updated Login component
import Signup from "./SignUp.jsx"; // Your Signup component
import { Link } from "react-router-dom";
const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const showAuthModal = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 relative">
      {/* Blur Overlay */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-10"
            onClick={() => navigate("/")}
          />
        )}
      </AnimatePresence>

      {/* Auth Modals */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-full max-w-md"
          >
            {location.pathname === "/login" ? <Login /> : <Signup />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Navigation */}
        <nav className="flex justify-between items-center mb-16">
          <Link to="/" className="text-3xl font-bold text-gray-800">
            ChoudharyEstate
          </Link>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition duration-300"
            >
              Sign Up
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="text-center mb-24">
          <h1 className="text-6xl font-bold text-gray-800 mb-6">
            Find Your Dream Property
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover premium real estate opportunities with our curated selection
            of luxury properties across the globe.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg text-lg hover:bg-blue-600 transition duration-300"
            >
              Get Started
            </button>
          </div>
        </section>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {["Luxury Selection", "Expert Agents", "Secure Transactions"].map(
            (feature, index) => (
              <div
                key={feature}
                className="bg-white p-6 rounded-xl shadow-lg text-center"
              >
                <div className="text-4xl mb-4 text-blue-500">
                  {["🏰", "👔", "🔒"][index]}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature}</h3>
                <p className="text-gray-600">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;