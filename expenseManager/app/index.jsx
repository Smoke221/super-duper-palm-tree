import { createStackNavigator } from "@react-navigation/stack";
import React, { useState, useEffect } from "react";
import { StatusBar, View, ActivityIndicator } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import TabNavigator from "./TabNavigator";
import UsernameScreen from "./components/UsernameScreen";
import colors from '../assets/colors';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasUsername, setHasUsername] = useState(false);

  useEffect(() => {
    checkUsername();
  }, []);

  const checkUsername = async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      setHasUsername(!!username);
    } catch (e) {
      console.error('Failed to get username:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background.dark,
      }}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <>
      <StatusBar backgroundColor="black" barStyle="light-content" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName={hasUsername ? "TabNavigator" : "UsernameScreen"}
      >
        <Stack.Screen name="UsernameScreen" component={UsernameScreen} />
        <Stack.Screen name="TabNavigator" component={TabNavigator} />
      </Stack.Navigator>
    </>
  );
}
