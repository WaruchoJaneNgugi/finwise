import type { BillCategory, BillCategoryMeta, Bill, BillStatus } from '../types';

export const BILL_META: Record<BillCategory, BillCategoryMeta> = {
  rent:         { label: 'Rent / Mortgage',  icon: '🏠', color: '#60A5FA' },
  electricity:  { label: 'Electricity',      icon: '💡', color: '#FBBF24' },
  water:        { label: 'Water',            icon: '💧', color: '#54C5D0' },
  internet:     { label: 'Internet / WiFi',  icon: '🌐', color: '#A78BFA' },
  phone:        { label: 'Phone / Airtime',  icon: '📱', color: '#F472B6' },
  insurance:    { label: 'Insurance',        icon: '🛡️', color: '#3DD68C' },
  subscription: { label: 'Subscription',     icon: '📺', color: '#E879F9' },
  loan:         { label: 'Loan Payment',     icon: '🏦', color: '#F87171' },
  tv:           { label: 'TV / Cable',       icon: '📡', color: '#FB923C' },
  other:        { label: 'Other',            icon: '📋', color: '#94A3B8' },
};

export const getBillStatus = (bill: Bill): BillStatus => {
  const today = new Date();
  const todayDay = today.getDate();

  if (bill.status === 'paid') {
    // Reset to upcoming if it's a new month
    if (bill.lastPaidDate) {
      const lastPaid = new Date(bill.lastPaidDate);
      if (lastPaid.getMonth() === today.getMonth() && lastPaid.getFullYear() === today.getFullYear()) {
        return 'paid';
      }
    }
    return 'upcoming';
  }

  if (todayDay > bill.dueDay) return 'overdue';
  if (todayDay >= bill.dueDay - 3) return 'upcoming'; // due within 3 days
  return 'upcoming';
};

export const getDaysUntilDue = (dueDay: number): number => {
  const today = new Date();
  const todayDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  if (dueDay >= todayDay) return dueDay - todayDay;
  return daysInMonth - todayDay + dueDay;
};

export const sortBillsByDueDate = (bills: Bill[]): Bill[] =>
  [...bills].sort((a, b) => {
    const daysA = getDaysUntilDue(a.dueDay);
    const daysB = getDaysUntilDue(b.dueDay);
    return daysA - daysB;
  });

export const getMonthlyTotal = (bills: Bill[]): number =>
  bills.reduce((sum, bill) => {
    if (bill.frequency === 'weekly')    return sum + bill.amount * 4;
    if (bill.frequency === 'quarterly') return sum + bill.amount / 3;
    if (bill.frequency === 'annually')  return sum + bill.amount / 12;
    return sum + bill.amount;
  }, 0);

export const getUpcomingBills = (bills: Bill[], days = 7): Bill[] =>
  bills.filter((b) => b.status !== 'paid' && getDaysUntilDue(b.dueDay) <= days);
