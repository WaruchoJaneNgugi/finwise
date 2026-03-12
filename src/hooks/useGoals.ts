import { useState, useCallback } from 'react';
import type { Goal } from '../types';
import { generateId } from '../utils/expenses';

const STORAGE_KEY = 'finwise_goals';

const load = (): Goal[] => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
};

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>(load);

  const save = (updated: Goal[]) => {
    setGoals(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addGoal = useCallback((data: Omit<Goal, 'id' | 'createdAt' | 'completed'>) => {
    save([...goals, { ...data, id: generateId(), createdAt: new Date().toISOString(), completed: false }]);
  }, [goals]);

  const removeGoal = useCallback((id: string) => {
    save(goals.filter((g) => g.id !== id));
  }, [goals]);

  const updateSaved = useCallback((id: string, amount: number) => {
    save(goals.map((g) => {
      if (g.id !== id) return g;
      const updated = { ...g, savedAmount: Math.max(0, amount) };
      updated.completed = updated.savedAmount >= updated.targetAmount;
      return updated;
    }));
  }, [goals]);

  const contribute = useCallback((id: string, amount: number) => {
    save(goals.map((g) => {
      if (g.id !== id) return g;
      const newSaved = g.savedAmount + amount;
      return { ...g, savedAmount: newSaved, completed: newSaved >= g.targetAmount };
    }));
  }, [goals]);

  const markComplete = useCallback((id: string) => {
    save(goals.map((g) => g.id === id ? { ...g, completed: true, savedAmount: g.targetAmount } : g));
  }, [goals]);

  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);
  const totalTargeted = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.savedAmount, 0);

  return { goals, activeGoals, completedGoals, totalTargeted, totalSaved, addGoal, removeGoal, updateSaved, contribute, markComplete };
};
