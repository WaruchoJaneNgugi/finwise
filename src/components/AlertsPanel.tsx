import React, { useState } from 'react';
import type { AlertContact, AlertLog, Bill, Goal } from '../types';
import type { MonthlyBreakdown, FinancialProfile, InvestmentSummary } from '../types';
import { formatCurrency } from '../utils/expenses';

interface AlertsPanelProps {
  contact: AlertContact;
  log: AlertLog[];
  hasContact: boolean;
  profile: FinancialProfile;
  breakdown: MonthlyBreakdown;
  investmentSummary: InvestmentSummary;
  bills: Bill[];
  billsMonthlyTotal: number;
  goals: Goal[];
  netWorthSummary: { totalAssets: number; totalLiabilities: number; netWorth: number };
  efCurrent: number;
  efTarget: number;
  userName?: string;
  onSaveContact: (contact: AlertContact) => void;
  onRecordAlert: (channel: AlertLog['channel'], snapshot: string) => void;
  onClearLog: () => void;
  onNavigateToAdvisor?: () => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  contact, log, hasContact,
  profile, breakdown, investmentSummary, bills, billsMonthlyTotal, goals, netWorthSummary,
  efCurrent, efTarget,
  userName, onSaveContact, onRecordAlert, onClearLog, onNavigateToAdvisor,
}) => {
  const [form, setForm] = useState<AlertContact>(contact);
  const [saved, setSaved] = useState(false);

  const billsDue = bills.filter((b) => b.status !== 'paid').reduce((s, b) => s + b.amount, 0);
  const spendPct = profile.monthlyIncome > 0
    ? Math.round((breakdown.totalExpenses / profile.monthlyIncome) * 100) : 0;
  const efPct = efTarget > 0 ? Math.min(100, Math.round((efCurrent / efTarget) * 100)) : 0;

  const buildSnapshot = (): string =>
    `🚨 FinWise SOS Alert
From: ${userName || 'FinWise User'}
Time: ${new Date().toLocaleString('en-KE', { dateStyle: 'full', timeStyle: 'short' })}

📊 FINANCIAL SNAPSHOT:
• Monthly Income: ${formatCurrency(profile.monthlyIncome, profile.currency)}
• Total Spent: ${formatCurrency(breakdown.totalExpenses, profile.currency)} (${spendPct}% of income)
• Necessary: ${formatCurrency(breakdown.necessaryTotal, profile.currency)}
• Unnecessary: ${formatCurrency(breakdown.unnecessaryTotal, profile.currency)}
• Savings Left: ${formatCurrency(breakdown.savingsLeft, profile.currency)}

💼 INVESTMENTS:
• Total Invested: ${formatCurrency(investmentSummary.totalInvested, profile.currency)}
• Projected Annual Return: ${formatCurrency(investmentSummary.projectedAnnualReturn, profile.currency)}

🗓 BILLS:
• Monthly Bills Total: ${formatCurrency(billsMonthlyTotal, profile.currency)}
• Currently Due/Overdue: ${formatCurrency(billsDue, profile.currency)}

⚖ NET WORTH:
• Total Assets: ${formatCurrency(netWorthSummary.totalAssets, profile.currency)}
• Total Liabilities: ${formatCurrency(netWorthSummary.totalLiabilities, profile.currency)}
• Net Worth: ${formatCurrency(netWorthSummary.netWorth, profile.currency)}

🛡 EMERGENCY FUND: ${efPct}% (${formatCurrency(efCurrent, profile.currency)} / ${formatCurrency(efTarget, profile.currency)})

🎯 ACTIVE GOALS:
${goals.filter((g) => !g.completed).map((g) =>
  `• ${g.name}: ${Math.min(100, Math.round((g.savedAmount / g.targetAmount) * 100))}% (${formatCurrency(g.savedAmount, profile.currency)} / ${formatCurrency(g.targetAmount, profile.currency)})`
).join('\n') || '• No active goals'}

Please assist urgently.`;

  const handleSave = () => {
    onSaveContact(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sendEmail = () => {
    if (!form.email) return;
    const snap = buildSnapshot();
    window.open(
      `mailto:${form.email}?subject=${encodeURIComponent(`🚨 FinWise SOS — ${userName || 'User'} needs help`)}&body=${encodeURIComponent(snap)}`
    );
    onRecordAlert('email', snap);
  };

  const sendWhatsApp = () => {
    if (!form.whatsapp) return;
    const snap = buildSnapshot();
    const num = form.whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(snap)}`);
    onRecordAlert('whatsapp', snap);
  };

  const callNow = () => {
    if (!form.phone) return;
    window.open(`tel:${form.phone}`);
    onRecordAlert('phone', buildSnapshot());
  };

  return (
    <div style={S.container} className="animate-in">
      {/* Page header */}
      <div style={S.pageHeader}>
        <div>
          <h1 style={S.pageTitle}>📡 Alerts & SOS</h1>
          <p style={S.pageSub}>Configure your advisor contacts and send instant financial snapshots when you need help</p>
        </div>
      </div>

      {/* Contact config */}
      <div style={S.card}>
        <div style={S.cardTitle}>👤 Advisor / Trusted Contact Setup</div>
        <p style={{ fontSize: 13, color: '#9BAAC4', marginBottom: 20, lineHeight: 1.6 }}>
          Set up your financial advisor or trusted person's contact details. When you trigger an SOS, they'll instantly receive your complete financial snapshot.
        </p>
        <div className="alerts-form-grid" style={{ marginBottom: 16 }}>
          <div style={S.field}>
            <label style={S.label}>Contact Name</label>
            <input style={S.input} value={form.name} placeholder="e.g. My Financial Advisor"
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div style={S.field}>
            <label style={S.label}>Email Address</label>
            <input style={S.input} type="email" value={form.email} placeholder="advisor@example.com"
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          </div>
          <div style={S.field}>
            <label style={S.label}>WhatsApp Number</label>
            <input style={S.input} value={form.whatsapp} placeholder="+254 7XX XXX XXX"
              onChange={(e) => setForm((p) => ({ ...p, whatsapp: e.target.value }))} />
          </div>
          <div style={S.field}>
            <label style={S.label}>Phone / Call Number</label>
            <input style={S.input} value={form.phone} placeholder="+254 7XX XXX XXX"
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button style={S.primaryBtn} onClick={handleSave}>
            {saved ? '✓ Saved!' : '💾 Save Contact'}
          </button>
          {hasContact && (
            <span style={{ fontSize: 12, color: '#3DD68C' }}>✓ Contact configured — SOS alerts ready</span>
          )}
        </div>
      </div>

      {/* SOS action buttons */}
      <div style={S.card}>
        <div style={S.cardTitle}>🚨 Send SOS Alert Now</div>
        <p style={{ fontSize: 13, color: '#9BAAC4', marginBottom: 20, lineHeight: 1.6 }}>
          Instantly send your complete financial snapshot to {contact.name || 'your advisor'}.
          They'll receive your income, expenses, bills, net worth, goals, and emergency fund status.
        </p>

        <div className="sos-grid">
          {/* Email */}
          <button style={{ ...S.sosBtn, ...(contact.email ? S.sosEmail : S.sosDisabled) }}
            onClick={sendEmail} disabled={!contact.email}>
            <span style={S.sosIcon}>📧</span>
            <div style={S.sosBtnTitle}>Send Email</div>
            <div style={S.sosBtnSub}>{contact.email || 'No email configured'}</div>
          </button>

          {/* WhatsApp */}
          <button style={{ ...S.sosBtn, ...(contact.whatsapp ? S.sosWhatsapp : S.sosDisabled) }}
            onClick={sendWhatsApp} disabled={!contact.whatsapp}>
            <span style={S.sosIcon}>💬</span>
            <div style={{ ...S.sosBtnTitle, color: contact.whatsapp ? '#3DD68C' : 'inherit' }}>WhatsApp</div>
            <div style={S.sosBtnSub}>{contact.whatsapp || 'No WhatsApp configured'}</div>
          </button>

          {/* Phone */}
          <button style={{ ...S.sosBtn, ...(contact.phone ? S.sosPhone : S.sosDisabled) }}
            onClick={callNow} disabled={!contact.phone}>
            <span style={S.sosIcon}>📞</span>
            <div style={{ ...S.sosBtnTitle, color: contact.phone ? '#60A5FA' : 'inherit' }}>Call Now</div>
            <div style={S.sosBtnSub}>{contact.phone || 'No phone configured'}</div>
          </button>

          {/* AI Chat */}
          <button style={{ ...S.sosBtn, borderColor: 'rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.06)', cursor: 'pointer' }}
            onClick={onNavigateToAdvisor}>
            <span style={S.sosIcon}>✦</span>
            <div style={{ ...S.sosBtnTitle, color: '#C9A84C' }}>AI Advisor</div>
            <div style={S.sosBtnSub}>Get instant AI advice</div>
          </button>
        </div>
      </div>

      {/* Message preview */}
      <div style={S.card}>
        <div style={S.cardTitle}>📄 Message Preview</div>
        <p style={{ fontSize: 12, color: '#5A6B8A', marginBottom: 14 }}>
          This is exactly what your contact will receive when you send an SOS alert:
        </p>
        <div style={S.previewBox}>
          <pre style={S.previewText}>{buildSnapshot()}</pre>
        </div>
      </div>

      {/* Alert log */}
      {log.length > 0 && (
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={S.cardTitle}>📜 Alert History</div>
            <button onClick={onClearLog}
              style={{ padding: '6px 14px', background: 'transparent', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, color: '#F87171', fontSize: 12, fontFamily: 'Karla, sans-serif', cursor: 'pointer' }}>
              Clear History
            </button>
          </div>
          {log.slice(0, 20).map((entry, i) => (
            <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <span style={{ fontSize: 20 }}>
                {entry.channel === 'email' ? '📧' : entry.channel === 'whatsapp' ? '💬' : '📞'}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: '#F0EDE4', textTransform: 'capitalize' }}>Alert via {entry.channel}</div>
                <div style={{ fontSize: 11, color: '#5A6B8A', marginTop: 2 }}>
                  {new Date(entry.timestamp).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>
              <span style={{ fontSize: 11, color: '#3DD68C', background: 'rgba(61,214,140,0.1)', padding: '3px 10px', borderRadius: 20 }}>Sent ✓</span>
            </div>
          ))}
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
  card: { background: '#132040', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '24px 26px' },
  cardTitle: { fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 600, color: '#F0EDE4', marginBottom: 0 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 11, color: '#5A6B8A', textTransform: 'uppercase', letterSpacing: '0.07em' },
  input: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, padding: '11px 14px', color: '#F0EDE4', fontSize: 13, fontFamily: 'Karla, sans-serif', outline: 'none', transition: '0.15s' },
  primaryBtn: { padding: '11px 22px', background: 'linear-gradient(135deg, #C9A84C, #E2C47A)', color: '#0A1628', borderRadius: 10, fontWeight: 700, fontSize: 14, fontFamily: 'Karla, sans-serif', border: 'none', cursor: 'pointer' },
  sosBtn: { padding: '22px 16px', borderRadius: 14, border: '1px solid', cursor: 'pointer', textAlign: 'center', transition: '0.15s', background: 'transparent', minHeight: 44 },
  sosEmail: { borderColor: 'rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.06)' },
  sosWhatsapp: { borderColor: 'rgba(61,214,140,0.3)', background: 'rgba(61,214,140,0.06)' },
  sosPhone: { borderColor: 'rgba(96,165,250,0.3)', background: 'rgba(96,165,250,0.06)' },
  sosDisabled: { borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', opacity: 0.4 },
  sosIcon: { display: 'block', fontSize: 28, marginBottom: 10 },
  sosBtnTitle: { fontSize: 14, fontWeight: 700, color: '#C9A84C', fontFamily: 'Cormorant Garamond, serif', marginBottom: 4 },
  sosBtnSub: { fontSize: 11, color: '#5A6B8A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  previewBox: { background: '#050D1A', borderRadius: 10, padding: '16px 18px', border: '1px solid rgba(255,255,255,0.06)', maxHeight: 320, overflowY: 'auto' },
  previewText: { fontFamily: 'monospace', fontSize: 11, color: '#9BAAC4', lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0 },
};
