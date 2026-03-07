import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BudgetStackParamList } from '../../navigation/types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Colors } from '../../constants/colors';
import { useBudgetStore } from '../../store/budgetStore';

type Props = NativeStackScreenProps<BudgetStackParamList, 'BudgetOverview'>;

export const BudgetOverviewScreen: React.FC<Props> = ({ navigation, route }) => {
  const { eventId } = route.params;
  const { budgets, isLoading, loadBudget } = useBudgetStore();
  const budget = budgets[eventId];

  useEffect(() => {
    loadBudget(eventId);
  }, [eventId]);

  if (isLoading && !budget) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!budget) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="💰"
          title="No Budget Yet"
          message="Create a budget to start tracking expenses for this event"
          actionLabel="Create Budget"
          onAction={() => {
            // TODO: Navigate to create budget screen
            navigation.goBack();
          }}
        />
      </View>
    );
  }

  const totalSpent = budget.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const percentage = Math.round((totalSpent / budget.totalBudget) * 100);

  // Calculate spent per category
  const categorySpending = budget.categories.map((category) => {
    const spent = budget.expenses
      .filter((exp) => exp.categoryId === category.id)
      .reduce((sum, exp) => sum + exp.amount, 0);
    return {
      ...category,
      spent,
    };
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budget Overview</Text>
      </View>

      <Card style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Budget</Text>
        <Text style={styles.summaryAmount}>KES {budget.totalBudget.toLocaleString()}</Text>
        
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min(percentage, 100)}%` }]} />
        </View>
        
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summarySubLabel}>Spent</Text>
            <Text style={styles.summarySubAmount}>KES {totalSpent.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRight}>
            <Text style={styles.summarySubLabel}>Remaining</Text>
            <Text style={[
              styles.summarySubAmount,
              totalSpent > budget.totalBudget && styles.overBudget
            ]}>
              KES {(budget.totalBudget - totalSpent).toLocaleString()}
            </Text>
          </View>
        </View>
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        {categorySpending.map((category) => {
          const catPercentage = Math.round((category.spent / category.allocatedAmount) * 100);
          return (
            <Card
              key={category.id}
              onPress={() => navigation.navigate('BudgetCategories', { eventId })}
            >
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={[
                  styles.categoryPercentage,
                  catPercentage > 100 && styles.overBudget
                ]}>
                  {catPercentage}%
                </Text>
              </View>
              <View style={styles.categoryAmounts}>
                <Text style={styles.categoryAmount}>
                  KES {category.spent.toLocaleString()} / {category.allocatedAmount.toLocaleString()}
                </Text>
              </View>
              <View style={styles.categoryProgress}>
                <View style={[
                  styles.categoryProgressFill,
                  { width: `${Math.min(catPercentage, 100)}%` },
                  catPercentage > 100 && styles.overBudgetBar
                ]} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  overBudget: {
    color: Colors.error,
  },
  overBudgetBar: {
    backgroundColor: Colors.error,
  },
});