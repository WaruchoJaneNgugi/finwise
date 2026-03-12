import React, { useState } from 'react';
import type { Bill, BillCategory, BillFrequency } from '../types';
import { BILL_META, getDaysUntilDue} from '../hooks/bills';
import { formatCurrency } from '../utils/expenses';

interface BillsProps {
  bills: Bill[];
  sortedBills: Bill[];
  monthlyTotal: number;
  upcomingThisWeek: Bill[];
  overdueCount: number;
  paidCount: number;
  onAdd: (data: Omit<Bill, 'id'>) => void;
  onRemove: (id: string) => void;
  onMarkPaid: (id: string) => void;
  onMarkUnpaid: (id: string) => void;
  currency: string;
}

export const Bills: React.FC<BillsProps> = ({
  bills, sortedBills, monthlyTotal, upcomingThisWeek,
  overdueCount, onAdd, onRemove, onMarkPaid, onMarkUnpaid, currency,
}) => {
  const [name, setName]         = useState('');
  const [amount, setAmount]     = useState('');
  const [category, setCategory] = useState<BillCategory>('rent');
  const [dueDay, setDueDay]     = useState('1');
  const [frequency, setFrequency] = useState<BillFrequency>('monthly');
  const [notes, setNotes]       = useState('');
  const [filter, setFilter]     = useState<'all' | 'upcoming' | 'paid' | 'overdue'>('all');
  const [submitted, setSubmitted] = useState(false);

  const handleAdd = () => {
    const amt = parseFloat(amount.replace(/,/g, ''));
    const day = parseInt(dueDay);
    if (!name.trim() || isNaN(amt) || amt <= 0 || isNaN(day) || day < 1 || day > 31) return;
    onAdd({ name: name.trim(), amount: amt, category, dueDay: day, frequency, status: 'upcoming', notes, isRecurring: true });
    setName(''); setAmount(''); setDueDay('1'); setNotes('');
    setSubmitted(true); setTimeout(() => setSubmitted(false), 1500);
  };

  const filteredBills = sortedBills.filter((b) => {
    if (filter === 'all') return true;
    if (filter === 'paid') return b.status === 'paid';
    if (filter === 'overdue') return b.status === 'overdue';
    return b.status !== 'paid';
  });

  const paidTotal = bills.filter((b) => b.status === 'paid').reduce((s, b) => s + b.amount, 0);
  const unpaidTotal = monthlyTotal - paidTotal;

  return (
    <div style={S.container} className="animate-in">

      {/* Summary */}
      <div className="stats-grid">
        {[
          { label: 'Monthly Total',  val: formatCurrency(monthlyTotal, currency), color: '#F0EDE4' },
          { label: 'Paid This Month',val: formatCurrency(paidTotal, currency),    color: '#3DD68C' },
          { label: 'Still to Pay',   val: formatCurrency(unpaidTotal, currency),  color: '#FBBF24' },
          { label: 'Overdue Bills',  val: overdueCount,                           color: overdueCount > 0 ? '#F87171' : '#3DD68C' },
        ].map((s) => (
          <div key={s.label} style={S.statCard}>
            <div style={S.statLabel}>{s.label}</div>
            <div style={{ ...S.statVal, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Upcoming this week alert */}
      {upcomingThisWeek.length > 0 && (
        <div style={S.alertCard}>
          <div style={S.alertTitle}>⏰ Due This Week ({upcomingThisWeek.length})</div>
          <div style={S.alertBills}>
            {upcomingThisWeek.map((b) => {
              const days = getDaysUntilDue(b.dueDay);
              return (
                <div key={b.id} style={S.alertBill}>
                  <span>{BILL_META[b.category].icon} {b.name}</span>
                  <span style={{ color: '#FBBF24' }}>{formatCurrency(b.amount, currency)}</span>
                  <span style={{ color: days === 0 ? '#F87171' : '#9BAAC4' }}>{days === 0 ? 'Due today' : `${days}d left`}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add form */}
      <div style={S.formCard}>
        <div style={S.formTitleRow}>
          <div style={S.cardTitle}>Add Bill</div>
          {submitted && <span style={S.successTag}>✓ Bill Added!</span>}
        </div>
        <div className="form-grid">
          <div style={S.field}>
            <label style={S.label}>Bill Name</label>
            <input style={S.input} placeholder="e.g. KPLC Electricity" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div style={S.field}>
            <label style={S.label}>Category</label>
            <select style={S.select} value={category} onChange={(e) => setCategory(e.target.value as BillCategory)}>
              {(Object.entries(BILL_META) as [BillCategory, typeof BILL_META[BillCategory]][]).map(([k, m]) => (
                <option key={k} value={k}>{m.icon} {m.label}</option>
              ))}
            </select>
          </div>
          <div style={S.field}>
            <label style={S.label}>Amount (KSh)</label>
            <input style={S.input} type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div style={S.field}>
            <label style={S.label}>Due Day of Month</label>
            <input style={S.input} type="number" min="1" max="31" placeholder="1–31" value={dueDay} onChange={(e) => setDueDay(e.target.value)} />
          </div>
          <div style={S.field}>
            <label style={S.label}>Frequency</label>
            <select style={S.select} value={frequency} onChange={(e) => setFrequency(e.target.value as BillFrequency)}>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
          </div>
          <div style={S.field}>
            <label style={S.label}>Notes</label>
            <input style={S.input} placeholder="Optional note..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <div style={S.formBottom}>
          <button style={{ ...S.addBtn, opacity: !name.trim() || !amount ? 0.5 : 1 }} onClick={handleAdd} disabled={!name.trim() || !amount}>
            + Add Bill
          </button>
        </div>
      </div>

      {/* Bills list */}
      <div style={S.listCard}>
        <div style={S.listHeader}>
          <div style={S.cardTitle}>All Bills</div>
          <div style={S.filterRow}>
            {(['all', 'upcoming', 'paid', 'overdue'] as const).map((f) => (
              <button key={f} style={{ ...S.filterBtn, ...(filter === f ? S.filterActive : {}) }} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredBills.length === 0 ? (
          <div style={S.emptyMsg}>No bills found. Add your recurring bills above.</div>
        ) : (
          <div style={S.billList}>
            {filteredBills.map((bill) => {
              const meta = BILL_META[bill.category];
              const daysLeft = getDaysUntilDue(bill.dueDay);
              const isOverdue = bill.status === 'overdue' || (bill.status !== 'paid' && new Date().getDate() > bill.dueDay);
              const isPaid = bill.status === 'paid';
              const statusColor = isPaid ? '#3DD68C' : isOverdue ? '#F87171' : daysLeft <= 3 ? '#FBBF24' : '#9BAAC4';

              return (
                <div key={bill.id} style={{ ...S.billItem, opacity: isPaid ? 0.6 : 1 }}>
                  <div style={{ ...S.billIcon, background: `${meta.color}18` }}>{meta.icon}</div>
                  <div style={S.billInfo}>
                    <div style={{ ...S.billName, textDecoration: isPaid ? 'line-through' : 'none' }}>{bill.name}</div>
                    <div style={S.billMeta}>
                      <span style={{ color: meta.color }}>{meta.label}</span>
                      <span style={S.dot}>·</span>
                      <span>Due {bill.dueDay}th</span>
                      <span style={S.dot}>·</span>
                      <span style={{ textTransform: 'capitalize' }}>{bill.frequency}</span>
                    </div>
                  </div>
                  <div style={S.billRight}>
                    <div style={S.billAmount}>{formatCurrency(bill.amount, currency)}</div>
                    <div style={{ ...S.billStatus, color: statusColor }}>
                      {isPaid ? '✓ Paid' : isOverdue ? '⚠ Overdue' : `${daysLeft}d left`}
                    </div>
                  </div>
                  <div style={S.billActions}>
                    {isPaid
                      ? <button style={{ ...S.actionBtn, color: '#5A6B8A' }} onClick={() => onMarkUnpaid(bill.id)}>Undo</button>
                      : <button style={{ ...S.actionBtn, color: '#3DD68C', borderColor: 'rgba(61,214,140,0.25)' }} onClick={() => onMarkPaid(bill.id)}>✓ Paid</button>
                    }
                    <button style={{ ...S.actionBtn, color: '#2A3B58' }} onClick={() => onRemove(bill.id)}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const S: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: 20 },
  cardTitle: { fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 600, color: '#F0EDE4' },
  statCard: { background: '#132040', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 18px' },
  statLabel: { fontSize: 11, color: '#5A6B8A', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 },
  statVal: { fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 700 },
  alertCard: { background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 12, padding: '18px 20px' },
  alertTitle: { fontSize: 14, fontWeight: 600, color: '#FBBF24', marginBottom: 12 },
  alertBills: { display: 'flex', flexDirection: 'column', gap: 8 },
  alertBill: { display: 'flex', gap: 16, fontSize: 13, color: '#9BAAC4', justifyContent: 'space-between' },
  formCard: { background: '#132040', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '24px 22px' },
  formTitleRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
  successTag: { fontSize: 12, color: '#3DD68C', background: 'rgba(61,214,140,0.12)', padding: '3px 10px', borderRadius: 4, fontWeight: 600 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 11, color: '#5A6B8A', textTransform: 'uppercase', letterSpacing: '0.07em' },
  input: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', color: '#F0EDE4', fontSize: 14, fontFamily: 'Karla, sans-serif' },
  select: { background: '#0F1F3D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', color: '#F0EDE4', fontSize: 14, fontFamily: 'Karla, sans-serif' },
  formBottom: { display: 'flex', justifyContent: 'flex-end', marginTop: 16 },
  addBtn: { padding: '11px 24px', background: 'linear-gradient(135deg, #C9A84C, #E2C47A)', color: '#0A1628', borderRadius: 9, fontWeight: 700, fontSize: 14, fontFamily: 'Karla, sans-serif' },
  listCard: { background: '#132040', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '24px 22px' },
  listHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 },
  filterRow: { display: 'flex', gap: 6 },
  filterBtn: { padding: '6px 12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#5A6B8A', fontSize: 12 },
  filterActive: { background: 'rgba(201,168,76,0.12)', borderColor: 'rgba(201,168,76,0.25)', color: '#C9A84C' },
  emptyMsg: { color: '#5A6B8A', fontSize: 14, textAlign: 'center', padding: '24px 0' },
  billList: { display: 'flex', flexDirection: 'column', gap: 2 },
  billItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 10px', borderRadius: 10, transition: '0.15s ease' },
  billIcon: { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 },
  billInfo: { flex: 1, minWidth: 0 },
  billName: { fontSize: 14, color: '#F0EDE4', fontWeight: 500 },
  billMeta: { display: 'flex', gap: 6, fontSize: 12, color: '#5A6B8A', marginTop: 2 },
  dot: { color: '#2A3B58' },
  billRight: { textAlign: 'right', flexShrink: 0 },
  billAmount: { fontFamily: 'Cormorant Garamond, serif', fontSize: 16, fontWeight: 600, color: '#F0EDE4' },
  billStatus: { fontSize: 11, marginTop: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' },
  billActions: { display: 'flex', gap: 6, flexShrink: 0 },
  actionBtn: { padding: '6px 12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, fontSize: 12, fontFamily: 'Karla, sans-serif', fontWeight: 600, cursor: 'pointer' },
};
