import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import colors from "../../assets/colors";
import {
  getCategoryById,
  getCategoryDescription,
  getCategoryIcon,
} from "../constants/categories";
import { getPaymentMethodById } from "../constants/paymentMethods";
import {
  filterTransactionsByDate,
  calculateTotals,
  formatDate,
  formatTime,
} from "../utils/transactionUtils";

const DailyTransactions = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({ totalIncome: 0, totalExpense: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactionsForDate(currentDate);
  }, [currentDate]);

  const fetchTransactionsForDate = async (date) => {
    setLoading(true);
    try {
      const transactionsData = await AsyncStorage.getItem("transactions");
      const parsedTransactions = transactionsData
        ? JSON.parse(transactionsData)
        : [];
      const filteredTransactions = filterTransactionsByDate(
        parsedTransactions,
        date
      );
      setTransactions(filteredTransactions);
      setTotals(calculateTotals(filteredTransactions));
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
    setLoading(false);
  };

  const goToPreviousDay = () => {
    const previousDay = new Date(currentDate);
    previousDay.setDate(currentDate.getDate() - 1);
    setCurrentDate(previousDay);
  };

  const goToNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1);
    setCurrentDate(nextDay);
  };

  const handleAddTransaction = () => {
    setModalVisible(false);
    navigation.navigate("AddTransaction", { date: currentDate });
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.iconButton}
      >
        <MaterialCommunityIcons
          name="file-document-outline"
          size={24}
          color={colors.common.white}
        />
      </TouchableOpacity>

      <Modal
        transparent={false}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContent}>
          <View style={styles.closeHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Daily Transactions</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.dateNavigation}>
            <TouchableOpacity
              onPress={goToPreviousDay}
              style={styles.navButton}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={colors.primary.main}
              />
            </TouchableOpacity>
            <Text style={styles.dateText}>{formatDate(currentDate)}</Text>
            <TouchableOpacity onPress={goToNextDay} style={styles.navButton}>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={colors.primary.main}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.summaryContainer}>
            <View style={[styles.summaryCard, styles.incomeCard]}>
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={styles.incomeText}>
                ${totals.totalIncome.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.summaryCard, styles.expenseCard]}>
              <Text style={styles.summaryLabel}>Expense</Text>
              <Text style={styles.expenseText}>
                ${totals.totalExpense.toFixed(2)}
              </Text>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color={colors.primary.main}
              style={styles.loader}
            />
          ) : (
            <View style={styles.transactionsContainer}>
              <Text style={styles.sectionTitle}>Transactions</Text>
              {transactions.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons
                    name="currency-usd-off"
                    size={50}
                    color={colors.text.disabled}
                  />
                  <Text style={styles.emptyText}>
                    No transactions for this day
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={transactions}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => <TransactionItem item={item} />}
                  contentContainerStyle={styles.transactionsList}
                />
              )}
            </View>
          )}

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddTransaction}
          >
            <MaterialCommunityIcons
              name="plus"
              size={24}
              color={colors.primary.contrast}
            />
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const TransactionItem = ({ item }) => {
  const category = getCategoryById(item.categoryName, item.type);
  const paymentMethod = getPaymentMethodById(item.paymentMethod, item.type);
  const transactionDate = new Date(item.date);

  return (
    <View style={styles.transactionItem}>
      <View
        style={[
          styles.categoryIconContainer,
          {
            backgroundColor:
              item.type === "income"
                ? "rgba(40, 167, 70, 0.16)"
                : "rgba(244, 40, 60, 0.28)",
          },
        ]}
      >
        <MaterialCommunityIcons
          name={getCategoryIcon(item.categoryName, item.type)}
          size={24}
          color={
            item.type === "income" ? colors.status.success : colors.status.error
          }
        />
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionDescription}>
          {item.description ||
            getCategoryDescription(item.categoryName, item.type)}
        </Text>
        <View style={styles.transactionMeta}>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{category?.name || "Other"}</Text>
          </View>
          <View style={styles.paymentMethodTag}>
            <MaterialCommunityIcons
              name={paymentMethod?.icon || "cash"}
              size={12}
              color={colors.text.inverse}
            />
            <Text style={styles.paymentText}>
              {paymentMethod?.name || "Cash"}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={styles.transactionTime}>
          {formatTime(transactionDate)}
        </Text>
        <Text
          style={[
            styles.transactionAmount,
            item.type === "income" ? styles.income : styles.expense,
          ]}
        >
          {item.type === "income" ? "+" : "-"}₹{item.amount.toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
    backgroundColor: colors.background.dark, // Dark background
    position: "relative",
  },
  iconButton: {
    marginRight: 15,
  },
  closeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  headerTitle: {
    color: colors.text.inverse, // White text for dark background
    fontSize: 18,
    fontWeight: "bold",
  },
  dateNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    backgroundColor: colors.background.dark, // Light grey background
  },
  dateText: {
    color: colors.text.inverse, // White text for dark background
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: 15,
  },
  navButton: {
    padding: 5,
  },
  summaryContainer: {
    flexDirection: "row",
    marginHorizontal: 10,
    marginVertical: 15,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 5,
    shadowColor: colors.common.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    backgroundColor: colors.background.dark, // White card background
  },
  incomeCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.status.success, // Green border for income
  },
  expenseCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.status.error, // Red border for expense
  },
  summaryLabel: {
    color: colors.text.inverse, // Medium grey text
    fontSize: 14,
    marginBottom: 5,
  },
  incomeText: {
    color: colors.status.success, // Green text for income
    fontSize: 18,
    fontWeight: "bold",
  },
  expenseText: {
    color: colors.status.error, // Red text for expense
    fontSize: 18,
    fontWeight: "bold",
  },
  loader: {
    marginTop: 40,
  },
  sectionTitle: {
    color: colors.text.inverse, // White text for dark background
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    marginLeft: 20,
    marginTop: 10,
  },
  transactionsContainer: {
    flex: 1,
  },
  transactionsList: {
    paddingHorizontal: 10,
    paddingBottom: 80, // Space for the floating action button
  },
  transactionItem: {
    backgroundColor: colors.background.dark, // White card background
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.dark,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: colors.common.inverse,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  transactionDetails: {
    flex: 1,
    justifyContent: "flex-start",
  },
  transactionRight: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  transactionTime: {
    color: colors.text.secondary,
    fontSize: 12,
    marginBottom: 20, // Space between time and amount
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  transactionDescription: {
    color: colors.text.inverse, // Dark grey text for readability
    fontSize: 11, // Slightly larger font size
    marginBottom: 8,
    flexShrink: 1,
  },
  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  categoryTag: {
    backgroundColor: colors.background.secondary, // Light grey background
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  categoryText: {
    color: colors.text.secondary, // Medium grey text
    fontSize: 12,
  },
  paymentMethodTag: {
    backgroundColor: colors.primary.main, // Bright orange background
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  paymentText: {
    color: colors.common.white, // White text for contrast
    fontSize: 12,
    marginLeft: 4,
  },
  income: {
    color: colors.status.success, // Green text for income
  },
  expense: {
    color: colors.status.error, // Red text for expense
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  emptyText: {
    color: colors.text.disabled, // Light grey text for empty state
    marginTop: 10,
    fontSize: 16,
  },
  addButton: {
    position: "absolute",
    bottom: 25,
    right: 25,
    backgroundColor: colors.primary.main, // Bright orange background
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: colors.common.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

export default DailyTransactions;
