import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import colors from "../../assets/colors";
import {
  getCategoryById,
  getCategoryDescription,
  getCategoryIcon,
} from "../constants/categories";
import { getPaymentMethodById } from "../constants/paymentMethods";
import LocalStorageService from "../utils/LocalStorageVariables";
import {
  calculateTotals,
  filterTransactionsByDate,
  formatDate,
  formatTime,
} from "../utils/transactionUtils";

// Financial wisdom/jokes for empty state
const EMPTY_STATE_MESSAGES = [
  "No money spent today? High five for epic self-control! 🖐️",
  "Your wallet is having a quiet day. Maybe it's meditating. 🧘‍♂️",
  "No transactions? Your bank account thanks you for the day off! 💤",
  "Empty like my promises to stop impulse buying. At least one of us is keeping it together!",
  "This is what financial responsibility looks like... or you just forgot to log your coffee.",
];

// Random financial advice with humor
const FINANCIAL_WISDOM = [
  "Saving tip: Make coffee at home instead of buying it. Use the savings to buy a $500 espresso machine.",
  "Budget wisely: Always leave room for emergency pizza funds.",
  "Investment advice: The best time to start saving was 20 years ago. The second best time is after this ice cream.",
  "If you saved $5 every day, you'd have enough for a tropical vacation in just 3 years. Or like, a lot of tacos now.",
  "Remember: Money can't buy happiness, but it can buy cheese. And that's basically the same thing.",
];

const DailyTransactions = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({ totalIncome: 0, totalExpense: 0 });
  const [loading, setLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState("");
  const [randomMessage] = useState(
    () =>
      EMPTY_STATE_MESSAGES[
        Math.floor(Math.random() * EMPTY_STATE_MESSAGES.length)
      ]
  );
  const [randomAdvice] = useState(
    () => FINANCIAL_WISDOM[Math.floor(Math.random() * FINANCIAL_WISDOM.length)]
  );

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(20);

  useEffect(() => {
    const fetchCurrenySymbol = async () => {
      const currencySymbol = await LocalStorageService.getCurrencySymbol();
      if (currencySymbol) {
        setCurrencySymbol(currencySymbol);
      }
    };
    fetchCurrenySymbol();
  }, []);

  // Animate content when modal opens
  useEffect(() => {
    if (modalVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations when modal closes
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
    }
  }, [modalVisible, fadeAnim, slideAnim]);

  const fetchTransactionsForDate = useCallback(async (date) => {
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
  }, []);

  // Refresh transactions when the date changes
  useEffect(() => {
    fetchTransactionsForDate(currentDate);
  }, [currentDate, fetchTransactionsForDate]);

  // Refresh transactions when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchTransactionsForDate(currentDate);
    }, [currentDate, fetchTransactionsForDate])
  );

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
    // Convert Date to timestamp (serializable)
    const dateTimestamp = currentDate.getTime();
    // Pass the timestamp instead of Date object
    navigation.navigate("AddTransaction", {
      dateTimestamp: dateTimestamp,
      onTransactionAdded: () => fetchTransactionsForDate(currentDate),
    });
  };

  // Get day status based on spending habits
  const getDayStatus = () => {
    const { totalIncome, totalExpense } = totals;

    if (totalExpense === 0)
      return "Spending freeze day! Your wallet thanks you.";
    if (totalIncome > totalExpense * 2)
      return "Profit day! Time to treat yourself (responsibly).";
    if (totalExpense > totalIncome)
      return "Spending day! Hope it was worth it.";
    return "Balanced day. Perfectly balanced, as all finances should be.";
  };

  // Whether it's a good day financially (tongue-in-cheek)
  const isGoodDay = totals.totalIncome >= totals.totalExpense;

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.iconButton}
      >
        <MaterialCommunityIcons
          name="calendar-today"
          size={24}
          color={colors.common.white}
        />
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.closeHeader}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.common.white} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Daily Transactions</Text>
              <View style={{ width: 24 }} />
            </View>

            <Animated.View
              style={[
                styles.contentContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
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

                <View style={styles.dateContainer}>
                  <Text style={styles.dateText}>{formatDate(currentDate)}</Text>
                  <Text style={styles.dateSubtext}>
                    {isGoodDay ? "👍 " : "🤔 "}
                    {getDayStatus()}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={goToNextDay}
                  style={styles.navButton}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color={colors.primary.main}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.summaryContainer}>
                <View style={[styles.summaryCard, styles.incomeCard]}>
                  <MaterialCommunityIcons
                    name="arrow-down-circle"
                    size={20}
                    color={colors.status.success}
                    style={styles.summaryIcon}
                  />
                  <Text style={styles.summaryLabel}>Income</Text>
                  <Text style={styles.incomeText}>
                    {currencySymbol}
                    {totals.totalIncome.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.summaryDivider} />

                <View style={[styles.summaryCard, styles.expenseCard]}>
                  <MaterialCommunityIcons
                    name="arrow-up-circle"
                    size={20}
                    color={colors.status.error}
                    style={styles.summaryIcon}
                  />
                  <Text style={styles.summaryLabel}>Expense</Text>
                  <Text style={styles.expenseText}>
                    {currencySymbol}
                    {totals.totalExpense.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Show financial advice card */}
              <View style={styles.adviceCard}>
                <MaterialCommunityIcons
                  name="lightbulb-outline"
                  size={24}
                  color={colors.primary.main}
                />
                <Text style={styles.adviceText}>{randomAdvice}</Text>
              </View>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary.main} />
                  <Text style={styles.loadingText}>Counting your money...</Text>
                </View>
              ) : (
                <View style={styles.transactionsContainer}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Transactions</Text>
                    {transactions.length > 0 && (
                      <Text style={styles.transactionCount}>
                        {transactions.length}{" "}
                        {transactions.length === 1 ? "item" : "items"}
                      </Text>
                    )}
                  </View>

                  {transactions.length === 0 ? (
                    <View style={styles.emptyState}>
                      <MaterialCommunityIcons
                        name="currency-usd-off"
                        size={60}
                        color={colors.text.disabled}
                      />
                      <Text style={styles.emptyText}>{randomMessage}</Text>
                    </View>
                  ) : (
                    <FlatList
                      data={transactions}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ item }) => (
                        <TransactionItem
                          item={item}
                          currencySymbol={currencySymbol}
                        />
                      )}
                      contentContainerStyle={styles.transactionsList}
                      showsVerticalScrollIndicator={false}
                    />
                  )}
                </View>
              )}
            </Animated.View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddTransaction}
            >
              <MaterialCommunityIcons
                name="plus"
                size={24}
                color={colors.common.white}
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const TransactionItem = ({ item, currencySymbol }) => {
  const category = getCategoryById(item.categoryName, item.type);
  const paymentMethod = getPaymentMethodById(item.paymentMethod, item.type);
  const transactionDate = new Date(item.date);

  // Animation for list items
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.transactionItem, { opacity: fadeAnim }]}>
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
          {item.type === "income" ? "+" : "-"} {currencySymbol}
          {item.amount.toFixed(2)}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    flex: 1,
    backgroundColor: colors.background.dark,
    position: "relative",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 50,
  },
  contentContainer: {
    flex: 1,
  },
  iconButton: {
    marginRight: 15,
  },
  closeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.primary.main,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: colors.common.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  dateNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: colors.background.dark,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.dark,
  },
  dateContainer: {
    alignItems: "center",
  },
  dateText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: "600",
  },
  dateSubtext: {
    color: colors.text.secondary,
    fontSize: 12,
    marginTop: 4,
  },
  navButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryContainer: {
    flexDirection: "row",
    margin: 15,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 15,
    shadowColor: colors.common.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryCard: {
    flex: 1,
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.border.dark,
    marginHorizontal: 15,
  },
  summaryIcon: {
    marginBottom: 5,
  },
  incomeCard: {
    // styles for income card
  },
  expenseCard: {
    // styles for expense card
  },
  summaryLabel: {
    color: colors.text.secondary,
    fontSize: 14,
    marginBottom: 5,
  },
  incomeText: {
    color: colors.status.success,
    fontSize: 18,
    fontWeight: "bold",
  },
  expenseText: {
    color: colors.status.error,
    fontSize: 18,
    fontWeight: "bold",
  },
  adviceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.main,
  },
  adviceText: {
    color: colors.text.inverse,
    fontSize: 12,
    marginLeft: 10,
    flex: 1,
    fontStyle: "italic",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: colors.text.secondary,
    marginTop: 12,
    fontStyle: "italic",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: "600",
  },
  transactionCount: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  transactionsContainer: {
    flex: 1,
  },
  transactionsList: {
    paddingHorizontal: 15,
    paddingBottom: 80,
  },
  transactionItem: {
    // backgroundColor: colors.background.primary,
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.dark,
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
    marginBottom: 10,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  transactionDescription: {
    color: colors.text.inverse,
    fontSize: 14,
    marginBottom: 8,
    flexShrink: 1,
  },
  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  categoryTag: {
    backgroundColor: colors.background.dark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  categoryText: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  paymentMethodTag: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  paymentText: {
    color: colors.common.white,
    fontSize: 12,
    marginLeft: 4,
  },
  income: {
    color: colors.status.success,
  },
  expense: {
    color: colors.status.error,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
    padding: 20,
  },
  emptyText: {
    color: colors.text.secondary,
    marginTop: 16,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  addButton: {
    position: "absolute",
    bottom: 25,
    right: 25,
    backgroundColor: colors.primary.main,
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
