import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import colors from "../../assets/colors";
import { getCategoryById } from "../constants/categories";
import { getPaymentMethodById } from "../constants/paymentMethods";
import { formatDate } from "../utils/transactionUtils";

const RecentTransactions = ({ transactions, onAddPress }) => {
  const recentTransactions = transactions.slice(0, 5);

  const renderNoTransactions = () => (
    <View style={styles.noDataContainer}>
      <MaterialCommunityIcons
        name="currency-usd-off"
        size={50}
        color={colors.text.secondary}
      />
      <Text style={styles.noDataText}>No transactions found</Text>
      <Text style={styles.noDataSubText}>
        Start adding your transactions to track your expenses
      </Text>
    </View>
  );

  return (
    <View style={styles.transactionsContainer}>
      <View style={styles.transactionHeader}>
        <Text style={styles.sectionTitle}>Recent</Text>
      </View>

      {recentTransactions.length === 0
        ? renderNoTransactions()
        : recentTransactions.map((transaction) => (
            <TransactionItem key={transaction.id} item={transaction} />
          ))}
    </View>
  );
};

const TransactionItem = ({ item }) => {
  const category = getCategoryById(item.categoryName, item.type);
  const paymentMethod = getPaymentMethodById(item.paymentMethod, item.type);

  return (
    <View style={styles.transaction}>
      <View style={styles.transactionLeft}>
        <View style={styles.categoryAndPayment}>
          {paymentMethod && (
            <MaterialCommunityIcons
              name={paymentMethod.icon}
              size={16}
              color={colors.primary.main}
              style={styles.paymentIcon}
            />
          )}
          <Text style={styles.transactionDescription}>
            {category?.name || ""}
          </Text>
        </View>
        <Text style={styles.transactionDate}>
          {formatDate(new Date(item.date))}
        </Text>
      </View>
      <View style={styles.transactionRight}>
        <Text style={styles.transactionCategory}>{item.description || ""}</Text>
        <Text
          style={[
            styles.transactionAmount,
            {
              color:
                item.type === "income"
                  ? colors.status.success
                  : colors.status.error,
            },
          ]}
        >
          {item.type === "income" ? "+" : "-"}₹{item.amount}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  transactionsContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary.main,
    marginBottom: 10,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    backgroundColor: colors.background.secondary,
    borderRadius: 10,
    marginTop: 10,
  },
  noDataText: {
    fontSize: 16,
    color: colors.primary.main,
    fontWeight: "bold",
    marginTop: 10,
  },
  noDataSubText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: 5,
    paddingHorizontal: 20,
  },
  addButton: {
    padding: 5,
  },
  transaction: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.dark,
  },
  transactionLeft: {
    flex: 1,
  },
  categoryAndPayment: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionDescription: {
    fontSize: 16,
    color: colors.text.inverse,
    marginLeft: 5,
  },
  transactionDate: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 5,
  },
  transactionCategory: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 5,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default RecentTransactions;
