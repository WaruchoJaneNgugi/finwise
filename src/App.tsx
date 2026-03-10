import React, { useState } from 'react';
import './styles/globals.css';
import type { AppView } from './types';
import { useExpenses } from './hooks/useExpenses';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ExpenseForm, ExpenseList } from './components/ExpenseManager';
import { Insights } from './components/Insights';
import { Advisor } from './components/Advisor';
import {
  InvestmentForm,
  InvestmentList,
  InvestmentSummaryBar,
  PortfolioAllocation
} from "./components/InvestmentManager.tsx";
import {useInvestments} from "./hooks/useInvestments.ts";

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>('advisor');

  const {
    monthlyExpenses, profile, breakdown, insight,
    warnings, addExpense, removeExpense, updateProfile,
  } = useExpenses();

  const {
    investments, summary, addInvestment,
    removeInvestment, updateStatus,
  } = useInvestments();

  const handleUpdateIncome = (income: number) => updateProfile(income, profile.currency);

  return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header
            activeView={activeView}
            onNavigate={setActiveView}
            score={insight.score}
            scoreLevel={insight.level}
        />

        <main className="main-content">
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>

            {activeView === 'advisor' && (
                <Advisor profile={profile} onUpdateIncome={handleUpdateIncome} />
            )}

            {activeView === 'dashboard' && (
                <Dashboard
                    breakdown={breakdown} insight={insight}
                    profile={profile} warnings={warnings}
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

            {activeView === 'investments' && (
                <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Summary stats */}
                  <InvestmentSummaryBar
                      summary={summary}
                      monthlyIncome={profile.monthlyIncome}
                  />

                  {/* Portfolio allocation chart (only when there are investments) */}
                  {summary.activeCount > 0 && (
                      <PortfolioAllocation summary={summary} />
                  )}

                  {/* Add form */}
                  <InvestmentForm onAdd={addInvestment} />

                  {/* List */}
                  <InvestmentList
                      investments={investments}
                      onRemove={removeInvestment}
                      onUpdateStatus={updateStatus}
                      currency={profile.currency}
                  />
                </div>
            )}

            {activeView === 'insights' && (
                <Insights breakdown={breakdown} profile={profile} />
            )}

          </div>
        </main>

        <footer className="app-footer">
          <span>FinWise © {new Date().getFullYear()}</span>
          <span className="footer-dot">·</span>
          <span>Smart money management for every Kenyan</span>
          <span className="footer-dot">·</span>
          <span style={{ color: '#C9A84C' }}>Your data stays on this device</span>
        </footer>
      </div>
  );
};

export default App;
