import type { GoalCategory, GoalCategoryMeta, Goal } from '../types';

export const GOAL_META: Record<GoalCategory, GoalCategoryMeta> = {
  emergency: { label: 'Emergency Fund', icon: '🛡️', color: '#F87171', description: 'Build a financial safety net' },
  vacation:  { label: 'Vacation',       icon: '✈️', color: '#60A5FA', description: 'Travel and experiences' },
  education: { label: 'Education',      icon: '📚', color: '#FFA55A', description: 'School fees, courses, upskilling' },
  property:  { label: 'Property',       icon: '🏡', color: '#FB923C', description: 'Home ownership or deposit' },
  car:       { label: 'Vehicle',        icon: '🚗', color: '#7B82FF', description: 'Car purchase or deposit' },
  business:  { label: 'Business',       icon: '💼', color: '#3DD68C', description: 'Start or grow a business' },
  retirement:{ label: 'Retirement',     icon: '🌿', color: '#34D399', description: 'Long-term retirement fund' },
  wedding:   { label: 'Wedding',        icon: '💍', color: '#F472B6', description: 'Wedding and celebrations' },
  other:     { label: 'Other',          icon: '🎯', color: '#C9A84C', description: 'Custom savings goal' },
};

export const getGoalProgress = (goal: Goal): number => {
  if (goal.targetAmount === 0) return 0;
  return Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
};

export const getMonthsToGoal = (goal: Goal): number | null => {
  const remaining = goal.targetAmount - goal.savedAmount;
  if (remaining <= 0) return 0;
  if (!goal.monthlyContribution || goal.monthlyContribution <= 0) return null;
  return Math.ceil(remaining / goal.monthlyContribution);
};

export const getGoalDeadlineStatus = (goal: Goal): 'on-track' | 'behind' | 'completed' | 'no-deadline' => {
  if (goal.completed || goal.savedAmount >= goal.targetAmount) return 'completed';
  if (!goal.deadline) return 'no-deadline';

  const now = new Date();
  const deadline = new Date(goal.deadline + '-01');
  const monthsLeft = (deadline.getFullYear() - now.getFullYear()) * 12
    + (deadline.getMonth() - now.getMonth());

  const monthsNeeded = getMonthsToGoal(goal);
  if (monthsNeeded === null) return 'behind';
  return monthsNeeded <= monthsLeft ? 'on-track' : 'behind';
};

export const projectGoalDate = (goal: Goal): string | null => {
  const months = getMonthsToGoal(goal);
  if (months === null) return null;
  if (months === 0) return 'Completed!';
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toLocaleDateString('en-KE', { month: 'short', year: 'numeric' });
};
