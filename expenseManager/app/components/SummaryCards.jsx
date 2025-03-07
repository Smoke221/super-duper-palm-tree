import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from "../../assets/colors";

const SummaryCards = ({ summary }) => {
  return (
    <>
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: colors.status.success }]}>
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={styles.summaryAmount}>₹{summary.totalIncome}</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.status.error }]}>
          <Text style={styles.summaryLabel}>Expenses</Text>
          <Text style={styles.summaryAmount}>₹{summary.totalExpense}</Text>
        </View>
      </View>

      <View style={styles.balanceContainer}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={[styles.balanceAmount, {
            color: summary.netAmount >= 0 
              ? colors.status.success 
              : colors.status.error
          }]}>
            ₹{summary.netAmount}
          </Text>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    paddingTop: 0,
  },
  summaryCard: {
    flex: 1,
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  summaryLabel: {
    color: colors.text.inverse,
    fontSize: 16,
  },
  summaryAmount: {
    color: colors.text.inverse,
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 5,
  },
  balanceContainer: {
    padding: 15,
    paddingTop: 0,
  },
  balanceCard: {
    backgroundColor: colors.background.secondary,
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  balanceLabel: {
    color: colors.text.primary,
    fontSize: 18,
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
  },
});

export default SummaryCards; 