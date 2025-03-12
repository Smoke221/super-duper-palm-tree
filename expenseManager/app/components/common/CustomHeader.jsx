import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Notifications from "../../screens/DailyTransactions";
import Settings from "../../screens/Settings";
import UserService from "../../utils/UserName";
import colors from "../../../assets/colors";

const CustomHeader = ({ title }) => {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const name = await UserService.getUserName();
        setUserName(name);
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };

    fetchUserName();
  }, []);

  // Function to return greeting based on time of day
  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <View style={styles.headerContainer}>
      {/* Left Side (Project Name) */}
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.greeting}>
          {getTimeOfDayGreeting()}, {userName}
        </Text>
      </View>

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
    color: colors.text.inverse,
    fontSize: 20,
    fontWeight: "bold",
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    justifyContent: "space-between",
  },
  greeting: {
    color: colors.primary.main,
    fontSize: 9,
    marginTop: 5,
  },
});

export default CustomHeader;
