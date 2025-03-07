import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Notifications from "../components/Header Components/Notifications";
import Settings from "../components/Header Components/Settings";

const colors = {
  primary: "#ffffff",
  secondary: "#888888",
};

const CustomHeader = ({ title }) => {
  return (
    <View style={styles.headerContainer}>
      {/* Left Side (Project Name) */}
      <Text style={styles.title}>{title}</Text>

      {/* Right Side (Notifications & Settings) */}
      <View style={styles.rightContainer}>
        <Notifications />
        <Settings />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "black",
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  title: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "bold",
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    justifyContent: "space-between",
  },
});

export default CustomHeader;
