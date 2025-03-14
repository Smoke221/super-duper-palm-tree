import AsyncStorage from "@react-native-async-storage/async-storage";

class LocalStorageService {
  static userName = null;
  static currencySymbol = null;
  static budget = null;
  static budgetCache = {}; // Cache for monthly budgets
  static recurringTransactions = null; // Cache for recurring transactions

  // Fetch userName from AsyncStorage if not already loaded
  static async getUserName() {
    if (this.userName) {
      return this.userName;
    }

    try {
      const storedUserName = await AsyncStorage.getItem("username");
      if (storedUserName) {
        this.userName = storedUserName;
        return storedUserName;
      }
      return "Guest";
    } catch (error) {
      return "Guest";
    }
  }

  // Fetch currencySymbol from AsyncStorage if not already loaded
  static async getCurrencySymbol() {
    if (this.currencySymbol) {
      return this.currencySymbol;
    }

    try {
      const storedCurrencySymbol = await AsyncStorage.getItem("currencySymbol");
      if (storedCurrencySymbol) {
        this.currencySymbol = storedCurrencySymbol;
        return storedCurrencySymbol;
      }
      return "₹";
    } catch (error) {
      return "₹";
    }
  }

  // Legacy method - kept for backward compatibility
  static async getBudget() {
    if (this.budget) {
      return this.budget;
    }
    try {
      const storedBudget = await AsyncStorage.getItem("budget");
      if (storedBudget) {
        this.budget = storedBudget;
        return storedBudget;
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }

  // Legacy method - kept for backward compatibility
  static async setBudget(budget) {
    await AsyncStorage.setItem("budget", budget);
  }

  // Get budget for a specific month and year
  static async getMonthlyBudget(year, month) {
    const budgetKey = `budget_${year}_${month}`;
    
    // Check cache first
    if (this.budgetCache[budgetKey]) {
      return this.budgetCache[budgetKey];
    }
    
    try {
      const storedBudget = await AsyncStorage.getItem(budgetKey);
      if (storedBudget) {
        this.budgetCache[budgetKey] = storedBudget;
        return storedBudget;
      }
      
      // If no budget is set for this month, try to get the default budget
      const defaultBudget = await this.getBudget();
      return defaultBudget;
    } catch (error) {
      console.error('Error getting monthly budget:', error);
      return 0;
    }
  }

  // Set budget for a specific month and year
  static async setMonthlyBudget(year, month, budget) {
    const budgetKey = `budget_${year}_${month}`;
    try {
      await AsyncStorage.setItem(budgetKey, budget.toString());
      this.budgetCache[budgetKey] = budget.toString();
      return true;
    } catch (error) {
      console.error('Error setting monthly budget:', error);
      return false;
    }
  }

  // Clear budget cache for testing or troubleshooting
  static clearBudgetCache() {
    this.budgetCache = {};
  }

  // Get all recurring transactions
  static async getRecurringTransactions() {
    if (this.recurringTransactions) {
      return this.recurringTransactions;
    }
    
    try {
      const storedTransactions = await AsyncStorage.getItem("recurringTransactions");
      if (storedTransactions) {
        const parsedTransactions = JSON.parse(storedTransactions);
        this.recurringTransactions = parsedTransactions;
        return parsedTransactions;
      }
      return [];
    } catch (error) {
      console.error('Error getting recurring transactions:', error);
      return [];
    }
  }

  // Save all recurring transactions
  static async saveRecurringTransactions(transactions) {
    try {
      await AsyncStorage.setItem("recurringTransactions", JSON.stringify(transactions));
      this.recurringTransactions = transactions;
      return true;
    } catch (error) {
      console.error('Error saving recurring transactions:', error);
      return false;
    }
  }

  // Add a new recurring transaction
  static async addRecurringTransaction(transaction) {
    try {
      const currentTransactions = await this.getRecurringTransactions();
      // Generate a unique ID
      transaction.id = Date.now().toString();
      // Set next occurrence based on start date
      transaction.nextOccurrence = new Date(transaction.startDate).getTime();
      
      const updatedTransactions = [...currentTransactions, transaction];
      await this.saveRecurringTransactions(updatedTransactions);
      return transaction.id;
    } catch (error) {
      console.error('Error adding recurring transaction:', error);
      return null;
    }
  }

  // Update a recurring transaction
  static async updateRecurringTransaction(updatedTransaction) {
    try {
      const currentTransactions = await this.getRecurringTransactions();
      const index = currentTransactions.findIndex(t => t.id === updatedTransaction.id);
      
      if (index !== -1) {
        currentTransactions[index] = updatedTransaction;
        await this.saveRecurringTransactions(currentTransactions);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating recurring transaction:', error);
      return false;
    }
  }

  // Delete a recurring transaction
  static async deleteRecurringTransaction(id) {
    try {
      const currentTransactions = await this.getRecurringTransactions();
      const filteredTransactions = currentTransactions.filter(t => t.id !== id);
      
      if (filteredTransactions.length !== currentTransactions.length) {
        await this.saveRecurringTransactions(filteredTransactions);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting recurring transaction:', error);
      return false;
    }
  }

  // Process due recurring transactions
  static async processRecurringTransactions() {
    try {
      const now = new Date().getTime();
      const recurringTransactions = await this.getRecurringTransactions();
      const regulartransactions = JSON.parse(await AsyncStorage.getItem("transactions") || "[]");
      let transactionsAdded = 0;
      
      // Find transactions that need to be created
      const updatedRecurringTransactions = recurringTransactions.map(rt => {
        // Skip inactive recurring transactions
        if (!rt.active) return rt;
        
        // Check if next occurrence is due
        if (rt.nextOccurrence <= now) {
          // Create a new transaction
          const newTransaction = {
            amount: parseFloat(rt.amount),
            categoryName: rt.categoryName,
            date: new Date(rt.nextOccurrence).toISOString(),
            description: rt.description,
            paymentMethod: rt.paymentMethod,
            type: rt.type,
            isRecurring: true,
            recurringId: rt.id
          };
          
          // Add to regular transactions
          regulartransactions.push(newTransaction);
          transactionsAdded++;
          
          // Calculate next occurrence based on frequency
          const nextDate = new Date(rt.nextOccurrence);
          switch (rt.frequency) {
            case 'daily':
              nextDate.setDate(nextDate.getDate() + 1);
              break;
            case 'weekly':
              nextDate.setDate(nextDate.getDate() + 7);
              break;
            case 'monthly':
              nextDate.setMonth(nextDate.getMonth() + 1);
              break;
            case 'yearly':
              nextDate.setFullYear(nextDate.getFullYear() + 1);
              break;
          }
          
          // Check if we've passed the end date
          if (rt.endDate && nextDate.getTime() > new Date(rt.endDate).getTime()) {
            rt.active = false; // Deactivate if we passed end date
          } else {
            rt.nextOccurrence = nextDate.getTime();
          }
        }
        
        return rt;
      });
      
      // Save changes if any transactions were processed
      if (transactionsAdded > 0) {
        await AsyncStorage.setItem("transactions", JSON.stringify(regulartransactions));
        await this.saveRecurringTransactions(updatedRecurringTransactions);
      }
      
      return transactionsAdded;
    } catch (error) {
      console.error('Error processing recurring transactions:', error);
      return 0;
    }
  }
}

export default LocalStorageService;
