import { Request, Response } from "express";
import { TransactionService } from "../services/transactionService";

export class TransactionController {
  static async getUserTransactions(req: Request, res: Response): Promise<void> {
    try {
      const userName = String(req.params.userName);
      const { startDate, endDate, categoryName, page, limit } = req.query;

      const result = await TransactionService.getUserTransactions(userName, {
        startDate: startDate as string,
        endDate: endDate as string,
        categoryName: categoryName as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch transactions",
      });
    }
  }

  static async getTransactionStats(req: Request, res: Response): Promise<void> {
    try {
      const userName = String(req.params.userName);
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: "Start date and end date are required",
        });
        return;
      }

      const stats = await TransactionService.getTransactionStats(
        userName as string,
        startDate as string,
        endDate as string
      );

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error("Error fetching transaction stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch transaction statistics",
      });
    }
  }

  static async createTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { userName } = req.params;
      const { amount, date, type, categoryName, description, paymentMethod } =
        req.body;

      // Validate required fields
      if (!amount || !date || !type || !categoryName) {
        res.status(400).json({
          success: false,
          message: "Amount, date, type, and categoryName are required",
        });
        return;
      }

      // Validate amount is a number
      if (typeof amount !== "number") {
        res.status(400).json({
          success: false,
          message: "Amount must be a number",
        });
        return;
      }

      const transaction = await TransactionService.createTransaction(userName, {
        amount,
        date,
        type,
        categoryName,
        description,
        paymentMethod,
      });

      res.status(201).json({
        success: true,
        data: transaction,
      });
    } catch (error: any) {
      console.error("Error creating transaction:", error);

      if (
        error.message.includes("Invalid") ||
        error.message.includes("format")
      ) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Failed to create transaction",
      });
    }
  }

  static async createBulkTransactions(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { userName } = req.params;
      const { transactions } = req.body;

      // Validate request body
      if (!Array.isArray(transactions) || transactions.length === 0) {
        res.status(400).json({
          success: false,
          message: "Transactions array is required and must not be empty",
        });
        return;
      }

      // Validate each transaction has required fields
      const invalidTransactions = transactions.filter(
        (t) =>
          !t.amount ||
          !t.date ||
          !t.categoryName ||
          typeof t.amount !== "number"
      );

      if (invalidTransactions.length > 0) {
        res.status(400).json({
          success: false,
          message:
            "All transactions must have amount, date, and categoryName. Amount must be a number",
          invalidTransactions,
        });
        return;
      }

      const result = await TransactionService.createBulkTransactions(
        userName,
        transactions
      );

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("Error creating bulk transactions:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create transactions",
      });
    }
  }
}
