import { ITransaction, Transaction } from "../models/Transaction";
import { IUser, User } from "../models/User";

export class DbUtils {
  static async findUserByUsername(username: string): Promise<IUser | null> {
    try {
      return await User.findOne({ username });
    } catch (error) {
      throw error;
    }
  }

  static async createUser(
    username: string,
    password: string,
    currency: string
  ): Promise<IUser> {
    try {
      const user = new User({ username, password, currency });
      return await user.save();
    } catch (error) {
      if ((error as any).code === 11000) {
        // MongoDB duplicate key error code
        throw new Error("Username already exists");
      }
      throw error;
    }
  }

  // Transaction Methods
  static async getUserTransactions(
    userName: string,
    filters: {
      startDate?: Date;
      endDate?: Date;
      categoryName?: string;
      limit?: number;
      skip?: number;
    }
  ): Promise<{
    transactions: ITransaction[];
    total: number;
    totalAmount: number;
  }> {
    try {
      const query: any = { userName };

      // Add date range filter if provided
      if (filters.startDate || filters.endDate) {
        query.date = {};
        if (filters.startDate) query.date.$gte = filters.startDate;
        if (filters.endDate) query.date.$lte = filters.endDate;
      }

      // Add category filter if provided
      if (filters.categoryName) {
        query.categoryName = filters.categoryName;
      }

      // Get total count for pagination
      const total = await Transaction.countDocuments(query);

      // Get transactions with pagination
      const transactions = await Transaction.find(query)
        .sort({ date: -1 })
        .skip(filters.skip || 0)
        .limit(filters.limit || 10);

      // Calculate total amount
      const totalAmount = await Transaction.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      return {
        transactions,
        total,
        totalAmount: totalAmount[0]?.total || 0,
      };
    } catch (error) {
      throw error;
    }
  }

  static async getTransactionStats(
    userName: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalExpense: number;
    totalIncome: number;
    categoryWise: { categoryName: string; total: number; type: string }[];
  }> {
    try {
      const query = {
        userName: userName,
        date: { $gte: startDate, $lte: endDate },
      };

      const [expenseStats, categoryStats] = await Promise.all([
        // Get total expense and income
        Transaction.aggregate([
          { $match: query },
          {
            $group: {
              _id: null,
              totalExpense: {
                $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
              },
              totalIncome: {
                $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
              },
            },
          },
        ]),

        // Get category-wise totals
        Transaction.aggregate([
          { $match: query },
          {
            $group: {
              _id: {
                categoryName: "$categoryName",
                type: "$type",
              },
              total: { $sum: "$amount" },
            },
          },
          {
            $project: {
              categoryName: "$_id.categoryName",
              type: "$_id.type",
              total: 1,
              _id: 0,
            },
          },
          {
            $sort: {
              type: 1,
              total: -1,
            },
          },
        ]),
      ]);

      return {
        totalExpense: expenseStats[0]?.totalExpense || 0,
        totalIncome: expenseStats[0]?.totalIncome || 0,
        categoryWise: categoryStats,
      };
    } catch (error) {
      throw error;
    }
  }

  static async createTransaction(
    userName: string,
    transactionData: {
      amount: number;
      date: Date;
      type: string;
      categoryName: string;
      description?: string;
      paymentMethod?: string;
    }
  ): Promise<ITransaction> {
    try {
      const transaction = new Transaction({
        userName: userName,
        categoryName: transactionData.categoryName,
        amount: transactionData.amount,
        date: transactionData.date,
        type: transactionData.type,
        description: transactionData.description,
        paymentMethod: transactionData.paymentMethod,
      });

      return await transaction.save();
    } catch (error) {
      throw error;
    }
  }

  static async createBulkTransactions(
    userName: string,
    transactions: Array<{
      amount: number;
      date: Date;
      type: string;
      categoryName: string;
      description?: string;
      paymentMethod?: string;
    }>
  ): Promise<{ success: ITransaction[]; failed: any[] }> {
    try {
      const results = {
        success: [] as ITransaction[],
        failed: [] as any[],
      };

      // Process transactions sequentially to maintain order and handle errors individually
      for (const transaction of transactions) {
        try {
          const newTransaction = new Transaction({
            userName: userName,
            categoryName: transaction.categoryName,
            amount: transaction.amount,
            date: transaction.date,
            type: transaction.type,
            description: transaction.description,
            paymentMethod: transaction.paymentMethod,
          });

          const saved = await newTransaction.save();
          results.success.push(saved);
        } catch (error) {
          results.failed.push({
            transaction,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return results;
    } catch (error) {
      throw error;
    }
  }
}
