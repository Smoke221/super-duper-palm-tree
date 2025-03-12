import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import ModalSelector from "react-native-modal-selector";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  uniqueNamesGenerator,
  adjectives,
  animals,
  NumberDictionary,
} from "unique-names-generator";
import colors from "../../assets/colors";

const UsernameScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [currency, setCurrency] = useState("INR"); // Default currency is INR
  const [error, setError] = useState("");

  // List of currencies with symbols and countries
  const currencies = [
    { code: "USD", symbol: "$", name: "United States Dollar", country: "United States" },
    { code: "EUR", symbol: "€", name: "Euro", country: "European Union" },
    { code: "GBP", symbol: "£", name: "British Pound", country: "United Kingdom" },
    { code: "INR", symbol: "₹", name: "Indian Rupee", country: "India" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen", country: "Japan" },
    { code: "CNY", symbol: "¥", name: "Chinese Yuan", country: "China" },
    { code: "AUD", symbol: "$", name: "Australian Dollar", country: "Australia" },
    { code: "CAD", symbol: "$", name: "Canadian Dollar", country: "Canada" },
    { code: "SGD", symbol: "$", name: "Singapore Dollar", country: "Singapore" },
    { code: "ZAR", symbol: "R", name: "South African Rand", country: "South Africa" },
    { code: "BRL", symbol: "R$", name: "Brazilian Real", country: "Brazil" },
    { code: "MXN", symbol: "$", name: "Mexican Peso", country: "Mexico" },
    { code: "RUB", symbol: "₽", name: "Russian Ruble", country: "Russia" },
    { code: "KRW", symbol: "₩", name: "South Korean Won", country: "South Korea" },
    { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", country: "Indonesia" },
    { code: "TRY", symbol: "₺", name: "Turkish Lira", country: "Turkey" },
    { code: "SAR", symbol: "﷼", name: "Saudi Riyal", country: "Saudi Arabia" },
    { code: "AED", symbol: "د.إ", name: "UAE Dirham", country: "United Arab Emirates" },
    { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", country: "Malaysia" },
    { code: "THB", symbol: "฿", name: "Thai Baht", country: "Thailand" },
    { code: "VND", symbol: "₫", name: "Vietnamese Dong", country: "Vietnam" },
    { code: "PHP", symbol: "₱", name: "Philippine Peso", country: "Philippines" },
    { code: "NGN", symbol: "₦", name: "Nigerian Naira", country: "Nigeria" },
    { code: "EGP", symbol: "£", name: "Egyptian Pound", country: "Egypt" },
    { code: "PKR", symbol: "₨", name: "Pakistani Rupee", country: "Pakistan" },
    { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", country: "Bangladesh" },
    { code: "NZD", symbol: "$", name: "New Zealand Dollar", country: "New Zealand" },
  ];

  // Format data for ModalSelector
  const currencyOptions = currencies.map((currency) => ({
    key: currency.code,
    label: `${currency.symbol} ${currency.code} - ${currency.country}`,
  }));

  const generateUniqueUsername = () => {
    const randomName = uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      length: 2,
      separator: "-",
    });

    const capitalizedRandomName = randomName
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");

    const randomNumbers = NumberDictionary.generate({
      min: 100,
      max: 999,
    });

    return `${capitalizedRandomName}s${randomNumbers}`;
  };

  const handleContinue = async () => {
    if (username.trim() === "") {
      setError("Username cannot be empty.");
      return;
    }

    try {
      const selectedCurrency = currencies.find((c) => c.code === currency);
      await AsyncStorage.setItem("username", username.trim());
      await AsyncStorage.setItem("currency", currency);
      await AsyncStorage.setItem("currencySymbol", selectedCurrency.symbol); // Save symbol
      navigation.replace("TabNavigator");
    } catch (e) {
      setError("Failed to save username or currency");
    }
  };

  const handleSkip = async () => {
    const finalUsername = generateUniqueUsername();
    try {
      const selectedCurrency = currencies.find((c) => c.code === currency);
      await AsyncStorage.setItem("username", finalUsername);
      await AsyncStorage.setItem("currency", currency);
      await AsyncStorage.setItem("currencySymbol", selectedCurrency.symbol); // Save symbol
      navigation.replace("TabNavigator");
    } catch (e) {
      setError("Failed to save username or currency");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Expense Manager</Text>
      <Text style={styles.subtitle}>Enter a username to get started</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter username (optional)"
        value={username}
        onChangeText={(text) => {
          setUsername(text);
          setError("");
        }}
      />

      {/* Currency Selector */}
      <ModalSelector
        data={currencyOptions}
        initValue={`${currencies.find((c) => c.code === currency).symbol} ${currency} - ${currencies.find((c) => c.code === currency).country}`}
        onChange={(option) => setCurrency(option.key)}
        style={styles.modalSelector}
        selectStyle={styles.selectStyle}
        selectTextStyle={styles.selectTextStyle}
        optionTextStyle={styles.optionTextStyle}
        optionContainerStyle={styles.optionContainerStyle}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipButtonText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: colors.background.dark,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary.main,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    color: colors.text.primary,
  },
  modalSelector: {
    marginBottom: 15,
  },
  selectStyle: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
  },
  selectTextStyle: {
    color: colors.text.primary,
    fontSize: 16,
  },
  optionTextStyle: {
    color: colors.text.primary,
    fontSize: 16,
  },
  optionContainerStyle: {
    backgroundColor: "white",
    borderRadius: 8,
    maxHeight: 300,
    overflow: "scroll",
  },
  button: {
    backgroundColor: colors.primary.main,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: colors.common.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: colors.status.error,
    marginBottom: 15,
  },
  skipButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  skipButtonText: {
    color: colors.primary.main,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default UsernameScreen;