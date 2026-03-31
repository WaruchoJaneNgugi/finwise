import React, { useState } from 'react';
import type { NetWorthItem, AssetCategory, LiabilityCategory } from '../types';
import { ASSET_META, LIABILITY_META, calculateNetWorth } from '../hooks/netWorth';
import { formatCurrency } from '../utils/expenses';

interface NetWorthProps {
  items: NetWorthItem[];
  summary: ReturnType<typeof calculateNetWorth>;
  onAdd: (data: Omit<NetWorthItem, 'id'>) => void;
  onRemove: (id: string) => void;
  onUpdateAmount: (id: string, amount: number) => void;
  currency: string;
}

export const NetWorth: React.FC<NetWorthProps> = ({ items, summary, onAdd, onRemove, onUpdateAmount, currency }) => {
  const [type, setType]         = useState<'asset' | 'liability'>('asset');
  const [name, setName]         = useState('');
  const [amount, setAmount]     = useState('');
  const [category, setCategory] = useState<AssetCategory | LiabilityCategory>('cash');
  const [notes, setNotes]       = useState('');
  const [editId, setEditId]     = useState<string | null>(null);
  const [editAmt, setEditAmt]   = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleTypeChange = (t: 'asset' | 'liability') => {
    setType(t);
    setCategory(t === 'asset' ? 'cash' : 'mortgage');
  };

  const handleAdd = () => {
    const amt = parseFloat(amount.replace(/,/g, ''));
    if (!name.trim() || isNaN(amt) || amt < 0) return;
    onAdd({ name: name.trim(), amount: amt, category, type, notes });
    setName(''); setAmount(''); setNotes('');
    setSubmitted(true); setTimeout(() => setSubmitted(false), 1500);
  };

  const handleUpdateAmt = (id: string) => {
    const amt = parseFloat(editAmt.replace(/,/g, ''));
    if (!isNaN(amt) && amt >= 0) onUpdateAmount(id, amt);
    setEditId(null); setEditAmt('');
  };

  const assets      = items.filter((i) => i.type === 'asset');
  const liabilities = items.filter((i) => i.type === 'liability');
  const netWorthColor = summary.netWorth >= 0 ? 'var(--green)' : 'var(--red)';

  // Donut chart values
  const total = summary.totalAssets + summary.totalLiabilities;
  const assetArc = total > 0 ? (summary.totalAssets / total) * 282 : 0;
  const liabilityArc = total > 0 ? (summary.totalLiabilities / total) * 282 : 0;

  return (
    <div style={S.container} className="animate-in">

      {/* Net Worth Hero */}
      <div style={S.heroCard} className="nw-hero-inner">
        <div style={S.heroLeft}>
          <div style={S.heroLabel}>Your Net Worth</div>
          <div style={{ ...S.heroAmount, color: netWorthColor }}>
            {summary.netWorth >= 0 ? '' : '−'}{formatCurrency(Math.abs(summary.netWorth), currency)}
          </div>
          <div style={S.heroSub}>Assets minus Liabilities</div>
          <div style={S.heroStats}>
            <div style={S.heroStat}>
              <div style={{ ...S.heroStatDot, background: 'var(--green)' }} />
              <div>
                <div style={S.heroStatLabel}>Total Assets</div>
                <div style={{ ...S.heroStatVal, color: 'var(--green)' }}>{formatCurrency(summary.totalAssets, currency)}</div>
              </div>
            </div>
            <div style={S.heroStat}>
              <div style={{ ...S.heroStatDot, background: 'var(--red)' }} />
              <div>
                <div style={S.heroStatLabel}>Total Liabilities</div>
                <div style={{ ...S.heroStatVal, color: 'var(--red)' }}>{formatCurrency(summary.totalLiabilities, currency)}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={S.heroRight}>
          <svg width="170" height="170" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="12" />
            {summary.totalAssets > 0 && (
              <circle cx="60" cy="60" r="45" fill="none" stroke="#3DD68C" strokeWidth="12"
                strokeDasharray={`${assetArc} 282`} strokeLinecap="butt" transform="rotate(-90 60 60)" />
            )}
            {summary.totalLiabilities > 0 && (
              <circle cx="60" cy="60" r="45" fill="none" stroke="#F87171" strokeWidth="12"
                strokeDasharray={`${liabilityArc} 282`} strokeLinecap="butt"
                transform={`rotate(${-90 + (assetArc / 282) * 360} 60 60)`} />
            )}
            <text x="60" y="56" textAnchor="middle" fill={netWorthColor} fontSize="10" fontFamily="Cormorant Garamond" fontWeight="700">
              {summary.totalAssets > 0 ? `${Math.round((summary.totalAssets / Math.max(total, 1)) * 100)}%` : '0%'}
            </text>
            <text x="60" y="68" textAnchor="middle" fill="#5A6B8A" fontSize="7" fontFamily="Karla">Assets</text>
          </svg>
        </div>
      </div>

      {/* Add form */}
      <div style={S.formCard}>
        <div style={S.formTitleRow}>
          <div style={S.cardTitle}>Add Item</div>
          {submitted && <span style={S.successTag}>✓ Added!</span>}
        </div>
        {/* Type toggle */}
        <div style={S.typeToggle}>
          {(['asset', 'liability'] as const).map((t) => (
            <button key={t} style={{ ...S.typeBtn, ...(type === t ? S.typeBtnActive : {}) }} onClick={() => handleTypeChange(t)}>
              {t === 'asset' ? '📈 Asset' : '📉 Liability'}
            </button>
          ))}
        </div>

        <div className="form-grid" style={{ marginTop: 16 }}>
          <div style={S.field}>
            <label style={S.label}>Name</label>
            <input style={S.input} placeholder={type === 'asset' ? 'e.g. KCB Savings' : 'e.g. Car Loan'} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div style={S.field}>
            <label style={S.label}>Category</label>
            <select style={S.select} value={category} onChange={(e) => setCategory(e.target.value as any)}>
              {type === 'asset'
                ? (Object.entries(ASSET_META) as [AssetCategory, typeof ASSET_META[AssetCategory]][]).map(([k, m]) => (
                    <option key={k} value={k}>{m.icon} {m.label}</option>
                  ))
                : (Object.entries(LIABILITY_META) as [LiabilityCategory, typeof LIABILITY_META[LiabilityCategory]][]).map(([k, m]) => (
                    <option key={k} value={k}>{m.icon} {m.label}</option>
                  ))
              }
            </select>
          </div>
          <div style={S.field}>
            <label style={S.label}>Current Value (KSh)</label>
            <input style={S.input} type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div style={S.field}>
            <label style={S.label}>Notes</label>
            <input style={S.input} placeholder="Optional..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <div style={S.formBottom}>
          <button style={{ ...S.addBtn, opacity: !name.trim() || !amount ? 0.5 : 1 }} onClick={handleAdd} disabled={!name.trim() || !amount}>
            + Add {type === 'asset' ? 'Asset' : 'Liability'}
          </button>
        </div>
      </div>

      {/* Assets & Liabilities */}
      <div className="two-col-grid">
        {[
          { title: '📈 Assets', list: assets, emptyMsg: 'No assets added yet', totalColor: 'var(--green)', total: summary.totalAssets },
          { title: '📉 Liabilities', list: liabilities, emptyMsg: 'No liabilities — great!', totalColor: 'var(--red)', total: summary.totalLiabilities },
        ].map(({ title, list, emptyMsg, totalColor, total: tot }) => (
          <div key={title} style={S.listCard}>
            <div style={S.listTitle}>{title}</div>
            {list.length === 0 ? (
              <div style={S.emptyMsg}>{emptyMsg}</div>
            ) : list.map((item) => {
              const meta = item.type === 'asset'
                ? ASSET_META[item.category as AssetCategory]
                : LIABILITY_META[item.category as LiabilityCategory];
              const pct = tot > 0 ? Math.round((item.amount / tot) * 100) : 0;
              return (
                <div key={item.id} style={S.itemRow}>
                  <div style={{ ...S.itemIcon, background: `${meta.color}18` }}>{meta.icon}</div>
                  <div style={S.itemInfo}>
                    <div style={S.itemName}>{item.name}</div>
                    <div style={{ ...S.itemCat, color: meta.color }}>{meta.label}</div>
                    <div style={S.itemBar}><div style={{ ...S.itemBarFill, width: `${pct}%`, background: meta.color }} /></div>
                  </div>
                  {editId === item.id ? (
                    <div style={S.editRow}>
                      <input style={{ ...S.input, width: 100, padding: '6px 10px', fontSize: 13 }}
                        type="number" value={editAmt} onChange={(e) => setEditAmt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdateAmt(item.id)} autoFocus />
                      <button style={S.saveBtn} onClick={() => handleUpdateAmt(item.id)}>✓</button>
                      <button style={S.cancelBtn} onClick={() => setEditId(null)}>✕</button>
                    </div>
                  ) : (
                    <div style={S.itemRight}>
                      <div style={{ ...S.itemAmount, color: totalColor }}>{formatCurrency(item.amount, currency)}</div>
                      <div style={S.itemPct}>{pct}%</div>
                    </div>
                  )}
                  <div style={S.rowActions}>
                    <button style={S.editBtn} onClick={() => { setEditId(item.id); setEditAmt(String(item.amount)); }}>✎</button>
                    <button style={S.removeBtn} onClick={() => onRemove(item.id)}>✕</button>
                  </div>
                </div>
              );
            })}
            <div style={S.listTotal}>
              <span style={{ color: 'var(--text-2)' }}>Total</span>
              <span style={{ color: totalColor, fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 700 }}>
                {formatCurrency(tot, currency)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const S: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: 20 },
  cardTitle: { fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 600, color: 'var(--text-1)' },
  heroCard: { background: 'var(--bg-elevated)', border: '1px solid var(--border-acc)', borderRadius: 16, padding: '24px 26px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' },
  heroLeft: { flex: 1 },
  heroRight: { flexShrink: 0 },
  heroLabel: { fontSize: 12, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 },
  heroAmount: { fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 700, lineHeight: 1 },
  heroSub: { fontSize: 13, color: 'var(--text-3)', marginTop: 6, marginBottom: 20 },
  heroStats: { display: 'flex', gap: 24 },
  heroStat: { display: 'flex', gap: 10, alignItems: 'flex-start' },
  heroStatDot: { width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0 },
  heroStatLabel: { fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 },
  heroStatVal: { fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 700 },
  formCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px 22px' },
  formTitleRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  successTag: { fontSize: 12, color: 'var(--green)', background: 'var(--green-dim)', padding: '3px 10px', borderRadius: 4, fontWeight: 600 },
  typeToggle: { display: 'flex', gap: 8 },
  typeBtn: { flex: 1, padding: '10px 0', background: 'transparent', border: '1px solid var(--border)', borderRadius: 9, color: 'var(--text-3)', fontSize: 14, fontFamily: 'Karla, sans-serif', fontWeight: 500 },
  typeBtnActive: { background: 'var(--gold-dim)', borderColor: 'var(--border-acc)', color: 'var(--gold)' },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em' },
  input: { background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text-1)', fontSize: 14, fontFamily: 'Karla, sans-serif' },
  select: { background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text-1)', fontSize: 14, fontFamily: 'Karla, sans-serif' },
  formBottom: { display: 'flex', justifyContent: 'flex-end', marginTop: 16 },
  addBtn: { padding: '11px 24px', background: 'linear-gradient(135deg, var(--gold), var(--gold-l))', color: '#0A1628', borderRadius: 9, fontWeight: 700, fontSize: 14, fontFamily: 'Karla, sans-serif' },
  listCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '22px 20px' },
  listTitle: { fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 600, color: 'var(--text-1)', marginBottom: 16 },
  emptyMsg: { color: 'var(--text-3)', fontSize: 13, padding: '8px 0' },
  itemRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' },
  itemIcon: { width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 },
  itemInfo: { flex: 1, minWidth: 0 },
  itemName: { fontSize: 13, color: 'var(--text-1)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  itemCat: { fontSize: 11, marginTop: 1 },
  itemBar: { width: '100%', height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', marginTop: 4 },
  itemBarFill: { height: '100%', borderRadius: 2, transition: 'width 0.5s ease' },
  itemRight: { textAlign: 'right', flexShrink: 0, minWidth: 80 },
  itemAmount: { fontFamily: 'Cormorant Garamond, serif', fontSize: 15, fontWeight: 700 },
  itemPct: { fontSize: 11, color: 'var(--text-3)' },
  editRow: { display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 },
  saveBtn: { padding: '5px 10px', background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid var(--green-b)', borderRadius: 6, fontSize: 13 },
  cancelBtn: { padding: '5px 8px', background: 'transparent', color: 'var(--text-3)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13 },
  rowActions: { display: 'flex', gap: 4, flexShrink: 0 },
  editBtn: { padding: '5px 8px', background: 'transparent', color: 'var(--text-3)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 },
  removeBtn: { padding: '5px 8px', background: 'transparent', color: 'var(--text-3)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 },
  listTotal: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, marginTop: 4 },
};
