import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Slide } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";

const propertyImages = [
  "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1600210492493-0946911123ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
];

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const showAuthModal = location.pathname === "/login" || location.pathname === "/signup";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const slideProperties = {
    duration: 3000, // Reduced from default 5000ms
    transitionDuration: 500, // Faster transition
    infinite: true,
    indicators: true,
    arrows: true,
    pauseOnHover: true,
    onChange: (oldIndex, newIndex) => {
      console.log(`Slide transition from ${oldIndex} to ${newIndex}`);
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 relative overflow-x-hidden">
      {/* Blur Overlay for Auth Modals */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-10"
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
      <motion.div
        className="container mx-auto px-6 py-16 relative z-30"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Navigation */}
        <motion.nav className="flex justify-between items-center mb-20" variants={itemVariants}>
          <Link to="/" className="text-4xl font-extrabold text-gray-900 hover:text-blue-600 transition-colors">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              ChoudharyEstate
            </motion.span>
          </Link>
          <motion.div className="flex gap-6" variants={itemVariants}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors"
              onClick={() => navigate("/login")}
            >
              Login
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition-colors"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </motion.button>
          </motion.div>
        </motion.nav>

        {/* Hero Section */}
        <motion.section className="text-center mb-32" variants={containerVariants}>
          <motion.h1
            className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight"
            variants={itemVariants}
          >
            Discover Your <span className="text-blue-600">Perfect</span> Home
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto"
            variants={itemVariants}
          >
            Explore our exclusive collection of luxury properties and find your dream home with ease and confidence.
          </motion.p>
          <motion.div className="flex justify-center gap-6" variants={itemVariants}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 bg-blue-600 text-white rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors"
              onClick={() => navigate("/login")}
            >
              Start Exploring
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 bg-transparent border-2 border-blue-600 text-blue-600 rounded-full text-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors"
              onClick={() => navigate("/signup")}
            >
              Create Account
            </motion.button>
          </motion.div>
        </motion.section>

        {/* Features Grid */}
        <motion.div className="grid md:grid-cols-3 gap-10 mb-24" variants={containerVariants}>
          {[
            { title: "Premium Properties", icon: "🏡", desc: "Browse our handpicked selection of luxury homes and estates." },
            { title: "Expert Guidance", icon: "🤝", desc: "Our experienced agents provide personalized support every step of the way." },
            { title: "Trusted Transactions", icon: "🔒", desc: "Secure and transparent processes for peace of mind." },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-white p-8 rounded-2xl shadow-xl text-center hover:shadow-2xl transition-all"
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className="text-5xl mb-4 text-blue-600">{feature.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Improved Slideshow Section */}
        <div className="w-full mb-24">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">Featured Luxury Properties</h2>
          <div className="h-[70vh] w-full rounded-2xl overflow-hidden shadow-2xl">
            <Slide {...slideProperties}>
              {propertyImages.map((image, index) => (
                <div key={index} className="h-[70vh] w-full">
                  <img 
                    src={image} 
                    alt={`Luxury Property ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </Slide>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;