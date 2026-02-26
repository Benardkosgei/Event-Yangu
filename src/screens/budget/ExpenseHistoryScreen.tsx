import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BudgetStackParamList } from '../../navigation/types';
import { Card } from '../../components/Card';
import { Colors } from '../../constants/colors';

type Props = NativeStackScreenProps<BudgetStackParamList, 'ExpenseHistory'>;

const mockExpenses = [
  {
    id: '1',
    description: 'Venue deposit',
    amount: 25000,
    category: 'Venue',
    date: '2026-02-10',
    addedBy: 'John Doe',
  },
  {
    id: '2',
    description: 'Catering advance payment',
    amount: 40000,
    category: 'Catering',
    date: '2026-02-09',
    addedBy: 'Jane Smith',
  },
  {
    id: '3',
    description: 'DJ booking fee',
    amount: 15000,
    category: 'Entertainment',
    date: '2026-02-08',
    addedBy: 'Mike Johnson',
  },
  {
    id: '4',
    description: 'Flower arrangements',
    amount: 12000,
    category: 'Decoration',
    date: '2026-02-07',
    addedBy: 'Sarah Williams',
  },
];

export const ExpenseHistoryScreen: React.FC<Props> = () => {
  const totalExpenses = mockExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expense History</Text>
        <Text style={styles.total}>Total: KES {totalExpenses.toLocaleString()}</Text>
      </View>

      {mockExpenses.map((expense) => (
        <Card key={expense.id}>
          <View style={styles.expenseHeader}>
            <Text style={styles.expenseDescription}>{expense.description}</Text>
            <Text style={styles.expenseAmount}>KES {expense.amount.toLocaleString()}</Text>
          </View>
          <View style={styles.expenseDetails}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{expense.category}</Text>
            </View>
            <Text style={styles.expenseDate}>{expense.date}</Text>
          </View>
          <Text style={styles.expenseAddedBy}>Added by {expense.addedBy}</Text>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  total: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
    marginRight: 12,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  expenseDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: Colors.primaryLight + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  expenseDate: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  expenseAddedBy: {
    fontSize: 12,
    color: Colors.text.light,
  },
});
