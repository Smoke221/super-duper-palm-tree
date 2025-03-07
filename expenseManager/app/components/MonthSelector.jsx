import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from "react-native-vector-icons/Ionicons";
import colors from "../../assets/colors";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MonthSelector = ({ currentDate, onMonthChange }) => {
  const changeMonth = (increment) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + increment);
    onMonthChange(newDate);
  };

  return (
    <View style={styles.monthSelector}>
      <TouchableOpacity 
        style={styles.arrowButton} 
        onPress={() => changeMonth(-1)}
      >
        <Ionicons name="chevron-back" size={24} color={colors.text.inverse} />
      </TouchableOpacity>
      <Text style={styles.monthText}>
        {months[currentDate.getMonth()]} {currentDate.getFullYear()}
      </Text>
      <TouchableOpacity 
        style={styles.arrowButton} 
        onPress={() => changeMonth(1)}
      >
        <Ionicons name="chevron-forward" size={24} color={colors.text.inverse} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  monthSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: colors.background.dark,
  },
  arrowButton: {
    padding: 5,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text.inverse,
    flex: 1,
    textAlign: 'center',
  },
});

export default MonthSelector; 