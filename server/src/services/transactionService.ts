import { ITransaction } from "../models/Transaction";
import { DbUtils } from "../utils/dbUtils";

export class TransactionService {
  static async getUserTransactions(
    userName: string,
    filters: {
      startDate?: string;
      endDate?: string;
      categoryName?: string;
      page?: number;
      limit?: number;
    }
  ) {
    try {
      const parsedFilters = {
        startDate: filters.startDate ? new Date(filters.startDate) : undefined,
        endDate: filters.endDate ? new Date(filters.endDate) : undefined,
        categoryName: filters.categoryName,
        limit: filters.limit || 10,
        skip: ((filters.page || 1) - 1) * (filters.limit || 10),
      };

      const result = await DbUtils.getUserTransactions(userName, parsedFilters);

      return {
        transactions: result.transactions.map(transaction => ({
          id: transaction.id,
          amount: transaction.amount,
          type: transaction.type,
          categoryName: transaction.categoryName,
          description: transaction.description || '',
          paymentMethod: transaction.paymentMethod || '',
          date: transaction.date.toISOString(),
          formattedDate: transaction.date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          createdAt: transaction.createdAt.toISOString()
        })),
        pagination: {
          total: result.total,
          totalPages: Math.ceil(result.total / parsedFilters.limit),
          currentPage: filters.page || 1,
          limit: parsedFilters.limit,
        },
        summary: {
          totalAmount: result.totalAmount,
          totalIncome: result.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0),
          totalExpense: result.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0)
        },
      };
    } catch (error) {
      throw error;
    }
  }

  static async getTransactionStats(
    userName: string,
    startDate: string,
    endDate: string
  ) {
    try {
      const stats = await DbUtils.getTransactionStats(
        userName,
        new Date(startDate),
        new Date(endDate)
      );

      return {
        summary: {
          totalExpense: stats.totalExpense,
          totalIncome: stats.totalIncome,
          netAmount: stats.totalIncome - stats.totalExpense,
        },
        categoryBreakdown: stats.categoryWise.map((cat) => ({
          name: cat.categoryName,
          type: cat.type,
          amount: cat.total,
          percentage:
            cat.type === "expense"
              ? Math.floor((cat.total / stats.totalExpense) * 100 * 100) / 100 // Floor to 2 decimal places
              : Math.floor((cat.total / stats.totalIncome) * 100 * 100) / 100,
        })),
      };
    } catch (error) {
      throw error;
    }
  }

  static async createTransaction(
    userName: string,
    transactionData: {
      amount: number;
      date: string;
      type: string;
      categoryName: string;
      description?: string;
      paymentMethod?: string;
    }
  ): Promise<ITransaction> {
    try {
      // Convert string date to Date object
      const parsedData = {
        ...transactionData,
        date: new Date(transactionData.date),
      };

      return await DbUtils.createTransaction(userName, parsedData);
    } catch (error) {
      throw error;
    }
  }

  static async createBulkTransactions(
    userName: string,
    transactions: Array<{
      amount: number;
      date: string;
      type: string;
      categoryName: string;
      description?: string;
      paymentMethod?: string;
    }>
  ) {
    try {
      // Convert string dates to Date objects
      const parsedTransactions = transactions.map((transaction) => ({
        ...transaction,
        date: new Date(transaction.date),
      }));

      const results = await DbUtils.createBulkTransactions(
        userName,
        parsedTransactions
      );

      return {
        success: results.success,
        failed: results.failed,
        summary: {
          total: transactions.length,
          successful: results.success.length,
          failed: results.failed.length,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
