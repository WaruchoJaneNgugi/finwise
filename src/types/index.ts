export type ExpenseCategory =
  | 'housing'
  | 'food'
  | 'transport'
  | 'utilities'
  | 'medical'
  | 'education'
  | 'entertainment'
  | 'diningOut'
  | 'shopping'
  | 'subscriptions'
  | 'impulse'
  | 'other';

export type ExpenseType = 'necessary' | 'unnecessary';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  type: ExpenseType;
  date: string;
  isRecurring: boolean;
}

export interface FinancialProfile {
  monthlyIncome: number;
  currency: string;
}

export interface CategoryMeta {
  label: string;
  type: ExpenseType;
  color: string;
  icon: string;
}

export interface SpendingInsight {
  score: number;
  level: 'critical' | 'poor' | 'fair' | 'good' | 'excellent';
  message: string;
}

export interface InvestmentAdvice {
  emergencyFund: number;
  savings: number;
  investment: number;
  living: number;
  tips: string[];
}

export interface MonthlyBreakdown {
  totalExpenses: number;
  necessaryTotal: number;
  unnecessaryTotal: number;
  byCategory: Record<ExpenseCategory, number>;
  savingsLeft: number;
}

export type AppView = 'dashboard' | 'expenses' | 'insights' | 'advisor';
