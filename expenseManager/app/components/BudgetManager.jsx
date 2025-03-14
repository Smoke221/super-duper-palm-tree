import React, { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  ProgressViewIOS,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import colors from "../../assets/colors";
import LocalStorageService from "../utils/LocalStorageVariables";

const BudgetManager = ({ currentDate, monthlyExpense = 0 }) => {
  const [budget, setBudget] = useState("0");
  const [newBudget, setNewBudget] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const [modalVisible, setModalVisible] = useState(false);

  // Get current year and month from provided date
  const year = currentDate
    ? currentDate.getFullYear()
    : new Date().getFullYear();
  const month = currentDate ? currentDate.getMonth() : new Date().getMonth();

  // Calculate budget usage percentage
  const budgetValue = parseFloat(budget) || 0;
  const expenseValue = parseFloat(monthlyExpense) || 0;
  const usagePercentage =
    budgetValue > 0 ? Math.min((expenseValue / budgetValue) * 100, 100) : 0;

  // Determine budget status
  const getBudgetStatus = () => {
    if (budgetValue === 0) return "unset";
    if (usagePercentage >= 100) return "exceeded";
    if (usagePercentage >= 80) return "warning";
    return "good";
  };

  const budgetStatus = getBudgetStatus();

  // Fetch budget and currency symbol on component mount or when the date changes
  useEffect(() => {
    const fetchData = async () => {
      // Get monthly budget for the specific year and month
      const storedBudget = await LocalStorageService.getMonthlyBudget(
        year,
        month
      );
      const storedCurrencySymbol =
        await LocalStorageService.getCurrencySymbol();

      setBudget(storedBudget.toString());
      setCurrencySymbol(storedCurrencySymbol);
    };

    fetchData();
  }, [year, month]); // Re-fetch when year or month changes

  // Handle budget update
  const handleUpdateBudget = async () => {
    if (newBudget && !isNaN(newBudget)) {
      // Save budget for the specific year and month
      await LocalStorageService.setMonthlyBudget(year, month, newBudget);
      setBudget(newBudget);
      setNewBudget("");
      setModalVisible(false);
    }
  };

  // Format month name for display
  const getMonthName = () => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return monthNames[month];
  };

  // Get status icon and color
  const getStatusIconAndColor = () => {
    switch (budgetStatus) {
      case "exceeded":
        return {
          icon: "alert-circle",
          color: colors.status.error,
          message:
            "Budget exceeded! Time to eat ramen for the rest of the month.",
        };
      case "warning":
        return {
          icon: "warning",
          color: colors.status.warning,
          message:
            "Getting close to your budget! Maybe skip that extra coffee?",
        };
      case "good":
        return {
          icon: "checkmark-circle",
          color: colors.status.success,
          message: "Budget on track! Treat yourself (moderately).",
        };
      case "unset":
      default:
        return {
          icon: "help-circle",
          color: colors.text.secondary,
          message: "Set a budget to track your spending!",
        };
    }
  };

  const { icon, color, message } = getStatusIconAndColor();

  // Custom progress bar implementation to avoid the null localData error
  const CustomProgressBar = ({ progress }) => {
    // Ensure progress is within valid range and not null
    const validProgress = Math.max(0.0001, Math.min(progress / 100, 1));

    if (Platform.OS === "ios") {
      return (
        <ProgressViewIOS progress={validProgress} progressTintColor={color} />
      );
    } else {
      return (
        <View style={styles.androidProgressContainer}>
          <View
            style={[
              styles.androidProgressFill,
              {
                width: `${progress}%`,
                backgroundColor: color,
              },
            ]}
          />
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.budgetCard}>
        <View style={styles.budgetHeader}>
          <Text style={styles.budgetTitle}>
            {getMonthName()} {year} Budget
          </Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="pencil" size={18} color={colors.primary.main} />
          </TouchableOpacity>
        </View>

        <View style={styles.budgetAmount}>
          <Text style={styles.currencySymbol}>{currencySymbol}</Text>
          <Text style={styles.budgetValue}>{budget}</Text>
        </View>

        {/* Budget Progress */}
        <View style={styles.progressContainer}>
          <CustomProgressBar progress={usagePercentage} />
          <View style={styles.expenseInfo}>
            <Text style={styles.expenseText}>
              {currencySymbol}
              {expenseValue.toFixed()} of {currencySymbol}
              {budgetValue.toFixed(0)}
            </Text>
            <Text style={[styles.percentageText, { color }]}>
              {usagePercentage.toFixed(0)}%
            </Text>
          </View>
        </View>

        {/* Budget Status */}
        <View style={styles.statusContainer}>
          <Ionicons name={icon} size={20} color={color} />
          <Text style={[styles.statusMessage, { color }]}>{message}</Text>
        </View>
      </View>

      {/* Budget Update Modal */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Update Budget for {getMonthName()} {year}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Enter budget amount:</Text>
              <TextInput
                style={styles.input}
                value={newBudget}
                onChangeText={setNewBudget}
                placeholder="Enter amount"
                keyboardType="numeric"
                placeholderTextColor={colors.text.secondary}
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setNewBudget("");
                  setModalVisible(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleUpdateBudget}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 15,
  },
  budgetCard: {
    backgroundColor: colors.common.white,
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  budgetTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  editButton: {
    padding: 5,
  },
  budgetAmount: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.primary.main,
    marginRight: 2,
  },
  budgetValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary.main,
  },
  progressContainer: {
    marginBottom: 12,
  },
  androidProgressContainer: {
    height: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
    overflow: "hidden",
  },
  androidProgressFill: {
    height: "100%",
    borderRadius: 5,
  },
  expenseInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  expenseText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.light,
    padding: 10,
    borderRadius: 5,
  },
  statusMessage: {
    marginLeft: 8,
    fontSize: 12,
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.common.white,
    padding: 20,
    borderRadius: 10,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 15,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: colors.text.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: colors.text.primary,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: colors.common.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary.main,
  },
  cancelButtonText: {
    color: colors.text.primary,
    fontWeight: "600",
  },
  saveButtonText: {
    color: colors.common.white,
    fontWeight: "600",
  },
});

export default BudgetManager;
