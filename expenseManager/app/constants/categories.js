export const categories = {
  expense: [
    { id: 'food_groceries', name: 'Food & Groceries', icon: 'food', description: "Calories don’t count if you don’t look at the receipt." },
    { id: 'transport', name: 'Transport', icon: 'car', description: "Faster than walking, slower than free." },
    { id: 'shopping', name: 'Shopping', icon: 'shopping', description: "Retail therapy: because happiness is not free." },
    { id: 'bills', name: 'Bills', icon: 'file-document-outline', description: "Your money waving goodbye every month." },
    { id: 'entertainment', name: 'Movies', icon: 'movie', description: "A ticket to another world… and an empty wallet." },
    { id: 'health_medical', name: 'Health', icon: 'medical-bag', description: "Because staying sick is even more expensive!" },
    { id: 'education', name: 'Education', icon: 'school', description: "Pay now, earn later. Hopefully." },
    { id: 'others', name: 'Other', icon: 'dots-horizontal', description: "Just take my money already!" },
  ],
  income: [
    { id: 'salary', name: 'Salary', icon: 'cash', description: "Earn. Spend. Repeat." },
    { id: 'freelance', name: 'Freelance', icon: 'laptop', description: "Working anytime, which means working all the time." },
    { id: 'investments', name: 'Investment', icon: 'chart-line', description: "Because putting money under the mattress is old school." },
    { id: 'gift', name: 'Gift', icon: 'gift', description: "Free money? Don’t ask questions!" },
    { id: 'others', name: 'Other', icon: 'dots-horizontal', description: "Money mysteriously appeared? Enjoy it!" },
  ],
};

export const getCategoryById = (id, type) => {
  return categories[type].find(cat => cat.id === id) || categories[type].find(cat => cat.id === 'others');
};

export const getCategoryIcon = (categoryId, type = 'expense') => {
  const category = getCategoryById(categoryId, type);
  return category ? category.icon : 'help-circle-outline';
};

export const getCategoryDescription = (categoryId, type = 'expense') => {
  const category = getCategoryById(categoryId, type);
  return category ? category.description : '';
};

