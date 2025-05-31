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
                // Ensure response.data.message is an array, default to empty array if not
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

            // If we’re not currently chatting with this user, mark as unread
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
                Loading...
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center">{error}</div>;
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
                            className={`flex items-center space-x-4 cursor-pointer p-3 rounded-lg
                                ${
                                user.hasUnread
                                    ? mode==="dark"
                                        ? "bg-blue-900" 
                                        : "bg-blue-100" // Highlight for unread messages
                                    : mode === "dark"
                                    ? "hover:bg-gray-800"
                                    : "hover:bg-gray-200"
                                }
                                ${
                                    user.hasUnread
                                        ? "border-2 border-blue-400" 
                                        : ""
                                }
                            `}
                            >
                            <div className="relative w-14 h-14">
                                <img
                                    src={user.avatar || "/default-avatar.png"}
                                    alt={`${user.username}'s avatar`}
                                    className="w-14 h-14 rounded-full border border-gray-300"
                                />
                                {onlineUsers && Object.keys(onlineUsers).includes(user._id) && (
                                    <span
                                        className="absolute bottom-0 right-0 block w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                                        title="Online"
                                    ></span>
                                )}
                            </div>
                            <span className={`text-lg ${user.hasUnread ? "font-bold" : "font-medium"}`}>
                                {user.username}
                            </span>
                            <div className="flex items-center ml-auto space-x-2">
                                {user.hasUnread && (
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> 
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-gray-500">No users found</p>
            )}
        </div>
    );
};

export default SideBar;