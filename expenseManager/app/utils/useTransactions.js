import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useState } from "react";
import { processLocalTransactions } from "./TransactionProcessor";

export const useTransactions = (currentDate) => {
  const [loading, setLoading] = useState(false);
  const [transactionData, setTransactionData] = useState({
    transactions: [],
    summary: { totalAmount: 0, totalIncome: 0, totalExpense: 0 },
    pagination: { total: 0, currentPage: 1, limit: 10 },
  });
  const [categoryStats, setCategoryStats] = useState({
    summary: { totalExpense: 0, totalIncome: 0, netAmount: 0 },
    categoryBreakdown: [],
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const transactionsStr = await AsyncStorage.getItem("transactions");
      const transactions = transactionsStr ? JSON.parse(transactionsStr) : [];
      const {
        transactionData: localTransactionData,
        categoryStats: localCategoryStats,
      } = processLocalTransactions(transactions, currentDate);
      setTransactionData(localTransactionData);
      setCategoryStats(localCategoryStats);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  return { loading, transactionData, categoryStats, fetchData };
};
