import { create } from 'zustand';
import { Budget, BudgetCategory, Expense } from '../types';
import { budgetService } from '../services/budget.service';

interface BudgetState {
  budgets: Record<string, Budget>;
  isLoading: boolean;
  loadBudget: (eventId: string) => Promise<void>;
  createBudget: (eventId: string, totalBudget: number, categories: Omit<BudgetCategory, 'id'>[]) => Promise<void>;
  addExpense: (expenseData: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (expenseId: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: {},
  isLoading: false,

  loadBudget: async (eventId: string) => {
    set({ isLoading: true });
    try {
      const budget = await budgetService.getBudget(eventId);
      if (budget) {
        set((state) => ({
          budgets: { ...state.budgets, [eventId]: budget },
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createBudget: async (eventId: string, totalBudget: number, categories: Omit<BudgetCategory, 'id'>[]) => {
    set({ isLoading: true });
    try {
      const budget = await budgetService.createBudget(eventId, totalBudget, categories);
      set((state) => ({
        budgets: { ...state.budgets, [eventId]: budget },
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  addExpense: async (expenseData: Omit<Expense, 'id'>) => {
    set({ isLoading: true });
    try {
      const expense = await budgetService.addExpense(expenseData);
      
      // Find the budget that contains this expense
      const budgets = get().budgets;
      const budgetEntry = Object.entries(budgets).find(
        ([_, budget]) => budget.id === expenseData.budgetId
      );

      if (budgetEntry) {
        const [eventId, budget] = budgetEntry;
        set((state) => ({
          budgets: {
            ...state.budgets,
            [eventId]: {
              ...budget,
              expenses: [...budget.expenses, expense],
            },
          },
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateExpense: async (expenseId: string, updates: Partial<Expense>) => {
    try {
      const updatedExpense = await budgetService.updateExpense(expenseId, updates);
      
      // Update expense in the appropriate budget
      const budgets = get().budgets;
      Object.entries(budgets).forEach(([eventId, budget]) => {
        const expenseIndex = budget.expenses.findIndex((e) => e.id === expenseId);
        if (expenseIndex !== -1) {
          const updatedExpenses = [...budget.expenses];
          updatedExpenses[expenseIndex] = updatedExpense;
          set((state) => ({
            budgets: {
              ...state.budgets,
              [eventId]: {
                ...budget,
                expenses: updatedExpenses,
              },
            },
          }));
        }
      });
    } catch (error) {
      throw error;
    }
  },

  deleteExpense: async (expenseId: string) => {
    try {
      await budgetService.deleteExpense(expenseId);
      
      // Remove expense from the appropriate budget
      const budgets = get().budgets;
      Object.entries(budgets).forEach(([eventId, budget]) => {
        const updatedExpenses = budget.expenses.filter((e) => e.id !== expenseId);
        if (updatedExpenses.length !== budget.expenses.length) {
          set((state) => ({
            budgets: {
              ...state.budgets,
              [eventId]: {
                ...budget,
                expenses: updatedExpenses,
              },
            },
          }));
        }
      });
    } catch (error) {
      throw error;
    }
  },
}));
