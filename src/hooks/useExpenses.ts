import { useState, useCallback, useMemo } from 'react';
import type { Expense, FinancialProfile } from '../types';
import { generateId, getCurrentMonth, filterByMonth } from '../utils/expenses';
import {
  calculateMonthlyBreakdown,
  getSpendingInsight,
  getUnnecessaryWarnings,
} from '../utils/calculations';

const STORAGE_KEY = 'finwise_expenses';
const PROFILE_KEY = 'finwise_profile';

const loadExpenses = (): Expense[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const loadProfile = (): FinancialProfile => {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{"monthlyIncome":0,"currency":"KES"}');
  } catch {
    return { monthlyIncome: 0, currency: 'KES' };
  }
};

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>(loadExpenses);
  const [profile, setProfile] = useState<FinancialProfile>(loadProfile);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  const saveExpenses = (updated: Expense[]) => {
    setExpenses(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const saveProfile = (updated: FinancialProfile) => {
    setProfile(updated);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
  };

  const addExpense = useCallback(
    (data: Omit<Expense, 'id'>) => {
      const newExpense: Expense = { ...data, id: generateId() };
      saveExpenses([...expenses, newExpense]);
    },
    [expenses]
  );

  const removeExpense = useCallback(
    (id: string) => {
      saveExpenses(expenses.filter((e) => e.id !== id));
    },
    [expenses]
  );

  const updateProfile = useCallback((income: number, currency: string) => {
    saveProfile({ monthlyIncome: income, currency });
  }, []);

  const monthlyExpenses = useMemo(
    () => filterByMonth(expenses, selectedMonth),
    [expenses, selectedMonth]
  );

  const breakdown = useMemo(
    () => calculateMonthlyBreakdown(monthlyExpenses, profile.monthlyIncome),
    [monthlyExpenses, profile.monthlyIncome]
  );

  const insight = useMemo(
    () => getSpendingInsight(breakdown, profile.monthlyIncome),
    [breakdown, profile.monthlyIncome]
  );

  const warnings = useMemo(
    () => getUnnecessaryWarnings(monthlyExpenses, profile.monthlyIncome),
    [monthlyExpenses, profile.monthlyIncome]
  );

  return {
    expenses,
    monthlyExpenses,
    profile,
    selectedMonth,
    setSelectedMonth,
    breakdown,
    insight,
    warnings,
    addExpense,
    removeExpense,
    updateProfile,
  };
};
