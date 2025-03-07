import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import colors from "../../assets/colors";

const categoryIcons = {
  food_groceries: "food",
  shopping: "shopping",
  transport: "car",
  entertainment: "movie",
  rent_utilities: "file-document-outline",
  health_medical: "medical-bag",
  education: "school-outline",
  travel: "airplane",
  others: "dots-horizontal",
  salary: "cash",
  savings_investments: "chart-line",
  miscellaneous: "gift",
};

const TopCategories = ({ categories }) => {
  const getIconForCategory = (categoryName) => {
    return categoryIcons[categoryName] || "help-circle-outline";
  };

  const expenseCategories = categories
    .filter((category) => category.type === "expense")
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);

  const renderNoCategories = () => (
    <View style={styles.noDataContainer}>
      <MaterialCommunityIcons 
        name="chart-bar" 
        size={50} 
        color={colors.text.secondary} 
      />
      <Text style={styles.noDataText}>No data to show</Text>
      <Text style={styles.noDataSubText}>
        Your top spending categories will appear here once you add some expenses
      </Text>
    </View>
  );

  return (
    <View style={styles.categoriesContainer}>
      <Text style={styles.sectionTitle}>Top Categories</Text>
      
      {expenseCategories.length === 0 ? (
        renderNoCategories()
      ) : (
        <View style={styles.categoriesGrid}>
          {expenseCategories.map((category, index) => (
            <View key={index} style={styles.categoryCard}>
              <MaterialCommunityIcons
                name={getIconForCategory(category.name)}
                size={32}
                color={colors.primary.main}
              />
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryAmount}>₹{category.amount}</Text>
              <Text style={styles.categoryPercentage}>
                {category.percentage.toFixed(1)}%
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  categoriesContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary.main,
    marginBottom: 10,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    backgroundColor: colors.background.secondary,
    borderRadius: 10,
    marginTop: 10,
  },
  noDataText: {
    fontSize: 16,
    color: colors.primary.main,
    fontWeight: 'bold',
    marginTop: 10,
  },
  noDataSubText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 5,
    paddingHorizontal: 20,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    width: "48%",
    backgroundColor: colors.background.secondary,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryName: {
    color: colors.text,
    fontSize: 14,
    marginTop: 5,
  },
  categoryAmount: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
  categoryPercentage: {
    color: colors.text.secondary,
    fontSize: 12,
    marginTop: 2,
  },
});

export default TopCategories;
