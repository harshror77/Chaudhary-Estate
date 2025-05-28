import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const SideBar = ({ onUserClick }) => {
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
                const fetchedUsers = Array.isArray(response.data?.message) ? response.data.message : [];
                setUsers(fetchedUsers);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to fetch users");
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

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
                : "bg-gray-100 border-gray-300 text-gray-700"
                }`}
        >
            <h2 className="text-lg font-bold mb-4">Chat Users</h2>
            {users.length > 0 ? (
                <ul className="space-y-3">
                    {users.map((user) => (
                        <li
                            key={user._id}
                            onClick={() => onUserClick(user)}
                            className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:${mode === "dark" ? "bg-gray-800" : "bg-gray-200"
                                }`}
                        >
                            <img
                                src={user.avatar || "/default-avatar.png"}
                                alt={`${user.username}'s avatar`}
                                className="w-10 h-10 rounded-full border border-gray-300"
                            />
                            <span className="text-sm font-medium">{user.username}</span>
                            {onlineUsers &&
                                Object.keys(onlineUsers).includes(user._id) && (
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                )}
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