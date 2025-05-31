import React, { useState } from "react";
import { Sidebar, ChatContainer } from "../components/index.js";
import { useLocation } from "react-router-dom";

function ChatPage() {
    const location = useLocation();
    const [selectedUser, setSelectedUser] = useState(
        location.state?.selectedUser || null
    );

    const handleUserClick = (user) => {
        setSelectedUser(user);
    };

    return (
        <div className="flex flex-col md:flex-row h-screen">
            <div className="md:w-1/3  md:h-full">
                <Sidebar 
                    onUserClick={handleUserClick} 
                    currentlyOpenChatId={selectedUser ? selectedUser._id : null}
                />
            </div>

            <div className="md:w-2/3 h-full">
                {selectedUser ? (
                    <ChatContainer user={selectedUser} />
                ) : (
                    <div className="flex items-center justify-center h-full text-lg text-gray-500">
                        Select a user to start chatting.
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatPage;