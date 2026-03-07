import { supabase } from '../lib/supabase';
import { Budget, BudgetCategory, Expense } from '../types';

export const budgetService = {
  async getBudget(eventId: string): Promise<Budget | null> {
    const { data: budget, error } = await supabase
      .from('budgets')
      .select(`
        *,
        budget_categories(*),
        expenses(*)
      `)
      .eq('event_id', eventId)
      .single();

    if (error) {
      return null;
    }

    return {
      id: budget.id,
      eventId: budget.event_id,
      totalBudget: budget.total_budget,
      categories: budget.budget_categories.map((cat: any): BudgetCategory => ({
        id: cat.id,
        name: cat.name,
        allocatedAmount: cat.allocated_amount,
      })),
      expenses: budget.expenses.map((exp: any): Expense => ({
        id: exp.id,
        budgetId: exp.budget_id,
        categoryId: exp.category_id,
        description: exp.description,
        amount: exp.amount,
        date: new Date(exp.expense_date),
        addedBy: exp.added_by,
      })),
    };
  },

  async createBudget(eventId: string, totalBudget: number, categories: Omit<BudgetCategory, 'id'>[]): Promise<Budget> {
    const { data: budget, error: budgetError } = await supabase
      .from('budgets')
      .insert({
        event_id: eventId,
        total_budget: totalBudget,
      })
      .select()
      .single();

    if (budgetError) {
      throw new Error('Failed to create budget');
    }

    // Create budget categories
    const categoryInserts = categories.map(cat => ({
      budget_id: budget.id,
      name: cat.name,
      allocated_amount: cat.allocatedAmount,
    }));

    const { data: budgetCategories, error: categoriesError } = await supabase
      .from('budget_categories')
      .insert(categoryInserts)
      .select();

    if (categoriesError) {
      throw new Error('Failed to create budget categories');
    }

    return {
      id: budget.id,
      eventId: budget.event_id,
      totalBudget: budget.total_budget,
      categories: budgetCategories.map((cat): BudgetCategory => ({
        id: cat.id,
        name: cat.name,
        allocatedAmount: cat.allocated_amount,
      })),
      expenses: [],
    };
  },

  async addExpense(expenseData: Omit<Expense, 'id'>): Promise<Expense> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data: expense, error } = await supabase
      .from('expenses')
      .insert({
        budget_id: expenseData.budgetId,
        category_id: expenseData.categoryId,
        description: expenseData.description,
        amount: expenseData.amount,
        expense_date: expenseData.date.toISOString().split('T')[0],
        added_by: user.id,
      })
      .select()
      .single();

    if (error) {
      throw new Error('Failed to add expense');
    }

    return {
      id: expense.id,
      budgetId: expense.budget_id,
      categoryId: expense.category_id,
      description: expense.description,
      amount: expense.amount,
      date: new Date(expense.expense_date),
      addedBy: expense.added_by,
    };
  },

  async updateExpense(expenseId: string, updates: Partial<Expense>): Promise<Expense> {
    const { data: expense, error } = await supabase
      .from('expenses')
      .update({
        description: updates.description,
        amount: updates.amount,
        expense_date: updates.date?.toISOString().split('T')[0],
        category_id: updates.categoryId,
      })
      .eq('id', expenseId)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update expense');
    }

    return {
      id: expense.id,
      budgetId: expense.budget_id,
      categoryId: expense.category_id,
      description: expense.description,
      amount: expense.amount,
      date: new Date(expense.expense_date),
      addedBy: expense.added_by,
    };
  },

  async deleteExpense(expenseId: string): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    if (error) {
      throw new Error('Failed to delete expense');
    }
  },
};