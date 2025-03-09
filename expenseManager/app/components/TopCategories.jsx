import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import colors from "../../assets/colors";
import { getCategoryById, getCategoryIcon } from "../constants/categories";

const TopCategories = ({ categories }) => {
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
      <Text style={styles.sectionTitle}>Spent On</Text>

      {expenseCategories.length === 0 ? (
        renderNoCategories()
      ) : (
        <View style={styles.categoriesGrid}>
          {expenseCategories.map((category, index) => {
            const categoryInfo = getCategoryById(
              category.categoryName,
              category.type
            );
            return (
              <View key={index} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <View style={styles.iconContainer}>
                    <MaterialCommunityIcons
                      name={getCategoryIcon(
                        category.categoryName,
                        category.type
                      )}
                      size={24}
                      color={colors.text.inverse}
                    />
                  </View>
                  <Text style={styles.categoryName} numberOfLines={1}>
                    {categoryInfo.name}
                  </Text>
                </View>
                <View style={styles.categoryDetails}>
                  <Text style={styles.categoryAmount}>
                    ₹{category.amount.toLocaleString()}
                  </Text>
                  <View style={styles.percentageContainer}>
                    <Text style={styles.categoryPercentage}>
                      {category.percentage.toFixed(1)}%
                    </Text>
                    <View
                      style={[
                        styles.percentageBar,
                        { width: `${Math.min(100, category.percentage)}%` },
                      ]}
                    />
                  </View>
                </View>
              </View>
            );
          })}
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
    marginBottom: 15,
  },
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    backgroundColor: colors.background.secondary,
    borderRadius: 10,
    marginTop: 10,
  },
  noDataText: {
    fontSize: 16,
    color: colors.primary.main,
    fontWeight: "bold",
    marginTop: 10,
  },
  noDataSubText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
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
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconContainer: {
    backgroundColor: colors.primary.main,
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  categoryName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  categoryDetails: {
    marginTop: 4,
  },
  categoryAmount: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  percentageContainer: {
    marginTop: 4,
  },
  categoryPercentage: {
    color: colors.text.secondary,
    fontSize: 12,
    marginBottom: 4,
  },
  percentageBar: {
    height: 3,
    backgroundColor: colors.primary.main,
    borderRadius: 1.5,
  },
});

export default TopCategories;
