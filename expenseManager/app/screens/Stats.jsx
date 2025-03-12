import React, { useEffect, useState } from "react";
import { Text, View, Button, ScrollView } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stats = () => {
  const [userName, setUserName] = useState('');
  const [transactions, setTransactions] = useState([]);

  // Retrieve data from AsyncStorage when the component is mounted
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Retrieve userName and transactions from AsyncStorage
        const storedUserName = await AsyncStorage.getItem('username');
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
        <ScrollView style={{ marginTop: 10 }}>
          {/* Table Header */}
          <View style={{ flexDirection: 'row', borderBottomWidth: 1, paddingBottom: 5 }}>
            {/* <Text style={{ flex: 1, fontWeight: 'bold' }}>User Name</Text> */}
            <Text style={{ flex: 1, fontWeight: 'bold' }}>Amount</Text>
            <Text style={{ flex: 1, fontWeight: 'bold' }}>Type</Text>
            {/* <Text style={{ flex: 1, fontWeight: 'bold' }}>Date</Text> */}
            <Text style={{ flex: 1, fontWeight: 'bold' }}>Cat</Text>
            <Text style={{ flex: 1, fontWeight: 'bold' }}>Payment</Text>
            <Text style={{ flex: 1, fontWeight: 'bold' }}>Status</Text>
          </View>

          {/* Table Rows */}
          {transactions.map((transaction, index) => (
            <View key={index} style={{ flexDirection: 'row', borderBottomWidth: 1, paddingVertical: 5 }}>
              {/* <Text style={{ flex: 1 }}>{transaction.userName}</Text> */}
              <Text style={{ flex: 1 }}>{transaction.amount}</Text>
              <Text style={{ flex: 1 }}>{transaction.type}</Text>
              {/* <Text style={{ flex: 1 }}>{transaction.date}</Text> */}
              <Text style={{ flex: 1 }}>{transaction.categoryName}</Text>
              <Text style={{ flex: 1 }}>{transaction.paymentMethod}</Text>
              <Text style={{ flex: 1 }}>{transaction.isSync ? "Synced" : "Not Synced"}</Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text>No transactions found</Text>
      )}
    </View>
  );
};

export default Stats;
