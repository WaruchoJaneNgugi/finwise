import React, { useState } from 'react';
import './styles/globals.css';
import type { AppView } from './types';
import { useExpenses } from './hooks/useExpenses';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ExpenseForm, ExpenseList } from './components/ExpenseManager';
import { Insights } from './components/Insights';
import { Advisor } from './components/Advisor';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>('advisor');
  const {
    monthlyExpenses,
    profile,
    breakdown,
    insight,
    warnings,
    addExpense,
    removeExpense,
    updateProfile,
  } = useExpenses();

  const handleUpdateIncome = (income: number) => {
    updateProfile(income, profile.currency);
  };

  return (
    <div style={appStyles.root}>
      <Header
        activeView={activeView}
        onNavigate={setActiveView}
        score={insight.score}
        scoreLevel={insight.level}
      />

      <main style={appStyles.main}>
        <div style={appStyles.content}>
          {activeView === 'dashboard' && (
            <Dashboard
              breakdown={breakdown}
              insight={insight}
              profile={profile}
              warnings={warnings}
              onUpdateIncome={handleUpdateIncome}
            />
          )}

          {activeView === 'expenses' && (
            <div className="animate-in">
              <ExpenseForm onAdd={addExpense} />
              <ExpenseList
                expenses={monthlyExpenses}
                onRemove={removeExpense}
                currency={profile.currency}
              />
            </div>
          )}

          {activeView === 'insights' && (
            <Insights breakdown={breakdown} profile={profile} />
          )}

          {activeView === 'advisor' && (
            <Advisor profile={profile} onUpdateIncome={handleUpdateIncome} />
          )}
        </div>
      </main>

      <footer style={appStyles.footer}>
        <span>FinWise © {new Date().getFullYear()}</span>
        <span style={appStyles.footerDot}>·</span>
        <span>Smart money management for every Kenyan</span>
        <span style={appStyles.footerDot}>·</span>
        <span style={{ color: '#C9A84C' }}>Your data stays on this device</span>
      </footer>
    </div>
  );
};

const appStyles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    flex: 1,
    padding: '32px 24px',
  },
  content: {
    // maxWidth: 1280,
    width:'100%',
    margin: '0 auto',
  },
  footer: {
    padding: '16px 24px',
    textAlign: 'center',
    fontSize: 12,
    color: '#2A3B58',
    borderTop: '1px solid rgba(255,255,255,0.04)',
    display: 'flex',
    justifyContent: 'center',
    gap: 10,
  },
  footerDot: { color: '#1A2E50' },
};

export default App;
