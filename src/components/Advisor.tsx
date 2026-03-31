import React, { useState } from 'react';
import type { InvestmentAdvice, FinancialProfile, MonthlyBreakdown } from '../types';
import { formatCurrency } from '../utils/expenses';
import { getInvestmentAdvice } from '../utils/calculations';

interface AdvisorProps {
  profile: FinancialProfile;
  onUpdateIncome: (income: number) => void;
  billsTotal?: number;
  goalsTotal?: number;
  breakdown?: MonthlyBreakdown;
}

export const Advisor: React.FC<AdvisorProps> = ({ profile, onUpdateIncome, billsTotal = 0, goalsTotal = 0, breakdown }) => {
  const [customIncome, setCustomIncome] = useState(String(profile.monthlyIncome || ''));
  const income = profile.monthlyIncome;
  const advice: InvestmentAdvice = getInvestmentAdvice(income);

  const actualSpend = breakdown?.totalExpenses ?? 0;
  const actualSavings = income > 0 ? Math.max(0, income - actualSpend) : 0;

  const allocationItems = [
    { label: 'Living Expenses', amount: advice.living, pct: income > 0 ? Math.round((advice.living / income) * 100) : 0, color: 'var(--blue)', icon: '🏠', desc: 'Housing, food, transport, utilities, medical' },
    { label: 'Emergency Fund', amount: advice.emergencyFund, pct: income > 0 ? Math.round((advice.emergencyFund / income) * 100) : 0, color: 'var(--red)', icon: '🛡️', desc: 'Unexpected events, job loss, medical emergencies' },
    { label: 'Savings', amount: advice.savings, pct: income > 0 ? Math.round((advice.savings / income) * 100) : 0, color: 'var(--green)', icon: '💰', desc: 'Short-term goals, school fees, purchases' },
    { label: 'Investments', amount: advice.investment, pct: income > 0 ? Math.round((advice.investment / income) * 100) : 0, color: 'var(--gold)', icon: '📈', desc: 'MMFs, SACCOs, NSE stocks, bonds' },
  ];

  const incomeLabel =
    income <= 20000 ? 'Entry Level (≤ KSh 20K)'
    : income <= 50000 ? 'Growing (KSh 20K – 50K)'
    : income <= 100000 ? 'Stable (KSh 50K – 100K)'
    : 'High Earner (> KSh 100K)';

  const handleApply = () => {
    const val = parseFloat(customIncome.replace(/,/g, ''));
    if (!isNaN(val) && val > 0) onUpdateIncome(val);
  };

  return (
    <div style={S.container} className="animate-in">

      {/* Income card */}
      <div style={S.incomeCard}>
        <div className="income-card-inner">
          <div style={S.incomeLeft}>
            <div style={S.cardTitle}>Your Monthly Income</div>
            <p style={S.incomeDesc}>
              Enter your take-home income to get personalised allocation advice. Works for incomes from KSh 10,000 and above.
            </p>
            <div className="income-row">
              <div style={S.inputWrap}>
                <span style={S.currencyTag}>KSh</span>
                <input style={S.incomeInput} type="number" min="10000" placeholder="e.g. 45000"
                  value={customIncome} onChange={(e) => setCustomIncome(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApply()} />
              </div>
              <button style={S.applyBtn} onClick={handleApply}>Apply</button>
            </div>
          </div>

          {income > 0 && (
            <div className="tier-badge">
              <div style={S.tierLabel}>Income Tier</div>
              <div style={S.tierName}>{incomeLabel}</div>
              <div style={S.tierIncome}>{formatCurrency(income, 'KES')} / month</div>
            </div>
          )}
        </div>
      </div>

      {income > 0 ? (
        <>
          {/* Allocation grid */}
          <div style={S.allocationCard}>
            <div style={S.cardTitle}>Recommended Monthly Allocation</div>
            <div className="allocation-grid">
              {allocationItems.map((item) => (
                <div key={item.label} style={{ ...S.allocItem, border: `1px solid ${item.color}25` }}>
                  <div style={{ ...S.allocIcon, background: `${item.color}15` }}>{item.icon}</div>
                  <div style={S.allocInfo}>
                    <div style={S.allocLabel}>{item.label}</div>
                    <div style={S.allocDesc}>{item.desc}</div>
                  </div>
                  <div style={S.allocRight}>
                    <div style={{ ...S.allocAmount, color: item.color }}>{formatCurrency(item.amount, 'KES')}</div>
                    <div style={S.allocPct}>{item.pct}%</div>
                    <div style={S.allocBar}>
                      <div style={{ ...S.allocBarFill, width: `${item.pct}%`, background: item.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actual vs Recommended */}
          {breakdown && income > 0 && (
            <div style={S.allocationCard}>
              <div style={S.cardTitle}>📊 Actual vs Recommended</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Total Spending', actual: actualSpend, recommended: advice.living + advice.emergencyFund, color: actualSpend > advice.living + advice.emergencyFund ? 'var(--red)' : 'var(--green)' },
                  { label: 'Bills', actual: billsTotal, recommended: Math.round(income * 0.3), color: billsTotal > income * 0.3 ? 'var(--red)' : 'var(--green)' },
                  { label: 'Goals Contributed', actual: goalsTotal, recommended: advice.savings, color: goalsTotal >= advice.savings ? 'var(--green)' : 'var(--amber)' },
                  { label: 'Remaining / Savings', actual: actualSavings, recommended: advice.savings + advice.investment, color: actualSavings >= advice.savings ? 'var(--green)' : 'var(--red)' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>{row.label}</div>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Rec: {formatCurrency(row.recommended, 'KES')}</div>
                      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, fontWeight: 700, color: row.color }}>{formatCurrency(row.actual, 'KES')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emergency fund */}
          <div style={S.emergencyCard}>
            <div style={S.emergencyHeader}>
              <span style={S.emergencyIcon}>🛡️</span>
              <div>
                <div style={S.emergencyTitle}>Emergency Fund Goal</div>
                <p style={S.emergencyDesc}>
                  You should build an emergency fund covering <strong style={{ color: 'var(--red)' }}>3–6 months</strong> of living expenses.
                  At your income, that means saving:
                </p>
              </div>
            </div>
            <div className="emergency-stats">
              {[
                { label: 'Monthly Contribution', val: advice.emergencyFund, color: 'var(--red)' },
                { label: '6-Month Target', val: advice.emergencyFund * 6, color: undefined },
                { label: '12-Month Target', val: advice.emergencyFund * 12, color: 'var(--green)' },
                { label: '2-Year Target', val: advice.emergencyFund * 24, color: undefined },
              ].map((stat) => (
                <div key={stat.label} style={S.emergencyStat}>
                  <div style={S.eStatLabel}>{stat.label}</div>
                  <div style={{ ...S.eStatVal, color: stat.color || 'var(--text-1)' }}>{formatCurrency(stat.val, 'KES')}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div style={S.tipsCard}>
            <div style={S.cardTitle}>💡 Personalised Investment Tips</div>
            <div style={S.tipsList}>
              {advice.tips.map((tip, i) => (
                <div key={i} style={S.tipItem}>
                  <div style={S.tipNumber}>{i + 1}</div>
                  <p style={S.tipText}>{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Habits */}
          <div style={S.habitsCard}>
            <div style={S.cardTitle}>🌱 Habits That Build Wealth</div>
            <div className="habits-grid">
              {HABITS.map((h) => (
                <div key={h.title} style={S.habitItem}>
                  <div style={S.habitEmoji}>{h.emoji}</div>
                  <div style={S.habitTitle}>{h.title}</div>
                  <div style={S.habitBody}>{h.body}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div style={S.promptCard}>
          <div style={S.promptIcon}>💎</div>
          <div style={S.promptTitle}>Enter your income to get started</div>
          <p style={S.promptText}>
            FinWise will generate a personalised financial plan for you — investment targets, emergency fund goals, savings allocation, and more.
          </p>
        </div>
      )}
    </div>
  );
};

const HABITS = [
  { emoji: '📅', title: 'Pay Yourself First', body: 'Move savings and investments the moment you receive income. Spend what remains.' },
  { emoji: '📊', title: 'Track Every Expense', body: 'Awareness is the first step. Small leaks sink big ships — log everything.' },
  { emoji: '🚫', title: '48-Hour Rule', body: 'Wait 48 hours before any unplanned purchase over KSh 1,000.' },
  { emoji: '🔄', title: 'Automate Savings', body: 'Set up a standing order to your SACCO or MMF on payday.' },
  { emoji: '📚', title: 'Invest in Knowledge', body: 'One financial book or course per quarter compounds your decision-making.' },
  { emoji: '🎯', title: 'Annual Review', body: 'Review your financial goals every January and July. Adjust, adapt, advance.' },
];

const S: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: 20 },
  cardTitle: { fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 600, color: 'var(--text-1)', marginBottom: 16 },
  incomeCard: { background: 'var(--bg-elevated)', border: '1px solid var(--border-acc)', borderRadius: 14, padding: 'clamp(16px, 3vw, 28px)' },
  incomeLeft: { flex: 1, minWidth: 0 },
  incomeDesc: { fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 16 },
  inputWrap: { display: 'flex', alignItems: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border-acc)', borderRadius: 9, overflow: 'hidden' },
  currencyTag: { padding: '0 12px', color: 'var(--gold)', fontSize: 13, fontWeight: 600, background: 'var(--gold-dim)', borderRight: '1px solid var(--border-acc)', height: '100%', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' },
  incomeInput: { background: 'transparent', border: 'none', padding: '12px 14px', color: 'var(--text-1)', fontSize: 16, fontFamily: 'Karla, sans-serif', width: '100%', minWidth: 0 },
  applyBtn: { padding: '12px 22px', background: 'linear-gradient(135deg, var(--gold), var(--gold-l))', color: '#0A1628', borderRadius: 9, fontWeight: 700, fontSize: 14, fontFamily: 'Karla, sans-serif', whiteSpace: 'nowrap', flexShrink: 0 },
  tierLabel: { fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' },
  tierName: { fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 600, color: 'var(--gold)', marginTop: 6 },
  tierIncome: { fontSize: 13, color: 'var(--text-2)', marginTop: 4 },
  allocationCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '26px 28px' },
  allocItem: { display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', background: 'var(--bg-surface)', borderRadius: 10 },
  allocIcon: { width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 },
  allocInfo: { flex: 1, minWidth: 0 },
  allocLabel: { fontSize: 14, color: 'var(--text-1)', fontWeight: 600 },
  allocDesc: { fontSize: 12, color: 'var(--text-3)', marginTop: 2, lineHeight: 1.4 },
  allocRight: { textAlign: 'right', flexShrink: 0, minWidth: 100 },
  allocAmount: { fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 700 },
  allocPct: { fontSize: 12, color: 'var(--text-3)' },
  allocBar: { width: 90, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', marginTop: 4 },
  allocBarFill: { height: '100%', borderRadius: 2, transition: 'width 0.6s ease' },
  emergencyCard: { background: 'var(--red-dim)', border: '1px solid var(--red-b)', borderRadius: 14, padding: '24px 28px' },
  emergencyHeader: { display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap' },
  emergencyIcon: { fontSize: 32, flexShrink: 0 },
  emergencyTitle: { fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 600, color: 'var(--text-1)', marginBottom: 8 },
  emergencyDesc: { fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 },
  emergencyStat: { background: 'var(--bg-surface)', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--border)' },
  eStatLabel: { fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 },
  eStatVal: { fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 700 },
  tipsCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '26px 28px' },
  tipsList: { display: 'flex', flexDirection: 'column', gap: 12 },
  tipItem: { display: 'flex', gap: 14, alignItems: 'flex-start' },
  tipNumber: { width: 28, height: 28, borderRadius: '50%', background: 'var(--gold-dim)', color: 'var(--gold)', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'Cormorant Garamond, serif' },
  tipText: { fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, paddingTop: 4 },
  habitsCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '26px 28px' },
  habitItem: { background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' },
  habitEmoji: { fontSize: 26, marginBottom: 10 },
  habitTitle: { fontSize: 14, color: 'var(--text-1)', fontWeight: 600, marginBottom: 6 },
  habitBody: { fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5 },
  promptCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', background: 'var(--bg-card)', border: '1px dashed var(--border-acc)', borderRadius: 14, textAlign: 'center' },
  promptIcon: { fontSize: 48, marginBottom: 16 },
  promptTitle: { fontFamily: 'Cormorant Garamond, serif', fontSize: 26, fontWeight: 600, color: 'var(--gold)', marginBottom: 12 },
  promptText: { fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, maxWidth: 420 },
};
