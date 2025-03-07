import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  BackHandler,
  Animated,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import colors from '../../assets/colors';

const AddTransaction = ({ navigation }) => {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.navigate('Home');
      return true;
    });

    return () => backHandler.remove();
  }, [navigation]);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleConfirm = (date) => {
    setCurrentDate(date);
    hideDatePicker();
  };

  const categories = {
    expense: [
      { id: 1, name: 'Food', icon: 'food' },
      { id: 2, name: 'Transport', icon: 'car' },
      { id: 3, name: 'Shopping', icon: 'shopping' },
      { id: 4, name: 'Bills', icon: 'file-document-outline' },
      { id: 5, name: 'Entertainment', icon: 'movie-open' },
      { id: 6, name: 'Health', icon: 'medical-bag' },
      { id: 7, name: 'Education', icon: 'school' },
      { id: 8, name: 'Other', icon: 'dots-horizontal' },
    ],
    income: [
      { id: 1, name: 'Salary', icon: 'cash' },
      { id: 2, name: 'Freelance', icon: 'laptop' },
      { id: 3, name: 'Investment', icon: 'chart-line' },
      { id: 4, name: 'Gift', icon: 'gift' },
      { id: 5, name: 'Other', icon: 'dots-horizontal' },
    ],
  };

  const handleSave = () => {
    // TODO: Implement saving logic
    navigation.navigate('Home');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Date Display */}
        <TouchableOpacity 
          style={styles.dateContainer}
          onPress={showDatePicker}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="calendar"
            size={24}
            color={colors.text.secondary}
          />
          <Text style={styles.dateText}>{formatDate(currentDate)}</Text>
          {/* <MaterialCommunityIcons
            name="chevron-down"
            size={24}
            color={colors.text.secondary}
          /> */}
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          date={currentDate}
          buttonTextColorIOS={colors.primary.main}
          pickerContainerStyleIOS={{ backgroundColor: colors.background.dark }}
          themeVariant="dark"
          isDarkModeEnabled
          accentColor={colors.primary.main}
          textColor={colors.text.inverse}
        />

        {/* Type Selector */}
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'expense' && styles.selectedTypeButton,
            ]}
            onPress={() => setType('expense')}
          >
            <MaterialCommunityIcons
              name="arrow-up-circle"
              size={24}
              color={type === 'expense' ? colors.text.inverse : colors.text.secondary}
            />
            <Text
              style={[
                styles.typeText,
                type === 'expense' && styles.selectedTypeText,
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'income' && styles.selectedTypeButton,
            ]}
            onPress={() => setType('income')}
          >
            <MaterialCommunityIcons
              name="arrow-down-circle"
              size={24}
              color={type === 'income' ? colors.text.inverse : colors.text.secondary}
            />
            <Text
              style={[
                styles.typeText,
                type === 'income' && styles.selectedTypeText,
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amount Input */}
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor={colors.text.secondary}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        {/* Description Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Description"
            placeholderTextColor={colors.text.secondary}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Category</Text>
        <ScrollView 
          style={styles.categoriesContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.categoriesGrid}>
            {categories[type].map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory?.id === category.id && styles.selectedCategoryCard,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <MaterialCommunityIcons
                  name={category.icon}
                  size={24}
                  color={selectedCategory?.id === category.id ? colors.text.inverse : colors.text.secondary}
                />
                <Text
                  style={[
                    styles.categoryName,
                    selectedCategory?.id === category.id && styles.selectedCategoryText,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!amount || !description || !selectedCategory) && styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={!amount || !description || !selectedCategory}
        >
          <Text style={styles.saveButtonText}>Save Transaction</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
    padding: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
    color: colors.text.inverse,
    marginLeft: 10,
    flex: 1,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: colors.background.secondary,
  },
  selectedTypeButton: {
    backgroundColor: colors.primary.main,
  },
  typeText: {
    marginLeft: 10,
    fontSize: 16,
    color: colors.text.secondary,
  },
  selectedTypeText: {
    color: colors.text.inverse,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  currencySymbol: {
    fontSize: 40,
    color: colors.text.inverse,
    marginRight: 10,
  },
  amountInput: {
    fontSize: 40,
    color: colors.text.inverse,
    minWidth: 150,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 30,
  },
  descriptionInput: {
    fontSize: 18,
    color: colors.text.inverse,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.dark,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.inverse,
    marginBottom: 15,
  },
  categoriesContainer: {
    flex: 1,
    marginBottom: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: colors.background.secondary,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedCategoryCard: {
    backgroundColor: colors.primary.main,
  },
  categoryName: {
    color: colors.text.secondary,
    fontSize: 14,
    marginTop: 5,
  },
  selectedCategoryText: {
    color: colors.text.inverse,
  },
  saveButton: {
    backgroundColor: colors.primary.main,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.text.disabled,
  },
  saveButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddTransaction; 