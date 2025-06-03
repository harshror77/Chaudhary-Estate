import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property"
    },
    type: {
        type: String,
        enum: ['transaction', 'chat', 'favorite', 'system', 'BUY_OFFER', 'REJECT_OFFER', 'ACCEPT_OFFER'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const Notification = mongoose.model("Notification", notificationSchema);