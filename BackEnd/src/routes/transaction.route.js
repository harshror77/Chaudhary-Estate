import express from "express";
import {
    createOrder,
    verifyPayment,
    getTransactionDetails,
    listTransactions,
    cancelTransaction
} from "../controllers/transaction.controller.js";

const router = express.Router();

router.post("/order", createOrder);
router.post("/verify", verifyPayment);
router.get("/:transactionId", getTransactionDetails);
router.get("/", listTransactions);
router.delete("/:transactionId", cancelTransaction);

export default router;
