import React, { useState, useRef, useEffect } from 'react';
import type {
  ChatMessage, FinancialProfile, MonthlyBreakdown, InvestmentSummary,
  Bill, Goal, Habit,
} from '../types';
import { formatCurrency, generateId } from '../utils/expenses';

interface AIChatProps {
  profile: FinancialProfile;
  breakdown: MonthlyBreakdown;
  investmentSummary: InvestmentSummary;
  userName?: string;
  // Extended cross-module context
  bills?: Bill[];
  billsMonthlyTotal?: number;
  goals?: Goal[];
  netWorthSummary?: { totalAssets: number; totalLiabilities: number; netWorth: number };
  habits?: Habit[];
  efCurrent?: number;
  efTarget?: number;
  onNavigateToAlerts?: () => void;
}

const QUICK_PROMPTS = [
  'How healthy is my spending this month?',
  'Where can I cut costs to save more?',
  'Am I on track with my goals?',
  'Analyse my net worth',
  'How fast can I build my emergency fund?',
  'Which bills should I pay first?',
  'Should I invest or clear debt first?',
  'Give me a monthly savings plan',
];

const buildSystemPrompt = (
  profile: FinancialProfile,
  breakdown: MonthlyBreakdown,
  summary: InvestmentSummary,
  bills: Bill[],
  billsMonthlyTotal: number,
  goals: Goal[],
  netWorthSummary: { totalAssets: number; totalLiabilities: number; netWorth: number },
  habits: Habit[],
  efCurrent: number,
  efTarget: number,
): string => {
  const spendPct = profile.monthlyIncome > 0
    ? Math.round((breakdown.totalExpenses / profile.monthlyIncome) * 100) : 0;
  const efPct = efTarget > 0 ? Math.min(100, Math.round((efCurrent / efTarget) * 100)) : 0;
  const billsDue = bills.filter((b) => b.status !== 'paid').reduce((s, b) => s + b.amount, 0);
  const overdueCount = bills.filter((b) => b.status === 'overdue').length;
  const habitsCompleted = habits.filter((h) => h.done).length;
  const activeGoals = goals.filter((g) => !g.completed);

  return `You are FinWise AI — an expert personal finance advisor exclusively for Kenyans. You have LIVE access to the user's complete financial data across ALL modules of FinWise. Give warm, specific, actionable advice. Always reference Kenyan financial instruments: SACCOs, M-Pesa, M-Shwari, KCB M-Pesa, Fuliza, NSE, T-Bills/Bonds via CBK, MMFs (Cytonn ~11%, NCBA ~10.5%, CIC ~10%, Zimele), HELB, NHIF, NSSF, KRA, Faulu, Equity, Co-op Bank, Family Bank.

Be concise and conversational (2–4 short paragraphs max). Use bullet points for lists. Always end with ONE bold specific action the user can take TODAY.

If the user appears to be in a financial crisis (can't pay bills, severe debt overload, extreme overspending), urgently acknowledge it and recommend they use the SOS Alert button in the Alerts & SOS tab to send their advisor a snapshot immediately.

━━━ LIVE FINANCIAL SNAPSHOT ━━━

INCOME & SPENDING:
• Monthly Income: ${formatCurrency(profile.monthlyIncome, profile.currency)}/month
• Total Spent: ${formatCurrency(breakdown.totalExpenses, profile.currency)} (${spendPct}% of income)
• Necessary Expenses: ${formatCurrency(breakdown.necessaryTotal, profile.currency)}
• Unnecessary Expenses: ${formatCurrency(breakdown.unnecessaryTotal, profile.currency)}
• Savings Left: ${formatCurrency(breakdown.savingsLeft, profile.currency)}

INVESTMENTS:
• Total Invested: ${formatCurrency(summary.totalInvested, profile.currency)}
• Active Investments: ${summary.activeCount}
• Projected Annual Return: ${formatCurrency(summary.projectedAnnualReturn, profile.currency)}

BILLS:
• Monthly Bills Total: ${formatCurrency(billsMonthlyTotal, profile.currency)}
• Bills Currently Due/Overdue: ${formatCurrency(billsDue, profile.currency)}
• Overdue Bills: ${overdueCount}
• All Bills: ${bills.map((b) => `${b.name} KSh${b.amount} [${b.status}]`).join(', ') || 'none added yet'}

NET WORTH:
• Total Assets: ${formatCurrency(netWorthSummary.totalAssets, profile.currency)}
• Total Liabilities: ${formatCurrency(netWorthSummary.totalLiabilities, profile.currency)}
• Net Worth: ${formatCurrency(netWorthSummary.netWorth, profile.currency)}

EMERGENCY FUND:
• Current: ${formatCurrency(efCurrent, profile.currency)} (${efPct}% of ${formatCurrency(efTarget, profile.currency)} target)
• Months Covered: ${profile.monthlyIncome > 0 ? (efCurrent / (breakdown.totalExpenses || 1)).toFixed(1) : '0'} months

GOALS (${activeGoals.length} active):
${activeGoals.length > 0 ? activeGoals.map((g) =>
  `• ${g.name}: ${Math.min(100, Math.round((g.savedAmount / g.targetAmount) * 100))}% (${formatCurrency(g.savedAmount, profile.currency)} / ${formatCurrency(g.targetAmount, profile.currency)})${g.deadline ? ` — deadline ${g.deadline}` : ''}`
).join('\n') : '• No active goals'}

DAILY HABITS: ${habitsCompleted}/${habits.length} habits completed today

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
};

export const AIChat: React.FC<AIChatProps> = ({
  profile, breakdown, investmentSummary, userName,
  bills = [], billsMonthlyTotal = 0, goals = [],
  netWorthSummary = { totalAssets: 0, totalLiabilities: 0, netWorth: 0 },
  habits = [], efCurrent = 0, efTarget = 0,
  onNavigateToAlerts,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Habari${userName ? `, ${userName}` : ''}! 👋 I'm your FinWise AI advisor — and I have live access to ALL your financial data: spending, investments, bills, goals, net worth, emergency fund, and habits.\n\nAsk me anything. What's on your mind?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setError(null);

    const userMsg: ChatMessage = {
      id: generateId(), role: 'user',
      content: text.trim(), timestamp: new Date().toISOString(),
    };
    const updatedMsgs = [...messages, userMsg];
    setMessages(updatedMsgs);
    setInput('');
    setLoading(true);

    try {
      const apiMessages = updatedMsgs
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      const finalMessages = apiMessages.length === 0
        ? [{ role: 'user' as const, content: text.trim() }]
        : apiMessages;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: buildSystemPrompt(
            profile, breakdown, investmentSummary,
            bills, billsMonthlyTotal, goals, netWorthSummary,
            habits, efCurrent, efTarget,
          ),
          messages: finalMessages,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as any)?.error?.message || `API error ${response.status}`);
      }

      const data = await response.json();
      const reply = data.content?.find((c: any) => c.type === 'text')?.text
        || 'Sorry, I could not generate a response.';

      setMessages((prev) => [...prev, {
        id: generateId(), role: 'assistant',
        content: reply, timestamp: new Date().toISOString(),
      }]);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });

  const renderContent = (text: string) =>
    text.split('\n').map((line, i) => {
      if (line.startsWith('- ') || line.startsWith('• '))
        return <div key={i} style={S.bullet}>• {line.replace(/^[•\-] /, '')}</div>;
      const boldLine = line.replace(/\*\*(.+?)\*\*/g, '');
      if (line.startsWith('**') && line.endsWith('**'))
        return <div key={i} style={S.boldLine}>{line.slice(2, -2)}</div>;
      if (line === '') return <div key={i} style={{ height: 6 }} />;
      return <div key={i}>{boldLine || line}</div>;
    });

  return (
    <div style={S.container} className="animate-in">

      {/* Header */}
      <div style={S.chatHeader}>
        <div style={S.aiAvatar}>Ƒ</div>
        <div>
          <div style={S.aiName}>FinWise AI Advisor</div>
          <div style={S.aiStatus}>
            <span style={S.statusDot} />Powered by Claude · Full context
          </div>
        </div>
        <div style={S.contextBadges}>
          <span style={S.badge}>💰 {formatCurrency(profile.monthlyIncome, profile.currency)}/mo</span>
          <span style={S.badge}>📊 {formatCurrency(breakdown.totalExpenses, profile.currency)} spent</span>
          <span style={S.badge}>📈 {formatCurrency(investmentSummary.totalInvested, profile.currency)} invested</span>
          <span style={S.badge}>⚖ {formatCurrency(netWorthSummary.netWorth, profile.currency)} NW</span>
        </div>
        {onNavigateToAlerts && (
          <button onClick={onNavigateToAlerts}
            style={{ padding: '7px 14px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 8, color: '#F87171', fontSize: 12, fontFamily: 'Karla, sans-serif', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            🚨 SOS
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={S.messagesPane}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ ...S.msgRow, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'assistant' && <div style={S.aiBubbleAvatar}>Ƒ</div>}
            <div style={{ ...S.bubble, ...(msg.role === 'user' ? S.userBubble : S.aiBubble) }}>
              <div style={S.bubbleContent}>{renderContent(msg.content)}</div>
              <div style={S.bubbleTime}>{formatTime(msg.timestamp)}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ ...S.msgRow, justifyContent: 'flex-start' }}>
            <div style={S.aiBubbleAvatar}>Ƒ</div>
            <div style={{ ...S.bubble, ...S.aiBubble }}>
              <div style={S.typingDots}>
                {[0, 0.2, 0.4].map((d, i) => (
                  <span key={i} style={{ ...S.dot, animationDelay: `${d}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {error && <div style={S.errorMsg}>⚠ {error}</div>}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 2 && (
        <div style={S.quickPromptsWrap}>
          <div style={S.quickLabel}>Quick questions</div>
          <div style={S.quickPrompts}>
            {QUICK_PROMPTS.map((p) => (
              <button key={p} className="fw-quick-btn" style={S.quickBtn} onClick={() => sendMessage(p)}>{p}</button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={S.inputArea}>
        <textarea
          ref={inputRef} className="fw-chat-textarea"
          style={S.textarea}
          placeholder="Ask me anything about your finances..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2} disabled={loading}
        />
        <button
          style={{ ...S.sendBtn, opacity: !input.trim() || loading ? 0.4 : 1 }}
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
        >
          {loading ? '···' : '→'}
        </button>
      </div>
      <div style={S.inputHint}>Enter to send · Shift+Enter for new line</div>

      <style>{`
        @keyframes blink { 0%,80%,100% { opacity: 0.2; } 40% { opacity: 1; } }
      `}</style>
    </div>
  );
};

const DOT_BASE: React.CSSProperties = {
  width: 7, height: 7, borderRadius: '50%', background: '#5A6B8A',
  display: 'inline-block', animationName: 'blink',
  animationDuration: '1.4s', animationTimingFunction: 'ease', animationIterationCount: 'infinite',
};

const S: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: 14, height: 'calc(100dvh - 160px)', minHeight: 480 },
  chatHeader: { background: '#132040', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  aiAvatar: { width: 42, height: 42, borderRadius: 11, background: 'linear-gradient(145deg, #C9A84C, #E8D08A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cormorant Garamond, serif', fontSize: 21, fontWeight: 800, color: '#0A1628', flexShrink: 0 },
  aiName: { fontFamily: 'Cormorant Garamond, serif', fontSize: 17, fontWeight: 600, color: '#E2C47A' },
  aiStatus: { fontSize: 11, color: '#5A6B8A', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: '50%', background: '#3DD68C', boxShadow: '0 0 6px rgba(61,214,140,0.6)', display: 'inline-block' },
  contextBadges: { display: 'flex', gap: 7, flexWrap: 'wrap', marginLeft: 'auto' },
  badge: { fontSize: 11, color: '#5A6B8A', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', padding: '3px 9px', borderRadius: 20 },
  messagesPane: { flex: 1, overflowY: 'auto', background: '#0D1A30', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 },
  msgRow: { display: 'flex', alignItems: 'flex-start', gap: 9 },
  aiBubbleAvatar: { width: 28, height: 28, borderRadius: 7, background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cormorant Garamond, serif', fontSize: 13, fontWeight: 700, color: '#C9A84C', flexShrink: 0, marginTop: 2 },
  bubble: { maxWidth: '76%', borderRadius: 13, padding: '11px 15px' },
  aiBubble: { background: '#132040', border: '1px solid rgba(255,255,255,0.06)', color: '#D0CFCA', fontSize: 14, lineHeight: 1.65, borderTopLeftRadius: 4 },
  userBubble: { background: 'linear-gradient(135deg, rgba(201,168,76,0.14), rgba(201,168,76,0.07))', border: '1px solid rgba(201,168,76,0.2)', color: '#F0EDE4', fontSize: 14, lineHeight: 1.65, borderTopRightRadius: 4 },
  bubbleContent: { display: 'flex', flexDirection: 'column', gap: 2 },
  bubbleTime: { fontSize: 10, color: '#3D5070', marginTop: 5, textAlign: 'right' },
  bullet: { paddingLeft: 4, marginTop: 2 },
  boldLine: { fontWeight: 600, color: '#F0EDE4', marginTop: 4 },
  typingDots: { display: 'flex', gap: 5, padding: '3px 0', alignItems: 'center' },
  dot: { ...DOT_BASE },
  errorMsg: { fontSize: 13, color: '#F87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', padding: '9px 13px', borderRadius: 8 },
  quickPromptsWrap: { background: '#132040', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '13px 16px' },
  quickLabel: { fontSize: 10, color: '#5A6B8A', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 9 },
  quickPrompts: { display: 'flex', flexWrap: 'wrap', gap: 7 },
  quickBtn: { padding: '6px 13px', background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 20, color: '#C9A84C', fontSize: 12, fontFamily: 'Karla, sans-serif', cursor: 'pointer' },
  inputArea: { display: 'flex', gap: 10, alignItems: 'flex-end' },
  textarea: { flex: 1, background: '#132040', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 11, padding: '12px 15px', color: '#F0EDE4', fontSize: 16, fontFamily: 'Karla, sans-serif', resize: 'none', lineHeight: 1.5, minHeight: 48 },
  sendBtn: { width: 48, height: 48, borderRadius: 11, background: 'linear-gradient(135deg, #C9A84C, #E2C47A)', color: '#0A1628', fontSize: 21, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: 'none', cursor: 'pointer', transition: '0.15s' },
  inputHint: { fontSize: 10, color: '#2A3B58', textAlign: 'center', marginTop: -6 },
};
