import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import type { UserProfile, SubscriptionTier } from '../../../types';

const TIERS: SubscriptionTier[] = ['free', 'silver', 'gold', 'platinum'];
const TIER_COLOR: Record<SubscriptionTier, string> = {
  free: '#9BAAC4', silver: '#C0C0C0', gold: '#C9A84C', platinum: '#A78BFA',
};

export const AdminOverview: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(collection(db, 'users')).then(snap => {
      setUsers(snap.docs.map(d => d.data() as UserProfile));
      setLoading(false);
    });
  }, []);

  const tierCounts = TIERS.map(t => ({ tier: t, count: users.filter(u => u.tier === t).length }));

  if (loading) return <div style={{ color: 'var(--text-3)', padding: 32 }}>Loading…</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h2 style={heading}>Overview</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
        <StatCard label="Total Users" value={users.length} />
        {tierCounts.map(({ tier, count }) => (
          <StatCard key={tier} label={tier.charAt(0).toUpperCase() + tier.slice(1)} value={count} color={TIER_COLOR[tier]} />
        ))}
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 14 }}>Tier Distribution</div>
        {tierCounts.map(({ tier, count }) => (
          <div key={tier} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
              <span style={{ color: TIER_COLOR[tier], fontWeight: 600 }}>{tier}</span>
              <span style={{ color: 'var(--text-2)' }}>{users.length ? Math.round((count / users.length) * 100) : 0}%</span>
            </div>
            <div style={{ height: 6, background: 'var(--bg-surface)', borderRadius: 4 }}>
              <div style={{ height: '100%', width: `${users.length ? (count / users.length) * 100 : 0}%`, background: TIER_COLOR[tier], borderRadius: 4, transition: 'width 0.4s' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; color?: string }> = ({ label, value, color }) => (
  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
    <div style={{ fontSize: 28, fontWeight: 700, color: color ?? 'var(--gold)', fontFamily: 'Cormorant Garamond, serif' }}>{value}</div>
    <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{label}</div>
  </div>
);

const heading: React.CSSProperties = { fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 700, color: 'var(--text-1)', margin: 0 };
