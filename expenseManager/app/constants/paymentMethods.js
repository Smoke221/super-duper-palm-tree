export const paymentMethods = {
  expense: [
    { id: "cash", name: "Cash", icon: "cash" },
    { id: "card", name: "Card", icon: "credit-card" },
    { id: "upi", name: "UPI", icon: "qrcode" },
  ],
  income: [
    { id: "bank_transfer", name: "Bank", icon: "bank-transfer" },
    { id: "cash", name: "Cash", icon: "cash" },
    { id: "digital", name: "Digital", icon: "cellphone" },
  ],
};

export const getPaymentMethodById = (id, type = 'expense') => {
  const methods = paymentMethods[type] || paymentMethods.expense;
  return methods.find(method => method.id === id) || methods[0];
}; 