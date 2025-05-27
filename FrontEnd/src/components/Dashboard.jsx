import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Edit, Trash2, MapPin, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const Dashboard = () => {
  const [listedProperties, setListedProperties] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState(null); // Track which dropdown is open
  const user = useSelector((state) => state.auth.userData);

  useEffect(() => {
    const fetchListedProperties = async () => {
      try {
        const response = await axios.get("http://localhost:3000/property/my-listings", {
          withCredentials: true,
        });
        setListedProperties(response.data.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching properties:", err);
        setError("Failed to load properties. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchListedProperties();
  }, []);

  const handleDeleteProperty = async (propertyId) => {
    try {
      await axios.delete(`http://localhost:3000/property/delete/${propertyId}`, {
        withCredentials: true,
      });
      setListedProperties(prev => prev.filter(p => p._id !== propertyId));
      setError(null);
    } catch (err) {
      console.error("Error deleting property:", err);
      setError("Failed to delete property. Please try again.");
    }
  };

  const handleChangeStatus = async (propertyId, newStatus) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/property/${propertyId}/change-status`,
        { status: newStatus },
        { withCredentials: true }
      );

      setListedProperties(prev => prev.map(p => 
        p._id === propertyId ? response.data.data : p
      ));
      setError(null);
      setOpenDropdownId(null); // Close the dropdown after status change
    } catch (err) {
      console.error("Error changing status:", err);
      setError("Failed to update property status. Please try again.");
    }
  };

  const toggleDropdown = (propertyId) => {
    setOpenDropdownId(openDropdownId === propertyId ? null : propertyId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800">
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 min-h-screen"
    >
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-center mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/20"
        >
          {error}
        </motion.div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header Section */}
        <motion.div
          variants={itemVariants}
          className="flex items-center space-x-6 mb-8 p-6 bg-white dark:bg-gray-700 rounded-2xl shadow-lg"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-3xl font-bold text-blue-600 dark:text-blue-200">
                {user?.fullname?.charAt(0).toUpperCase()}
              </div>
            )}
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {user?.fullname || "User"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{user?.email}</p>
          </div>
        </motion.div>

        {/* Personal Details Section */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-gray-700 shadow-lg rounded-xl p-6 mb-8"
        >
          <h2 className="text-xl font-semibold mb-4 border-b pb-2 border-gray-200 dark:border-gray-600">
            Personal Details
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600/30">
              <span className="font-medium">Name:</span>
              <span>{user?.fullname || "N/A"}</span>
            </div>
            <div className="flex justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600/30">
              <span className="font-medium">Email:</span>
              <span>{user?.email || "N/A"}</span>
            </div>
            <div className="flex justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600/30">
              <span className="font-medium">Phone:</span>
              <span>{user?.phone || "N/A"}</span>
            </div>
            <div className="flex justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600/30">
              <span className="font-medium">Address:</span>
              <span>
                {user?.address && typeof user.address === 'object'
                  ? `${user.address.street}, ${user.address.city}, ${user.address.state} ${user.address.postalCode}`
                  : user?.address || "N/A"}
              </span>

            </div>
            <div className="flex justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600/30">
      <span className="font-medium">Last Login:</span>
      <span>
        {user?.lastLogin
          ? new Date(user.lastLogin).toLocaleString()
          : "N/A"}
      </span>
    </div>
          </div>
        </motion.div>

        {/* Listed Properties Section */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-gray-700 shadow-lg rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Your Listings</h2>
            <Link
              to="/add-properties"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add New Property
            </Link>
          </div>

          <AnimatePresence>
            {listedProperties.length === 0 ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center text-gray-600 dark:text-gray-400 py-12"
              >
                No properties listed yet. Start by adding a new property!
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listedProperties.map((property, index) => (
                  <motion.div
                    key={property._id}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative bg-white dark:bg-gray-600 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                  >
                    {/* Action Buttons */}
                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                      <div className="relative">
                        <button
                          onClick={() => toggleDropdown(property._id)}
                          className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm flex items-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <span className="mr-1">
                            {property.status === 'for sale' && 'For Sale'}
                            {property.status === 'sold' && 'Sold'}
                            {property.status === 'for rent' && 'For Rent'}
                            {property.status === 'rented' && 'Rented'}
                          </span>
                          <ChevronDown size={16} />
                        </button>

                        {/* Dropdown Menu */}
                        {openDropdownId === property._id && (
                          <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 rounded-lg shadow-lg z-20">
                            <button
                              onClick={() => handleChangeStatus(property._id, 'for sale')}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              For Sale
                            </button>
                            <button
                              onClick={() => handleChangeStatus(property._id, 'sold')}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              Sold
                            </button>
                            <button
                              onClick={() => handleChangeStatus(property._id, 'for rent')}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              For Rent
                            </button>
                            <button
                              onClick={() => handleChangeStatus(property._id, 'rented')}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              Rented
                            </button>
                          </div>
                        )}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteProperty(property._id)}
                        className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg shadow-sm hover:bg-red-200 dark:hover:bg-red-800/30 transition-colors"
                      >
                        <Trash2 className="text-red-500" size={20} />
                      </motion.button>
                    </div>

                    {/* Property Image */}
                    <Link 
                      to={`/property/${property._id}`}
                      className="block h-48 overflow-hidden rounded-t-xl"
                    >
                      <img
                        src={property.images?.[0] || '/default-property.jpg'}
                        alt={property.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </Link>

                    {/* Property Details */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold truncate">
                          {property.title}
                        </h3>
                        <Link
                          to={`/settings`}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-500/30 rounded-md"
                        >
                          <Edit size={18} className="text-blue-500" />
                        </Link>
                      </div>

                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                        ₹{property.price?.toLocaleString()}
                      </p>

                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                        <MapPin size={16} className="mr-1" />
                        <span className="truncate">{property.address}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className={`px-2 py-1 rounded-full ${property.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400'
                        }`}>
                          {property.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {new Date(property.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;