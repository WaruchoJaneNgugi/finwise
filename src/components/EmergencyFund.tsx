import React, { useState } from 'react';
import type { EmergencyFundData } from '../types';
import { formatCurrency } from '../utils/expenses';

interface EmergencyFundProps {
  data: EmergencyFundData;
  targetAmount: number;
  progressPct: number;
  monthsCovered: number;
  monthlyExpenses: number;
  monthlyIncome: number;
  currency: string;
  onDeposit: (amount: number, note?: string) => void;
  onWithdraw: (amount: number, note?: string) => void;
  onSetTargetMonths: (months: number) => void;
  onSetCurrentAmount: (amount: number) => void;
}

export const EmergencyFund: React.FC<EmergencyFundProps> = ({
  data, targetAmount, progressPct, monthsCovered,
  monthlyExpenses, monthlyIncome, currency,
  onDeposit, onWithdraw, onSetTargetMonths, onSetCurrentAmount,
}) => {
  const [depositAmt, setDepositAmt]     = useState('');
  const [depositNote, setDepositNote]   = useState('');
  const [withdrawAmt, setWithdrawAmt]   = useState('');
  const [withdrawNote, setWithdrawNote] = useState('');
  const [overrideAmt, setOverrideAmt]   = useState('');
  const [activeTab, setActiveTab]       = useState<'deposit' | 'withdraw' | 'set'>('deposit');

  const amountLeft  = Math.max(0, targetAmount - data.currentAmount);
  const monthlyRec  = Math.ceil(amountLeft / 6);
  const weeklyRec   = Math.ceil(amountLeft / 26);
  const incomeAlloc = monthlyIncome > 0 ? Math.ceil((monthlyRec / monthlyIncome) * 100) : 0;

  const statusColor = progressPct >= 80 ? '#3DD68C' : progressPct >= 40 ? '#FBBF24' : '#F87171';
  const statusLabel = progressPct >= 100 ? '🎉 Complete!' : progressPct >= 80 ? '🟢 Almost there' : progressPct >= 40 ? '🟡 In progress' : '🔴 Just started';

  const handleDeposit = () => {
    const v = parseFloat(depositAmt);
    if (!isNaN(v) && v > 0) { onDeposit(v, depositNote); setDepositAmt(''); setDepositNote(''); }
  };
  const handleWithdraw = () => {
    const v = parseFloat(withdrawAmt);
    if (!isNaN(v) && v > 0) { onWithdraw(v, withdrawNote); setWithdrawAmt(''); setWithdrawNote(''); }
  };
  const handleOverride = () => {
    const v = parseFloat(overrideAmt);
    if (!isNaN(v) && v >= 0) { onSetCurrentAmount(v); setOverrideAmt(''); }
  };

  return (
    <div style={S.container} className="animate-in">
      {/* Page header */}
      <div style={S.pageHeader} className="page-header-row">
        <div>
          <h1 style={S.pageTitle}>🛡 Emergency Fund</h1>
          <p style={S.pageSub}>Your financial safety net — aim for {data.targetMonths} months of living expenses</p>
        </div>
        <div style={S.targetToggle} className="toggle-group">
          {[3, 6, 9].map((m) => (
            <button key={m}
              style={{ ...S.toggleBtn, ...(data.targetMonths === m ? S.toggleActive : {}) }}
              onClick={() => onSetTargetMonths(m)}
            >
              {m}mo
            </button>
          ))}
        </div>
      </div>

      {/* Main progress card */}
      <div style={{ ...S.progressCard, borderColor: `${statusColor}30`, background: `linear-gradient(135deg, #0F1F3D 0%, #132040 100%)` }}>
        <div style={S.progressTop}>
          <div>
            <div style={{ fontSize: 12, color: '#5A6B8A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Current Fund</div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 700, color: statusColor }}>
              {formatCurrency(data.currentAmount, currency)}
            </div>
            <div style={{ fontSize: 13, color: '#9BAAC4', marginTop: 4 }}>
              of {formatCurrency(targetAmount, currency)} target · {statusLabel}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(36px, 6vw, 52px)', fontWeight: 700, color: statusColor, lineHeight: 1 }}>{progressPct}%</div>
            <div style={{ fontSize: 12, color: '#5A6B8A' }}>complete</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={S.bigBar}>
          <div style={{ ...S.bigBarFill, width: `${progressPct}%`, background: statusColor, boxShadow: `0 0 12px ${statusColor}60` }} />
        </div>

        {/* KPI row */}
        <div className="ef-kpi-row">
          {[
            { label: 'Months Covered', value: `${monthsCovered} mo`, color: statusColor },
            { label: 'Still Needed', value: formatCurrency(amountLeft, currency), color: amountLeft > 0 ? '#F87171' : '#3DD68C' },
            { label: 'Monthly Target', value: formatCurrency(monthlyExpenses, currency), color: '#9BAAC4' },
            { label: 'Last Updated', value: data.lastUpdated || '—', color: '#5A6B8A' },
          ].map((k) => (
            <div key={k.label} style={S.kpi}>
              <div style={{ fontSize: 11, color: '#5A6B8A', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{k.label}</div>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 700, color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Action + Recommendations row */}
      <div className="ef-two-col">
        {/* Action card */}
        <div style={S.card}>
          <div style={S.cardTitle}>Manage Fund</div>

          {/* Tab switcher */}
          <div style={S.tabs}>
            {(['deposit', 'withdraw', 'set'] as const).map((t) => (
              <button key={t} style={{ ...S.tabBtn, ...(activeTab === t ? S.tabActive : {}) }} onClick={() => setActiveTab(t)}>
                {t === 'deposit' ? '+ Deposit' : t === 'withdraw' ? '− Withdraw' : '✎ Set Amount'}
              </button>
            ))}
          </div>

          {activeTab === 'deposit' && (
            <div style={S.actionForm}>
              <p style={S.actionDesc}>Add money to your emergency fund. Consider using Cytonn MMF or NCBA Money Market for interest while it stays accessible.</p>
              {/* Quick amounts */}
              <div style={S.quickAmts}>
                {[1000, 2500, 5000, 10000, 20000].map((a) => (
                  <button key={a} style={S.quickAmt} onClick={() => setDepositAmt(String(a))}>
                    +{(a / 1000).toFixed(0)}K
                  </button>
                ))}
              </div>
              <input style={S.input} type="number" placeholder="Amount (KES)" value={depositAmt}
                onChange={(e) => setDepositAmt(e.target.value)} />
              <input style={S.input} placeholder="Note (optional, e.g. Payday transfer)" value={depositNote}
                onChange={(e) => setDepositNote(e.target.value)} />
              <button style={S.primaryBtn} onClick={handleDeposit} disabled={!depositAmt}>
                💰 Deposit to Fund
              </button>
            </div>
          )}

          {activeTab === 'withdraw' && (
            <div style={S.actionForm}>
              <div style={S.withdrawWarning}>
                ⚠️ Only withdraw for genuine emergencies — job loss, medical emergency, urgent repairs.
              </div>
              <input style={S.input} type="number" placeholder="Amount (KES)" value={withdrawAmt}
                onChange={(e) => setWithdrawAmt(e.target.value)} />
              <input style={S.input} placeholder="Reason (required)" value={withdrawNote}
                onChange={(e) => setWithdrawNote(e.target.value)} />
              <button style={{ ...S.primaryBtn, background: '#F87171', border: 'none' }} onClick={handleWithdraw}
                disabled={!withdrawAmt || !withdrawNote}>
                Withdraw Funds
              </button>
            </div>
          )}

          {activeTab === 'set' && (
            <div style={S.actionForm}>
              <p style={S.actionDesc}>Already have savings elsewhere? Set the current fund amount directly.</p>
              <input style={S.input} type="number" placeholder="Current total amount (KES)"
                value={overrideAmt} onChange={(e) => setOverrideAmt(e.target.value)} />
              <button style={S.primaryBtn} onClick={handleOverride} disabled={!overrideAmt}>
                ✎ Update Amount
              </button>
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div style={S.card}>
          <div style={S.cardTitle}>📊 Recommendations</div>
          <div style={S.recList}>
            {[
              { label: 'Monthly contribution', value: formatCurrency(monthlyRec, currency), sub: 'to reach target in 6 months' },
              { label: 'Weekly savings target', value: formatCurrency(weeklyRec, currency), sub: `≈ ${incomeAlloc}% of monthly income` },
              { label: 'Best place to store it', value: 'Cytonn / NCBA MMF', sub: '~11% p.a. — liquid & insured' },
              { label: '3-Month target', value: formatCurrency(monthlyExpenses * 3, currency), sub: 'minimum safety net' },
              { label: '6-Month target', value: formatCurrency(monthlyExpenses * 6, currency), sub: 'recommended buffer' },
            ].map((r) => (
              <div key={r.label} style={S.recRow}>
                <div>
                  <div style={{ fontSize: 13, color: '#F0EDE4', fontWeight: 500 }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: '#5A6B8A', marginTop: 2 }}>{r.sub}</div>
                </div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 17, fontWeight: 700, color: '#C9A84C', textAlign: 'right' }}>{r.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contribution history */}
      {data.contributions.length > 0 && (
        <div style={S.card}>
          <div style={S.cardTitle}>📋 Contribution History</div>
          <div>
            {data.contributions.slice(0, 15).map((c, i) => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.amount > 0 ? '#3DD68C' : '#F87171', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: '#F0EDE4' }}>{c.note || (c.amount > 0 ? 'Deposit' : 'Withdrawal')}</div>
                  <div style={{ fontSize: 11, color: '#5A6B8A' }}>{c.date}</div>
                </div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, fontWeight: 700, color: c.amount > 0 ? '#3DD68C' : '#F87171' }}>
                  {c.amount > 0 ? '+' : ''}{formatCurrency(c.amount, currency)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const S: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: 20 },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 },
  pageTitle: { fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 700, color: '#E2C47A', margin: 0 },
  pageSub: { fontSize: 13, color: '#9BAAC4', marginTop: 4 },
  targetToggle: { display: 'flex', gap: 6 },
  toggleBtn: { padding: '7px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#5A6B8A', fontFamily: 'Karla, sans-serif', fontSize: 13, cursor: 'pointer' },
  toggleActive: { borderColor: '#C9A84C', background: 'rgba(201,168,76,0.1)', color: '#C9A84C', fontWeight: 700 },
  progressCard: { borderRadius: 16, padding: 'clamp(16px, 4vw, 32px)', border: '1px solid' },
  progressTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  bigBar: { height: 14, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden', marginBottom: 24 },
  bigBarFill: { height: '100%', borderRadius: 99, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' },
  kpi: { background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.04)' },
  card: { background: '#132040', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '24px 26px' },
  cardTitle: { fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 600, color: '#F0EDE4', marginBottom: 18 },
  tabs: { display: 'flex', gap: 6, marginBottom: 18 },
  tabBtn: { flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#5A6B8A', fontFamily: 'Karla, sans-serif', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: '0.15s' },
  tabActive: { borderColor: '#C9A84C', background: 'rgba(201,168,76,0.1)', color: '#C9A84C' },
  actionForm: { display: 'flex', flexDirection: 'column', gap: 12 },
  actionDesc: { fontSize: 13, color: '#9BAAC4', lineHeight: 1.6 },
  withdrawWarning: { padding: '10px 14px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, fontSize: 13, color: '#FCA5A5', lineHeight: 1.5 },
  quickAmts: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  quickAmt: { padding: '6px 14px', borderRadius: 20, border: '1px solid rgba(201,168,76,0.2)', background: 'rgba(201,168,76,0.07)', color: '#C9A84C', fontSize: 12, fontFamily: 'Karla, sans-serif', cursor: 'pointer' },
  input: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '11px 14px', color: '#F0EDE4', fontSize: 14, fontFamily: 'Karla, sans-serif', outline: 'none' },
  primaryBtn: { padding: '12px 20px', background: 'linear-gradient(135deg, #C9A84C, #E2C47A)', color: '#0A1628', borderRadius: 10, fontWeight: 700, fontSize: 14, fontFamily: 'Karla, sans-serif', cursor: 'pointer', border: 'none', transition: '0.15s' },
  recList: { display: 'flex', flexDirection: 'column', gap: 0 },
  recRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
};
