import React, {type Dispatch, type SetStateAction, useState} from 'react';
import type {MonthlyBreakdown, SpendingInsight, FinancialProfile, Bill, Goal, Habit, AppView} from '../types';
import { formatCurrency, CATEGORY_META } from '../utils/expenses';
import { HabitsTracker } from './HabitsTracker';

interface DashboardProps {
  breakdown: MonthlyBreakdown;
  insight: SpendingInsight;
  profile: FinancialProfile;
  warnings: string[];
  onUpdateIncome: (income: number) => void;
  // Extended props
  bills?: Bill[];
  billsMonthlyTotal?: number;
  goals?: Goal[];
  netWorthSummary?: { totalAssets: number; totalLiabilities: number; netWorth: number };
  habits?: Habit[];
  habitsCompletedCount?: number;
  habitsCompletionPct?: number;
  efCurrent?: number;
  efTarget?: number;
  efProgressPct?: number;
  onToggleHabit?: (id: string) => void;
  onAddHabit?: (text: string) => void;
  onRemoveHabit?: (id: string) => void;
  onNavigate?: Dispatch<SetStateAction<AppView>>;
}

const LEVEL_COLORS: Record<string, string> = {
  excellent: 'var(--score-excellent)', good: 'var(--score-good)', fair: 'var(--score-fair)', poor: 'var(--score-poor)', critical: 'var(--score-critical)',
};
const LEVEL_BG: Record<string, string> = {
  excellent: 'var(--green-dim)', good: 'var(--blue-dim)',
  fair: 'var(--amber-dim)', poor: 'rgba(251,146,60,0.12)', critical: 'var(--red-dim)',
};

export const Dashboard: React.FC<DashboardProps> = ({
  breakdown, insight, profile, warnings, onUpdateIncome,
  bills = [], goals = [],
  netWorthSummary = { totalAssets: 0, totalLiabilities: 0, netWorth: 0 },
  habits = [], habitsCompletedCount = 0, habitsCompletionPct = 0,
  efCurrent = 0, efTarget = 0, efProgressPct = 0,
  onToggleHabit, onAddHabit, onRemoveHabit, onNavigate,
}) => {
  const [editingIncome, setEditingIncome] = useState(false);
  const [incomeInput, setIncomeInput] = useState(String(profile.monthlyIncome));
  const scoreColor = LEVEL_COLORS[insight.level];
  const scoreBg = LEVEL_BG[insight.level];

  const saveIncome = () => {
    const val = parseFloat(incomeInput.replace(/,/g, ''));
    if (!isNaN(val) && val > 0) onUpdateIncome(val);
    setEditingIncome(false);
  };

  const spendingPct = profile.monthlyIncome > 0
    ? Math.min(100, Math.round((breakdown.totalExpenses / profile.monthlyIncome) * 100)) : 0;
  const unnecessaryPct = profile.monthlyIncome > 0
    ? Math.min(100, Math.round((breakdown.unnecessaryTotal / profile.monthlyIncome) * 100)) : 0;

  const topCategories = Object.entries(breakdown.byCategory)
    .filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a).slice(0, 5);

  const billsDue = bills.filter((b) => b.status !== 'paid');
  const billsOverdue = bills.filter((b) => b.status === 'overdue');
  const activeGoals = goals.filter((g) => !g.completed).slice(0, 3);
  const efColor = efProgressPct >= 80 ? 'var(--green)' : efProgressPct >= 40 ? 'var(--amber)' : 'var(--red)';

  return (
    <div style={S.container} className="animate-in">

      {/* Setup banner */}
      {profile.monthlyIncome === 0 && (
        <div className="setup-banner">
          <span style={{ fontSize: 20 }}>💰</span>
          <span className="setup-text" style={S.setupText}>Set your monthly income to unlock personalized insights</span>
          <button style={S.setupBtn} onClick={() => setEditingIncome(true)}>Set Income</button>
        </div>
      )}

      {/* Stats row */}
      <div className="stats-grid">
        {/* Income */}
        <div style={S.statCard}>
          <div style={S.statLabel}>Monthly Income</div>
          {editingIncome ? (
            <div style={S.incomeEdit}>
              <input style={S.incomeInput} value={incomeInput}
                onChange={(e) => setIncomeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveIncome()}
                autoFocus placeholder="e.g. 45000" />
              <button style={S.saveBtn} onClick={saveIncome}>Save</button>
            </div>
          ) : (
            <div style={S.statValueRow}>
              <div style={S.statValue}>
                {profile.monthlyIncome > 0 ? formatCurrency(profile.monthlyIncome, profile.currency) : '—'}
              </div>
              <button style={S.editBtn} onClick={() => { setIncomeInput(String(profile.monthlyIncome)); setEditingIncome(true); }}>✎</button>
            </div>
          )}
          <div style={S.statSub}>per month</div>
        </div>

        {/* Total spent */}
        <div style={S.statCard}>
          <div style={S.statLabel}>Total Spent</div>
          <div style={S.statValue}>{formatCurrency(breakdown.totalExpenses, profile.currency)}</div>
          <div style={S.progressBar}>
            <div style={{ ...S.progressFill, width: `${spendingPct}%`, background: spendingPct > 80 ? 'var(--red)' : 'var(--blue)' }} />
          </div>
          <div style={S.statSub}>{spendingPct}% of income</div>
        </div>

        {/* Unnecessary */}
        <div style={S.statCard}>
          <div style={S.statLabel}>Unnecessary Spending</div>
          <div style={{ ...S.statValue, color: breakdown.unnecessaryTotal > 0 ? 'var(--amber)' : 'var(--green)' }}>
            {formatCurrency(breakdown.unnecessaryTotal, profile.currency)}
          </div>
          <div style={S.progressBar}>
            <div style={{ ...S.progressFill, width: `${unnecessaryPct}%`, background: 'var(--amber)' }} />
          </div>
          <div style={S.statSub}>{unnecessaryPct}% of income</div>
        </div>

        {/* Savings */}
        <div style={S.statCard}>
          <div style={S.statLabel}>Available to Save</div>
          <div style={{ ...S.statValue, color: breakdown.savingsLeft > 0 ? 'var(--green)' : 'var(--red)' }}>
            {formatCurrency(breakdown.savingsLeft, profile.currency)}
          </div>
          <div style={S.statSub}>
            {profile.monthlyIncome > 0 && breakdown.savingsLeft > 0
              ? `${Math.round((breakdown.savingsLeft / profile.monthlyIncome) * 100)}% remaining`
              : profile.monthlyIncome > 0 ? 'Overspent!' : '—'}
          </div>
        </div>
      </div>

      {/* Score + categories */}
      <div className="mid-row">
        <div style={{ ...S.scorePanel, background: scoreBg, border: `1px solid ${scoreColor}30` }} className="score-panel-equal">
          <div style={S.scoreHeader}>
            <span style={S.scorePanelLabel}>Financial Health</span>
            <span style={{ ...S.levelBadge, color: scoreColor, background: `${scoreColor}20` }}>
              {insight.level.toUpperCase()}
            </span>
          </div>
          <svg width="120" height="120" viewBox="0 0 120 120" style={{ margin: '6px 0' }}>
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
            <circle cx="60" cy="60" r="50" fill="none" stroke={scoreColor} strokeWidth="10"
              strokeDasharray={`${(insight.score / 100) * 314} 314`}
              strokeLinecap="round" transform="rotate(-90 60 60)"
              style={{ filter: `drop-shadow(0 0 6px ${scoreColor})` }}
            />
            <text x="60" y="55" textAnchor="middle" fill={scoreColor} fontSize="28" fontFamily="Cormorant Garamond" fontWeight="700">{insight.score}</text>
            <text x="60" y="72" textAnchor="middle" fill="#9BAAC4" fontSize="10" fontFamily="Karla">out of 100</text>
          </svg>
          <p style={S.scoreMessage}>{insight.message}</p>
        </div>

        <div style={S.categoriesCard}>
          <div style={S.cardTitle}>Top Spending Categories</div>
          {topCategories.length === 0 ? (
            <div style={S.emptyState}>No expenses yet this month</div>
          ) : (
            <div style={S.categoryList}>
              {topCategories.map(([cat, amount]) => {
                const meta = CATEGORY_META[cat as keyof typeof CATEGORY_META];
                const pct = breakdown.totalExpenses > 0 ? Math.round((amount / breakdown.totalExpenses) * 100) : 0;
                return (
                  <div key={cat} style={S.categoryItem}>
                    <div style={S.catLeft}>
                      <span style={S.catIcon}>{meta?.icon}</span>
                      <div>
                        <div style={S.catName}>{meta?.label}</div>
                        <div style={{ ...S.catType, color: meta?.type === 'unnecessary' ? 'var(--amber)' : 'var(--green)' }}>{meta?.type}</div>
                      </div>
                    </div>
                    <div style={S.catRight}>
                      <div style={S.catAmount}>{formatCurrency(amount, 'KES')}</div>
                      <div style={S.catBar}><div style={{ ...S.catBarFill, width: `${pct}%`, background: meta?.color }} /></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3-card preview row: Net Worth, Bills Due, Emergency Fund */}
      <div className="stats-grid">
        {/* Net Worth */}
        <div style={{ ...S.statCard, cursor: onNavigate ? 'pointer' : 'default' }}
          onClick={() => onNavigate?.('networth')}>
          <div style={S.statLabel}>Net Worth</div>
          <div style={{ ...S.statValue, color: netWorthSummary.netWorth >= 0 ? 'var(--green)' : 'var(--red)', fontSize: 22 }}>
            {formatCurrency(netWorthSummary.netWorth, profile.currency)}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6, fontSize: 11, color: 'var(--text-3)' }}>
            <span style={{ color: 'var(--green)' }}>↑ {formatCurrency(netWorthSummary.totalAssets, profile.currency)}</span>
            <span>·</span>
            <span style={{ color: 'var(--red)' }}>↓ {formatCurrency(netWorthSummary.totalLiabilities, profile.currency)}</span>
          </div>
        </div>

        {/* Bills */}
        <div style={{ ...S.statCard, cursor: onNavigate ? 'pointer' : 'default' }}
          onClick={() => onNavigate?.('bills')}>
          <div style={S.statLabel}>Bills Due</div>
          <div style={{ ...S.statValue, color: billsOverdue.length > 0 ? 'var(--red)' : 'var(--amber)', fontSize: 22 }}>
            {formatCurrency(billsDue.reduce((s, b) => s + b.amount, 0), profile.currency)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>
            {billsOverdue.length > 0
              ? <span style={{ color: 'var(--red)' }}>⚠ {billsOverdue.length} overdue!</span>
              : `${billsDue.length} unpaid this month`}
          </div>
        </div>

        {/* Emergency Fund */}
        <div style={{ ...S.statCard, cursor: onNavigate ? 'pointer' : 'default' }}
          onClick={() => onNavigate?.('emergency')}>
          <div style={S.statLabel}>Emergency Fund</div>
          <div style={{ ...S.statValue, color: efColor, fontSize: 22 }}>{efProgressPct}%</div>
          <div style={S.progressBar}>
            <div style={{ ...S.progressFill, width: `${efProgressPct}%`, background: efColor }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
            {formatCurrency(efCurrent, profile.currency)} of {formatCurrency(efTarget, profile.currency)}
          </div>
        </div>

        {/* Goals */}
        <div style={{ ...S.statCard, cursor: onNavigate ? 'pointer' : 'default' }}
          onClick={() => onNavigate?.('goals')}>
          <div style={S.statLabel}>Active Goals</div>
          <div style={{ ...S.statValue, color: 'var(--gold)', fontSize: 22 }}>{goals.filter((g) => !g.completed).length}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>
            {goals.filter((g) => g.completed).length} completed · {goals.length} total
          </div>
        </div>
      </div>

      {/* Goals progress preview */}
      {activeGoals.length > 0 && (
        <div style={S.previewCard}>
          <div style={{ ...S.cardTitle, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🎯 Goals Progress</span>
            {onNavigate && <button style={S.viewAllBtn} onClick={() => onNavigate('goals')}>View all →</button>}
          </div>
          {activeGoals.map((g) => {
            const gPct = g.targetAmount > 0 ? Math.min(100, Math.round((g.savedAmount / g.targetAmount) * 100)) : 0;
            const gColor = g.category === 'emergency' ? 'var(--red)' : g.category === 'retirement' ? 'var(--green)' : 'var(--gold)';
            return (
              <div key={g.id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-1)' }}>{g.name}</span>
                  <span style={{ fontSize: 12, color: gColor, fontWeight: 600 }}>{gPct}%</span>
                </div>
                <div style={S.progressBar}>
                  <div style={{ ...S.progressFill, width: `${gPct}%`, background: gColor }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{formatCurrency(g.savedAmount, profile.currency)} saved</span>
                  <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{formatCurrency(g.targetAmount, profile.currency)} target</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div style={S.warningsCard}>
          <div style={S.cardTitle}>⚠️ Spending Alerts</div>
          <div style={S.warningsList}>
            {warnings.map((w, i) => (
              <div key={i} style={S.warningItem}>
                <span style={S.warningBullet}>›</span>
                <span>{w}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Habits tracker */}
      {onToggleHabit && onAddHabit && onRemoveHabit && (
        <HabitsTracker
          habits={habits}
          completedCount={habitsCompletedCount}
          completionPct={habitsCompletionPct}
          onToggle={onToggleHabit}
          onAdd={onAddHabit}
          onRemove={onRemoveHabit}
        />
      )}
    </div>
  );
};

const S: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: 20 },
  setupText: { flex: 1, fontSize: 14, color: 'var(--gold-l)' },
  setupBtn: { padding: '8px 18px', background: 'var(--gold)', color: '#0A1628', borderRadius: 8, fontWeight: 700, fontSize: 13, fontFamily: 'Karla, sans-serif', whiteSpace: 'nowrap' },
  statCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px', boxShadow: 'var(--shadow-md)', transition: '0.15s' },
  statLabel: { fontSize: 12, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 },
  statValueRow: { display: 'flex', alignItems: 'center', gap: 8 },
  statValue: { fontFamily: 'Cormorant Garamond, serif', fontSize: 26, fontWeight: 700, color: 'var(--text-1)' },
  statSub: { fontSize: 12, color: 'var(--text-3)', marginTop: 6 },
  incomeEdit: { display: 'flex', gap: 8, alignItems: 'center' },
  incomeInput: { flex: 1, minWidth: 0, background: 'var(--bg-surface)', border: '1px solid var(--border-acc)', borderRadius: 6, padding: '6px 10px', color: 'var(--text-1)', fontSize: 15, fontFamily: 'Karla, sans-serif' },
  saveBtn: { padding: '6px 12px', background: 'var(--gold)', color: '#0A1628', borderRadius: 6, fontWeight: 700, fontSize: 12, fontFamily: 'Karla, sans-serif', flexShrink: 0, border: 'none' },
  editBtn: { background: 'transparent', color: 'var(--text-3)', fontSize: 16, padding: '2px 6px', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer' },
  progressBar: { height: 4, background: 'var(--border)', borderRadius: 2, marginTop: 10, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2, transition: 'width 0.6s ease' },
  scorePanel: { borderRadius: 14, padding: '22px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
  scoreHeader: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  scorePanelLabel: { fontSize: 12, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.07em' },
  levelBadge: { fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, letterSpacing: '0.08em' },
  scoreMessage: { fontSize: 13, color: 'var(--text-2)', textAlign: 'center', lineHeight: 1.5 },
  categoriesCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '22px 24px' },
  cardTitle: { fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 600, color: 'var(--text-1)', marginBottom: 16 },
  emptyState: { color: 'var(--text-3)', fontSize: 14, paddingTop: 8 },
  categoryList: { display: 'flex', flexDirection: 'column', gap: 14 },
  categoryItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  catLeft: { display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 },
  catIcon: { fontSize: 22, flexShrink: 0 },
  catName: { fontSize: 14, color: 'var(--text-1)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  catType: { fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' },
  catRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 },
  catAmount: { fontFamily: 'Cormorant Garamond, serif', fontSize: 16, fontWeight: 600 },
  catBar: { width: 70, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: 2, transition: 'width 0.6s ease' },
  previewCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '22px 24px' },
  viewAllBtn: { fontSize: 12, color: 'var(--gold)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'Karla, sans-serif' },
  warningsCard: { background: 'var(--amber-dim)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 14, padding: '20px 24px' },
  warningsList: { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 },
  warningItem: { display: 'flex', gap: 10, fontSize: 14, color: 'var(--gold-l)', lineHeight: 1.5 },
  warningBullet: { color: 'var(--amber)', fontWeight: 700, flexShrink: 0 },
};
