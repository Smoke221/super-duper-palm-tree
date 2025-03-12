import React, { useState } from "react";
import { View, ActivityIndicator, ScrollView, StyleSheet, SafeAreaView } from "react-native";
import colors from "../../assets/colors";
import MonthSelector from "../components/common/MonthSelector";
import SummaryCards from "../components/common/SummaryCards";
import RecentTransactions from "../components/RecentTransactions";
import TopCategories from "../components/TopCategories";
import { useFocusEffect } from '@react-navigation/native';
import { useTransactions } from "../utils/useTransactions";

const Home = ({ navigation }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { loading, transactionData, categoryStats, fetchData } = useTransactions(currentDate);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [currentDate, fetchData])
  );

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

export default Home;
