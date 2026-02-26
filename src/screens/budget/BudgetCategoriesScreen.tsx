import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BudgetStackParamList } from '../../navigation/types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';

type Props = NativeStackScreenProps<BudgetStackParamList, 'BudgetCategories'>;

const mockCategories = [
  {
    id: '1',
    name: 'Venue',
    allocated: 50000,
    spent: 45000,
    items: [
      { name: 'Hall rental', amount: 30000 },
      { name: 'Deposit', amount: 15000 },
    ],
  },
  {
    id: '2',
    name: 'Catering',
    allocated: 80000,
    spent: 72000,
    items: [
      { name: 'Food', amount: 50000 },
      { name: 'Beverages', amount: 22000 },
    ],
  },
  {
    id: '3',
    name: 'Entertainment',
    allocated: 30000,
    spent: 15000,
    items: [{ name: 'DJ booking', amount: 15000 }],
  },
  {
    id: '4',
    name: 'Decoration',
    allocated: 20000,
    spent: 18000,
    items: [
      { name: 'Flowers', amount: 12000 },
      { name: 'Balloons', amount: 6000 },
    ],
  },
];

export const BudgetCategoriesScreen: React.FC<Props> = ({ navigation, route }) => {
  const { eventId } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budget Categories</Text>
      </View>

      {mockCategories.map((category) => {
        const percentage = Math.round((category.spent / category.allocated) * 100);
        const remaining = category.allocated - category.spent;

        return (
          <Card key={category.id}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryPercentage}>{percentage}%</Text>
            </View>

            <View style={styles.amounts}>
              <View>
                <Text style={styles.amountLabel}>Allocated</Text>
                <Text style={styles.amountValue}>KES {category.allocated.toLocaleString()}</Text>
              </View>
              <View>
                <Text style={styles.amountLabel}>Spent</Text>
                <Text style={styles.amountValue}>KES {category.spent.toLocaleString()}</Text>
              </View>
              <View>
                <Text style={styles.amountLabel}>Remaining</Text>
                <Text style={[styles.amountValue, { color: remaining < 0 ? Colors.error : Colors.success }]}>
                  KES {remaining.toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(percentage, 100)}%` }]} />
            </View>

            <View style={styles.items}>
              <Text style={styles.itemsTitle}>Expenses:</Text>
              {category.items.map((item, index) => (
                <View key={index} style={styles.item}>
                  <Text style={styles.itemName}>• {item.name}</Text>
                  <Text style={styles.itemAmount}>KES {item.amount.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          </Card>
        );
      })}

      <View style={styles.actions}>
        <Button
          title="Add Expense"
          onPress={() => navigation.navigate('AddExpense', { eventId })}
        />
      </View>
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
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  categoryPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  amounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  items: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  itemAmount: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  actions: {
    padding: 24,
  },
});
