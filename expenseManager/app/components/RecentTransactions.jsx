import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import colors from "../../assets/colors";
import { getCategoryById } from "../constants/categories";
import { getPaymentMethodById } from "../constants/paymentMethods";

const RecentTransactions = ({ transactions, onAddPress }) => {
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
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {/* <TouchableOpacity 
          style={styles.addButton}
          onPress={onAddPress}
        >
          <Ionicons name="add-circle" size={32} color={colors.primary.main} />
        </TouchableOpacity> */}
      </View>

      {transactions.length === 0
        ? renderNoTransactions()
        : transactions.map((transaction) => {
            // Get the category using the name and type
            const category = getCategoryById(
              transaction.categoryName,
              transaction.type
            );
            // Get the payment method
            const paymentMethod = getPaymentMethodById(
              transaction.paymentMethod,
              transaction.type
            );
            return (
              <View key={transaction.id} style={styles.transaction}>
                <View style={styles.transactionLeft}>
                  <View style={styles.categoryAndPayment}>
                    {paymentMethod && (
                      <MaterialCommunityIcons
                        name={paymentMethod.icon}
                        size={16}
                        color={colors.text.secondary}
                        style={styles.paymentIcon}
                      />
                    )}
                    <Text style={styles.transactionDescription}>
                      {category ? category.name : ""}
                    </Text>
                  </View>
                  <Text style={styles.transactionDate}>
                    {transaction.formattedDate}
                  </Text>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={styles.transactionCategory}>
                    {transaction.description || ""}
                  </Text>
                  <Text
                    style={[
                      styles.transactionAmount,
                      {
                        color:
                          transaction.type === "income"
                            ? colors.status.success
                            : colors.status.error,
                      },
                    ]}
                  >
                    {transaction.type === "income" ? "+" : "-"}₹
                    {transaction.amount}
                  </Text>
                </View>
              </View>
            );
          })}
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
