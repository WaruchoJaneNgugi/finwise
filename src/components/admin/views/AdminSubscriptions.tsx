import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import type { UserProfile, SubscriptionTier } from '../../../types';

const TIER_PRICE: Record<SubscriptionTier, number> = { free: 0, silver: 299, gold: 599, platinum: 999 };
const TIER_COLOR: Record<SubscriptionTier, string> = { free: '#9BAAC4', silver: '#C0C0C0', gold: '#C9A84C', platinum: '#A78BFA' };

export const AdminSubscriptions: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(collection(db, 'users')).then(snap => {
      setUsers(snap.docs.map(d => d.data() as UserProfile));
      setLoading(false);
    });
  }, []);

  const tiers = (['free', 'silver', 'gold', 'platinum'] as SubscriptionTier[]);
  const mrr = users.reduce((sum, u) => sum + TIER_PRICE[u.tier], 0);

  if (loading) return <div style={{ color: 'var(--text-3)', padding: 32 }}>Loading…</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h2 style={heading}>Subscriptions</h2>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-acc)', borderRadius: 12, padding: '20px 24px' }}>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>Monthly Recurring Revenue (est.)</div>
        <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--gold)', fontFamily: 'Cormorant Garamond, serif' }}>
          KES {mrr.toLocaleString()}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        {tiers.map(tier => {
          const count = users.filter(u => u.tier === tier).length;
          return (
            <div key={tier} style={{ background: 'var(--bg-card)', border: `1px solid var(--border)`, borderRadius: 12, padding: '16px 20px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: TIER_COLOR[tier], marginBottom: 8, textTransform: 'capitalize' }}>{tier}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-1)', fontFamily: 'Cormorant Garamond, serif' }}>{count}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
                {TIER_PRICE[tier] === 0 ? 'Free' : `KES ${TIER_PRICE[tier]}/mo`} · KES {(count * TIER_PRICE[tier]).toLocaleString()} MRR
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const heading: React.CSSProperties = { fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 700, color: 'var(--text-1)', margin: 0 };
