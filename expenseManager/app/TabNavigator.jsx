import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigationState } from '@react-navigation/native';
import Home from "./screens/Home";
import Stats from "./screens/Stats";
import AddTransaction from "./components/AddTransaction";
import CustomHeader from "./components/common/CustomHeader";
import colors from "../assets/colors";
import Ionicons from "react-native-vector-icons/Ionicons";

const Tab = createBottomTabNavigator();

const AddButton = ({ navigation }) => {
  const state = useNavigationState(state => state);
  const currentRoute = state.routes[state.index].name;
  const isAddTransactionFocused = currentRoute === 'AddTransaction';

  return (
    <View style={styles.addTransactionButton}>
      <TouchableOpacity
        style={[
          styles.addButton,
          { backgroundColor: isAddTransactionFocused ? "red" : colors.primary.main }
        ]}
        onPress={() => {
          if (isAddTransactionFocused) {
            navigation.navigate('Home');
          } else {
            navigation.navigate('AddTransaction');
          }
        }}
      >
        <Ionicons 
          name={isAddTransactionFocused ? "close" : "add"} 
          size={32} 
          color={colors.text.inverse} 
        />
      </TouchableOpacity>
    </View>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background.dark,
          borderTopColor: colors.border.dark,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.secondary,
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          headerShown: true,
          header: () => <CustomHeader title="Expense Manager" />,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AddTransaction"
        component={AddTransaction}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('AddTransaction');
          },
        })}
        options={({ navigation }) => ({
          headerShown: false,
          tabBarLabel: "",
          tabBarIcon: () => <AddButton navigation={navigation} />,
        })}
      />
      <Tab.Screen
        name="Stats"
        component={Stats}
        options={{
          headerShown: true,
          header: () => <CustomHeader title="Expense Manager" />,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  addTransactionButton: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary.main,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default TabNavigator;
