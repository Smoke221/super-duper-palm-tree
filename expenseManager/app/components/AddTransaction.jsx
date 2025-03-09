import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  BackHandler,
  Animated,
  Platform,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../../assets/colors";
import UserService from "../helpers/UserName";
import { categories } from "../constants/categories";
import { paymentMethods } from "../constants/paymentMethods";

const AddTransaction = ({ navigation }) => {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  useEffect(() => {
    // Reset payment method when transaction type changes
    setPaymentMethod(type === "expense" ? "cash" : "bank_transfer");
  }, [type]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        navigation.navigate("Home");
        return true;
      }
    );

    return () => backHandler.remove();
  }, [navigation]);

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleConfirm = (date) => {
    setCurrentDate(date);
    hideDatePicker();
  };

  const handleSave = async () => {
    if (!amount || !selectedCategory) return;

    const userName = await UserService.getUserName();

    const transaction = {
      id: Date.now().toString(),
      userName,
      amount: parseFloat(amount),
      type,
      date: currentDate.toISOString(),
      categoryName: selectedCategory.id,
      description: description || undefined,
      paymentMethod: paymentMethod,
      isSync: false,
    };

    try {
      // Get existing transactions from AsyncStorage
      const existingTransactionsStr = await AsyncStorage.getItem(
        "transactions"
      );
      const existingTransactions = existingTransactionsStr
        ? JSON.parse(existingTransactionsStr)
        : [];

      // Add new transaction to the array
      const updatedTransactions = [...existingTransactions, transaction];

      // Save back to AsyncStorage
      await AsyncStorage.setItem(
        "transactions",
        JSON.stringify(updatedTransactions)
      );

      // Log the transaction data
      console.log("New Transaction:", transaction);
      console.log("Updated Transactions:", updatedTransactions);

      navigation.navigate("Home");
      setAmount("");
      setDescription("");
      setType("expense");
      setSelectedCategory(null);
      setCurrentDate(new Date());
      transaction.type === "expense"
        ? setPaymentMethod("cash")
        : setPaymentMethod("bank_transfer");
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Date Display */}
        <TouchableOpacity
          style={styles.dateContainer}
          onPress={showDatePicker}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="calendar"
            size={24}
            color={colors.text.secondary}
          />
          <Text style={styles.dateText}>{formatDate(currentDate)}</Text>
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          date={currentDate}
          buttonTextColorIOS={colors.primary.main}
          pickerContainerStyleIOS={{ backgroundColor: colors.background.dark }}
          themeVariant="dark"
          isDarkModeEnabled
          accentColor={colors.primary.main}
          textColor={colors.text.inverse}
        />

        {/* Type Selector */}
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === "expense" && styles.selectedTypeButton,
            ]}
            onPress={() => setType("expense")}
          >
            <MaterialCommunityIcons
              name="arrow-up-circle"
              size={24}
              color={
                type === "expense" ? colors.text.inverse : colors.text.secondary
              }
            />
            <Text
              style={[
                styles.typeText,
                type === "expense" && styles.selectedTypeText,
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === "income" && styles.selectedTypeButton,
            ]}
            onPress={() => setType("income")}
          >
            <MaterialCommunityIcons
              name="arrow-down-circle"
              size={24}
              color={
                type === "income" ? colors.text.inverse : colors.text.secondary
              }
            />
            <Text
              style={[
                styles.typeText,
                type === "income" && styles.selectedTypeText,
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amount Input */}
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>₹</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor={colors.text.secondary}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        {/* Description Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Description (Optional)"
            placeholderTextColor={colors.text.secondary}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Payment Method */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentMethodContainer}>
          {paymentMethods[type].map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethodButton,
                paymentMethod === method.id && styles.selectedPaymentMethod,
              ]}
              onPress={() => setPaymentMethod(method.id)}
            >
              <MaterialCommunityIcons
                name={method.icon}
                size={20}
                color={
                  paymentMethod === method.id
                    ? colors.text.inverse
                    : colors.text.secondary
                }
              />
              <Text
                style={[
                  styles.paymentMethodText,
                  paymentMethod === method.id &&
                    styles.selectedPaymentMethodText,
                ]}
              >
                {method.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Category</Text>
        <ScrollView
          style={styles.categoriesContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.categoriesGrid}>
            {categories[type].map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory?.id === category.id &&
                    styles.selectedCategoryCard,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <MaterialCommunityIcons
                  name={category.icon}
                  size={20}
                  color={
                    selectedCategory?.id === category.id
                      ? colors.text.inverse
                      : colors.text.secondary
                  }
                />
                <Text
                  style={[
                    styles.categoryName,
                    selectedCategory?.id === category.id &&
                      styles.selectedCategoryText,
                  ]}
                  numberOfLines={1}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            !amount || !selectedCategory
              ? styles.disabledButton
              : styles.enabledButton,
          ]}
          onPress={handleSave}
          disabled={!amount || !selectedCategory}
        >
          <Text style={styles.saveButtonText}>Save Transaction</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
    padding: 20,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
    color: colors.text.inverse,
    marginLeft: 10,
    flex: 1,
  },
  typeSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: colors.background.secondary,
  },
  selectedTypeButton: {
    backgroundColor: colors.primary.main,
  },
  typeText: {
    marginLeft: 10,
    fontSize: 16,
    color: colors.text.secondary,
  },
  selectedTypeText: {
    color: colors.text.inverse,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  currencySymbol: {
    fontSize: 40,
    color: colors.text.inverse,
    marginRight: 10,
  },
  amountInput: {
    fontSize: 40,
    color: colors.text.inverse,
    minWidth: 150,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 30,
  },
  descriptionInput: {
    fontSize: 18,
    color: colors.text.inverse,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.dark,
    paddingVertical: 10,
  },
  paymentMethodContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  paymentMethodButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
  },
  selectedPaymentMethod: {
    backgroundColor: colors.primary.main,
  },
  paymentMethodText: {
    marginLeft: 6,
    fontSize: 12,
    color: colors.text.secondary,
  },
  selectedPaymentMethodText: {
    color: colors.text.inverse,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.inverse,
    marginBottom: 15,
  },
  categoriesContainer: {
    flex: 1,
    marginBottom: 15,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingBottom: 10,
  },
  categoryCard: {
    width: "31%",
    flex: 0,
    minWidth: 90,
    backgroundColor: colors.background.secondary,
    padding: 8,
    borderRadius: 8,
    marginBottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedCategoryCard: {
    backgroundColor: colors.primary.main,
  },
  categoryName: {
    color: colors.text.secondary,
    fontSize: 12,
    marginLeft: 4,
  },
  selectedCategoryText: {
    color: colors.text.inverse,
  },
  saveButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: colors.text.disabled,
  },
  enabledButton: {
    backgroundColor: colors.status.success,
  },
  saveButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AddTransaction;
