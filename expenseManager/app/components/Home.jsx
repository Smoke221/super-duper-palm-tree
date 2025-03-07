import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, ScrollView, StyleSheet, SafeAreaView } from "react-native";
import colors from "../../assets/colors";
import ApiService from "../services/api.service";
import MonthSelector from "./MonthSelector";
import SummaryCards from "./SummaryCards";
import RecentTransactions from "./RecentTransactions";
import TopCategories from "./TopCategories";

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

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
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
