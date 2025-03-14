import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
  Switch,
  Alert,
  ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import colors from "../../assets/colors";
import LocalStorageService from "../utils/LocalStorageVariables";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Settings = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [usernameModalVisible, setUsernameModalVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const [selectedCurrency, setSelectedCurrency] = useState("₹");
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(false);

  const currencies = [
    { symbol: "₹", name: "Indian Rupee (INR)" },
    { symbol: "$", name: "US Dollar (USD)" },
    { symbol: "€", name: "Euro (EUR)" },
    { symbol: "£", name: "British Pound (GBP)" },
    { symbol: "¥", name: "Japanese Yen (JPY)" },
    { symbol: "₩", name: "Korean Won (KRW)" },
    { symbol: "₽", name: "Russian Ruble (RUB)" },
    { symbol: "₿", name: "Bitcoin (BTC) (for the dreamers)" },
  ];

  // Fetch username and currency from AsyncStorage
  useEffect(() => {
    const fetchData = async () => {
      const storedUsername = await LocalStorageService.getUserName();
      const storedCurrencySymbol =
        await LocalStorageService.getCurrencySymbol();
      if (storedUsername) {
        setUsername(storedUsername);
        setNewUsername(storedUsername);
      }
      if (storedCurrencySymbol) {
        setCurrencySymbol(storedCurrencySymbol);
        setSelectedCurrency(storedCurrencySymbol);
      }
    };
    fetchData();
  }, []);

  const handleSaveUsername = async () => {
    if (newUsername.trim()) {
      await AsyncStorage.setItem("username", newUsername.trim());
      setUsername(newUsername.trim());
      LocalStorageService.userName = newUsername.trim();
      setUsernameModalVisible(false);

      Alert.alert(
        "Username Updated",
        `Congratulations on your new identity, ${newUsername.trim()}! 🎭`,
        [{ text: "I'll wear it with pride!" }]
      );
    } else {
      Alert.alert(
        "Error",
        "Username cannot be empty. We need to call you something!"
      );
    }
  };

  const handleSaveCurrency = async () => {
    await AsyncStorage.setItem("currencySymbol", selectedCurrency);
    setCurrencySymbol(selectedCurrency);
    LocalStorageService.currencySymbol = selectedCurrency;
    setCurrencyModalVisible(false);

    Alert.alert(
      "Currency Updated",
      selectedCurrency === "₿"
        ? "Bitcoin, huh? Dreaming big! Now watch those expenses in BTC. 🚀"
        : `Currency updated to ${selectedCurrency}. Money looks different now!`,
      [{ text: "Show me the money!" }]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      "Erase All Data",
      "Are you sure you want to delete everything? This is like factory resetting your financial life. No pressure.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, nuke it all",
          style: "destructive",
          onPress: async () => {
            const keys = await AsyncStorage.getAllKeys();
            await AsyncStorage.multiRemove(keys);
            LocalStorageService.userName = null;
            LocalStorageService.currencySymbol = null;
            LocalStorageService.budget = null;
            LocalStorageService.budgetCache = {};
            LocalStorageService.recurringTransactions = null;

            Alert.alert(
              "Data Cleared",
              "All data has been wiped. It's like you never spent any money! (If only real life worked that way...)",
              [{ text: "Fresh start!" }]
            );

            // Reset local state
            setUsername("Guest");
            setCurrencySymbol("₹");
            setSelectedCurrency("₹");
            setModalVisible(false);
          },
        },
      ]
    );
  };

  return (
    <>
      {/* Settings Icon */}
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Ionicons
          name="settings-outline"
          size={24}
          color={colors.common.white}
        />
      </TouchableOpacity>

      {/* Modal for Settings */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={styles.modalOverlay}
          onTouchEnd={() => setModalVisible(false)}
        >
          <View
            style={styles.modalContent}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Settings</Text>
              <Text style={styles.username}>hey, {username}</Text>
            </View>

            <ScrollView style={styles.settingsScrollView}>
              {/* Account Section */}
              <Text style={styles.sectionTitle}>Account</Text>

              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => setUsernameModalVisible(true)}
              >
                <View style={styles.settingLeft}>
                  <Ionicons
                    name="person"
                    size={20}
                    color={colors.primary.main}
                  />
                  <Text style={styles.settingText}>Change Username</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.text.secondary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => setCurrencyModalVisible(true)}
              >
                <View style={styles.settingLeft}>
                  <MaterialCommunityIcons
                    name="currency-usd"
                    size={20}
                    color={colors.primary.main}
                  />
                  <Text style={styles.settingText}>Currency</Text>
                </View>
                <View style={styles.settingRight}>
                  <Text style={styles.settingValue}>{currencySymbol}</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.text.secondary}
                  />
                </View>
              </TouchableOpacity>

              {/* Appearance Section */}
              {/* <Text style={styles.sectionTitle}>Appearance</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Ionicons name="moon" size={20} color={colors.primary.main} />
                  <Text style={styles.settingText}>Dark Mode</Text>
                </View>
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{ false: colors.border, true: colors.primary.main }}
                  thumbColor={colors.common.white}
                />
              </View> */}

              {/* Notifications Section */}
              {/* <Text style={styles.sectionTitle}>Notifications</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Ionicons name="notifications" size={20} color={colors.primary.main} />
                  <Text style={styles.settingText}>Budget Alerts</Text>
                </View>
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: colors.border, true: colors.primary.main }}
                  thumbColor={colors.common.white}
                />
              </View> */}

              <View style={styles.comingSoonFeature}>
                <Text style={styles.comingSoonLabel}>Sync Across Devices</Text>
                <Text style={styles.comingSoonDesc}>Coming Soon</Text>
              </View>

              {/* Other Section */}
              <Text style={styles.sectionTitle}>Other</Text>

              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => setPrivacyModalVisible(true)}
              >
                <View style={styles.settingLeft}>
                  <Ionicons
                    name="shield-checkmark"
                    size={20}
                    color={colors.primary.main}
                  />
                  <Text style={styles.settingText}>Privacy Policy</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.text.secondary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => setAboutModalVisible(true)}
              >
                <View style={styles.settingLeft}>
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color={colors.primary.main}
                  />
                  <Text style={styles.settingText}>About</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.text.secondary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => Linking.openURL("https://smoke221.github.io/")}
              >
                <View style={styles.settingLeft}>
                  <Ionicons
                    name="globe"
                    size={20}
                    color={colors.primary.main}
                  />
                  <Text style={styles.settingText}>Visit Developer's Site</Text>
                </View>
                <Ionicons
                  name="open-outline"
                  size={20}
                  color={colors.text.secondary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.settingItem, styles.dangerItem]}
                onPress={handleClearAllData}
              >
                <View style={styles.settingLeft}>
                  <Ionicons
                    name="trash"
                    size={20}
                    color={colors.status.error}
                  />
                  <Text style={[styles.settingText, styles.dangerText]}>
                    Clear All Data
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.versionInfo}>
                <Text style={styles.versionText}>Version 1.0.0</Text>
                <Text style={styles.versionTag}>
                  Spending money never looked so good
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        transparent
        visible={privacyModalVisible}
        animationType="slide"
        onRequestClose={() => setPrivacyModalVisible(false)}
      >
        <View style={styles.privacyModalOverlay}>
          <View style={styles.privacyModalContent}>
            <Text style={styles.privacyTitle}>Privacy Policy</Text>
            <Text style={styles.privacyText}>
              We don't collect or store any of your data. Seriously, we don't
              even know your favorite color.
              {"\n\n"}
              Your secrets are safe with us... because we don't have them!
              {"\n\n"}
              If you're still worried, just remember: we're too lazy to spy on
              you. 😴
              {"\n\n"}
              All your data is stored locally on your device, which means if you
              lose your phone, we can't help you recover your financial history.
              Consider it a fresh financial start!
            </Text>
            <TouchableOpacity
              style={styles.privacyCloseButton}
              onPress={() => setPrivacyModalVisible(false)}
            >
              <Text style={styles.privacyCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal
        transparent
        visible={aboutModalVisible}
        animationType="slide"
        onRequestClose={() => setAboutModalVisible(false)}
      >
        <View style={styles.privacyModalOverlay}>
          <View style={styles.privacyModalContent}>
            <Text style={styles.privacyTitle}>About Expense Manager</Text>
            <Text style={styles.privacyText}>
              This app was made with ❤️ and 🍕 by Anil.
              {"\n\n"}
              Expense Manager helps you track where all your money disappears
              to. Spoiler alert: it's probably coffee and subscriptions you
              forgot about.
              {"\n\n"}
              Features:
              {"\n"}• Track expenses and income
              {"\n"}• Set monthly budgets
              {"\n"}• Create recurring transactions
              {"\n"}• Visualize your spending habits
              {"\n"}• Feel guilty about your financial decisions
              {"\n\n"}
              Special thanks to:
              {"\n"}• Caffeine, for making development possible
              {"\n"}• The internet, for all the Stack Overflow answers
              {"\n"}• You, for using this app instead of actually saving money
            </Text>
            <TouchableOpacity
              style={styles.privacyCloseButton}
              onPress={() => setAboutModalVisible(false)}
            >
              <Text style={styles.privacyCloseButtonText}>
                Thanks for nothing
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Username Change Modal */}
      <Modal
        transparent
        visible={usernameModalVisible}
        animationType="slide"
        onRequestClose={() => setUsernameModalVisible(false)}
      >
        <View style={styles.privacyModalOverlay}>
          <View style={styles.privacyModalContent}>
            <Text style={styles.privacyTitle}>Change Username</Text>
            <Text style={styles.modalSubtitle}>
              What shall we call you, oh master of financial wisdom?
            </Text>

            <TextInput
              style={styles.textInput}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="Enter your name"
              placeholderTextColor={colors.text.secondary}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setNewUsername(username);
                  setUsernameModalVisible(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveUsername}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Currency Selection Modal */}
      <Modal
        transparent
        visible={currencyModalVisible}
        animationType="slide"
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <View style={styles.privacyModalOverlay}>
          <View style={styles.currencyModalContent}>
            <Text style={styles.privacyTitle}>Select Currency</Text>
            <Text style={styles.modalSubtitle}>
              Pick your poison... I mean, currency!
            </Text>

            <ScrollView style={styles.currencyList}>
              {currencies.map((currency) => (
                <TouchableOpacity
                  key={currency.symbol}
                  style={[
                    styles.currencyItem,
                    selectedCurrency === currency.symbol &&
                      styles.selectedCurrency,
                  ]}
                  onPress={() => setSelectedCurrency(currency.symbol)}
                >
                  <Text style={styles.currencySymbolText}>
                    {currency.symbol}
                  </Text>
                  <Text style={styles.currencyName}>{currency.name}</Text>
                  {selectedCurrency === currency.symbol && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary.main}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setSelectedCurrency(currencySymbol);
                  setCurrencyModalVisible(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveCurrency}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end", // Align modal to the bottom
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20, // Rounded corners at the top
    borderTopRightRadius: 20,
    width: Dimensions.get("window").width, // Full width of the screen
    maxHeight: Dimensions.get("window").height * 0.8, // 80% of screen height max
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2, // Shadow at the top
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  username: {
    fontSize: 16,
    color: colors.primary.main,
  },
  settingsScrollView: {
    maxHeight: Dimensions.get("window").height * 0.7,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
    marginTop: 20,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    fontSize: 16,
    color: colors.text.primary,
    marginLeft: 12,
  },
  settingValue: {
    fontSize: 16,
    color: colors.text.secondary,
    marginRight: 8,
  },
  dangerItem: {
    marginTop: 10,
    borderBottomWidth: 0,
  },
  dangerText: {
    color: colors.status.error,
  },
  versionInfo: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 10,
  },
  versionText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  versionTag: {
    fontSize: 10,
    fontStyle: "italic",
    color: colors.text.disabled,
  },
  comingSoonFeature: {
    backgroundColor: colors.background.light,
    padding: 10,
    borderRadius: 6,
    marginTop: 5,
    marginBottom: 10,
  },
  comingSoonLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.primary.main,
    marginBottom: 4,
  },
  comingSoonDesc: {
    fontSize: 12,
    fontStyle: "italic",
    color: colors.text.secondary,
  },
  privacyModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  privacyModalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    maxHeight: "80%",
  },
  currencyModalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    maxHeight: "70%",
  },
  privacyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 15,
    fontStyle: "italic",
  },
  privacyText: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  privacyCloseButton: {
    backgroundColor: colors.primary.main,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  privacyCloseButtonText: {
    color: colors.common.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  textInput: {
    backgroundColor: colors.background.light,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: colors.background.light,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary.main,
  },
  cancelButtonText: {
    color: colors.text.primary,
  },
  saveButtonText: {
    color: colors.common.white,
    fontWeight: "bold",
  },
  currencyList: {
    marginVertical: 10,
    maxHeight: 250,
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedCurrency: {
    backgroundColor: colors.background.light,
  },
  currencySymbolText: {
    fontSize: 18,
    fontWeight: "bold",
    width: 30,
    textAlign: "center",
    marginRight: 10,
  },
  currencyName: {
    fontSize: 14,
    flex: 1,
  },
  syncButton: {
    marginTop: 20,
    backgroundColor: colors.primary.main,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  syncButtonText: {
    color: colors.common.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  comingSoonText: {
    color: colors.text.secondary,
    fontSize: 10,
    fontStyle: "italic",
  },
  option: {
    fontSize: 16,
    paddingVertical: 5,
  },
  madeBy: {
    fontSize: 8,
    marginTop: 10,
    textAlign: "center",
  },
});

export default Settings;
