import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Heart, ShoppingBag, Bell, User } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import io from "socket.io-client";
import { useSelector } from "react-redux";

const getNotificationIcon = (type) => {
  switch (type) {
    case "chat":
      return <MessageCircle size={18} className="text-purple-600" />;
    case "favorite":
      return <Heart size={18} className="text-pink-500" />;
    case "BUY_OFFER":
      return <ShoppingBag size={18} className="text-green-600" />;
    default:
      return <Bell size={18} className="text-gray-400" />;
  }
};

const Notifications = () => {
  const user  = useSelector(state=>state.auth.userData);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await axios.get("http://localhost:3000/notifications", {
        params: { page: 1, limit: 20 },
        withCredentials: true,
      });
      const updatedData = response.data.data.map(n => ({ ...n, isActionTaken: false }));
      setNotifications(updatedData);
    } catch (error) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const handleMarkRead = async (notificationId) => {
    try {
      if (notificationId) {
        await axios.put(`http://localhost:3000/notifications/${notificationId}`, {}, { withCredentials: true });
        setNotifications(prev =>
          prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
        );
      } else {
        // Mark all as read
        await Promise.all(
          notifications
            .filter(n => !n.isRead)
            .map(n => axios.put(`http://localhost:3000/notifications/${n._id}`, {}, { withCredentials: true }))
        );
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
      toast.success("Notifications updated");
    } catch (error) {
      toast.error("Failed to update notifications");
    }
  };

  // Delete notification
  const handleDelete = async (notificationId) => {
    try {
      await axios.delete(`http://localhost:3000/notifications/${notificationId}`, { withCredentials: true });
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  // accept and reject offer
  const handleOfferResponse = async (notification, action) => {
    const responseMessage = action === "accepted"
      ? `Your offer for ${notification.property.title} was accepted!`
      : `Your offer for ${notification.property.title} was rejected.`;

    const notificationType = action === "accepted" ? "ACCEPT_OFFER" : "REJECT_OFFER";

    try {
      await axios.post("http://localhost:3000/notifications", {
        type: notificationType,
        recipient: notification.sender._id,
        property: notification.property._id,
        message: responseMessage,
      }, { withCredentials: true });

      toast.success(`Offer ${action} and notification sent`);
      setNotifications(prev =>
        prev.map(n =>
          n._id === notification._id ? { ...n, isActionTaken: true, actionStatus: action } : n
        )
      );
    } catch (err) {
      toast.error(`Failed to ${action} offer.`);
    }
  };

  // Socket.io setup
  useEffect(() => {
    if (!user) return;
  
    console.log("Attempting socket connection with token:", user);
  
    const newSocket = io("http://localhost:3000", {
      path: "/socket.io/",  // Ensure this matches your backend's socket path
      withCredentials: true,
      auth: {
        userId: user._id,
      },
    });
  
    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });
  
    newSocket.on("notification", (newNotification) => {
      setNotifications((prev) => [
        { ...newNotification, isActionTaken: false },
        ...prev,
      ]);
    });
  
    setSocket(newSocket);
  
    return () => newSocket.disconnect();
  }, [user]);
  

  // Initial fetch
  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Bell size={24} className="text-purple-600" />
          Notifications
        </h2>
        <button 
          onClick={() => handleMarkRead(null)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Mark all as read
        </button>
      </div>

      <AnimatePresence>
        {notifications.length > 0 ? (
          <ul className="space-y-3">
            {notifications.map((notification, index) => (
              <motion.li
                key={notification._id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`group relative p-4 rounded-xl shadow-sm transition-all
                  ${!notification.isRead ? 'bg-blue-100 border-l-4 border-blue-500' : 'bg-white'}`}
              > 
                {!notification.isRead && (
                  <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded tracking-wide select-none">
                    NEW
                  </span>
                )}
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {notification.sender?.avatar ? (
                      <img 
                        src={notification.sender.avatar} 
                        className="w-10 h-10 rounded-full object-cover"
                        alt={notification.sender.name}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User size={20} className="text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800">
                        {notification.sender?.fullname || 'Unknown User'}
                      </span>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <p className="text-gray-700">{notification.message}</p>
                    {notification.type === "BUY_OFFER" && user?._id === notification.property?.owner?._id && (
                      !notification.isActionTaken ? (
                        <div className="mt-2 flex gap-3">
                          <button
                            onClick={() => handleOfferResponse(notification, "accepted")}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleOfferResponse(notification, "rejected")}
                            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <p className={`mt-2 text-sm font-medium ${
                          notification.actionStatus === "accepted" ? "text-green-600" : "text-red-600"
                        }`}>
                          Offer {notification.actionStatus}.
                        </p>
                      )
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-500">
                        {new Date(notification.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkRead(notification._id)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Mark read
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification._id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Property Preview */}
                {notification.property && (
                  <div className="ml-14 mt-3 p-2 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2">
                      <img 
                        src={notification.property.images?.[0]} 
                        className="w-12 h-12 rounded-md object-cover"
                        alt="Property"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {notification.property.title}
                        </p>
                        <p className="text-xs text-gray-600">
                          ₹{notification.property.price?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.li>
            ))}
          </ul>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="text-gray-500 mb-4">🎉</div>
            <p className="text-gray-600">No new notifications!</p>
            <p className="text-sm text-gray-500 mt-1">We'll notify you when something arrives</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;