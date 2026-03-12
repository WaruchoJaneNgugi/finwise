import React, { useState } from 'react';
import type { Habit } from '../types';

interface HabitsTrackerProps {
  habits: Habit[];
  completedCount: number;
  completionPct: number;
  onToggle: (id: string) => void;
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
  onResetAll?: () => void;
  compact?: boolean;
}

export const HabitsTracker: React.FC<HabitsTrackerProps> = ({
  habits, completedCount, completionPct,
  onToggle, onAdd, onRemove, onResetAll,
  compact = false,
}) => {
  const [newHabit, setNewHabit] = useState('');

  const handleAdd = () => {
    if (!newHabit.trim()) return;
    onAdd(newHabit.trim());
    setNewHabit('');
  };

  if (compact) {
    return (
      <div style={S.compactContainer}>
        <div style={S.compactHeader}>
          <span style={S.compactTitle}>Today's Habits</span>
          <span style={{ fontSize: 12, color: completedCount === habits.length && habits.length > 0 ? '#3DD68C' : '#5A6B8A' }}>
            {completedCount}/{habits.length} done
          </span>
        </div>
        <div style={S.compactBar}>
          <div style={{ ...S.compactBarFill, width: `${completionPct}%`, background: completionPct === 100 ? '#3DD68C' : '#C9A84C' }} />
        </div>
        <div style={S.pillsWrap}>
          {habits.map((h) => (
            <button key={h.id} onClick={() => onToggle(h.id)}
              style={{ ...S.pill, ...(h.done ? S.pillDone : {}) }}>
              <span>{h.done ? '✓' : '○'}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{h.text}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={S.container} className="animate-in">
      <div style={S.header}>
        <div>
          <h2 style={S.title}>🌱 Daily Financial Habits</h2>
          <p style={S.sub}>Build consistent money habits. These reset automatically each day.</p>
        </div>
        <div style={S.scoreCircle}>
          <svg width="60" height="60" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
            <circle cx="30" cy="30" r="24" fill="none"
              stroke={completionPct === 100 ? '#3DD68C' : '#C9A84C'} strokeWidth="5"
              strokeDasharray={`${(completionPct / 100) * 150.8} 150.8`}
              strokeLinecap="round" transform="rotate(-90 30 30)"
              style={{ transition: 'stroke-dasharray 0.5s ease', filter: `drop-shadow(0 0 4px ${completionPct === 100 ? '#3DD68C' : '#C9A84C'})` }}
            />
            <text x="30" y="34" textAnchor="middle" fill={completionPct === 100 ? '#3DD68C' : '#C9A84C'}
              fontSize="14" fontFamily="Cormorant Garamond" fontWeight="700">{completionPct}%</text>
          </svg>
          <div style={S.scoreLabel}>{completedCount}/{habits.length} done</div>
        </div>
      </div>

      {/* Add habit */}
      <div style={S.addRow}>
        <input style={S.input} value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add a new daily habit..." />
        <button style={S.addBtn} onClick={handleAdd} disabled={!newHabit.trim()}>+ Add</button>
        {onResetAll && (
          <button onClick={onResetAll} style={S.resetBtn} title="Reset all habits for today">
            ↺ Reset
          </button>
        )}
      </div>

      {/* Habit list */}
      <div style={S.list}>
        {habits.map((h, i) => (
          <div key={h.id} style={{ ...S.habitItem, borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
            <button onClick={() => onToggle(h.id)}
              style={{ ...S.checkbox, ...(h.done ? S.checkboxDone : {}) }}>
              {h.done && '✓'}
            </button>
            <span style={{ ...S.habitText, textDecoration: h.done ? 'line-through' : 'none', color: h.done ? '#3D5070' : '#F0EDE4' }}>
              {h.text}
            </span>
            {h.done && <span style={S.doneBadge}>Done ✓</span>}
            <button onClick={() => onRemove(h.id)} style={S.removeBtn}>✕</button>
          </div>
        ))}
        {habits.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#3D5070', fontSize: 13 }}>
            No habits yet. Add your first financial habit above.
          </div>
        )}
      </div>

      {completedCount === habits.length && habits.length > 0 && (
        <div style={S.completeBanner}>
          🎉 All habits complete for today! Great financial discipline!
        </div>
      )}
    </div>
  );
};

const S: Record<string, React.CSSProperties> = {
  container: { background: '#132040', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: 18 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 600, color: '#F0EDE4', margin: 0 },
  sub: { fontSize: 13, color: '#9BAAC4', marginTop: 4 },
  scoreCircle: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  scoreLabel: { fontSize: 11, color: '#5A6B8A', textAlign: 'center' },
  addRow: { display: 'flex', gap: 10, alignItems: 'center' },
  input: { flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, padding: '10px 14px', color: '#F0EDE4', fontSize: 13, fontFamily: 'Karla, sans-serif', outline: 'none' },
  addBtn: { padding: '10px 18px', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 9, color: '#C9A84C', fontSize: 13, fontFamily: 'Karla, sans-serif', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' },
  resetBtn: { padding: '10px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, color: '#5A6B8A', fontSize: 12, fontFamily: 'Karla, sans-serif', cursor: 'pointer' },
  list: { display: 'flex', flexDirection: 'column' },
  habitItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' },
  checkbox: { width: 24, height: 24, borderRadius: 7, border: '1.5px solid #3D5070', background: 'transparent', cursor: 'pointer', color: '#0A1628', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: '0.15s' },
  checkboxDone: { borderColor: '#3DD68C', background: '#3DD68C' },
  habitText: { flex: 1, fontSize: 14, lineHeight: 1.4, transition: '0.2s' },
  doneBadge: { fontSize: 10, color: '#3DD68C', background: 'rgba(61,214,140,0.1)', padding: '3px 9px', borderRadius: 20, whiteSpace: 'nowrap' },
  removeBtn: { background: 'transparent', border: 'none', color: '#3D5070', fontSize: 14, cursor: 'pointer', padding: '0 4px', lineHeight: 1 },
  completeBanner: { padding: '12px 16px', background: 'rgba(61,214,140,0.1)', border: '1px solid rgba(61,214,140,0.25)', borderRadius: 10, fontSize: 14, color: '#3DD68C', textAlign: 'center', fontWeight: 600 },
  // Compact mode
  compactContainer: { display: 'flex', flexDirection: 'column', gap: 10 },
  compactHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  compactTitle: { fontSize: 12, color: '#5A6B8A', textTransform: 'uppercase', letterSpacing: '0.08em' },
  compactBar: { height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' },
  compactBarFill: { height: '100%', borderRadius: 99, transition: 'width 0.5s ease' },
  pillsWrap: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  pill: { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#9BAAC4', fontSize: 12, fontFamily: 'Karla, sans-serif', cursor: 'pointer', transition: '0.15s', maxWidth: 200 },
  pillDone: { borderColor: 'rgba(61,214,140,0.3)', background: 'rgba(61,214,140,0.08)', color: '#3DD68C' },
};
