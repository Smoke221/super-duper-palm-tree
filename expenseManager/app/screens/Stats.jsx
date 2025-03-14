import React, { useEffect, useState } from "react";
import { Text, View, Button, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import colors from "@/assets/colors";

const processRecurringTransactions = async (baseDate) => {
  try {
    // Get recurring transactions
    const recurringData = await AsyncStorage.getItem('recurringTransactions');
    if (!recurringData) return;
    
    const recurringTransactions = JSON.parse(recurringData);
    const transactionsData = await AsyncStorage.getItem('transactions');
    let transactions = transactionsData ? JSON.parse(transactionsData) : [];
    
    // Process each recurring transaction
    let modified = false;
    for (const recurring of recurringTransactions) {
      if (!recurring.active) continue;
      
      // Check if there's an endDate and if we've passed it
      if (recurring.endDate && baseDate > new Date(recurring.endDate)) {
        // If we've passed the end date, mark it as inactive
        recurring.active = false;
        modified = true;
        continue; // Skip processing this transaction
      }
      
      const nextOccurrence = new Date(recurring.nextOccurrence);
      
      // If next occurrence is before or equal to our test date
      if (nextOccurrence <= baseDate) {
        // Ensure amount is a number, not a string
        const amount = parseFloat(recurring.amount);
        if (isNaN(amount)) continue; // Skip if amount is not a valid number
        
        // Create new transaction with numeric amount
        const newTransaction = {
          id: Date.now() + Math.random().toString(36).substring(2, 10),
          amount: amount, // Using the parsed float value
          categoryName: recurring.categoryName,
          description: recurring.description,
          date: nextOccurrence.getTime(),
          paymentMethod: recurring.paymentMethod,
          type: recurring.type,
          notes: recurring.notes || '',
          fromRecurring: true,
          recurringId: recurring.id
        };
        
        transactions.push(newTransaction);
        
        // Calculate next occurrence based on frequency
        let updatedNextOccurrence = new Date(nextOccurrence);
        switch (recurring.frequency) {
          case 'daily':
            updatedNextOccurrence.setDate(updatedNextOccurrence.getDate() + 1);
            break;
          case 'weekly':
            // Correctly add 7 days for weekly transactions
            updatedNextOccurrence.setDate(updatedNextOccurrence.getDate() + 7);
            break;
          case 'monthly':
            // Handle month rollover correctly
            updatedNextOccurrence.setMonth(updatedNextOccurrence.getMonth() + 1);
            break;
          case 'yearly':
            updatedNextOccurrence.setFullYear(updatedNextOccurrence.getFullYear() + 1);
            break;
        }
        
        // Skip updating nextOccurrence if it would be after endDate
        if (recurring.endDate && updatedNextOccurrence > new Date(recurring.endDate)) {
          recurring.active = false; // Mark as inactive since we've reached the end
        } else {
          // Update the recurring transaction with next occurrence
          recurring.nextOccurrence = updatedNextOccurrence.getTime();
        }
        
        modified = true;
      }
    }
    
    // Save updated transactions and recurring transactions
    if (modified) {
      await AsyncStorage.setItem('transactions', JSON.stringify(transactions));
      await AsyncStorage.setItem('recurringTransactions', JSON.stringify(recurringTransactions));
    }
    
    return modified;
  } catch (error) {
    console.error('Error processing recurring transactions:', error);
    return false;
  }
};

const advanceTime = async (days) => {
  try {
    // Get current stored debug date or use current date
    const debugDateStr = await AsyncStorage.getItem('debugDate');
    let debugDate = debugDateStr ? new Date(parseInt(debugDateStr)) : new Date();
    
    // Advance time
    debugDate.setDate(debugDate.getDate() + days);
    
    // Store new debug date
    await AsyncStorage.setItem('debugDate', debugDate.getTime().toString());
    
    // Process recurring transactions with the new date
    const processed = await processRecurringTransactions(debugDate);
    
    return { 
      success: true, 
      newDate: debugDate.toDateString(), 
      processed
    };
  } catch (error) {
    console.error('Error advancing time:', error);
    return { success: false, error: error.message };
  }
};

const resetDebugTime = async () => {
  try {
    await AsyncStorage.removeItem('debugDate');
    return { success: true };
  } catch (error) {
    console.error('Error resetting debug time:', error);
    return { success: false, error: error.message };
  }
};

const viewStorageData = async () => {
  try {
    const recurringData = await AsyncStorage.getItem('recurringTransactions');
    const transactionsData = await AsyncStorage.getItem('transactions');
    const debugDateStr = await AsyncStorage.getItem('debugDate');
    
    return {
      debugDate: debugDateStr ? new Date(parseInt(debugDateStr)).toISOString() : 'Not set',
      recurringTransactions: recurringData ? JSON.parse(recurringData) : [],
      transactions: transactionsData ? JSON.parse(transactionsData) : []
    };
  } catch (error) {
    console.error('Error viewing storage data:', error);
    return { error: error.message };
  }
};

const Stats = () => {
  const [userName, setUserName] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [devMode, setDevMode] = useState(false);
  const [devData, setDevData] = useState(null);
  const [devMessage, setDevMessage] = useState('');
  const navigation = useNavigation();

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
          // setTransactions(JSON.parse(storedTransactions)); // Set the transactions state
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

  const toggleDevMode = () => {
    setDevMode(!devMode);
    if (!devMode) {
      setDevMessage('');
      setDevData(null);
    }
  };

  const handleAdvanceTime = async (days) => {
    const result = await advanceTime(days);
    if (result.success) {
      setDevMessage(`Time advanced to ${result.newDate}. ${result.processed ? 'Recurring transactions processed!' : 'No recurring transactions were due.'}`);
      // Refresh the screen or navigate to transactions
      setTimeout(() => navigation.navigate('Recurring'), 1000);
    } else {
      setDevMessage(`Error: ${result.error}`);
    }
  };

  const handleResetTime = async () => {
    const result = await resetDebugTime();
    if (result.success) {
      setDevMessage('Debug time reset to current time.');
    } else {
      setDevMessage(`Error: ${result.error}`);
    }
  };

  const handleViewStorage = async () => {
    const data = await viewStorageData();
    if (data.error) {
      setDevMessage(`Error: ${data.error}`);
    } else {
      setDevData(data);
      setDevMessage('Storage data retrieved.');
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
              <Text style={{ flex: 1 }}>{parseFloat(transaction.amount).toFixed(2)}</Text>
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

      <View style={styles.section}>
        <TouchableOpacity onPress={toggleDevMode} style={styles.developerButton}>
          <Text style={styles.developerButtonText}>
            {devMode ? 'Hide Developer Settings' : 'Developer Settings'}
          </Text>
        </TouchableOpacity>
        
        {devMode && (
          <View style={styles.developerPanel}>
            <Text style={styles.developerTitle}>Testing Recurring Transactions</Text>
            
            <View style={styles.devActions}>
              <TouchableOpacity onPress={() => handleAdvanceTime(1)} style={styles.devActionButton}>
                <Text style={styles.devActionText}>+1 Day</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => handleAdvanceTime(7)} style={styles.devActionButton}>
                <Text style={styles.devActionText}>+1 Week</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => handleAdvanceTime(30)} style={styles.devActionButton}>
                <Text style={styles.devActionText}>+1 Month</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.devActions}>
              <TouchableOpacity onPress={handleResetTime} style={[styles.devActionButton, styles.resetButton]}>
                <Text style={styles.devActionText}>Reset Time</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleViewStorage} style={[styles.devActionButton, styles.viewButton]}>
                <Text style={styles.devActionText}>View Storage</Text>
              </TouchableOpacity>
            </View>
            
            {devMessage ? (
              <View style={styles.messageBox}>
                <Text style={styles.messageText}>{devMessage}</Text>
              </View>
            ) : null}
            
            {devData && (
              <ScrollView style={styles.dataViewer}>
                <Text style={styles.dataTitle}>Current Debug Date:</Text>
                <Text style={styles.dataText}>{devData.debugDate}</Text>
                
                <Text style={styles.dataTitle}>Recurring Transactions:</Text>
                <Text style={styles.dataText}>
                  {JSON.stringify(devData.recurringTransactions, null, 2)}
                </Text>
                
                <Text style={styles.dataTitle}>Recent Transactions:</Text>
                <Text style={styles.dataText}>
                  {JSON.stringify(devData.transactions.slice(-5), null, 2)}
                </Text>
              </ScrollView>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
  },
  developerButton: {
    backgroundColor: colors.background.secondary,
    padding: 10,
    borderRadius: 5,
    margin: 10,
    alignItems: 'center',
  },
  developerButtonText: {
    color: colors.text.inverse,
    fontWeight: 'bold',
  },
  developerPanel: {
    backgroundColor: colors.background.secondary,
    padding: 15,
    margin: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary.dark,
  },
  developerTitle: {
    color: colors.primary.main,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  devActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  devActionButton: {
    flex: 1,
    backgroundColor: colors.primary.main,
    padding: 10,
    borderRadius: 5,
    margin: 5,
    alignItems: 'center',
  },
  devActionText: {
    color: colors.common.white,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: colors.status.error,
  },
  viewButton: {
    backgroundColor: colors.status.warning,
  },
  messageBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  messageText: {
    color: colors.text.inverse,
  },
  dataViewer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    maxHeight: 300,
  },
  dataTitle: {
    color: colors.primary.light,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  dataText: {
    color: colors.text.secondary,
    fontSize: 12,
    fontFamily: 'monospace',
  },
});

export default Stats;
