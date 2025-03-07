import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  uniqueNamesGenerator,
  adjectives,
  animals,
  NumberDictionary,
} from "unique-names-generator";
import colors from "../../assets/colors";
import ApiService from "../services/api.service";

const UsernameScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSkipDisclaimer, setShowSkipDisclaimer] = useState(false);

  const generateUniqueUsername = () => {
    const randomName = uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      length: 2,
      separator: "-",
    });

    // Capitalize the first letter of each word in randomName
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

  const handleSkip = async () => {
    try {
      const uniqueUsername = generateUniqueUsername();
      await AsyncStorage.setItem("username", uniqueUsername);
      await AsyncStorage.setItem("isSkipped", "true");
      navigation.replace("TabNavigator");
    } catch (e) {
      setError("Failed to save data");
    }
  };

  const handleAuth = async (action) => {
    setShowSkipDisclaimer(false);
    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await ApiService.authenticateUser({
        username: username.trim(),
        password,
        action,
        currency: "INR",
      });

      if (response.success) {
        await AsyncStorage.setItem("username", username.trim());
        await AsyncStorage.setItem("isSkipped", "false");
        navigation.replace("TabNavigator");
      } else {
        setError(response.message || "Authentication failed");
      }
    } catch (error) {
      setError(error.message || "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Expense Manager</Text>
      <Text style={styles.subtitle}>Please sign in to continue (optional)</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={(text) => {
          setUsername(text);
          setError("");
        }}
        placeholderTextColor="#666"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setError("");
        }}
        placeholderTextColor="#666"
        secureTextEntry
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.authButton]}
          onPress={() => handleAuth("signup")}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.authButton]}
          onPress={() => handleAuth("login")}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>

      {!showSkipDisclaimer ? (
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => setShowSkipDisclaimer(true)}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimer}>
            Your data won't be synced across devices if you continue without
            authentication.
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.continueButton]}
            onPress={handleSkip}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.inverse,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    backgroundColor: colors.background.secondary,
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  authButton: {
    backgroundColor: colors.primary.main,
    flex: 0.48,
  },
  continueButton: {
    backgroundColor: "#a38b43",
    width: "100%",
    marginTop: 15,
  },
  buttonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: "bold",
  },
  skipButton: {
    marginTop: 30,
    padding: 15,
    alignItems: "center",
  },
  skipButtonText: {
    color: colors.text.secondary,
    fontSize: 16,
  },
  disclaimerContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  disclaimer: {
    color: "#a38b43",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 5,
  },
  error: {
    color: colors.status.error,
    marginBottom: 10,
  },
});

export default UsernameScreen;
