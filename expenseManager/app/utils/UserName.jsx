import AsyncStorage from "@react-native-async-storage/async-storage";

class UserService {
  static userName = null;

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
      return "Guest"; // Default fallback
    } catch (error) {
      return "Guest"; // Default fallback on error
    }
  }
}

export default UserService;
