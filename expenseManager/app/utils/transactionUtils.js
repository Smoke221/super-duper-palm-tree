export const filterTransactionsByDate = (transactions, date) => {
  return transactions.filter(
    (transaction) =>
      new Date(transaction.date).toDateString() === date.toDateString()
  );
};

export const calculateTotals = (transactions) => {
  return transactions.reduce(
    (acc, transaction) => {
      if (transaction.type === "income") {
        acc.totalIncome += transaction.amount;
      } else {
        acc.totalExpense += transaction.amount;
      }
      return acc;
    },
    { totalIncome: 0, totalExpense: 0 }
  );
};

export const formatDate = (date) => {
  const options = { weekday: "short", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
};

export const formatTime = (date) => {
  const options = { hour: "numeric", minute: "numeric", hour12: true };
  return date.toLocaleTimeString("en-US", options);
};
