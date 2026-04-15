import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, CreditCard, Settings } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { AdminLogin } from './AdminLogin';
import { AdminOverview } from './views/AdminOverview';
import { AdminUsers } from './views/AdminUsers';
import { AdminSubscriptions } from './views/AdminSubscriptions';
import { AdminSettings } from './views/AdminSettings';

type AdminView = 'overview' | 'users' | 'subscriptions' | 'settings';

const NAV: { view: AdminView; label: string; icon: React.ReactNode; roles: string[] }[] = [
  { view: 'overview',      label: 'Overview',      icon: <LayoutDashboard size={20} />, roles: ['super_admin', 'support', 'finance'] },
  { view: 'users',         label: 'Users',         icon: <Users size={20} />,           roles: ['super_admin', 'support'] },
  { view: 'subscriptions', label: 'Subscriptions', icon: <CreditCard size={20} />,      roles: ['super_admin', 'finance'] },
  { view: 'settings',      label: 'Settings',      icon: <Settings size={20} />,        roles: ['super_admin'] },
];

export const AdminPanel: React.FC = () => {
  const { admin, logout, login, loading, error } = useAdminAuth();
  const [view, setView] = useState<AdminView>('overview');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  if (!admin) return <AdminLogin login={login} loading={loading} error={error} />;

  const allowedNav = NAV.filter(n => n.roles.includes(admin.role));

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: '100vh', background: 'var(--bg-page)', fontFamily: 'DM Sans, sans-serif' }}>

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside style={sidebar}>
          <div style={{ padding: '24px 20px 16px' }}>
            <div style={{ fontSize: 16, fontFamily: 'Cormorant Garamond, serif', fontWeight: 700, color: 'var(--gold)' }}>FinWise Admin</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{admin.role.replace('_', ' ')}</div>
          </div>
          <nav style={{ flex: 1, padding: '0 10px' }}>
            {allowedNav.map(n => (
              <button key={n.view} onClick={() => setView(n.view)} style={{
                ...navBtn,
                background: view === n.view ? 'var(--sidebar-active)' : 'transparent',
                color: view === n.view ? 'var(--gold)' : 'var(--text-2)',
                borderLeft: view === n.view ? '3px solid var(--gold)' : '3px solid transparent',
              }}>
                <span style={{ marginRight: 10, display: 'flex' }}>{n.icon}</span>{n.label}
              </button>
            ))}
          </nav>
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{admin.email}</div>
            <button onClick={logout} style={logoutBtn}>Sign Out</button>
          </div>
        </aside>
      )}

      {/* Main content */}
      <main style={{ flex: 1, padding: isMobile ? '20px 16px 80px' : '32px 28px', overflowY: 'auto' }}>
        {/* Mobile header */}
        {isMobile && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 15, fontFamily: 'Cormorant Garamond, serif', fontWeight: 700, color: 'var(--gold)' }}>FinWise Admin</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{admin.role.replace('_', ' ')}</div>
            </div>
            <button onClick={logout} style={{ ...logoutBtn, width: 'auto', padding: '6px 12px' }}>Sign Out</button>
          </div>
        )}

        {view === 'overview'      && <AdminOverview />}
        {view === 'users'         && <AdminUsers canEdit={admin.role === 'super_admin'} />}
        {view === 'subscriptions' && <AdminSubscriptions />}
        {view === 'settings'      && <AdminSettings />}
      </main>

      {/* Mobile Bottom Nav */}
      {isMobile && (
        <nav style={bottomNav}>
          {allowedNav.map(n => (
            <button key={n.view} onClick={() => setView(n.view)} style={{
              ...bottomTab,
              color: view === n.view ? 'var(--gold)' : 'var(--text-3)',
            }}>
              {n.icon}
              <span style={{ fontSize: 10, fontWeight: view === n.view ? 700 : 400 }}>{n.label}</span>
              {view === n.view && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 24, height: 2, background: 'var(--gold)', borderRadius: 2 }} />}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
};

const sidebar: React.CSSProperties = {
  width: 220, background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)',
  display: 'flex', flexDirection: 'column', flexShrink: 0,
};
const navBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', width: '100%', padding: '10px 12px',
  borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
  fontFamily: 'DM Sans, sans-serif', marginBottom: 2, textAlign: 'left',
};
const logoutBtn: React.CSSProperties = {
  width: '100%', padding: '8px', borderRadius: 7, border: '1px solid var(--border-s)',
  background: 'transparent', color: 'var(--text-3)', fontSize: 12, cursor: 'pointer',
};
const bottomNav: React.CSSProperties = {
  position: 'fixed', bottom: 0, left: 0, right: 0,
  background: 'var(--sidebar-bg)', borderTop: '1px solid var(--sidebar-border)',
  display: 'flex', height: 60, zIndex: 50,
};
const bottomTab: React.CSSProperties = {
  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
  justifyContent: 'center', gap: 2, border: 'none', background: 'transparent',
  cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', position: 'relative',
};
