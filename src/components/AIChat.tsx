import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, FinancialProfile, MonthlyBreakdown, InvestmentSummary } from '../types';
import { formatCurrency, generateId } from '../utils/expenses';

interface AIChatProps {
  profile: FinancialProfile;
  breakdown: MonthlyBreakdown;
  investmentSummary: InvestmentSummary;
  userName?: string;
}

const QUICK_PROMPTS = [
  'How healthy is my spending this month?',
  'Where can I cut costs to save more?',
  'What investments should I start with?',
  'How do I build an emergency fund?',
  'Explain Money Market Funds to me',
  'How much should I save for retirement?',
];

const buildSystemPrompt = (
  profile: FinancialProfile,
  breakdown: MonthlyBreakdown,
  summary: InvestmentSummary,
): string => `You are FinWise AI, a friendly and expert personal finance advisor for Kenyans. You give practical, specific advice tailored to the Kenyan financial context — referencing SACCOs, M-Pesa, NSE, T-Bills, Cytonn MMF, CIC, etc. Be concise, warm, and actionable.

USER'S CURRENT FINANCIAL DATA:
- Monthly Income: ${formatCurrency(profile.monthlyIncome, profile.currency)}
- Total Spent This Month: ${formatCurrency(breakdown.totalExpenses, profile.currency)}
- Necessary Expenses: ${formatCurrency(breakdown.necessaryTotal, profile.currency)}
- Unnecessary Expenses: ${formatCurrency(breakdown.unnecessaryTotal, profile.currency)}
- Savings Left: ${formatCurrency(breakdown.savingsLeft, profile.currency)}
- Spending Ratio: ${profile.monthlyIncome > 0 ? Math.round((breakdown.totalExpenses / profile.monthlyIncome) * 100) : 0}% of income
- Total Invested: ${formatCurrency(summary.totalInvested, profile.currency)}
- Projected Annual Return: ${formatCurrency(summary.projectedAnnualReturn, profile.currency)}

Keep responses clear and to the point (2–4 short paragraphs max). Use bullet points where helpful. Always end with one specific actionable tip the user can do today.`;

export const AIChat: React.FC<AIChatProps> = ({ profile, breakdown, investmentSummary, userName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Habari${userName ? `, ${userName}` : ''}! 👋 I'm your FinWise AI advisor. I can see your financial data and give you personalised advice.\n\nAsk me anything — from cutting expenses to picking the right investment, I'm here to help. What's on your mind?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setError(null);

    const userMsg: ChatMessage = { id: generateId(), role: 'user', content: text.trim(), timestamp: new Date().toISOString() };
    const updatedMsgs = [...messages, userMsg];
    setMessages(updatedMsgs);
    setInput('');
    setLoading(true);

    try {
      const apiMessages = updatedMsgs
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      // If only the user message (no prior chat), add it
      const finalMessages = apiMessages.length === 0
        ? [{ role: 'user' as const, content: text.trim() }]
        : apiMessages;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: buildSystemPrompt(profile, breakdown, investmentSummary),
          messages: finalMessages,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || `API error ${response.status}`);
      }

      const data = await response.json();
      const reply = data.content?.find((c: any) => c.type === 'text')?.text || 'Sorry, I could not generate a response.';

      setMessages((prev) => [...prev, {
        id: generateId(), role: 'assistant', content: reply, timestamp: new Date().toISOString(),
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

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });

  const renderContent = (text: string) => {
    // Very simple markdown: bold, bullet points, line breaks
    return text.split('\n').map((line, i) => {
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return <div key={i} style={S.bullet}>• {line.replace(/^[•-] /, '')}</div>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <div key={i} style={S.boldLine}>{line.slice(2, -2)}</div>;
      }
      if (line === '') return <div key={i} style={{ height: 6 }} />;
      return <div key={i}>{line}</div>;
    });
  };

  return (
    <div style={S.container} className="animate-in">

      {/* Header */}
      <div style={S.chatHeader}>
        <div style={S.aiAvatar}>Ƒ</div>
        <div>
          <div style={S.aiName}>FinWise AI Advisor</div>
          <div style={S.aiStatus}><span style={S.statusDot} />Powered by Claude · Context-aware</div>
        </div>
        <div style={S.contextBadges}>
          <span style={S.badge}>💰 {formatCurrency(profile.monthlyIncome, profile.currency)}/mo</span>
          <span style={S.badge}>📊 {formatCurrency(breakdown.totalExpenses, profile.currency)} spent</span>
          <span style={S.badge}>📈 {formatCurrency(investmentSummary.totalInvested, profile.currency)} invested</span>
        </div>
      </div>

      {/* Messages */}
      <div style={S.messagesPane}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ ...S.msgRow, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'assistant' && <div style={S.aiBubbleAvatar}>Ƒ</div>}
            <div style={{
              ...S.bubble,
              ...(msg.role === 'user' ? S.userBubble : S.aiBubble),
            }}>
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
                <span style={{ ...S.dot1 }} /><span style={{ ...S.dot2 }} /><span style={{ ...S.dot3 }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={S.errorMsg}>⚠ {error}</div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 2 && (
        <div style={S.quickPromptsWrap}>
          <div style={S.quickLabel}>Quick questions</div>
          <div style={S.quickPrompts}>
            {QUICK_PROMPTS.map((p) => (
              <button key={p} style={S.quickBtn} onClick={() => sendMessage(p)}>{p}</button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={S.inputArea}>
        <textarea
          ref={inputRef}
          style={S.textarea}
          placeholder="Ask me anything about your finances..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          disabled={loading}
        />
        <button
          style={{ ...S.sendBtn, opacity: !input.trim() || loading ? 0.4 : 1 }}
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
        >
          {loading ? '...' : '→'}
        </button>
      </div>
      <div style={S.inputHint}>Press Enter to send · Shift+Enter for new line</div>

      <style>{`
        @keyframes blink { 0%,80%,100% { opacity: 0.2; } 40% { opacity: 1; } }
        .fw-dot1 { animation: blink 1.4s ease infinite; }
        .fw-dot2 { animation: blink 1.4s ease 0.2s infinite; }
        .fw-dot3 { animation: blink 1.4s ease 0.4s infinite; }
      `}</style>
    </div>
  );
};

const DOT_STYLE: React.CSSProperties = {
  width: 7, height: 7, borderRadius: '50%', background: '#5A6B8A', display: 'inline-block',
};

const S: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: 16, height: 'calc(100vh - 180px)', minHeight: 500 },
  chatHeader: { background: '#132040', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' },
  aiAvatar: { width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(145deg, #C9A84C, #E8D08A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 800, color: '#0A1628', flexShrink: 0 },
  aiName: { fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 600, color: '#E2C47A' },
  aiStatus: { fontSize: 12, color: '#5A6B8A', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: '50%', background: '#3DD68C', boxShadow: '0 0 6px rgba(61,214,140,0.6)', display: 'inline-block' },
  contextBadges: { display: 'flex', gap: 8, flexWrap: 'wrap', marginLeft: 'auto' },
  badge: { fontSize: 11, color: '#5A6B8A', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: 20 },
  messagesPane: { flex: 1, overflowY: 'auto', background: '#0D1A30', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '20px', display: 'flex', flexDirection: 'column', gap: 16, scrollBehavior: 'smooth' },
  msgRow: { display: 'flex', alignItems: 'flex-start', gap: 10 },
  aiBubbleAvatar: { width: 30, height: 30, borderRadius: 8, background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cormorant Garamond, serif', fontSize: 14, fontWeight: 700, color: '#C9A84C', flexShrink: 0, marginTop: 2 },
  bubble: { maxWidth: '75%', borderRadius: 14, padding: '12px 16px' },
  aiBubble: { background: '#132040', border: '1px solid rgba(255,255,255,0.06)', color: '#D0CFCA', fontSize: 14, lineHeight: 1.65, borderTopLeftRadius: 4 },
  userBubble: { background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.08))', border: '1px solid rgba(201,168,76,0.2)', color: '#F0EDE4', fontSize: 14, lineHeight: 1.65, borderTopRightRadius: 4 },
  bubbleContent: { display: 'flex', flexDirection: 'column', gap: 2 },
  bubbleTime: { fontSize: 10, color: '#3D5070', marginTop: 6, textAlign: 'right' },
  bullet: { paddingLeft: 4, marginTop: 2 },
  boldLine: { fontWeight: 600, color: '#F0EDE4', marginTop: 4 },
  typingDots: { display: 'flex', gap: 5, padding: '4px 0', alignItems: 'center' },
  dot1: { ...DOT_STYLE, animationName: 'blink', animationDuration: '1.4s', animationTimingFunction: 'ease', animationIterationCount: 'infinite' },
  dot2: { ...DOT_STYLE, animationName: 'blink', animationDuration: '1.4s', animationDelay: '0.2s', animationTimingFunction: 'ease', animationIterationCount: 'infinite' },
  dot3: { ...DOT_STYLE, animationName: 'blink', animationDuration: '1.4s', animationDelay: '0.4s', animationTimingFunction: 'ease', animationIterationCount: 'infinite' },
  errorMsg: { fontSize: 13, color: '#F87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', padding: '10px 14px', borderRadius: 8 },
  quickPromptsWrap: { background: '#132040', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 16px' },
  quickLabel: { fontSize: 11, color: '#5A6B8A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 },
  quickPrompts: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  quickBtn: { padding: '7px 14px', background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 20, color: '#C9A84C', fontSize: 12, fontFamily: 'Karla, sans-serif', cursor: 'pointer', transition: '0.15s ease' },
  inputArea: { display: 'flex', gap: 10, alignItems: 'flex-end' },
  textarea: { flex: 1, background: '#132040', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 12, padding: '12px 16px', color: '#F0EDE4', fontSize: 14, fontFamily: 'Karla, sans-serif', resize: 'none', lineHeight: 1.5 },
  sendBtn: { width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #C9A84C, #E2C47A)', color: '#0A1628', fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: '0.2s ease' },
  inputHint: { fontSize: 11, color: '#2A3B58', textAlign: 'center', marginTop: -8 },
};
