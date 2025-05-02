import Razorpay from "razorpay";
import crypto from "crypto";
import { Transaction } from "../models/transaction.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET
});


export const createOrder = asyncHandler(async (req, res) => {
    const { propertyId, buyerId, sellerId, price, paymentMethod } = req.body;

    if ([propertyId, buyerId, sellerId, paymentMethod].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const transaction = await Transaction.create({
        property: propertyId,
        buyer: buyerId,
        seller: sellerId,
        price,
        paymentMethod,
        paymentStatus: "pending"
    });

    if (!transaction) throw new ApiError(401, "Transaction could not be created");

    const options = {
        amount: price * 100, 
        currency: "INR",
        receipt: transaction._id.toString()
    };

    const order = await razorpay.orders.create(options);

    if (!order) throw new ApiError(402, "Razorpay order could not be created");

    return res
    .status(200)
    .json(
        new ApiResponse(200, { transaction, order }, "Order created successfully")
    );
});


export const verifyPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, transactionId } = req.body;

    const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

    if (generatedSignature !== razorpay_signature) {
        throw new ApiError(400, "Invalid payment signature");
    }

    const transaction = await Transaction.findByIdAndUpdate(
        transactionId,
        { paymentStatus: "successfull" },
        { new: true }
    );

    if (!transaction) throw new ApiError(404, "Transaction not found");

    return res
    .status(200)
    .json(
        new ApiResponse(200, transaction, "Payment verified successfully")
    );
});


export const getTransactionDetails = asyncHandler(async (req, res) => {
    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId)
        .populate("property buyer seller");

    if (!transaction) throw new ApiError(404, "Transaction not found");

    return res
    .status(200)
    .json(
        new ApiResponse(200, transaction, "Transaction details retrieved successfully")
    );
});


export const listTransactions = asyncHandler(async (req, res) => {
    const transactions = await Transaction.find({})
        .populate("property buyer seller")
        .sort({ createdAt: -1 });

    return res
    .status(200)
    .json(
        new ApiResponse(200, transactions, "Transactions retrieved successfully")
    );
});


export const cancelTransaction = asyncHandler(async (req, res) => {
    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) throw new ApiError(404, "Transaction not found");

    if (transaction.paymentStatus === "successfull") {
        throw new ApiError(400, "Cannot cancel a successful transaction");
    }

    transaction.paymentStatus = "failed";
    await transaction.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200, transaction, "Transaction canceled successfully")
    );
});
