import { useState, useCallback, useMemo } from 'react';
import type { Expense, FinancialProfile } from '../types';
import { generateId, getCurrentMonth, filterByMonth } from '../utils/expenses';
import { calculateMonthlyBreakdown, getSpendingInsight, getUnnecessaryWarnings } from '../utils/calculations';
import { syncCollection, syncDoc, deleteFromCollection } from '../lib/sync';

const STORAGE_KEY = 'finwise_expenses';
const PROFILE_KEY = 'finwise_profile';

const loadExpenses = (): Expense[] => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
};
const loadProfile = (): FinancialProfile => {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{"monthlyIncome":0,"currency":"KES"}'); }
  catch { return { monthlyIncome: 0, currency: 'KES' }; }
};

export const useExpenses = (billsTotal = 0, goalsTotal = 0) => {
  const [expenses, setExpenses] = useState<Expense[]>(loadExpenses);
  const [profile, setProfile] = useState<FinancialProfile>(loadProfile);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  const saveProfile = (updated: FinancialProfile) => {
    setProfile(updated);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    syncDoc('financialProfile', updated);
  };

  const addExpense = useCallback((data: Omit<Expense, 'id'>) => {
    const newExpense: Expense = { ...data, id: generateId() };
    const updated = [...expenses, newExpense];
    setExpenses(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    syncCollection('expenses', updated);
  }, [expenses]);

  const removeExpense = useCallback((id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    deleteFromCollection('expenses', id);
  }, [expenses]);

  const updateProfile = useCallback((income: number, currency: string) => {
    saveProfile({ monthlyIncome: income, currency });
  }, []);

  const monthlyExpenses = useMemo(() => filterByMonth(expenses, selectedMonth), [expenses, selectedMonth]);
  const breakdown = useMemo(() => calculateMonthlyBreakdown(monthlyExpenses, profile.monthlyIncome, billsTotal, goalsTotal), [monthlyExpenses, profile.monthlyIncome, billsTotal, goalsTotal]);
  const insight = useMemo(() => getSpendingInsight(breakdown, profile.monthlyIncome), [breakdown, profile.monthlyIncome]);
  const warnings = useMemo(() => getUnnecessaryWarnings(monthlyExpenses, profile.monthlyIncome), [monthlyExpenses, profile.monthlyIncome]);

  return { expenses, monthlyExpenses, profile, selectedMonth, setSelectedMonth, breakdown, insight, warnings, addExpense, removeExpense, updateProfile };
};
