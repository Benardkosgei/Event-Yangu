import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BudgetStackParamList } from '../../navigation/types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/colors';

type Props = NativeStackScreenProps<BudgetStackParamList, 'BudgetOverview'>;

const mockCategories = [
  { id: '1', name: 'Venue', allocated: 50000, spent: 45000 },
  { id: '2', name: 'Catering', allocated: 80000, spent: 72000 },
  { id: '3', name: 'Entertainment', allocated: 30000, spent: 15000 },
  { id: '4', name: 'Decoration', allocated: 20000, spent: 18000 },
];

export const BudgetOverviewScreen: React.FC<Props> = ({ navigation, route }) => {
  const { eventId } = route.params;
  
  const totalAllocated = mockCategories.reduce((sum, cat) => sum + cat.allocated, 0);
  const totalSpent = mockCategories.reduce((sum, cat) => sum + cat.spent, 0);
  const percentage = Math.round((totalSpent / totalAllocated) * 100);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budget Overview</Text>
      </View>

      <Card style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Budget</Text>
        <Text style={styles.summaryAmount}>KES {totalAllocated.toLocaleString()}</Text>
        
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percentage}%` }]} />
        </View>
        
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summarySubLabel}>Spent</Text>
            <Text style={styles.summarySubAmount}>KES {totalSpent.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRight}>
            <Text style={styles.summarySubLabel}>Remaining</Text>
            <Text style={styles.summarySubAmount}>
              KES {(totalAllocated - totalSpent).toLocaleString()}
            </Text>
          </View>
        </View>
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        {mockCategories.map((category) => {
          const catPercentage = Math.round((category.spent / category.allocated) * 100);
          return (
            <Card
              key={category.id}
              onPress={() => navigation.navigate('BudgetCategories', { eventId })}
            >
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryPercentage}>{catPercentage}%</Text>
              </View>
              <View style={styles.categoryAmounts}>
                <Text style={styles.categoryAmount}>
                  KES {category.spent.toLocaleString()} / {category.allocated.toLocaleString()}
                </Text>
              </View>
              <View style={styles.categoryProgress}>
                <View style={[styles.categoryProgressFill, { width: `${catPercentage}%` }]} />
              </View>
            </Card>
          );
        })}
      </View>

      <View style={styles.actions}>
        <Button
          title="Add Expense"
          onPress={() => navigation.navigate('AddExpense', { eventId })}
        />
        <Button
          title="View History"
          onPress={() => navigation.navigate('ExpenseHistory', { eventId })}
          variant="outline"
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
  summaryCard: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryRight: {
    alignItems: 'flex-end',
  },
  summarySubLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  summarySubAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  section: {
    padding: 24,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  categoryPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  categoryAmounts: {
    marginBottom: 8,
  },
  categoryAmount: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  categoryProgress: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  actions: {
    padding: 24,
    gap: 12,
  },
});
