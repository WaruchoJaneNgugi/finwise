import React, { useState } from 'react';
import type { Expense, ExpenseCategory } from '../types';
import { CATEGORY_META, formatCurrency } from '../utils/expenses';

interface ExpenseFormProps {
  onAdd: (expense: Omit<Expense, 'id'>) => void;
}

interface ExpenseListProps {
  expenses: Expense[];
  onRemove: (id: string) => void;
  currency: string;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [isRecurring, setIsRecurring] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    const amt = parseFloat(amount.replace(/,/g, ''));
    if (!name.trim() || isNaN(amt) || amt <= 0) return;
    onAdd({
      name: name.trim(), amount: amt, category,
      type: CATEGORY_META[category].type,
      date: new Date().toISOString().slice(0, 10),
      isRecurring,
    });
    setName(''); setAmount(''); setCategory('food'); setIsRecurring(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 1500);
  };

  return (
    <div style={S.formCard}>
      <div style={S.formTitle}>
        <span style={S.formTitleText}>Add Expense</span>
        {submitted && <span style={S.successTag}>✓ Added!</span>}
      </div>

      <div className="form-grid">
        <div style={S.field}>
          <label style={S.label}>Expense Name</label>
          <input style={S.input} placeholder="e.g. Uber, Lunch, Netflix…"
            value={name} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />
        </div>

        <div style={S.field}>
          <label style={S.label}>Amount (KSh)</label>
          <input style={S.input} placeholder="0" value={amount} type="number" min="0"
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />
        </div>

        <div style={S.field}>
          <label style={S.label}>Category</label>
          <select style={S.select} value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
            <optgroup label="✅ Necessary">
              {(Object.entries(CATEGORY_META) as [ExpenseCategory, typeof CATEGORY_META[ExpenseCategory]][])
                .filter(([, m]) => m.type === 'necessary')
                .map(([key, meta]) => (
                  <option key={key} value={key}>{meta.icon} {meta.label}</option>
                ))}
            </optgroup>
            <optgroup label="⚠️ Unnecessary">
              {(Object.entries(CATEGORY_META) as [ExpenseCategory, typeof CATEGORY_META[ExpenseCategory]][])
                .filter(([, m]) => m.type === 'unnecessary')
                .map(([key, meta]) => (
                  <option key={key} value={key}>{meta.icon} {meta.label}</option>
                ))}
            </optgroup>
          </select>
        </div>

        <div style={S.field}>
          <label style={S.label}>Type</label>
          <div style={S.typeTag}>
            <span style={{
              ...S.typeChip,
              background: CATEGORY_META[category].type === 'necessary' ? 'rgba(61,214,140,0.15)' : 'rgba(251,191,36,0.15)',
              color: CATEGORY_META[category].type === 'necessary' ? '#3DD68C' : '#FBBF24',
            }}>
              {CATEGORY_META[category].type === 'necessary' ? '✓ Necessary' : '⚠ Unnecessary'}
            </span>
          </div>
        </div>
      </div>

      <div className="form-bottom">
        <label style={S.checkLabel}>
          <input type="checkbox" checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            style={{ accentColor: '#C9A84C' }} />
          <span>Recurring expense</span>
        </label>
        <button
          style={{ ...S.addBtn, opacity: !name.trim() || !amount ? 0.5 : 1 }}
          onClick={handleSubmit} disabled={!name.trim() || !amount}>
          + Add Expense
        </button>
      </div>
    </div>
  );
};

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onRemove, currency }) => {
  const [filter, setFilter] = useState<'all' | 'necessary' | 'unnecessary'>('all');

  const filtered = expenses.filter((e) =>
    filter === 'all' ? true : CATEGORY_META[e.category].type === filter
  );
  const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div style={S.listCard}>
      <div className="list-header">
        <div style={S.listTitle}>This Month's Expenses</div>
        <div style={S.filterRow}>
          {(['all', 'necessary', 'unnecessary'] as const).map((f) => (
            <button key={f}
              style={{ ...S.filterBtn, ...(filter === f ? S.filterBtnActive : {}) }}
              onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div style={S.emptyList}>No expenses found. Start adding your expenses above.</div>
      ) : (
        <div style={S.list}>
          {sorted.map((exp) => {
            const meta = CATEGORY_META[exp.category];
            return (
              <div key={exp.id} className="exp-item">
                <div style={{ ...S.expIcon, background: `${meta.color}20` }}>{meta.icon}</div>
                <div style={S.expInfo}>
                  <div style={S.expName}>{exp.name}</div>
                  <div style={S.expMeta}>
                    <span style={{ color: meta.color }}>{meta.label}</span>
                    <span style={S.expDot}>·</span>
                    <span>{exp.date}</span>
                    {exp.isRecurring && (
                      <><span style={S.expDot}>·</span><span style={S.recurringTag}>↻ Recurring</span></>
                    )}
                  </div>
                </div>
                <div style={S.expRight}>
                  <div style={S.expAmount}>{formatCurrency(exp.amount, currency)}</div>
                  <div style={{ ...S.expType, color: meta.type === 'necessary' ? '#3DD68C' : '#FBBF24' }}>
                    {meta.type}
                  </div>
                </div>
                <button style={S.removeBtn} onClick={() => onRemove(exp.id)} aria-label="Remove">✕</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const S: Record<string, React.CSSProperties> = {
  formCard: { background: '#132040', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '24px 22px' },
  formTitle: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
  formTitleText: { fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 600, color: '#F0EDE4' },
  successTag: { fontSize: 12, color: '#3DD68C', background: 'rgba(61,214,140,0.12)', padding: '3px 10px', borderRadius: 4, fontWeight: 600 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 11, color: '#5A6B8A', textTransform: 'uppercase', letterSpacing: '0.07em' },
  input: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', color: '#F0EDE4', fontSize: 14, fontFamily: 'Karla, sans-serif' },
  select: { background: '#0F1F3D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', color: '#F0EDE4', fontSize: 14, fontFamily: 'Karla, sans-serif' },
  typeTag: { display: 'flex', alignItems: 'center', paddingTop: 4 },
  typeChip: { padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600 },
  checkLabel: { display: 'flex', alignItems: 'center', gap: 8, color: '#9BAAC4', fontSize: 14, cursor: 'pointer' },
  addBtn: { padding: '11px 24px', background: 'linear-gradient(135deg, #C9A84C, #E2C47A)', color: '#0A1628', borderRadius: 9, fontWeight: 700, fontSize: 14, fontFamily: 'Karla, sans-serif', boxShadow: '0 4px 20px rgba(201,168,76,0.3)' },
  listCard: { background: '#132040', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '24px 22px', marginTop: 16 },
  listTitle: { fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 600, color: '#F0EDE4' },
  filterRow: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  filterBtn: { padding: '6px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#5A6B8A', fontSize: 12, fontFamily: 'Karla, sans-serif' },
  filterBtnActive: { background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)', color: '#C9A84C' },
  emptyList: { color: '#5A6B8A', fontSize: 14, padding: '20px 0', textAlign: 'center' },
  list: { display: 'flex', flexDirection: 'column', gap: 2 },
  expIcon: { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 },
  expInfo: { flex: 1, minWidth: 0 },
  expName: { fontSize: 14, color: '#F0EDE4', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  expMeta: { display: 'flex', gap: 6, fontSize: 12, color: '#5A6B8A', marginTop: 2, flexWrap: 'wrap' },
  expDot: { color: '#2A3B58' },
  recurringTag: { color: '#60A5FA' },
  expRight: { textAlign: 'right', flexShrink: 0 },
  expAmount: { fontFamily: 'Cormorant Garamond, serif', fontSize: 16, fontWeight: 600 },
  expType: { fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' },
  removeBtn: { background: 'transparent', color: '#2A3B58', fontSize: 14, padding: '4px 8px', borderRadius: 6, border: '1px solid transparent', flexShrink: 0 },
};
