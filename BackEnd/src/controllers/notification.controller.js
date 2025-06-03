import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Notification } from './../models/notification.model.js';

const createNotification = asyncHandler(async (req, res) => {
    const { type, recipient, property, message } = req.body;

    if (!recipient || !message || !type) {
        throw new ApiError(400, "Recipient, message and type are required");
    }

    const notification = await Notification.create({
        user: recipient,
        sender: req.user._id,
        message,
        type,
        property: property || null,
    });

    const populatedNotification = await Notification.findById(notification._id)
        .populate('sender', 'avatar fullname')
        .populate({
            path: 'property',
            select: 'title price images owner', 
            populate: { path: 'owner', select: 'fullname avatar' } 
        });

    const io = req.app.get("io");
    if (io) {
        io.to(recipient.toString()).emit("notification", {
            ...populatedNotification.toObject(),
            createdAt: populatedNotification.createdAt
        });
    }

    return res
        .status(201)
        .json(new ApiResponse(201, populatedNotification, "Notification created successfully"));
});

const markAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;

    const updatedNotification = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
    ).populate('sender', 'avatar fullname')
     .populate({
         path: 'property',
         select: 'title price images owner', 
         populate: { path: 'owner', select: 'fullname avatar' }
     });

    if (!updatedNotification) {
        throw new ApiError(404, "Notification not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedNotification, "Notification marked as read"));
});

const getAllNotifications = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sender', 'avatar fullname')
        .populate({
            path: 'property',
            select: 'title price images owner', 
            populate: { path: 'owner', select: 'fullname avatar' }
        });
    return res
        .status(200)
        .json(new ApiResponse(200, notifications, "Notifications fetched successfully"));
});

const deleteNotification = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;

    const deletedNotification = await Notification.findByIdAndDelete(notificationId);

    if (!deletedNotification) {
        throw new ApiError(404, "Notification not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Notification deleted successfully"));
});

export {
    createNotification,
    markAsRead,
    getAllNotifications,
    deleteNotification,
};