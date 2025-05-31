import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { getSocket } from "../../lib/socket.js";

const SideBar = ({ onUserClick, currentlyOpenChatId }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const mode = useSelector((state) => state.auth.mode);
    const onlineUsers = useSelector((state) => state.auth.onlineUsers);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/chat/`, {
                    withCredentials: true,
                });
                const fetchedUsers = Array.isArray(response.data?.data) ? response.data.data : [];
                setUsers(fetchedUsers);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to fetch users");
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // listen for new unread message events
    useEffect(() => {
        const socket = getSocket();
        const handleIncomingMessage = (messageData) => {
            const senderId = messageData.senderId;

            // If we're not currently chatting with this user, mark as unread
            if (senderId !== currentlyOpenChatId) {
                setUsers((prevUsers) =>
                    prevUsers.map((u) =>
                        u._id === senderId ? { ...u, hasUnread: true } : u
                    )
                );
            }
        };

        socket.on("recieve-message", handleIncomingMessage);

        return () => {
            socket.off("recieve-message", handleIncomingMessage);
        };
    }, [currentlyOpenChatId]);

    const handleUserClick = (user) => {
        onUserClick(user);

        // Remove unread highlight for clicked user
        setUsers((prevUsers) =>
            prevUsers.map((u) =>
                u._id === user._id ? { ...u, hasUnread: false } : u
            )
        );
    };

    if (loading) {
        return (
            <div
                className={`flex justify-center items-center h-full ${mode === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"
                    }`}
            >
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center p-4">{error}</div>;
    }

    return (
        <div
            className={`h-full p-3 sm:p-4 border-r ${mode === "dark"
                ? "bg-gray-900 border-gray-700 text-white"
                : "bg-gray-100 border-gray-300 text-black-700"
                }`}
        >
            <h2 className="text-xl font-bold mb-4 text-center">Chat Users</h2>
            {users.length > 0 ? (
                <ul className="space-y-3">
                    {users.map((user) => (
                        <li
                            key={user._id}
                            onClick={() => handleUserClick(user)}
                            className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg transition-all
                                ${user._id === currentlyOpenChatId
                                    ? mode === "dark"
                                        ? "bg-blue-900/30"
                                        : "bg-blue-100"
                                    : mode === "dark"
                                        ? "hover:bg-gray-800"
                                        : "hover:bg-gray-200"
                                }
                                ${user.hasUnread && "ring-2 ring-blue-500"}
                            `}
                        >
                            <div className="relative flex-shrink-0">
                                <img
                                    src={user.avatar || "/default-avatar.png"}
                                    alt={`${user.username}'s avatar`}
                                    className="w-12 h-12 rounded-full border-2 border-gray-300 object-cover"
                                />
                                <span
                                    className={`absolute -bottom-1 -right-1 block w-4 h-4 rounded-full border-2 ${
                                        mode === "dark" ? "border-gray-900" : "border-gray-100"
                                    } ${
                                        onlineUsers && 
                                        Object.keys(onlineUsers).includes(user._id) 
                                            ? "bg-green-500" 
                                            : "bg-gray-400"
                                    }`}
                                    title={
                                        onlineUsers && 
                                        Object.keys(onlineUsers).includes(user._id) 
                                            ? "Online" 
                                            : "Offline"
                                    }
                                ></span>
                            </div>
                            
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                    <span className={`text-base truncate ${
                                        user.hasUnread ? "font-bold" : "font-medium"
                                    }`}>
                                        {user.username}
                                    </span>
                                    {user.hasUnread && (
                                        <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                            New
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 truncate mt-1">
                                    {onlineUsers && 
                                     Object.keys(onlineUsers).includes(user._id) 
                                        ? "Online now" 
                                        : "Offline"}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full p-4 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-1">No contacts found</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-xs">
                        You don't have any contacts yet. Start adding people to chat!
                    </p>
                </div>
            )}
        </div>
    );
};

export default SideBar;