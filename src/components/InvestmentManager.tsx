import React, { useState } from 'react';
import type { Investment, InvestmentCategory, InvestmentStatus, InvestmentSummary } from '../types';
import { INVESTMENT_META, RISK_COLORS, projectGrowth } from '../utils/investments';
import { formatCurrency } from '../utils/expenses';

// ─────────────────────────────────────────────────────────────
// Summary bar
// ─────────────────────────────────────────────────────────────
interface SummaryProps {
  summary: InvestmentSummary;
  monthlyIncome: number;
}

export const InvestmentSummaryBar: React.FC<SummaryProps> = ({ summary, monthlyIncome }) => {
  const projectedMonthly = summary.projectedAnnualReturn / 12;
  const investPct = monthlyIncome > 0
    ? Math.min(100, Math.round((summary.totalMonthly / monthlyIncome) * 100)) : 0;

  const stats = [
    { label: 'Total Portfolio',   value: formatCurrency(summary.totalInvested, 'KES'), color: '#C9A84C', sub: `${summary.activeCount} active positions` },
    { label: 'Added This Month',  value: formatCurrency(summary.totalMonthly, 'KES'),  color: '#3DD68C', sub: `${investPct}% of income` },
    { label: 'Projected / Year',  value: formatCurrency(summary.projectedAnnualReturn, 'KES'), color: '#60A5FA', sub: 'weighted avg return' },
    { label: 'Projected / Month', value: formatCurrency(projectedMonthly, 'KES'),      color: '#A78BFA', sub: 'passive income est.' },
  ];

  return (
    <div className="stats-grid">
      {stats.map((s) => (
        <div key={s.label} style={S.statCard}>
          <div style={S.statLabel}>{s.label}</div>
          <div style={{ ...S.statValue, color: s.color }}>{s.value}</div>
          <div style={S.statSub}>{s.sub}</div>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Add Investment Form
// ─────────────────────────────────────────────────────────────
interface FormProps {
  onAdd: (inv: Omit<Investment, 'id'>) => void;
}

export const InvestmentForm: React.FC<FormProps> = ({ onAdd }) => {
  const [name,      setName]      = useState('');
  const [amount,    setAmount]    = useState('');
  const [category,  setCategory]  = useState<InvestmentCategory>('mmf');
  const [returnPct, setReturnPct] = useState(String(INVESTMENT_META['mmf'].avgReturn));
  const [notes,     setNotes]     = useState('');
  const [recurring, setRecurring] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleCategoryChange = (cat: InvestmentCategory) => {
    setCategory(cat);
    setReturnPct(String(INVESTMENT_META[cat].avgReturn));
  };

  const handleSubmit = () => {
    const amt = parseFloat(amount.replace(/,/g, ''));
    const ret = parseFloat(returnPct) || 0;
    if (!name.trim() || isNaN(amt) || amt <= 0) return;

    onAdd({
      name: name.trim(),
      amount: amt,
      category,
      expectedReturnPct: ret,
      notes: notes.trim(),
      date: new Date().toISOString().slice(0, 10),
      status: 'active',
      isRecurring: recurring,
    });

    setName(''); setAmount(''); setNotes(''); setRecurring(false);
    setCategory('mmf'); setReturnPct(String(INVESTMENT_META['mmf'].avgReturn));
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 1800);
  };

  const meta = INVESTMENT_META[category];
  const risk = RISK_COLORS[meta.riskLevel];

  return (
    <div style={S.formCard}>
      <style>{`
        .inv-input:focus { border-color: rgba(201,168,76,0.5) !important; outline: none; }
        .inv-select:focus { border-color: rgba(201,168,76,0.5) !important; outline: none; }
        .inv-add-btn { transition: opacity 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease; }
        .inv-add-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(201,168,76,0.4) !important; }
        .inv-add-btn:active:not(:disabled) { transform: translateY(0); }
      `}</style>

      <div style={S.formHeader}>
        <span style={S.formTitle}>Log Investment</span>
        {submitted && <span style={S.successTag}>✓ Investment logged!</span>}
      </div>

      {/* Category description strip */}
      <div style={{ ...S.catStrip, borderColor: `${meta.color}30`, background: `${meta.color}08` }}>
        <span style={S.catStripIcon}>{meta.icon}</span>
        <div style={S.catStripText}>
          <span style={{ ...S.catStripName, color: meta.color }}>{meta.label}</span>
          <span style={S.catStripDesc}>{meta.description}</span>
        </div>
        <span style={{ ...S.riskBadge, color: risk.text, background: risk.bg }}>
          {meta.riskLevel} risk
        </span>
        <span style={S.avgReturn}>~{meta.avgReturn}% avg / yr</span>
      </div>

      <div className="inv-form-grid">
        <div style={S.field}>
          <label style={S.label}>Investment Name</label>
          <input
            className="inv-input"
            style={S.input}
            placeholder="e.g. Cytonn MMF, KCB SACCO…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <div style={S.field}>
          <label style={S.label}>Amount (KSh)</label>
          <input
            className="inv-input"
            style={S.input}
            type="number" min="0"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <div style={S.field}>
          <label style={S.label}>Category</label>
          <select
            className="inv-select"
            style={S.select}
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value as InvestmentCategory)}
          >
            {(Object.entries(INVESTMENT_META) as [InvestmentCategory, typeof INVESTMENT_META[InvestmentCategory]][])
              .map(([key, m]) => (
                <option key={key} value={key}>{m.icon} {m.label}</option>
              ))}
          </select>
        </div>

        <div style={S.field}>
          <label style={S.label}>Expected Return (% / yr)</label>
          <input
            className="inv-input"
            style={S.input}
            type="number" min="0" max="100"
            placeholder={String(meta.avgReturn)}
            value={returnPct}
            onChange={(e) => setReturnPct(e.target.value)}
          />
        </div>
      </div>

      {/* Notes row */}
      <div style={{ marginTop: 14 }}>
        <label style={S.label}>Notes (optional)</label>
        <input
          className="inv-input"
          style={{ ...S.input, marginTop: 6, width: '100%' }}
          placeholder="e.g. Monthly contribution, maturity date, account ref…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="form-bottom">
        <label style={S.checkLabel}>
          <input
            type="checkbox"
            checked={recurring}
            onChange={(e) => setRecurring(e.target.checked)}
            style={{ accentColor: '#C9A84C' }}
          />
          <span>Monthly recurring contribution</span>
        </label>
        <button
          className="inv-add-btn"
          style={{ ...S.addBtn, opacity: !name.trim() || !amount ? 0.5 : 1 }}
          onClick={handleSubmit}
          disabled={!name.trim() || !amount}
        >
          + Log Investment
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Investment List
// ─────────────────────────────────────────────────────────────
interface ListProps {
  investments: Investment[];
  onRemove: (id: string) => void;
  onUpdateStatus: (id: string, status: InvestmentStatus) => void;
  currency: string;
}

export const InvestmentList: React.FC<ListProps> = ({ investments, onRemove, onUpdateStatus, currency }) => {
  const [filter, setFilter] = useState<'all' | InvestmentCategory | 'recurring'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = [...investments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filtered = sorted.filter((inv) => {
    if (filter === 'all') return true;
    if (filter === 'recurring') return inv.isRecurring;
    return inv.category === filter;
  });

  // Categories present in current list
  const presentCategories = [...new Set(sorted.map((i) => i.category))];

  const STATUS_STYLES: Record<InvestmentStatus, { color: string; bg: string; label: string }> = {
    active:    { color: '#3DD68C', bg: 'rgba(61,214,140,0.12)',  label: 'Active' },
    matured:   { color: '#C9A84C', bg: 'rgba(201,168,76,0.12)', label: 'Matured' },
    withdrawn: { color: '#94A3B8', bg: 'rgba(148,163,184,0.1)',  label: 'Withdrawn' },
  };

  return (
    <div style={S.listCard}>
      <style>{`
        .inv-row { transition: background 0.15s ease; }
        .inv-row:hover { background: rgba(255,255,255,0.025) !important; }
        .inv-remove:hover { color: #F87171 !important; border-color: rgba(248,113,113,0.3) !important; }
        .status-select { cursor: pointer; transition: border-color 0.15s ease; }
        .status-select:hover { border-color: rgba(255,255,255,0.2) !important; }
      `}</style>

      <div className="list-header">
        <div style={S.listTitle}>All Investments</div>
        <div style={S.filterRow}>
          <button
            style={{ ...S.filterBtn, ...(filter === 'all' ? S.filterBtnActive : {}) }}
            onClick={() => setFilter('all')}
          >All</button>
          <button
            style={{ ...S.filterBtn, ...(filter === 'recurring' ? S.filterBtnActive : {}) }}
            onClick={() => setFilter('recurring')}
          >↻ Recurring</button>
          {presentCategories.map((cat) => {
            const m = INVESTMENT_META[cat];
            return (
              <button
                key={cat}
                style={{
                  ...S.filterBtn,
                  ...(filter === cat ? { ...S.filterBtnActive, borderColor: `${m.color}40`, color: m.color, background: `${m.color}12` } : {}),
                }}
                onClick={() => setFilter(cat)}
              >
                {m.icon} {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={S.emptyList}>
          <div style={S.emptyIcon}>📊</div>
          <div style={S.emptyTitle}>No investments logged yet</div>
          <div style={S.emptyText}>Start tracking your SACCOs, MMFs, stocks and more above.</div>
        </div>
      ) : (
        <div style={S.list}>
          {filtered.map((inv) => {
            const meta  = INVESTMENT_META[inv.category];
            const ss    = STATUS_STYLES[inv.status];
            const risk  = RISK_COLORS[meta.riskLevel];
            const expanded = expandedId === inv.id;
            const proj1yr  = projectGrowth(inv.amount, inv.expectedReturnPct, 1) - inv.amount;
            const proj5yr  = projectGrowth(inv.amount, inv.expectedReturnPct, 5) - inv.amount;

            return (
              <div key={inv.id}>
                <div
                  className="inv-row"
                  style={{ ...S.invRow, background: expanded ? 'rgba(255,255,255,0.025)' : 'transparent' }}
                >
                  {/* Icon */}
                  <div style={{ ...S.invIcon, background: `${meta.color}15`, border: `1px solid ${meta.color}25` }}>
                    {meta.icon}
                  </div>

                  {/* Info */}
                  <div style={S.invInfo}>
                    <div style={S.invName}>{inv.name}</div>
                    <div style={S.invMeta}>
                      <span style={{ color: meta.color }}>{meta.label}</span>
                      <span style={S.dot}>·</span>
                      <span>{inv.date}</span>
                      <span style={S.dot}>·</span>
                      <span style={{ color: risk.text }}>{meta.riskLevel} risk</span>
                      {inv.isRecurring && (
                        <><span style={S.dot}>·</span><span style={{ color: '#60A5FA' }}>↻ Monthly</span></>
                      )}
                      {inv.notes && (
                        <><span style={S.dot}>·</span><span style={{ color: '#5A6B8A', fontStyle: 'italic' }}>{inv.notes}</span></>
                      )}
                    </div>
                  </div>

                  {/* Right side */}
                  <div style={S.invRight}>
                    <div style={S.invAmount}>{formatCurrency(inv.amount, currency)}</div>
                    <div style={S.invReturn}>{inv.expectedReturnPct}% / yr</div>
                  </div>

                  {/* Status badge */}
                  <select
                    className="status-select"
                    style={{ ...S.statusSelect, color: ss.color, background: ss.bg, borderColor: `${ss.color}25` }}
                    value={inv.status}
                    onChange={(e) => onUpdateStatus(inv.id, e.target.value as InvestmentStatus)}
                  >
                    <option value="active">Active</option>
                    <option value="matured">Matured</option>
                    <option value="withdrawn">Withdrawn</option>
                  </select>

                  {/* Expand toggle */}
                  <button
                    style={S.expandBtn}
                    onClick={() => setExpandedId(expanded ? null : inv.id)}
                    title="View projections"
                  >
                    {expanded ? '▲' : '▼'}
                  </button>

                  {/* Remove */}
                  <button
                    className="inv-remove"
                    style={S.removeBtn}
                    onClick={() => onRemove(inv.id)}
                    aria-label="Remove"
                  >✕</button>
                </div>

                {/* Expanded projection row */}
                {expanded && (
                  <div style={S.projRow}>
                    <div style={S.projTitle}>Growth Projection at {inv.expectedReturnPct}% annual return</div>
                    <div style={S.projGrid}>
                      {[
                        { label: 'Principal',   val: inv.amount,                                          color: '#9BAAC4' },
                        { label: '+ 1 Year',    val: projectGrowth(inv.amount, inv.expectedReturnPct, 1), color: '#60A5FA' },
                        { label: '+ 3 Years',   val: projectGrowth(inv.amount, inv.expectedReturnPct, 3), color: '#A78BFA' },
                        { label: '+ 5 Years',   val: projectGrowth(inv.amount, inv.expectedReturnPct, 5), color: '#3DD68C' },
                        { label: '+ 10 Years',  val: projectGrowth(inv.amount, inv.expectedReturnPct, 10), color: '#C9A84C' },
                      ].map((p) => (
                        <div key={p.label} style={S.projStat}>
                          <div style={S.projStatLabel}>{p.label}</div>
                          <div style={{ ...S.projStatVal, color: p.color }}>{formatCurrency(Math.round(p.val), 'KES')}</div>
                        </div>
                      ))}
                    </div>
                    <div style={S.projGainRow}>
                      <span style={S.projGainLabel}>Gain in 1 yr:</span>
                      <span style={{ color: '#60A5FA' }}>{formatCurrency(Math.round(proj1yr), 'KES')}</span>
                      <span style={S.projGainLabel}>Gain in 5 yrs:</span>
                      <span style={{ color: '#3DD68C' }}>{formatCurrency(Math.round(proj5yr), 'KES')}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Portfolio allocation chart
// ─────────────────────────────────────────────────────────────
interface AllocationProps {
  summary: InvestmentSummary;
}

export const PortfolioAllocation: React.FC<AllocationProps> = ({ summary }) => {
  const entries = (Object.entries(summary.byCategory) as [InvestmentCategory, number][])
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a);

  const total = summary.totalInvested;

  if (entries.length === 0) {
    return null;
  }

  // Build SVG donut arcs
  const R = 70;
  const CX = 90;
  const CY = 90;
  const CIRC = 2 * Math.PI * R;

  let cumulativePct = 0;
  const arcs = entries.map(([cat, amount]) => {
    const pct = amount / total;
    const offset = cumulativePct;
    cumulativePct += pct;
    return { cat, amount, pct, offset, meta: INVESTMENT_META[cat] };
  });

  return (
    <div style={S.allocCard}>
      <div style={S.cardTitle}>Portfolio Allocation</div>
      <div style={S.allocInner}>
        {/* Donut */}
        <div style={S.donutWrap}>
          <svg width="180" height="180" viewBox="0 0 180 180">
            {/* Track */}
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="#1A2E50" strokeWidth="24" />
            {/* Arcs */}
            {arcs.map(({ cat, pct, offset, meta }) => (
              <circle
                key={cat}
                cx={CX} cy={CY} r={R}
                fill="none"
                stroke={meta.color}
                strokeWidth="24"
                strokeDasharray={`${pct * CIRC} ${CIRC}`}
                strokeLinecap="butt"
                transform={`rotate(${-90 + offset * 360} ${CX} ${CY})`}
              />
            ))}
            <text x={CX} y={CY - 6} textAnchor="middle" fill="#9BAAC4" fontSize="11" fontFamily="Karla">Portfolio</text>
            <text x={CX} y={CY + 12} textAnchor="middle" fill="#C9A84C" fontSize="13" fontFamily="Cormorant Garamond" fontWeight="700">
              {entries.length} assets
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div style={S.allocLegend}>
          {arcs.map(({ cat, amount, pct, meta }) => (
            <div key={cat} style={S.allocItem}>
              <div style={{ ...S.allocDot, background: meta.color }} />
              <div style={S.allocItemInfo}>
                <span style={S.allocCatName}>{meta.icon} {meta.label}</span>
                <div style={S.allocBarTrack}>
                  <div style={{ ...S.allocBarFill, width: `${pct * 100}%`, background: meta.color }} />
                </div>
              </div>
              <div style={S.allocItemRight}>
                <span style={{ ...S.allocPct, color: meta.color }}>{Math.round(pct * 100)}%</span>
                <span style={S.allocAmt}>{formatCurrency(amount, 'KES')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  // stat cards
  statCard:   { background: '#132040', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '20px 22px', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' },
  statLabel:  { fontSize: 12, color: '#5A6B8A', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 },
  statValue:  { fontFamily: 'Cormorant Garamond, serif', fontSize: 26, fontWeight: 700 },
  statSub:    { fontSize: 12, color: '#5A6B8A', marginTop: 6 },

  // form
  formCard:   { background: '#132040', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '26px 24px' },
  formHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  formTitle:  { fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 600, color: '#F0EDE4' },
  successTag: { fontSize: 12, color: '#3DD68C', background: 'rgba(61,214,140,0.12)', padding: '3px 12px', borderRadius: 4, fontWeight: 600 },
  catStrip:   { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: '1px solid', marginBottom: 18, flexWrap: 'wrap' },
  catStripIcon: { fontSize: 22, flexShrink: 0 },
  catStripText: { display: 'flex', flexDirection: 'column' as const, gap: 2, flex: 1, minWidth: 0 },
  catStripName: { fontSize: 13, fontWeight: 600 },
  catStripDesc: { fontSize: 12, color: '#5A6B8A' },
  riskBadge:  { fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, textTransform: 'capitalize' as const, letterSpacing: '0.05em', flexShrink: 0 },
  avgReturn:  { fontSize: 13, color: '#C9A84C', fontWeight: 600, flexShrink: 0 },
  field:      { display: 'flex', flexDirection: 'column' as const, gap: 6 },
  label:      { fontSize: 11, color: '#5A6B8A', textTransform: 'uppercase' as const, letterSpacing: '0.07em' },
  input:      { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', color: '#F0EDE4', fontSize: 14, fontFamily: 'Karla, sans-serif', transition: 'border-color 0.2s ease', width: '100%' },
  select:     { background: '#0F1F3D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', color: '#F0EDE4', fontSize: 14, fontFamily: 'Karla, sans-serif', width: '100%' },
  checkLabel: { display: 'flex', alignItems: 'center', gap: 8, color: '#9BAAC4', fontSize: 14, cursor: 'pointer' },
  addBtn:     { padding: '11px 26px', background: 'linear-gradient(135deg, #3DD68C, #2BBA76)', color: '#0A1628', borderRadius: 9, fontWeight: 700, fontSize: 14, fontFamily: 'Karla, sans-serif', boxShadow: '0 4px 20px rgba(61,214,140,0.25)', cursor: 'pointer', border: 'none' },

  // list
  listCard:   { background: '#132040', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '24px 22px', marginTop: 16 },
  listTitle:  { fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 600, color: '#F0EDE4' },
  filterRow:  { display: 'flex', gap: 6, flexWrap: 'wrap' as const },
  filterBtn:  { padding: '6px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#5A6B8A', fontSize: 12, fontFamily: 'Karla, sans-serif', cursor: 'pointer' },
  filterBtnActive: { background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)', color: '#C9A84C' },
  emptyList:  { textAlign: 'center' as const, padding: '40px 20px' },
  emptyIcon:  { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: '#F0EDE4', marginBottom: 8 },
  emptyText:  { fontSize: 14, color: '#5A6B8A', lineHeight: 1.5 },
  list:       { display: 'flex', flexDirection: 'column' as const, gap: 0 },
  invRow:     { display: 'flex', alignItems: 'center', gap: 12, padding: '13px 10px', borderRadius: 10, borderBottom: '1px solid rgba(255,255,255,0.04)' },
  invIcon:    { width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 },
  invInfo:    { flex: 1, minWidth: 0 },
  invName:    { fontSize: 14, color: '#F0EDE4', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
  invMeta:    { display: 'flex', gap: 6, fontSize: 12, color: '#5A6B8A', marginTop: 2, flexWrap: 'wrap' as const },
  dot:        { color: '#2A3B58' },
  invRight:   { textAlign: 'right' as const, flexShrink: 0 },
  invAmount:  { fontFamily: 'Cormorant Garamond, serif', fontSize: 16, fontWeight: 600, color: '#F0EDE4' },
  invReturn:  { fontSize: 12, color: '#3DD68C', marginTop: 2 },
  statusSelect: { fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 20, border: '1px solid', fontFamily: 'Karla, sans-serif', letterSpacing: '0.04em', flexShrink: 0, appearance: 'none' as const },
  expandBtn:  { background: 'transparent', color: '#3A4E6A', fontSize: 10, padding: '4px 8px', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, cursor: 'pointer', flexShrink: 0, fontFamily: 'Karla, sans-serif' },
  removeBtn:  { background: 'transparent', color: '#2A3B58', fontSize: 13, padding: '4px 8px', borderRadius: 6, border: '1px solid transparent', flexShrink: 0, cursor: 'pointer', transition: 'color 0.15s, border-color 0.15s' },

  // projections
  projRow:    { margin: '0 0 4px', padding: '14px 16px', background: 'rgba(61,214,140,0.04)', border: '1px solid rgba(61,214,140,0.1)', borderRadius: '0 0 10px 10px', marginTop: -4 },
  projTitle:  { fontSize: 12, color: '#5A6B8A', marginBottom: 12, textTransform: 'uppercase' as const, letterSpacing: '0.06em' },
  projGrid:   { display: 'flex', gap: 12, flexWrap: 'wrap' as const },
  projStat:   { background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '10px 14px', border: '1px solid rgba(255,255,255,0.04)', minWidth: 100 },
  projStatLabel: { fontSize: 11, color: '#5A6B8A', marginBottom: 4 },
  projStatVal:   { fontFamily: 'Cormorant Garamond, serif', fontSize: 16, fontWeight: 700 },
  projGainRow: { display: 'flex', gap: 16, marginTop: 12, fontSize: 13, alignItems: 'center', flexWrap: 'wrap' as const },
  projGainLabel: { color: '#5A6B8A' },

  // allocation card
  allocCard:  { background: '#132040', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '24px' },
  cardTitle:  { fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 600, color: '#F0EDE4', marginBottom: 18 },
  allocInner: { display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' as const },
  donutWrap:  { flexShrink: 0 },
  allocLegend: { flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column' as const, gap: 12, justifyContent: 'center' },
  allocItem:  { display: 'flex', alignItems: 'center', gap: 10 },
  allocDot:   { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  allocItemInfo: { flex: 1, minWidth: 0 },
  allocCatName: { fontSize: 13, color: '#9BAAC4', display: 'block', marginBottom: 4 },
  allocBarTrack: { height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' },
  allocBarFill: { height: '100%', borderRadius: 2, transition: 'width 0.6s ease' },
  allocItemRight: { display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: 1, flexShrink: 0 },
  allocPct:   { fontSize: 13, fontWeight: 700 },
  allocAmt:   { fontFamily: 'Cormorant Garamond, serif', fontSize: 13, color: '#F0EDE4' },
};
