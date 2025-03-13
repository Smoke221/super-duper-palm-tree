import AsyncStorage from "@react-native-async-storage/async-storage";

class LocalStorageService {
  static userName = null;
  static currencySymbol = null;

  // Fetch userName from AsyncStorage if not already loaded
  static async getUserName() {
    if (this.userName) {
      return this.userName;
    }

    try {
      const storedUserName = await AsyncStorage.getItem("username");
      if (storedUserName) {
        this.userName = storedUserName;
        return storedUserName;
      }
      return "Guest";
    } catch (error) {
      return "Guest";
    }
  }

  // Fetch currencySymbol from AsyncStorage if not already loaded
  static async getCurrencySymbol() {
    if (this.currencySymbol) {
      return this.currencySymbol;
    }

    try {
      const storedCurrencySymbol = await AsyncStorage.getItem("currencySymbol");
      if (storedCurrencySymbol) {
        this.currencySymbol = storedCurrencySymbol;
        return storedCurrencySymbol;
      }
      return "₹";
    } catch (error) {
      return "₹";
    }
  }
}

export default LocalStorageService;
