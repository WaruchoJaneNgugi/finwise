import React from 'react';
import type { SubscriptionTier } from '../types';

const PLANS = [
  {
    tier: 'silver' as SubscriptionTier,
    name: 'Silver',
    price: 299,
    color: '#94A3B8',
    icon: '◈',
    features: ['Bills & recurring payments', 'Savings goals with deadlines', 'Emergency fund tracker', 'Net Worth calculator'],
  },
  {
    tier: 'gold' as SubscriptionTier,
    name: 'Gold',
    price: 599,
    color: '#D97706',
    icon: '◉',
    popular: true,
    features: ['Everything in Silver', 'Investment portfolio', 'Spending insights & analytics', 'AI Chat advisor', 'CSV exports'],
  },
  {
    tier: 'platinum' as SubscriptionTier,
    name: 'Platinum',
    price: 999,
    color: '#8B5CF6',
    icon: '✦',
    features: ['Everything in Gold', 'Alerts & SOS system', 'Emergency contact notifications', 'Priority support', 'All future features'],
  },
];

interface UpgradePageProps {
  currentTier: SubscriptionTier;
  onSelectPlan: (tier: SubscriptionTier) => void;
}

export const UpgradePage: React.FC<UpgradePageProps> = ({ onSelectPlan }) => {
  return (
    <div style={S.page} className="animate-in">
      {/* Header */}
      <div style={S.header}>
        <div style={S.badge}>⭐ UPGRADE YOUR PLAN</div>
        <h1 style={S.title}>Unlock the full FinWise experience</h1>
        <p style={S.sub}>
          You're on the <strong style={{ color: 'var(--text-1)' }}>Free plan</strong>. Upgrade to access investments,
          goals, bills, AI chat and more.
        </p>
      </div>

      {/* What you're missing */}
      <div style={S.lockedGrid}>
        {[
          { icon: '📈', label: 'Investments' },
          { icon: '🎯', label: 'Goals' },
          { icon: '📋', label: 'Bills' },
          { icon: '💰', label: 'Net Worth' },
          { icon: '🛡️', label: 'Emergency Fund' },
          { icon: '📊', label: 'Insights' },
          { icon: '🤖', label: 'AI Chat' },
          { icon: '🔔', label: 'Alerts & SOS' },
        ].map(f => (
          <div key={f.label} style={S.lockedItem}>
            <span style={S.lockedIcon}>{f.icon}</span>
            <span style={S.lockedLabel}>{f.label}</span>
            <span style={S.lockBadge}>🔒</span>
          </div>
        ))}
      </div>

      {/* Plans */}
      <div style={S.plansGrid}>
        {PLANS.map(plan => (
          <div
            key={plan.tier}
            style={{
              ...S.planCard,
              border: plan.popular ? `2px solid ${plan.color}` : '1.5px solid var(--border)',
              boxShadow: plan.popular ? `0 8px 32px ${plan.color}22` : 'var(--shadow-card)',
            }}
          >
            {plan.popular && (
              <div style={{ ...S.popularBadge, background: `linear-gradient(135deg, #F59E0B, #D97706)` }}>
                ⭐ MOST POPULAR
              </div>
            )}
            <div style={{ fontSize: 30, marginBottom: 8 }}>{plan.icon}</div>
            <div style={{ ...S.planName, color: plan.color }}>{plan.name}</div>
            <div style={S.planPrice}>
              <span style={S.planAmt}>KES {plan.price.toLocaleString()}</span>
              <span style={S.planPer}>/mo</span>
            </div>
            <ul style={S.featureList}>
              {plan.features.map(f => (
                <li key={f} style={S.featureItem}>
                  <span style={{ color: plan.color, marginRight: 8, fontWeight: 700 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button
              style={S.planBtn}
              onClick={() => onSelectPlan(plan.tier)}
            >
              Upgrade to {plan.name} →
            </button>
          </div>
        ))}
      </div>

      <div style={S.note}>🔒 Secure payment via M-Pesa or Visa · Cancel anytime</div>
    </div>
  );
};

const S: Record<string, React.CSSProperties> = {
  page:         { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, padding: '8px 0 40px' },
  header:       { textAlign: 'center', maxWidth: 560 },
  badge:        { display: 'inline-block', fontSize: 11, fontWeight: 700, color: 'var(--gold)', background: 'var(--gold-dim)', border: '1px solid var(--border-acc)', borderRadius: 20, padding: '5px 14px', letterSpacing: '0.1em', marginBottom: 14 },
  title:        { fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 700, color: 'var(--text-1)', marginBottom: 12, lineHeight: 1.2 },
  sub:          { fontSize: 15, color: 'var(--text-2)', lineHeight: 1.7 },
  lockedGrid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, width: '100%', maxWidth: 700 },
  lockedItem:   { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative', opacity: 0.7 },
  lockedIcon:   { fontSize: 24 },
  lockedLabel:  { fontSize: 12, fontWeight: 600, color: 'var(--text-2)' },
  lockBadge:    { position: 'absolute', top: 8, right: 8, fontSize: 11 },
  plansGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, width: '100%', maxWidth: 780 },
  planCard:     { background: 'var(--bg-card)', borderRadius: 18, padding: '28px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' },
  popularBadge: { position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', fontSize: 10, fontWeight: 800, color: '#fff', padding: '4px 14px', borderRadius: 20, letterSpacing: '0.08em', whiteSpace: 'nowrap' },
  planName:     { fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontWeight: 700, marginBottom: 6 },
  planPrice:    { marginBottom: 20 },
  planAmt:      { fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 700, color: 'var(--text-1)' },
  planPer:      { fontSize: 13, color: 'var(--text-3)', marginLeft: 3 },
  featureList:  { listStyle: 'none', padding: 0, margin: '0 0 24px', width: '100%', textAlign: 'left' },
  featureItem:  { fontSize: 13, color: 'var(--text-2)', padding: '6px 0', borderBottom: '1px solid var(--border)', lineHeight: 1.5 },
  planBtn:      { width: '100%', padding: '12px', background: 'linear-gradient(135deg, var(--gold-l), var(--gold))', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' },
  note:         { fontSize: 12, color: 'var(--text-3)', textAlign: 'center' },
};
