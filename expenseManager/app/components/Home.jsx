import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, ScrollView, StyleSheet, SafeAreaView } from "react-native";
import colors from "../../assets/colors";
import ApiService from "../services/api.service";
import MonthSelector from "./MonthSelector";
import SummaryCards from "./SummaryCards";
import RecentTransactions from "./RecentTransactions";
import TopCategories from "./TopCategories";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from '@react-navigation/native';

const Home = ({ navigation }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [transactionData, setTransactionData] = useState({
    transactions: [],
    summary: {
      totalAmount: 0,
      totalIncome: 0,
      totalExpense: 0,
    },
    pagination: {
      total: 0,
      currentPage: 1,
      limit: 10,
    },
  });
  const [categoryStats, setCategoryStats] = useState({
    summary: {
      totalExpense: 0,
      totalIncome: 0,
      netAmount: 0,
    },
    categoryBreakdown: [],
  });

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [currentDate])
  );

  const processLocalTransactions = (transactions) => {
    // Filter transactions for current month
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    // Calculate summary
    const summary = filteredTransactions.reduce(
      (acc, transaction) => {
        const amount = transaction.amount;
        if (transaction.type === "income") {
          acc.totalIncome += amount;
        } else {
          acc.totalExpense += amount;
        }
        acc.totalAmount = acc.totalIncome - acc.totalExpense;
        return acc;
      },
      { totalAmount: 0, totalIncome: 0, totalExpense: 0 }
    );

    // Calculate category breakdown
    const categoryMap = new Map();
    filteredTransactions.forEach(transaction => {
      const key = transaction.categoryName;
      const existing = categoryMap.get(key) || { amount: 0, type: transaction.type };
      existing.amount += transaction.amount;
      categoryMap.set(key, existing);
    });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([categoryName, data]) => ({
      categoryName,
      amount: data.amount,
      type: data.type,
      percentage: (data.amount / (data.type === 'income' ? summary.totalIncome : summary.totalExpense)) * 100
    }));

    // Format transactions for display
    const formattedTransactions = filteredTransactions
      .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date, newest first
      .map(transaction => ({
        ...transaction,
        id: transaction.id || `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Fallback ID for older transactions
        formattedDate: new Date(transaction.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }));

    return {
      transactionData: {
        transactions: formattedTransactions,
        summary,
        pagination: {
          total: formattedTransactions.length,
          currentPage: 1,
          limit: 10,
        },
      },
      categoryStats: {
        summary: {
          totalExpense: summary.totalExpense,
          totalIncome: summary.totalIncome,
          netAmount: summary.totalAmount,
        },
        categoryBreakdown,
      },
    };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const isSkipped = await AsyncStorage.getItem('isSkipped');
      
      if (isSkipped === 'true') {
        // Get data from local storage
        const transactionsStr = await AsyncStorage.getItem('transactions');
        const transactions = transactionsStr ? JSON.parse(transactionsStr) : [];
        
        const { transactionData: localTransactionData, categoryStats: localCategoryStats } = 
          processLocalTransactions(transactions);
        
        setTransactionData(localTransactionData);
        setCategoryStats(localCategoryStats);
      } else {
        // Get data from API
        const startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        ).toISOString();
        const endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        ).toISOString();

        const [transactionsResponse, statsResponse] = await Promise.all([
          ApiService.getTransactions(startDate, endDate),
          ApiService.getTransactionStats(startDate, endDate),
        ]);

        if (transactionsResponse.success) {
          setTransactionData(transactionsResponse.data);
        }

        if (statsResponse.success) {
          setCategoryStats(statsResponse.data);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Month Selector */}
      <View style={styles.fixedHeader}>
        <MonthSelector currentDate={currentDate} onMonthChange={setCurrentDate} />
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SummaryCards summary={categoryStats.summary} />
        <TopCategories categories={categoryStats.categoryBreakdown} />
        <RecentTransactions
          transactions={transactionData.transactions}
          onAddPress={() => navigation.navigate("AddTransaction")}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  fixedHeader: {
    backgroundColor: colors.background.dark,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scrollContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.dark,
  },
});

export default Home;
