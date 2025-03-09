import React, { useEffect, useState } from "react";
import { Text, View, Button, FlatList } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stats = () => {
  const [userName, setUserName] = useState('');
  const [transactions, setTransactions] = useState([]);

  // Retrieve data from AsyncStorage when the component is mounted
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Retrieve userName and transactions from AsyncStorage
        const storedUserName = await AsyncStorage.getItem('userName');
        const storedTransactions = await AsyncStorage.getItem('transactions');

        if (storedUserName !== null) {
          setUserName(storedUserName); // Set the userName state
        }
        if (storedTransactions !== null) {
          setTransactions(JSON.parse(storedTransactions)); // Set the transactions state
        }
      } catch (error) {
        console.error("Error retrieving data from AsyncStorage: ", error);
      }
    };

    fetchData();
  }, []);

  // Function to clear AsyncStorage
  const clearStorage = async () => {
    try {
      await AsyncStorage.clear(); // Clears all items in AsyncStorage
      setUserName('');
      setTransactions([]);
      console.log("Storage cleared!");
    } catch (error) {
      console.error("Error clearing storage: ", error);
    }
  };

  // Function to render a single transaction
  const renderTransaction = (transaction) => {
    return (
      <View style={{ marginBottom: 10 }}>
        <Text>User Name: {transaction.userName}</Text>
        <Text>Amount: {transaction.amount}</Text>
        <Text>Type: {transaction.type}</Text>
        <Text>Date: {transaction.date}</Text>
        <Text>Category: {transaction.categoryName}</Text>
        <Text>Payment Method: {transaction.paymentMethod}</Text>
        <Text>Sync Status: {transaction.isSync ? "Synced" : "Not Synced"}</Text>
      </View>
    );
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Clear Local Storage" onPress={clearStorage} />
      <Text>Stats</Text>

      {userName ? (
        <Text>User Name: {userName}</Text>
      ) : (
        <Text>No user name found</Text>
      )}

      <Text>Transactions:</Text>
      {transactions.length > 0 ? (
        <FlatList
          data={transactions}
          renderItem={({ item }) => renderTransaction(item)}
          keyExtractor={(item, index) => index.toString()}
        />
      ) : (
        <Text>No transactions found</Text>
      )}

    </View>
  );
};

export default Stats;
