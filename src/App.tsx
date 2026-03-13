import React, { useState } from 'react';
import './styles/globals.css';
import type { AppView } from './types';
import { useExpenses }      from './hooks/useExpenses';
import { useInvestments }   from './hooks/useInvestments';
import { useGoals }         from './hooks/useGoals';
import { useBills }         from './hooks/useBills';
import { useNetWorth }      from './hooks/useNetWorth';
import { useAuth }          from './hooks/useAuth';
import { useHabits }        from './hooks/useHabits';
import { useEmergencyFund } from './hooks/useEmergencyFund';
import { useAlerts }        from './hooks/useAlerts';

import { Header }           from './components/Header';
import { Dashboard }        from './components/Dashboard';
import { ExpenseForm, ExpenseList } from './components/ExpenseManager';
import { Insights }         from './components/Insights';
import { Advisor }          from './components/Advisor';
import {
  InvestmentForm, InvestmentList,
  InvestmentSummaryBar, PortfolioAllocation,
} from './components/InvestmentManager';
import { AuthGate }         from './components/AuthGate';
import { Goals }            from './components/Goals';
import { Bills }            from './components/Bills';
import { NetWorth }         from './components/NetWorth';
import { AIChat }           from './components/AIChat';
import { EmergencyFund }    from './components/EmergencyFund';
import { AlertsPanel }      from './components/AlertsPanel';
// import { HabitsTracker }    from './components/HabitsTracker';

import {
  exportExpensesToCSV,
  exportInvestmentsToCSV,
  exportNetWorthToCSV,
} from './hooks/exportUtils';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>('advisor');

  const auth = useAuth();

  const {
    monthlyExpenses, profile, breakdown, insight,
    warnings, addExpense, removeExpense, updateProfile,
  } = useExpenses();

  const {
    investments, summary: investmentSummary,
    addInvestment, removeInvestment, updateStatus,
  } = useInvestments();

  const goals   = useGoals();
  const bills   = useBills();
  const netWorth = useNetWorth();
  const habits  = useHabits();

  // Emergency fund uses monthly expenses as baseline for target calculation
  const emergencyFund = useEmergencyFund(breakdown.totalExpenses || profile.monthlyIncome * 0.6);

  const alerts = useAlerts();

  const handleUpdateIncome = (income: number) => updateProfile(income, profile.currency);

  // Show auth gate if not unlocked
  if (!auth.isUnlocked) {
    return (
      <AuthGate
        hasProfile={!!auth.profile}
        onCreateProfile={auth.createProfile}
        onUnlock={auth.unlock}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        activeView={activeView}
        onNavigate={setActiveView}
        score={insight.score}
        scoreLevel={insight.level}
        userName={auth.profile?.name}
        onLock={auth.lock}
        onExportExpenses={() => exportExpensesToCSV(monthlyExpenses)}
        onExportInvestments={() => exportInvestmentsToCSV(investments)}
        onExportNetWorth={() => exportNetWorthToCSV(netWorth.items)}
      />

      <main className="main-content">
        <div style={{  margin: '0 auto' }}>

          {/* ── Advisor ─────────────────────────────────────────── */}
          {activeView === 'advisor' && (
            <Advisor profile={profile} onUpdateIncome={handleUpdateIncome} />
          )}

          {/* ── Dashboard ───────────────────────────────────────── */}
          {activeView === 'dashboard' && (
            <Dashboard
              breakdown={breakdown}
              insight={insight}
              profile={profile}
              warnings={warnings}
              onUpdateIncome={handleUpdateIncome}
              bills={bills.bills}
              billsMonthlyTotal={bills.monthlyTotal}
              goals={goals.goals}
              netWorthSummary={netWorth.summary}
              habits={habits.habits}
              habitsCompletedCount={habits.completedCount}
              habitsCompletionPct={habits.completionPct}
              efCurrent={emergencyFund.data.currentAmount}
              efTarget={emergencyFund.targetAmount}
              efProgressPct={emergencyFund.progressPct}
              onToggleHabit={habits.toggleHabit}
              onAddHabit={habits.addHabit}
              onRemoveHabit={habits.removeHabit}
              onNavigate={setActiveView}
            />
          )}

          {/* ── Expenses ────────────────────────────────────────── */}
          {activeView === 'expenses' && (
            <div className="animate-in">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <button style={exportBtnStyle} onClick={() => exportExpensesToCSV(monthlyExpenses)}>
                  ↓ Export CSV
                </button>
              </div>
              <ExpenseForm onAdd={addExpense} />
              <ExpenseList expenses={monthlyExpenses} onRemove={removeExpense} currency={profile.currency} />
            </div>
          )}

          {/* ── Investments ─────────────────────────────────────── */}
          {activeView === 'investments' && (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button style={exportBtnStyle} onClick={() => exportInvestmentsToCSV(investments)}>
                  ↓ Export CSV
                </button>
              </div>
              <InvestmentSummaryBar summary={investmentSummary} monthlyIncome={profile.monthlyIncome} />
              {investmentSummary.activeCount > 0 && <PortfolioAllocation summary={investmentSummary} />}
              <InvestmentForm onAdd={addInvestment} />
              <InvestmentList
                investments={investments}
                onRemove={removeInvestment}
                onUpdateStatus={updateStatus}
                currency={profile.currency}
              />
            </div>
          )}

          {/* ── Goals ───────────────────────────────────────────── */}
          {activeView === 'goals' && (
            <Goals
              goals={goals.goals}
              activeGoals={goals.activeGoals}
              completedGoals={goals.completedGoals}
              totalTargeted={goals.totalTargeted}
              totalSaved={goals.totalSaved}
              onAdd={goals.addGoal}
              onRemove={goals.removeGoal}
              onContribute={goals.contribute}
              onUpdateSaved={goals.updateSaved}
              currency={profile.currency}
            />
          )}

          {/* ── Bills ───────────────────────────────────────────── */}
          {activeView === 'bills' && (
            <Bills
              bills={bills.bills}
              sortedBills={bills.sortedBills}
              monthlyTotal={bills.monthlyTotal}
              upcomingThisWeek={bills.upcomingThisWeek}
              overdueCount={bills.overdueCount}
              paidCount={bills.paidCount}
              onAdd={bills.addBill}
              onRemove={bills.removeBill}
              onMarkPaid={bills.markPaid}
              onMarkUnpaid={bills.markUnpaid}
              currency={profile.currency}
            />
          )}

          {/* ── Net Worth ───────────────────────────────────────── */}
          {activeView === 'networth' && (
            <div className="animate-in">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <button style={exportBtnStyle} onClick={() => exportNetWorthToCSV(netWorth.items)}>
                  ↓ Export CSV
                </button>
              </div>
              <NetWorth
                items={netWorth.items}
                summary={netWorth.summary}
                onAdd={netWorth.addItem}
                onRemove={netWorth.removeItem}
                onUpdateAmount={netWorth.updateAmount}
                currency={profile.currency}
              />
            </div>
          )}

          {/* ── Emergency Fund ──────────────────────────────────── */}
          {activeView === 'emergency' && (
            <EmergencyFund
              data={emergencyFund.data}
              targetAmount={emergencyFund.targetAmount}
              progressPct={emergencyFund.progressPct}
              monthsCovered={emergencyFund.monthsCovered}
              monthlyExpenses={breakdown.totalExpenses || profile.monthlyIncome * 0.6}
              monthlyIncome={profile.monthlyIncome}
              currency={profile.currency}
              onDeposit={emergencyFund.deposit}
              onWithdraw={emergencyFund.withdraw}
              onSetTargetMonths={emergencyFund.setTargetMonths}
              onSetCurrentAmount={emergencyFund.setCurrentAmount}
            />
          )}

          {/* ── Insights ────────────────────────────────────────── */}
          {activeView === 'insights' && (
            <Insights breakdown={breakdown} profile={profile} />
          )}

          {/* ── AI Chat ─────────────────────────────────────────── */}
          {activeView === 'chat' && (
            <AIChat
              profile={profile}
              breakdown={breakdown}
              investmentSummary={investmentSummary}
              userName={auth.profile?.name}
              bills={bills.bills}
              billsMonthlyTotal={bills.monthlyTotal}
              goals={goals.goals}
              netWorthSummary={netWorth.summary}
              habits={habits.habits}
              efCurrent={emergencyFund.data.currentAmount}
              efTarget={emergencyFund.targetAmount}
              onNavigateToAlerts={() => setActiveView('alerts')}
            />
          )}

          {/* ── Alerts & SOS ────────────────────────────────────── */}
          {activeView === 'alerts' && (
            <AlertsPanel
              contact={alerts.contact}
              log={alerts.log}
              hasContact={alerts.hasContact}
              profile={profile}
              breakdown={breakdown}
              investmentSummary={investmentSummary}
              bills={bills.bills}
              billsMonthlyTotal={bills.monthlyTotal}
              goals={goals.goals}
              netWorthSummary={netWorth.summary}
              efCurrent={emergencyFund.data.currentAmount}
              efTarget={emergencyFund.targetAmount}
              userName={auth.profile?.name}
              onSaveContact={alerts.saveContact}
              onRecordAlert={alerts.recordAlert}
              onClearLog={alerts.clearLog}
              onNavigateToAdvisor={() => setActiveView('chat')}
            />
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

const exportBtnStyle: React.CSSProperties = {
  padding: '8px 16px',
  background: 'rgba(201,168,76,0.1)',
  border: '1px solid rgba(201,168,76,0.25)',
  borderRadius: 8,
  color: '#C9A84C',
  fontSize: 13,
  fontFamily: 'Karla, sans-serif',
  fontWeight: 600,
  cursor: 'pointer',
};

export default App;
