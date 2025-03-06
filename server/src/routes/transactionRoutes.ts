import { Router } from "express";
import { TransactionController } from "../controllers/transactionController";

const router = Router();

// Get user's transactions with filters and pagination
router.get("/:userName", TransactionController.getUserTransactions);

// Get transaction statistics
router.get("/:userName/stats", TransactionController.getTransactionStats);

// Create a single transaction
router.post("/:userName", TransactionController.createTransaction);

// Create multiple transactions
router.post("/:userName/bulk", TransactionController.createBulkTransactions);

export default router;
