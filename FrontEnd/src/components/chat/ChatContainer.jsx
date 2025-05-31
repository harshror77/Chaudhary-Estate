import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Send, Image, MessageCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { getSocket } from "../../lib/socket.js";
import Loader from "../../pages/Loader.jsx";

const ChatContainer = ({ user }) => {
    const userData = useSelector((state) => state.auth.userData);
    const onlineUsers = useSelector((state) => state.auth.onlineUsers);
    const mode = useSelector((state) => state.auth.mode);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [imagetopreview, setImageToPreview] = useState(null);
    const [fetchError, setFetchError] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/api/v1/chat/get-message/${user._id}`,
                    { withCredentials: true }
                );
                const fetchedMessages = Array.isArray(response.data?.data) ? response.data.data : [];
                setMessages(fetchedMessages);
            } catch (error) {
                console.error(
                    "Error fetching messages:",
                    error.response?.data?.message || error.message
                );
                setFetchError("Failed to fetch messages");
            }
        };

        if (user) fetchMessages();
    }, [user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const toggleImagePreviewer = (imageUrl) => {
        setImageToPreview(imageUrl);
    };

    function formatTime(isoDate) {
        const date = new Date(isoDate);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const sendMessage = async () => {
        if (!newMessage.trim() && !image) return;

        const formData = new FormData();
        formData.append("text", newMessage);
        if (image) {
            setLoading(true);
            formData.append("image", image);
        }
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/chat/send-message/${user._id}`,
                formData,
                { withCredentials: true }
            );

            if (response.data.data) {
                const newMsg = response.data.data;
                const socket = getSocket();
                if (socket) {
                    socket.emit("message", { room: user._id, message: newMsg });
                }
                setMessages((prev) => [...prev, newMsg]);
                setNewMessage("");
                setImage(null);
            }
        } catch (error) {
            console.error(
                "Error sending message:",
                error.response?.data?.message || error.message
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const socket = getSocket();
        if (socket) {
            socket.emit("join-room", user._id);
            socket.on("recieve-message", (data) => {
                if (user._id === data.senderId) {
                    setMessages((prevMessages) => [...prevMessages, data.message]);
                }
            });
        }
        return () => {
            if (socket) socket.off("recieve-message");
        };
    }, [user]);

    if (loading) return <Loader />;
    if (fetchError) return <div className="text-red-500 text-center p-4">{fetchError}</div>;

    return (
        <>
            <div className={`flex flex-col h-full w-full shadow-lg rounded-xl overflow-hidden ${
                mode === "dark" 
                    ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white" 
                    : "bg-gradient-to-br from-white to-gray-50 text-black"
            }`}>
                {/* Header */}
                <div className={`flex items-center px-4 py-3 border-b ${
                    mode === "dark" 
                        ? "border-gray-700 bg-gray-800" 
                        : "border-gray-200 bg-gray-50"
                }`}>
                    <div className="relative">
                        <img
                            src={user.avatar || "/default-avatar.png"}
                            alt={user.username}
                            className="w-10 h-10 rounded-full border-2 border-blue-500"
                        />
                        <span className={`absolute bottom-0 right-0 block w-3 h-3 rounded-full ${
                            onlineUsers && Object.keys(onlineUsers).includes(user._id)
                                ? "bg-green-500"
                                : "bg-gray-400"
                        }`}></span>
                    </div>
                    <div className="ml-3">
                        <h2 className="text-lg font-semibold">{user.username}</h2>
                        <p className="text-xs text-gray-500">
                            {onlineUsers && Object.keys(onlineUsers).includes(user._id)
                                ? "Online"
                                : "Offline"}
                        </p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.length > 0 ? (
                        messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${
                                    message.senderId === userData._id 
                                        ? "justify-end" 
                                        : "justify-start"
                                }`}
                            >
                                <div
                                    className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
                                        message.senderId === userData._id
                                            ? "bg-blue-500 text-white rounded-br-none"
                                            : mode === "dark"
                                                ? "bg-gray-700 text-gray-200 rounded-bl-none"
                                                : "bg-gray-100 text-gray-800 rounded-bl-none"
                                    }`}
                                >
                                    {message.text && (
                                        <div className="break-words">{message.text}</div>
                                    )}
                                    
                                    {message.image && (
                                        <div className="mt-2">
                                            <img
                                                src={message.image}
                                                alt="Attached"
                                                className="max-w-[200px] rounded-lg cursor-pointer border border-gray-300"
                                                onClick={() => toggleImagePreviewer(message.image)}
                                            />
                                        </div>
                                    )}
                                    
                                    <div className={`text-xs mt-1 ${
                                        message.senderId === userData._id
                                            ? "text-blue-100"
                                            : mode === "dark"
                                                ? "text-gray-400"
                                                : "text-gray-500"
                                    }`}>
                                        {formatTime(message.createdAt)}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full p-4 mb-4">
                                <MessageCircle className="w-10 h-10 text-gray-500 dark:text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold mb-1">No messages yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-xs">
                                Start the conversation by sending your first message
                            </p>
                        </div>
                    )}
                    <div ref={messagesEndRef}></div>
                </div>

                {/* Input Area */}
                <div className={`p-3 border-t ${
                    mode === "dark" 
                        ? "border-gray-700 bg-gray-800" 
                        : "border-gray-200 bg-gray-50"
                }`}>
                    {image && (
                        <div className="relative mb-3 flex">
                            <img
                                src={URL.createObjectURL(image)}
                                alt="Preview"
                                className="w-16 h-16 rounded-lg object-cover border"
                            />
                            <button
                                onClick={() => setImage(null)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                            >
                                &times;
                            </button>
                        </div>
                    )}
                    
                    <div className="flex items-center">
                        <label className="p-2 cursor-pointer rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                            <Image
                                className={`w-5 h-5 ${
                                    mode === "dark" ? "text-white" : "text-blue-500"
                                }`}
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImage(e.target.files[0])}
                                className="hidden"
                            />
                        </label>
                        
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            className={`flex-grow min-w-0 px-4 py-3 rounded-full focus:outline-none ${
                                mode === "dark"
                                    ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
                                    : "bg-white border-gray-300 text-gray-700 focus:ring-blue-500"
                            } border`}
                        />
                        
                        <button 
                            onClick={sendMessage}
                            disabled={loading}
                            className="ml-2 p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition disabled:opacity-50"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Image Preview Modal */}
            {imagetopreview && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
                    <div className="relative max-w-4xl mx-4">
                        <button
                            onClick={() => toggleImagePreviewer(null)}
                            className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-red-400 z-10 bg-black/30 rounded-full w-10 h-10 flex items-center justify-center"
                        >
                            &times;
                        </button>
                        <img
                            src={imagetopreview}
                            alt="Enlarged Preview"
                            className="max-w-full max-h-[90vh] rounded-lg shadow-lg"
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatContainer;