export const categories = {
  expense: [
    { id: 'food_groceries', name: 'Food & Groceries', icon: 'food' },
    { id: 'transport', name: 'Transport', icon: 'car' },
    { id: 'shopping', name: 'Shopping', icon: 'shopping' },
    { id: 'bills', name: 'Bills', icon: 'file-document-outline' },
    { id: 'entertainment', name: 'Movies', icon: 'movie' },
    { id: 'health_medical', name: 'Health', icon: 'medical-bag' },
    { id: 'education', name: 'Education', icon: 'school' },
    { id: 'others', name: 'Other', icon: 'dots-horizontal' },
  ],
  income: [
    { id: 'salary', name: 'Salary', icon: 'cash' },
    { id: 'freelance', name: 'Freelance', icon: 'laptop' },
    { id: 'investments', name: 'Investment', icon: 'chart-line' },
    { id: 'gift', name: 'Gift', icon: 'gift' },
    { id: 'others', name: 'Other', icon: 'dots-horizontal' },
  ],
};

export const getCategoryById = (id, type) => {
  return categories[type].find(cat => cat.id === id) || categories[type].find(cat => cat.id === 'others');
};

export const getCategoryIcon = (categoryId, type = 'expense') => {
  const category = getCategoryById(categoryId, type);
  return category ? category.icon : 'help-circle-outline';
}; 