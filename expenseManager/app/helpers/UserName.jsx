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
      throw new Error("User not authenticated");
    } catch (error) {
      throw new Error("Failed to retrieve userName from AsyncStorage");
    }
  }
}

export default UserService;
