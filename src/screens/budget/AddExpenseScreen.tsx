import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BudgetStackParamList } from '../../navigation/types';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';
import { validation } from '../../utils/validation';

type Props = NativeStackScreenProps<BudgetStackParamList, 'AddExpense'>;

const categoryOptions = [
  { label: 'Venue', value: 'venue' },
  { label: 'Catering', value: 'catering' },
  { label: 'Entertainment', value: 'entertainment' },
  { label: 'Decoration', value: 'decoration' },
  { label: 'Other', value: 'other' },
];

export const AddExpenseScreen: React.FC<Props> = ({ navigation }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    description: '',
    amount: '',
    category: '',
  });

  const validateForm = (): boolean => {
    const newErrors = {
      description: validation.required(description, 'Description') || '',
      amount: validation.positiveNumber(amount) || '',
      category: validation.required(category, 'Category') || '',
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== '');
  };

  const handleAddExpense = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Add expense logic
      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigation.goBack();
    } catch (error) {
      console.error('Add expense failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Add Expense</Text>

        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="What was this expense for?"
          error={errors.description}
        />

        <Input
          label="Amount (KES)"
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="numeric"
          error={errors.amount}
        />

        <Select
          label="Category"
          value={category}
          options={categoryOptions}
          onValueChange={setCategory}
          placeholder="Select category"
          error={errors.category}
        />

        <View style={styles.actions}>
          <Button title="Add Expense" onPress={handleAddExpense} loading={loading} />
          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="outline"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 24,
  },
  actions: {
    gap: 12,
    marginTop: 24,
  },
});
