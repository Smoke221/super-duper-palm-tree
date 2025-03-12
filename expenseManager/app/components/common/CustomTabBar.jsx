import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import Entypo from "react-native-vector-icons/Entypo";
import Ionicons from "react-native-vector-icons/Ionicons";

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabContainer}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const { options } = descriptors[route.key];
        const iconColor = isFocused ? "#6200ea" : "#aaa";

        let iconName;
        if (route.name === "Home") {
          iconName = <Entypo name="home" size={24} color={iconColor} />;
        } else if (route.name === "Stats") {
          iconName = (
            <Ionicons name="stats-chart-sharp" size={24} color={iconColor} />
          );
        }

        return (
          <TouchableOpacity
            key={index}
            onPress={() => navigation.navigate(route.name)}
            style={styles.tabButton}
          >
            {iconName}
            <Text style={{ color: iconColor }}>{route.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingTop: 10,
  },
  tabButton: {
    alignItems: "center",
  },
});

export default CustomTabBar;
