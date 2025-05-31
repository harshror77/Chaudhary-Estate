import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { Link, Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Menu,
  X,
  User,
  LogIn,
  Settings,
  Home,
  LogOut,
  Search,
  Bell,
  Heart,
  Moon,
  Sun,
  Banknote,
  MessageCircleMore
} from "lucide-react";
import { logout } from "../../store/authSlice.js";

const Header = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [location, setLocation] = useState('');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('');


  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth.userData);
  const status = useSelector((state) => state.auth.status);
  // Handle Search
  const handleApplyFilters = () => {
    const filterQuery = {
      location,
      priceFrom,
      priceTo,
      status: statusFilter,
    };
  
    console.log('Filters applied:', filterQuery);
  
    // If you want to navigate:
    if(location || priceFrom || priceTo || statusFilter) navigate(`/filterProperty?location=${location}&priceFrom=${priceFrom}&priceTo=${priceTo}&status=${statusFilter}`);
  
    // OR: if you just want to set a query object:
    setQuery(filterQuery);
  
    // Optional: clear inputs if needed
    setLocation('');
    setPriceFrom('');
    setPriceTo('');
    setStatusFilter('');
  };
  

  // Handle Sidebar Toggle
  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Handle Dark Mode Toggle
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.classList.toggle("dark", newDarkMode);
    localStorage.setItem("darkMode", newDarkMode ? "enabled" : "disabled");
  };

  // Check for saved dark mode preference on initial load
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode === "enabled") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    try {
      const response = await axios.delete(
        "http://localhost:3000/users/logout", // Make sure this is the correct backend route
        { withCredentials: true } // Send cookies for authentication
      );
  
      console.log(response);
      if (response.status === 200) {
        dispatch(logout()); 
        console.log('hihelllo');
        localStorage.removeItem('token');
        navigate("/");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        // Treat as successful logout
        console.warn("Already logged out or not authenticated, cleaning up frontend session.");
        dispatch(logout());
        localStorage.removeItem('token');
        navigate("/");
      } else {
          console.error("Error while logging out: ", error.response?.data || error.message);
      }
    }
  };
  
  

  return (
    <div className="h-screen flex flex-col dark:bg-black">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4 shadow-lg">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-extrabold text-gray-800 dark:text-gray-200 hover:text-blue-500 transition duration-300"
        >
          Choudhary Estate
        </Link>

        {/* Filters Row (Centered) */}
        <div className="flex-grow flex justify-center mx-4">
          {status && (
            <div className="bg-white dark:bg-gray-700 shadow-lg rounded-full px-4 py-2 max-w-5xl flex items-center space-x-2 justify-center mx-auto w-full max-w-full sm:max-w-5xl">
              
              {/* Location */}
              <input
                type="text"
                placeholder="Enter city"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-48 rounded-full px-4 py-2 text-gray-700 dark:text-black-200 focus:outline-none"
              />

              {/* Price From */}
              <input
                type="number"
                placeholder="Price From"
                value={priceFrom}
                onChange={(e) => setPriceFrom(e.target.value)}
                className="w-24 rounded-full px-4 py-2 text-gray-700 dark:text-black-200 focus:outline-none"
              />

              {/* Price To */}
              <input
                type="number"
                placeholder="Price To"
                value={priceTo}
                onChange={(e) => setPriceTo(e.target.value)}
                className="w-24 rounded-full px-4 py-2 text-gray-700 dark:text-black-200 focus:outline-none"
              />

              {/* Status */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-36 rounded-full px-2 py-2 text-gray-700 dark:text-black-200 focus:outline-none flex justify-center mx-4"
              >
                <option value="" className="text-gray-700 dark:text-black-200">Select Status</option>
                <option value="for rent">For Rent</option>
                <option value="sold">Sold</option>
                <option value="for sale">For Sale</option>
              </select>

              {/* Apply Button */}
              <button
                onClick={handleApplyFilters}
                className="bg-blue-600 text-white rounded-full px-6 py-2 hover:bg-blue-700 transition"
              >
                Apply Filters
              </button>
            </div>
          )}
        </div>
        {/** filter property ends */}



        {/* User and Dark Mode Section */}
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="text-gray-700 dark:text-gray-200 hover:text-blue-500 transition duration-300"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User Section */}
          {status ? (
            <Link to="/profile">
              <div className="flex items-center space-x-2">
                {userData?.avatar ? (
                  <img
                    src={userData.avatar}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full border-2 border-gray-300"
                  />
                ) : (
                  <User
                    size={32}
                    className="text-gray-800 dark:text-gray-200 cursor-pointer hover:text-blue-500 transition duration-300"
                  />
                )}
              </div>
            </Link>
          ) : (
            <Link to="/login">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-lg transition duration-300">
                <LogIn size={20} />
                <span>Login</span>
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Layout with Sidebar */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <motion.div
          className={`bg-gradient-to-b from-gray-800 to-gray-700 text-white shadow-lg ${
            isSidebarOpen ? "w-64" : "w-16"
          } transition-all duration-300 flex flex-col`}
        >
          {/* Sidebar Toggle */}
          <div className="flex items-center justify-between p-4 border-b border-gray-600">
            <span
              className={`text-lg font-bold ${
                isSidebarOpen ? "block" : "hidden"
              }`}
            >
              Menu
            </span>
            <button
              onClick={toggleSidebar}
              className="text-white hover:bg-gray-600 p-2 rounded-full"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Sidebar Links */}
          <div className="flex-1 flex flex-col mt-4 space-y-4">
            {status && (
              <>
                <Link
              to="/"
              className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-600 rounded transition duration-300"
            >
              <Home size={20} />
              {isSidebarOpen && <span>Home</span>}
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-600 rounded transition duration-300"
            >
              <Home size={20} />
              {isSidebarOpen && <span>Dashboard</span>}
            </Link>
                <Link
                  to="/add-properties"
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-600 rounded transition duration-300"
                >
                  <Banknote size={20} />
                  {isSidebarOpen && <span>Add Properties</span>}
                </Link>
                <Link
                  to="/favorites"
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-600 rounded transition duration-300"
                >
                  <Heart size={20} />
                  {isSidebarOpen && <span>Favorites</span>}
                </Link>
                <Link
                  to="/notifications"
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-600 rounded transition duration-300"
                >
                  <Bell size={20} />
                  {isSidebarOpen && <span>Notifications</span>}
                </Link>
                <Link to='/chat' className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-600 rounded transition duration-300">
                  <MessageCircleMore size={20} />
                  {isSidebarOpen && <span>Chat</span>}
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-600 rounded transition duration-300"
                >
                  <Settings size={20} />
                  {isSidebarOpen && <span>Settings</span>}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-600 rounded transition duration-300"
                >
                  <LogOut size={20} />
                  {isSidebarOpen && <span>Logout</span>}
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 bg-gray-50 dark:bg-black p-4">
          <div className="h-full overflow-y-auto">
            {/* This is where the Outlet renders the child components */}
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;