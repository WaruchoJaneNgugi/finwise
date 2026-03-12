import { useState, useCallback, useMemo } from 'react';
import type { NetWorthItem } from '../types';
import { generateId } from '../utils/expenses';
import {calculateNetWorth} from "./netWorth.ts";

const STORAGE_KEY = 'finwise_networth';

const load = (): NetWorthItem[] => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
};

export const useNetWorth = () => {
  const [items, setItems] = useState<NetWorthItem[]>(load);

  const save = (updated: NetWorthItem[]) => {
    setItems(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addItem = useCallback((data: Omit<NetWorthItem, 'id'>) => {
    save([...items, { ...data, id: generateId() }]);
  }, [items]);

  const removeItem = useCallback((id: string) => {
    save(items.filter((i) => i.id !== id));
  }, [items]);

  const updateAmount = useCallback((id: string, amount: number) => {
    save(items.map((i) => i.id === id ? { ...i, amount } : i));
  }, [items]);

  const summary = useMemo(() => calculateNetWorth(items), [items]);

  return { items, summary, addItem, removeItem, updateAmount };
};
