import { useState, useCallback, useMemo } from 'react';
import type{ Investment, InvestmentStatus } from '../types';
import { generateId, getCurrentMonth } from '../utils/expenses';
import { calculateInvestmentSummary, filterInvestmentsByMonth } from '../utils/investments';

const STORAGE_KEY = 'finwise_investments';

const loadInvestments = (): Investment[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const useInvestments = () => {
  const [investments, setInvestments] = useState<Investment[]>(loadInvestments);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  const save = (updated: Investment[]) => {
    setInvestments(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addInvestment = useCallback(
    (data: Omit<Investment, 'id'>) => {
      save([...investments, { ...data, id: generateId() }]);
    },
    [investments]
  );

  const removeInvestment = useCallback(
    (id: string) => save(investments.filter((i) => i.id !== id)),
    [investments]
  );

  const updateStatus = useCallback(
    (id: string, status: InvestmentStatus) => {
      save(investments.map((i) => (i.id === id ? { ...i, status } : i)));
    },
    [investments]
  );

  const monthlyInvestments = useMemo(
    () => filterInvestmentsByMonth(investments, selectedMonth),
    [investments, selectedMonth]
  );

  const summary = useMemo(
    () => calculateInvestmentSummary(investments, selectedMonth),
    [investments, selectedMonth]
  );

  return {
    investments,
    monthlyInvestments,
    selectedMonth,
    setSelectedMonth,
    summary,
    addInvestment,
    removeInvestment,
    updateStatus,
  };
};
