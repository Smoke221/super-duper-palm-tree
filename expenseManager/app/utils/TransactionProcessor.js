export const processLocalTransactions = (transactions, currentDate) => {
  // Filter transactions for current month
  const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });

  // Calculate summary
  const summary = filteredTransactions.reduce(
    (acc, transaction) => {
      const amount = transaction.amount;
      if (transaction.type === "income") {
        acc.totalIncome += amount;
      } else {
        acc.totalExpense += amount;
      }
      acc.totalAmount = acc.totalIncome - acc.totalExpense;
      return acc;
    },
    { totalAmount: 0, totalIncome: 0, totalExpense: 0 }
  );

  // Calculate category breakdown
  const categoryMap = new Map();
  filteredTransactions.forEach(transaction => {
    const key = transaction.categoryName;
    const existing = categoryMap.get(key) || { amount: 0, type: transaction.type };
    existing.amount += transaction.amount;
    categoryMap.set(key, existing);
  });

  const categoryBreakdown = Array.from(categoryMap.entries()).map(([categoryName, data]) => ({
    categoryName,
    amount: data.amount,
    type: data.type,
    percentage: (data.amount / (data.type === 'income' ? summary.totalIncome : summary.totalExpense)) * 100
  }));

  // Format transactions for display
  const formattedTransactions = filteredTransactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(transaction => ({
      ...transaction,
      id: transaction.id || `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      formattedDate: new Date(transaction.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }));

  return {
    transactionData: {
      transactions: formattedTransactions,
      summary,
      pagination: {
        total: formattedTransactions.length,
        currentPage: 1,
        limit: 10,
      },
    },
    categoryStats: {
      summary: {
        totalExpense: summary.totalExpense,
        totalIncome: summary.totalIncome,
        netAmount: summary.totalAmount,
      },
      categoryBreakdown,
    },
  };
}; 