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

const UsernameScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

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
      await AsyncStorage.setItem("username", username.trim());
      navigation.replace("TabNavigator");
    } catch (e) {
      setError("Failed to save username");
    }
  };

  const handleSkip = async () => {
    const finalUsername = generateUniqueUsername();
    try {
      await AsyncStorage.setItem("username", finalUsername);
      navigation.replace("TabNavigator");
    } catch (e) {
      setError("Failed to save username");
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
