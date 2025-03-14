import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import colors from "../../assets/colors";
import { categories } from "../constants/categories";
import { paymentMethods } from "../constants/paymentMethods";
import LocalStorageService from "../utils/LocalStorageVariables";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RecurringTransactions = () => {
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all"); // 'all', 'income', 'expense'
  const [currencySymbol, setCurrencySymbol] = useState("₹");

  // New transaction form state
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense",
    categoryName: "",
    paymentMethod: "",
    frequency: "monthly",
    startDate: new Date(),
    endDate: null,
    active: true,
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);

  // Fetch currency symbol
  useEffect(() => {
    const fetchCurrencySymbol = async () => {
      const symbol = await LocalStorageService.getCurrencySymbol();
      setCurrencySymbol(symbol);
    };
    fetchCurrencySymbol();
  }, []);

  // Load recurring transactions whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchRecurringTransactions();

      // Also process any due recurring transactions
      LocalStorageService.processRecurringTransactions();
    }, [])
  );

  const fetchRecurringTransactions = async () => {
    setLoading(true);
    try {
      const transactions = await LocalStorageService.getRecurringTransactions();
      setRecurringTransactions(transactions);
    } catch (error) {
      console.error("Error fetching recurring transactions:", error);
    }
    setLoading(false);
  };

  const filteredTransactions = () => {
    if (filterType === "all") return recurringTransactions;
    return recurringTransactions.filter((t) => t.type === filterType);
  };

  const handleAddTransaction = async () => {
    // Validate form
    if (!formData.description.trim()) {
      Alert.alert("Missing Information", "Please enter a description");
      return;
    }

    if (
      !formData.amount ||
      isNaN(parseFloat(formData.amount)) ||
      parseFloat(formData.amount) <= 0
    ) {
      Alert.alert("Invalid Amount", "Please enter a valid positive number");
      return;
    }

    if (!formData.categoryName) {
      Alert.alert("Missing Category", "Please select a category");
      return;
    }

    if (!formData.paymentMethod) {
      Alert.alert("Missing Payment Method", "Please select a payment method");
      return;
    }

    try {
      setLoading(true);

      if (isEditMode && currentEditId) {
        // Update existing transaction
        await LocalStorageService.updateRecurringTransaction({
          ...formData,
          id: currentEditId,
        });
      } else {
        // Add new transaction
        await LocalStorageService.addRecurringTransaction(formData);
      }

      // Refresh transactions list
      await fetchRecurringTransactions();

      // Reset form and close modal
      resetForm();
      setModalVisible(false);
    } catch (error) {
      console.error("Error saving recurring transaction:", error);
      Alert.alert("Error", "Failed to save the recurring transaction");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this recurring transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            await LocalStorageService.deleteRecurringTransaction(id);
            await fetchRecurringTransactions();
            setLoading(false);
          },
        },
      ]
    );
  };

  const handleEditTransaction = (transaction) => {
    // Set form data with transaction details
    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type,
      categoryName: transaction.categoryName,
      paymentMethod: transaction.paymentMethod,
      frequency: transaction.frequency,
      startDate: new Date(transaction.startDate),
      endDate: transaction.endDate ? new Date(transaction.endDate) : null,
      active: transaction.active,
    });

    setIsEditMode(true);
    setCurrentEditId(transaction.id);
    setModalVisible(true);
  };

  const resetForm = () => {
    setFormData({
      description: "",
      amount: "",
      type: "expense",
      categoryName: "",
      paymentMethod: "",
      frequency: "monthly",
      startDate: new Date(),
      endDate: null,
      active: true,
    });
    setIsEditMode(false);
    setCurrentEditId(null);
  };

  const formatDate = (date) => {
    if (!date) return "Not set";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const getFrequencyText = (frequency) => {
    switch (frequency) {
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      case "yearly":
        return "Yearly";
      default:
        return "Unknown";
    }
  };

  const getNextOccurrence = (transaction) => {
    if (!transaction.active) return "Inactive";
    return formatDate(transaction.nextOccurrence);
  };

  const getFrequencyIcon = (frequency) => {
    switch (frequency) {
      case "daily":
        return "calendar-today";
      case "weekly":
        return "calendar-week";
      case "monthly":
        return "calendar-month";
      case "yearly":
        return "calendar";
      default:
        return "calendar";
    }
  };

  const getCategoryOptions = () => {
    // Check if categories[formData.type] exists before mapping
    if (!categories || !categories[formData.type]) {
      return <Picker.Item label="No categories available" value="" />;
    }

    return categories[formData.type].map((category) => (
      <Picker.Item
        key={category.id}
        label={category.name}
        value={category.id}
      />
    ));
  };

  const getPaymentMethodOptions = () => {
    if (!paymentMethods || !paymentMethods[formData.type]) {
      return <Picker.Item label="No payment methods available" value="" />;
    }

    return paymentMethods[formData.type].map((method) => (
      <Picker.Item key={method.id} label={method.name} value={method.id} />
    ));
  };

  const handleUpdateTransaction = async () => {
    try {
      // Get the existing recurring transactions
      const existingData = await AsyncStorage.getItem('recurringTransactions');
      const recurringTransactions = existingData ? JSON.parse(existingData) : [];
      
      // Find the transaction we're editing
      const index = recurringTransactions.findIndex(t => t.id === currentEditId);
      
      if (index !== -1) {
        // Create an updated transaction by merging the existing transaction with form data
        // This ensures we keep all fields that aren't being updated
        const updatedTransaction = {
          ...recurringTransactions[index], // Keep all existing fields
          ...formData, // Override with new form values
          // Convert form date strings to timestamps where needed
          startDate: formData.startDate ? new Date(formData.startDate).getTime() : recurringTransactions[index].startDate,
          endDate: formData.endDate ? new Date(formData.endDate).getTime() : recurringTransactions[index].endDate,
          // IMPORTANT: Preserve nextOccurrence if it wasn't specifically changed
          nextOccurrence: formData.nextOccurrence ? new Date(formData.nextOccurrence).getTime() : recurringTransactions[index].nextOccurrence,
        };
        
        // Make sure amount is a number
        updatedTransaction.amount = parseFloat(updatedTransaction.amount);
        
        // If they changed the frequency, we might need to recalculate nextOccurrence
        // This is optional, but could be helpful
        if (formData.frequency && formData.frequency !== recurringTransactions[index].frequency) {
          // Recalculate next occurrence based on new frequency
          const today = new Date();
          let nextOccurrence = new Date(today);
          switch(formData.frequency) {
            case 'daily':
              nextOccurrence.setDate(today.getDate() + 1);
              break;
            case 'weekly':
              nextOccurrence.setDate(today.getDate() + 7);
              break;
            case 'monthly':
              nextOccurrence.setMonth(today.getMonth() + 1);
              break;
            case 'yearly':
              nextOccurrence.setFullYear(today.getFullYear() + 1);
              break;
          }
          // Only update if the new calculated date is sooner than the current next occurrence
          if (!updatedTransaction.nextOccurrence || nextOccurrence.getTime() < updatedTransaction.nextOccurrence) {
            updatedTransaction.nextOccurrence = nextOccurrence.getTime();
          }
        }
        
        // Replace the transaction in the array
        recurringTransactions[index] = updatedTransaction;
        
        // Save back to AsyncStorage
        await AsyncStorage.setItem('recurringTransactions', JSON.stringify(recurringTransactions));
        
        // Update UI state
        setRecurringTransactions(recurringTransactions);
        setModalVisible(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      // Show error message to user
    }
  };

  const renderTransactionItem = ({ item }) => (
    <View style={[styles.transactionItem, !item.active && styles.inactiveItem]}>
      {/* Status indicator strip */}
      <View 
        style={[
          styles.statusStrip, 
          { 
            backgroundColor: item.type === "income" 
              ? colors.status.success 
              : colors.status.error 
          }
        ]}
      />
      
      <View style={styles.cardContent}>
        {/* Card Header with Title and Status */}
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.transactionTitle} numberOfLines={1}>
              {item.description}
            </Text>
            {!item.active && (
              <View style={styles.inactiveTag}>
                <Text style={styles.inactiveTagText}>INACTIVE</Text>
              </View>
            )}
          </View>
          
          <View style={styles.amountContainer}>
            <Text
              style={[
                styles.amount,
                {
                  color:
                    item.type === "income"
                      ? colors.status.success
                      : colors.status.error,
                },
              ]}
            >
              {item.type === "income" ? "+" : "-"} {currencySymbol}
              {parseFloat(item.amount).toFixed(2)}
            </Text>
          </View>
        </View>
        
        {/* Card Body with Details */}
        <View style={styles.cardBody}>
          {/* Frequency Section */}
          <View style={styles.frequencyContainer}>
            <MaterialCommunityIcons
              name={getFrequencyIcon(item.frequency)}
              size={20}
              color={item.type === "income" 
                ? colors.status.success 
                : colors.status.error}
              style={styles.frequencyIcon}
            />
            <View>
              <Text style={styles.detailLabel}>Frequency</Text>
              <Text style={styles.frequencyText}>
                {getFrequencyText(item.frequency)}
              </Text>
            </View>
          </View>
          
          {/* Dates Section - Now side by side */}
          <View style={styles.datesContainer}>
            {/* Next Occurrence */}
            <View style={styles.dateColumn}>
              <Text style={styles.detailLabel}>Next</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {getNextOccurrence(item)}
              </Text>
            </View>
            
            {/* End Date */}
            <View style={styles.dateColumn}>
              <Text style={styles.detailLabel}>End</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {item.endDate ? formatDate(item.endDate) : "No end date"}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Card Footer with Actions */}
        <View style={styles.cardFooter}>
          <View style={styles.categoryTag}>
            <MaterialCommunityIcons
              name={categories[item.type]?.find(c => c.id === item.categoryName)?.icon || "tag"}
              size={14}
              color={colors.text.inverse}
              style={{marginRight: 4}}
            />
            <Text style={styles.categoryText}>
              {categories[item.type]?.find(c => c.id === item.categoryName)?.name || "Category"}
            </Text>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditTransaction(item)}
            >
              <Ionicons name="pencil-sharp" size={18} color={colors.primary.main} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteTransaction(item.id)}
            >
              <Ionicons name="trash" size={18} color={colors.common.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons
        name="calendar-refresh"
        size={60}
        color={colors.text.disabled}
      />
      <Text style={styles.emptyTitle}>No Recurring Transactions</Text>
      <Text style={styles.emptyMessage}>
        Time to set up some recurring transactions!{"\n"}
        Bills don't pay themselves... unfortunately.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recurring Transactions</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color={colors.common.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === "all" && styles.activeFilter,
          ]}
          onPress={() => setFilterType("all")}
        >
          <Text
            style={[
              styles.filterText,
              filterType === "all" && styles.activeFilterText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === "income" && styles.activeFilter,
          ]}
          onPress={() => setFilterType("income")}
        >
          <Text
            style={[
              styles.filterText,
              filterType === "income" && styles.activeFilterText,
            ]}
          >
            Income
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === "expense" && styles.activeFilter,
          ]}
          onPress={() => setFilterType("expense")}
        >
          <Text
            style={[
              styles.filterText,
              filterType === "expense" && styles.activeFilterText,
            ]}
          >
            Expense
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions()}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          resetForm();
          setModalVisible(false);
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                resetForm();
                setModalVisible(false);
              }}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>
              {isEditMode
                ? "Edit Recurring Transaction"
                : "Add Recurring Transaction"}
            </Text>

            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.formContainer}>
            {/* Transaction Type Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Transaction Type</Text>
              <View style={styles.typeButtonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    formData.type === "expense" && styles.activeTypeButton,
                    formData.type === "expense" && {
                      backgroundColor: colors.status.error,
                    },
                  ]}
                  onPress={() =>
                    setFormData({
                      ...formData,
                      type: "expense",
                      categoryName: "",
                      paymentMethod: "",
                    })
                  }
                >
                  <MaterialCommunityIcons
                    name="arrow-up"
                    size={20}
                    color={
                      formData.type === "expense"
                        ? colors.common.white
                        : colors.status.error
                    }
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      formData.type === "expense" && {
                        color: colors.common.white,
                      },
                    ]}
                  >
                    Expense
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    formData.type === "income" && styles.activeTypeButton,
                    formData.type === "income" && {
                      backgroundColor: colors.status.success,
                    },
                  ]}
                  onPress={() =>
                    setFormData({
                      ...formData,
                      type: "income",
                      categoryName: "",
                      paymentMethod: "",
                    })
                  }
                >
                  <MaterialCommunityIcons
                    name="arrow-down"
                    size={20}
                    color={
                      formData.type === "income"
                        ? colors.common.white
                        : colors.status.success
                    }
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      formData.type === "income" && {
                        color: colors.common.white,
                      },
                    ]}
                  >
                    Income
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={styles.input}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                placeholder="e.g. Netflix Subscription"
              />
            </View>

            {/* Amount */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Amount</Text>
              <View style={styles.amountContainer}>
                <Text style={styles.currencySymbol}>{currencySymbol}</Text>
                <TextInput
                  style={styles.amountInput}
                  value={formData.amount}
                  onChangeText={(text) =>
                    setFormData({ ...formData, amount: text })
                  }
                  keyboardType="numeric"
                  placeholder="0.00"
                />
              </View>
            </View>

            {/* Category */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.categoryName}
                  style={styles.picker}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryName: value })
                  }
                >
                  <Picker.Item label="Select a category" value="" />
                  {getCategoryOptions()}
                </Picker>
              </View>
            </View>

            {/* Payment Method */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Payment Method</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.paymentMethod}
                  style={styles.picker}
                  onValueChange={(value) =>
                    setFormData({ ...formData, paymentMethod: value })
                  }
                >
                  <Picker.Item label="Select a payment method" value="" />
                  {getPaymentMethodOptions()}
                </Picker>
              </View>
            </View>

            {/* Frequency */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Frequency</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.frequency}
                  style={styles.picker}
                  onValueChange={(value) =>
                    setFormData({ ...formData, frequency: value })
                  }
                >
                  <Picker.Item label="Daily" value="daily" />
                  <Picker.Item label="Weekly" value="weekly" />
                  <Picker.Item label="Monthly" value="monthly" />
                  <Picker.Item label="Yearly" value="yearly" />
                </Picker>
              </View>
            </View>

            {/* Start Date */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Start Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {formatDate(formData.startDate)}
                </Text>
                <Ionicons
                  name="calendar"
                  size={20}
                  color={colors.primary.main}
                />
              </TouchableOpacity>

              {showStartDatePicker && (
                <DateTimePicker
                  value={formData.startDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowStartDatePicker(false);
                    if (selectedDate) {
                      setFormData({ ...formData, startDate: selectedDate });
                    }
                  }}
                />
              )}
            </View>

            {/* End Date */}
            <View style={styles.formGroup}>
              <View style={styles.endDateHeader}>
                <Text style={styles.formLabel}>End Date (Optional)</Text>
                <TouchableOpacity
                  onPress={() =>
                    setFormData({
                      ...formData,
                      endDate: formData.endDate ? null : new Date(),
                    })
                  }
                >
                  <Text style={styles.toggleEndDateText}>
                    {formData.endDate ? "Remove" : "Add End Date"}
                  </Text>
                </TouchableOpacity>
              </View>

              {formData.endDate && (
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {formatDate(formData.endDate)}
                  </Text>
                  <Ionicons
                    name="calendar"
                    size={20}
                    color={colors.primary.main}
                  />
                </TouchableOpacity>
              )}

              {showEndDatePicker && formData.endDate && (
                <DateTimePicker
                  value={formData.endDate || new Date()}
                  mode="date"
                  display="default"
                  minimumDate={formData.startDate || new Date()}
                  onChange={(event, selectedDate) => {
                    setShowEndDatePicker(false);
                    if (selectedDate) {
                      setFormData({ ...formData, endDate: selectedDate });
                    }
                  }}
                />
              )}
            </View>

            {/* Active Toggle (Only for edit mode) */}
            {isEditMode && (
              <View style={styles.formGroup}>
                <View style={styles.activeToggleContainer}>
                  <Text style={styles.formLabel}>Transaction Status</Text>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      {
                        backgroundColor: formData.active
                          ? colors.status.success
                          : colors.status.error,
                      },
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, active: !formData.active })
                    }
                  >
                    <Text style={styles.statusButtonText}>
                      {formData.active ? "Active" : "Inactive"}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.statusHelpText}>
                  {formData.active
                    ? "This recurring transaction is currently active and will be processed according to schedule."
                    : "This recurring transaction is currently inactive and will not generate new transactions."}
                </Text>
              </View>
            )}

            {/* Humorous Note */}
            <View style={styles.humorNote}>
              <Ionicons
                name="information-circle"
                size={20}
                color={colors.text.secondary}
              />
              <Text style={styles.humorText}>
                {formData.type === "expense"
                  ? "Setting up a recurring expense? That's adulting level 100!"
                  : "Recurring income? Nice! Let's hope it's not your allowance from mom."}
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={isEditMode ? handleUpdateTransaction : handleAddTransaction}
            >
              <Text style={styles.submitButtonText}>
                {isEditMode ? "Update Transaction" : "Add Transaction"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background.dark,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.inverse,
  },
  addButton: {
    backgroundColor: colors.primary.main,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  filterContainer: {
    flexDirection: "row",
    padding: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
    marginHorizontal: 4,
    borderWidth: 0.5,
    borderColor: colors.primary.main,
    backgroundColor: colors.background.dark,
  },
  activeFilter: {
    backgroundColor: colors.primary.main,
  },
  filterText: {
    color: colors.text.inverse,
    fontWeight: "500",
  },
  activeFilterText: {
    color: colors.common.white,
  },
  listContent: {
    flexGrow: 1,
    padding: 12,
  },
  transactionItem: {
    backgroundColor: colors.background.light,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  inactiveItem: {
    opacity: 0.7,
  },
  statusStrip: {
    width: 6,
    height: '100%',
  },
  cardContent: {
    flex: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.common.white,
    marginRight: 8,
    flex: 1,
  },
  inactiveTag: {
    backgroundColor: colors.status.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  inactiveTagText: {
    color: colors.common.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  amountContainer: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardBody: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  frequencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  frequencyIcon: {
    marginRight: 8,
  },
  frequencyText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateColumn: {
    flex: 1,
    paddingRight: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTag: {
    // backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor:colors.common.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    color: colors.text.inverse,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: colors.status.error,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.inverse,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.text.secondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.common.white,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
    color: colors.text.primary,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.common.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: colors.text.primary,
  },
  pickerContainer: {
    backgroundColor: colors.common.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  typeButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.light,
    padding: 12,
    borderRadius: 6,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeTypeButton: {
    borderWidth: 0,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.common.white,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  endDateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  toggleEndDateText: {
    fontSize: 14,
    color: colors.primary.main,
    fontWeight: "500",
  },
  humorNote: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 6,
    marginBottom: 20,
    alignItems: "center",
  },
  humorText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 8,
    fontStyle: "italic",
    flex: 1,
  },
  submitButton: {
    backgroundColor: colors.primary.main,
    padding: 16,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 32,
  },
  submitButtonText: {
    color: colors.common.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  activeToggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  statusButtonText: {
    color: colors.common.white,
    fontWeight: "bold",
  },
  statusHelpText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: "italic",
  },
});

export default RecurringTransactions;
