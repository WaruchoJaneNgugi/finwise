import React, { useState } from 'react';
import type { Goal, GoalCategory } from '../types';
import { GOAL_META, getGoalProgress, getGoalDeadlineStatus, projectGoalDate } from '../hooks/goals';
import { formatCurrency } from '../utils/expenses';

interface GoalsProps {
  goals: Goal[];
  activeGoals: Goal[];
  completedGoals: Goal[];
  totalTargeted: number;
  totalSaved: number;
  onAdd: (data: Omit<Goal, 'id' | 'createdAt' | 'completed'>) => void;
  onRemove: (id: string) => void;
  onContribute: (id: string, amount: number) => void;
  onUpdateSaved: (id: string, amount: number) => void;
  currency: string;
}

export const Goals: React.FC<GoalsProps> = ({
  goals, activeGoals, completedGoals, totalTargeted, totalSaved,
  onAdd, onRemove, onContribute, currency,
}) => {
  const [name, setName]         = useState('');
  const [target, setTarget]     = useState('');
  const [saved, setSaved]       = useState('');
  const [monthly, setMonthly]   = useState('');
  const [category, setCategory] = useState<GoalCategory>('emergency');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes]       = useState('');
  const [contributeId, setContributeId] = useState<string | null>(null);
  const [contributeAmt, setContributeAmt] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleAdd = () => {
    const tgt = parseFloat(target.replace(/,/g, ''));
    const sav = parseFloat(saved.replace(/,/g, '') || '0');
    const mon = parseFloat(monthly.replace(/,/g, '') || '0');
    if (!name.trim() || isNaN(tgt) || tgt <= 0) return;
    onAdd({ name: name.trim(), targetAmount: tgt, savedAmount: sav, category, deadline, monthlyContribution: mon, notes });
    setName(''); setTarget(''); setSaved(''); setMonthly(''); setDeadline(''); setNotes('');
    setSubmitted(true); setTimeout(() => setSubmitted(false), 1500);
  };

  const handleContribute = (id: string) => {
    const amt = parseFloat(contributeAmt.replace(/,/g, ''));
    if (isNaN(amt) || amt <= 0) return;
    onContribute(id, amt);
    setContributeId(null); setContributeAmt('');
  };

  const overallPct = totalTargeted > 0 ? Math.round((totalSaved / totalTargeted) * 100) : 0;

  return (
    <div style={S.container} className="animate-in">

      {/* Summary bar */}
      <div style={S.summaryBar}>
        {[
          { label: 'Active Goals',     val: activeGoals.length,                         unit: '',    color: '#60A5FA' },
          { label: 'Total Targeted',   val: formatCurrency(totalTargeted, currency),     unit: '',    color: '#F0EDE4' },
          { label: 'Total Saved',      val: formatCurrency(totalSaved, currency),        unit: '',    color: '#3DD68C' },
          { label: 'Goals Completed',  val: completedGoals.length,                       unit: '',    color: '#C9A84C' },
        ].map((s) => (
          <div key={s.label} style={S.summaryItem}>
            <div style={S.summaryLabel}>{s.label}</div>
            <div style={{ ...S.summaryVal, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      {goals.length > 0 && (
        <div style={S.overallCard}>
          <div style={S.overallLeft}>
            <div style={S.cardTitle}>Overall Progress</div>
            <div style={S.overallAmt}>{formatCurrency(totalSaved, currency)} <span style={S.overallOf}>of {formatCurrency(totalTargeted, currency)}</span></div>
          </div>
          <div style={S.overallRight}>
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle cx="36" cy="36" r="28" fill="none" stroke="#C9A84C" strokeWidth="8"
                strokeDasharray={`${(overallPct / 100) * 176} 176`}
                strokeLinecap="round" transform="rotate(-90 36 36)"
                style={{ filter: 'drop-shadow(0 0 4px rgba(201,168,76,0.5))' }} />
              <text x="36" y="40" textAnchor="middle" fill="#C9A84C" fontSize="13" fontFamily="Cormorant Garamond" fontWeight="700">{overallPct}%</text>
            </svg>
          </div>
        </div>
      )}

      {/* Add form */}
      <div style={S.formCard}>
        <div style={S.formTitleRow}>
          <div style={S.cardTitle}>Add New Goal</div>
          {submitted && <span style={S.successTag}>✓ Goal Added!</span>}
        </div>
        <div className="goals-form-grid">
          <div style={S.field}>
            <label style={S.label}>Goal Name</label>
            <input style={S.input} placeholder="e.g. Mombasa Vacation" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div style={S.field}>
            <label style={S.label}>Category</label>
            <select style={S.select} value={category} onChange={(e) => setCategory(e.target.value as GoalCategory)}>
              {(Object.entries(GOAL_META) as [GoalCategory, typeof GOAL_META[GoalCategory]][]).map(([k, m]) => (
                <option key={k} value={k}>{m.icon} {m.label}</option>
              ))}
            </select>
          </div>
          <div style={S.field}>
            <label style={S.label}>Target Amount (KSh)</label>
            <input style={S.input} type="number" placeholder="e.g. 150000" value={target} onChange={(e) => setTarget(e.target.value)} />
          </div>
          <div style={S.field}>
            <label style={S.label}>Already Saved (KSh)</label>
            <input style={S.input} type="number" placeholder="0" value={saved} onChange={(e) => setSaved(e.target.value)} />
          </div>
          <div style={S.field}>
            <label style={S.label}>Monthly Contribution (KSh)</label>
            <input style={S.input} type="number" placeholder="e.g. 5000" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
          </div>
          <div style={S.field}>
            <label style={S.label}>Deadline (optional)</label>
            <input style={S.input} type="month" value={deadline} onChange={(e) => setDeadline(e.target.value)}
              // style={{ ...S.input, colorScheme: 'dark' }}
            />
          </div>
        </div>
        <div style={S.formBottom}>
          <input style={{ ...S.input, flex: 1 }} placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <button style={{ ...S.addBtn, opacity: !name.trim() || !target ? 0.5 : 1 }} onClick={handleAdd} disabled={!name.trim() || !target}>
            + Add Goal
          </button>
        </div>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div>
          <div style={S.sectionTitle}>🎯 Active Goals ({activeGoals.length})</div>
          <div style={S.goalGrid}>
            {activeGoals.map((goal) => {
              const meta = GOAL_META[goal.category];
              const pct  = getGoalProgress(goal);
              const status = getGoalDeadlineStatus(goal);
              const projDate = projectGoalDate(goal);
              // const remaining = goal.targetAmount - goal.savedAmount;

              return (
                <div key={goal.id} style={{ ...S.goalCard, borderColor: `${meta.color}25` }}>
                  <div style={S.goalHeader}>
                    <div style={{ ...S.goalIcon, background: `${meta.color}18` }}>{meta.icon}</div>
                    <div style={S.goalInfo}>
                      <div style={S.goalName}>{goal.name}</div>
                      <div style={{ ...S.goalCat, color: meta.color }}>{meta.label}</div>
                    </div>
                    <div style={S.goalBadgeWrap}>
                      {status !== 'no-deadline' && (
                        <span style={{ ...S.statusBadge,
                          color: status === 'on-track' ? '#3DD68C' : '#F87171',
                          background: status === 'on-track' ? 'rgba(61,214,140,0.1)' : 'rgba(248,113,113,0.1)',
                        }}>
                          {status === 'on-track' ? '✓ On Track' : '⚠ Behind'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={S.goalAmounts}>
                    <div>
                      <div style={S.amtLabel}>Saved</div>
                      <div style={{ ...S.amtVal, color: meta.color }}>{formatCurrency(goal.savedAmount, currency)}</div>
                    </div>
                    <div style={S.amtDivider}>/</div>
                    <div>
                      <div style={S.amtLabel}>Target</div>
                      <div style={S.amtVal}>{formatCurrency(goal.targetAmount, currency)}</div>
                    </div>
                    <div style={S.amtPct}>{pct}%</div>
                  </div>

                  <div style={S.progressTrack}>
                    <div style={{ ...S.progressFill, width: `${pct}%`, background: `linear-gradient(90deg, ${meta.color}99, ${meta.color})` }} />
                  </div>

                  <div style={S.goalMeta}>
                    {goal.deadline && <span>🗓 {goal.deadline}</span>}
                    {projDate && <span>📍 Est. {projDate}</span>}
                    {goal.monthlyContribution > 0 && <span>💰 {formatCurrency(goal.monthlyContribution, currency)}/mo</span>}
                  </div>

                  {/* Contribute panel */}
                  {contributeId === goal.id ? (
                    <div style={S.contributeRow}>
                      <input style={{ ...S.input, flex: 1, padding: '8px 12px', fontSize: 13 }}
                        type="number" placeholder="Amount to add..." value={contributeAmt}
                        onChange={(e) => setContributeAmt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleContribute(goal.id)}
                        autoFocus />
                      <button style={S.confirmBtn} onClick={() => handleContribute(goal.id)}>Add</button>
                      <button style={S.cancelBtn} onClick={() => setContributeId(null)}>✕</button>
                    </div>
                  ) : (
                    <div style={S.goalActions}>
                      <button style={S.contributeBtn} onClick={() => setContributeId(goal.id)}>+ Contribute</button>
                      <button style={S.removeBtn} onClick={() => onRemove(goal.id)}>Remove</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <div style={S.sectionTitle}>🏆 Completed Goals ({completedGoals.length})</div>
          <div style={S.completedList}>
            {completedGoals.map((goal) => {
              const meta = GOAL_META[goal.category];
              return (
                <div key={goal.id} style={S.completedItem}>
                  <span style={S.completedIcon}>{meta.icon}</span>
                  <div style={S.completedInfo}>
                    <div style={S.completedName}>{goal.name}</div>
                    <div style={S.completedAmt}>{formatCurrency(goal.targetAmount, currency)}</div>
                  </div>
                  <span style={S.completedBadge}>✓ Done</span>
                  <button style={S.removeBtn} onClick={() => onRemove(goal.id)}>✕</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {goals.length === 0 && (
        <div style={S.emptyState}>
          <div style={S.emptyIcon}>🎯</div>
          <div style={S.emptyTitle}>Set your first financial goal</div>
          <p style={S.emptyText}>Whether it's an emergency fund, a vacation, or a down payment — every goal starts with a single step.</p>
        </div>
      )}
    </div>
  );
};

const S: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: 20 },
  cardTitle: { fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 600, color: '#F0EDE4', marginBottom: 16 },
  summaryBar: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 },
  summaryItem: { background: '#132040', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 18px' },
  summaryLabel: { fontSize: 11, color: '#5A6B8A', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 },
  summaryVal: { fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 700 },
  overallCard: { background: 'linear-gradient(135deg, #132040, #1A2E50)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 14, padding: '22px 26px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  overallLeft: { flex: 1 },
  overallRight: { flexShrink: 0 },
  overallAmt: { fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 700, color: '#C9A84C' },
  overallOf: { fontSize: 16, color: '#5A6B8A' },
  formCard: { background: '#132040', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '24px 22px' },
  formTitleRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
  successTag: { fontSize: 12, color: '#3DD68C', background: 'rgba(61,214,140,0.12)', padding: '3px 10px', borderRadius: 4, fontWeight: 600 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 11, color: '#5A6B8A', textTransform: 'uppercase', letterSpacing: '0.07em' },
  input: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', color: '#F0EDE4', fontSize: 14, fontFamily: 'Karla, sans-serif' },
  select: { background: '#0F1F3D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', color: '#F0EDE4', fontSize: 14, fontFamily: 'Karla, sans-serif' },
  formBottom: { display: 'flex', gap: 12, marginTop: 14, alignItems: 'center' },
  addBtn: { padding: '11px 24px', background: 'linear-gradient(135deg, #C9A84C, #E2C47A)', color: '#0A1628', borderRadius: 9, fontWeight: 700, fontSize: 14, fontFamily: 'Karla, sans-serif', whiteSpace: 'nowrap', flexShrink: 0 },
  sectionTitle: { fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 600, color: '#9BAAC4', marginBottom: 12 },
  goalGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 },
  goalCard: { background: '#132040', border: '1px solid', borderRadius: 14, padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 },
  goalHeader: { display: 'flex', alignItems: 'center', gap: 12 },
  goalIcon: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 },
  goalInfo: { flex: 1, minWidth: 0 },
  goalName: { fontSize: 15, fontWeight: 600, color: '#F0EDE4' },
  goalCat: { fontSize: 12, marginTop: 2 },
  goalBadgeWrap: { flexShrink: 0 },
  statusBadge: { fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, letterSpacing: '0.06em' },
  goalAmounts: { display: 'flex', alignItems: 'center', gap: 12 },
  amtLabel: { fontSize: 11, color: '#5A6B8A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 },
  amtVal: { fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 700, color: '#F0EDE4' },
  amtDivider: { color: '#2A3B58', fontSize: 20, alignSelf: 'flex-end', paddingBottom: 2 },
  amtPct: { marginLeft: 'auto', fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 700, color: '#5A6B8A' },
  progressTrack: { height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, transition: 'width 0.6s ease' },
  goalMeta: { display: 'flex', gap: 12, fontSize: 12, color: '#5A6B8A', flexWrap: 'wrap' },
  contributeRow: { display: 'flex', gap: 8, alignItems: 'center' },
  confirmBtn: { padding: '8px 16px', background: 'linear-gradient(135deg, #C9A84C, #E2C47A)', color: '#0A1628', borderRadius: 7, fontWeight: 700, fontSize: 13 },
  cancelBtn: { padding: '8px 10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#5A6B8A', borderRadius: 7, fontSize: 13 },
  goalActions: { display: 'flex', gap: 8 },
  contributeBtn: { flex: 1, padding: '9px 0', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)', color: '#C9A84C', borderRadius: 8, fontWeight: 600, fontSize: 13 },
  removeBtn: { padding: '9px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', color: '#2A3B58', borderRadius: 8, fontSize: 13 },
  completedList: { display: 'flex', flexDirection: 'column', gap: 8 },
  completedItem: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'rgba(61,214,140,0.04)', border: '1px solid rgba(61,214,140,0.12)', borderRadius: 10 },
  completedIcon: { fontSize: 22, flexShrink: 0 },
  completedInfo: { flex: 1 },
  completedName: { fontSize: 14, color: '#F0EDE4', fontWeight: 500 },
  completedAmt: { fontSize: 12, color: '#5A6B8A', marginTop: 2 },
  completedBadge: { fontSize: 11, color: '#3DD68C', background: 'rgba(61,214,140,0.1)', padding: '3px 10px', borderRadius: 20, fontWeight: 700 },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 24px', background: '#132040', border: '1px dashed rgba(201,168,76,0.2)', borderRadius: 14, textAlign: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontWeight: 600, color: '#C9A84C', marginBottom: 10 },
  emptyText: { fontSize: 14, color: '#9BAAC4', lineHeight: 1.7, maxWidth: 400 },
};
