import React, { useState, useCallback } from "react";
import {
  View,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import colors from "../../assets/colors";
import MonthSelector from "../components/common/MonthSelector";
import SummaryCards from "../components/common/SummaryCards";
import RecentTransactions from "../components/RecentTransactions";
import TopCategories from "../components/TopCategories";
import { useFocusEffect } from "@react-navigation/native";
import { useTransactions } from "../utils/useTransactions";
import BudgetManager from '../components/BudgetManager';

const Home = ({ navigation }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { loading, transactionData, categoryStats, fetchData } = useTransactions(currentDate);

  // Memoize fetchData to avoid unnecessary re-renders
  const memoizedFetchData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Fetch data only when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      memoizedFetchData();
    }, [memoizedFetchData])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  // Get monthly expense total from category stats
  const monthlyExpense = categoryStats.summary ? categoryStats.summary.totalExpense : 0;

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
        {/* Pass currentDate and monthly expense to BudgetManager */}
        <BudgetManager 
          currentDate={currentDate} 
          monthlyExpense={monthlyExpense} 
        />
        
        <SummaryCards summary={categoryStats.summary} />
        <TopCategories categories={categoryStats.categoryBreakdown} />
        <RecentTransactions
          transactions={transactionData.transactions}
          onAddPress={() => navigation.navigate("DailyTransactions")}
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

export default React.memo(Home); // Memoize the Home component