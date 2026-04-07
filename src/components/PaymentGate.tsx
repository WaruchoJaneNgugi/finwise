import React, { useState } from 'react';

interface PaymentGateProps {
  tierName: string;
  tierPrice: number;
  tierColor: string;
  onPaymentComplete: (phone: string) => void;
  onBack: () => void;
}

type PayMethod = 'mpesa' | 'visa' | null;
type MpesaStep = 'phone' | 'pin';

export const PaymentGate: React.FC<PaymentGateProps> = ({
  tierName, tierPrice, tierColor, onPaymentComplete, onBack,
}) => {
  const [method, setMethod] = useState<PayMethod>(null);
  const [mpesaStep, setMpesaStep] = useState<MpesaStep>('phone');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [pinErr, setPinErr] = useState('');

  const reset = () => { setMethod(null); setMpesaStep('phone'); setPin(''); setPinErr(''); };

  return (
    <div style={S.page}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .pg-in { animation: fadeUp 0.35s ease forwards; }
        .pg-btn { transition: transform 0.15s, box-shadow 0.15s; }
        .pg-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(217,119,6,0.3); }
        .pg-method:hover { border-color: rgba(217,119,6,0.5) !important; background: rgba(217,119,6,0.03) !important; }
        .pg-layout { display: flex; min-height: 100vh; }
        .pg-left {
          width: 360px; flex-shrink: 0;
          background: linear-gradient(160deg, #0A1628 0%, #1a2f50 100%);
          display: flex; align-items: center; justify-content: center; padding: 40px;
        }
        .pg-right {
          flex: 1; display: flex; flex-direction: column;
          justify-content: center; padding: 60px 64px; max-width: 560px;
        }
        @media (max-width: 700px) {
          .pg-layout { flex-direction: column; min-height: 100vh; }
          .pg-left {
            width: 100%; padding: 24px 20px;
            align-items: flex-start;
          }
          .pg-left-inner { flex-direction: row !important; align-items: center; gap: 16px !important; width: 100%; }
          .pg-plan-box { flex: 1; }
          .pg-trust-list { display: none !important; }
          .pg-right { padding: 24px 20px; max-width: 100%; }
        }
      `}</style>

      <div className="pg-layout">
        {/* Left panel */}
        <div className="pg-left">
          <div className="pg-left-inner" style={S.leftInner}>
            <div style={S.logoRow}>
              <div style={S.logoMark}><span style={S.logoSym}>Ƒ</span></div>
              <div>
                <div style={S.logoName}>FinWise</div>
                <div style={S.logoTag}>YOUR MONEY, MASTERED</div>
              </div>
            </div>
            <div className="pg-plan-box" style={S.planBox}>
              <div style={S.planBoxLabel}>YOU'RE SUBSCRIBING TO</div>
              <div style={{ ...S.planBoxName, color: tierColor }}>{tierName}</div>
              <div style={S.planBoxPrice}>
                KES <span style={S.planBoxAmt}>{tierPrice.toLocaleString()}</span>
                <span style={S.planBoxPer}>/month</span>
              </div>
            </div>
            <div className="pg-trust-list" style={S.trustList}>
              {['🔒 Secured by Safaricom Daraja', '📱 Instant activation', '↩ Cancel anytime', '🇰🇪 KES billing'].map(t => (
                <div key={t} style={S.trustItem}>{t}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="pg-right">
          <button style={S.back} onClick={method ? reset : onBack}>← Back</button>

          {!method && (
            <div className="pg-in">
              <div style={S.title}>Complete your subscription</div>
              <p style={S.sub}>Choose how you'd like to pay for your <strong style={{ color: tierColor }}>{tierName}</strong> plan</p>
              <div style={S.methods}>
                <button className="pg-method" style={S.methodBtn} onClick={() => setMethod('mpesa')}>
                  <div style={S.methodLeft}>
                    <span style={S.methodIcon}>📱</span>
                    <div>
                      <div style={S.methodName}>M-Pesa</div>
                      <div style={S.methodDesc}>Pay via Safaricom M-Pesa STK Push</div>
                    </div>
                  </div>
                  <span style={S.methodArrow}>→</span>
                </button>
                <button className="pg-method" style={S.methodBtn} onClick={() => setMethod('visa')}>
                  <div style={S.methodLeft}>
                    <span style={S.methodIcon}>💳</span>
                    <div>
                      <div style={S.methodName}>Visa / Mastercard</div>
                      <div style={S.methodDesc}>Pay with debit or credit card</div>
                    </div>
                  </div>
                  <span style={S.methodArrow}>→</span>
                </button>
              </div>
              <div style={S.secureNote}>🔐 All payments are encrypted and secure</div>
            </div>
          )}

          {method === 'mpesa' && mpesaStep === 'phone' && (
            <div className="pg-in">
              <div style={S.mpesaLogo}>📱</div>
              <div style={S.title}>M-Pesa Payment</div>
              <p style={S.sub}>Enter the M-Pesa number to charge <strong style={{ color: '#D97706' }}>KES {tierPrice.toLocaleString()}</strong></p>
              <div style={S.field}>
                <label style={S.label}>M-Pesa Phone Number</label>
                <input
                  style={S.input} type="tel" placeholder="e.g. 0712 345 678"
                  value={phone} autoFocus
                  onChange={e => setPhone(e.target.value.replace(/[^\d\s+]/g, ''))}
                  onKeyDown={e => e.key === 'Enter' && phone.trim().length >= 9 && setMpesaStep('pin')}
                />
              </div>
              <button className="pg-btn" style={{ ...S.btn, opacity: phone.trim().length >= 9 ? 1 : 0.5 }}
                disabled={phone.trim().length < 9} onClick={() => setMpesaStep('pin')}>
                Continue →
              </button>
            </div>
          )}

          {method === 'mpesa' && mpesaStep === 'pin' && (
            <div className="pg-in">
              <div style={S.mpesaLogo}>🔐</div>
              <div style={S.title}>Authorise Payment</div>
              <p style={S.sub}>Enter your M-Pesa PIN to authorise <strong style={{ color: '#D97706' }}>KES {tierPrice.toLocaleString()}</strong> from <strong>{phone}</strong></p>
              <div style={S.field}>
                <label style={S.label}>M-Pesa PIN</label>
                <input style={S.input} type="password" inputMode="numeric"
                  placeholder="••••••" maxLength={6} value={pin} autoFocus
                  onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setPinErr(''); }}
                  onKeyDown={e => e.key === 'Enter' && pin.length >= 4 && onPaymentComplete(phone.trim())}
                />
                {pinErr && <div style={S.err}>{pinErr}</div>}
              </div>
              <div style={S.pinNote}>Your PIN is never stored. Processed securely via Safaricom Daraja API.</div>
              <button className="pg-btn" style={{ ...S.btn, opacity: pin.length >= 4 ? 1 : 0.5 }}
                disabled={pin.length < 4}
                onClick={() => { if (pin.length < 4) { setPinErr('Enter your M-Pesa PIN'); return; } onPaymentComplete(phone.trim()); }}>
                Pay KES {tierPrice.toLocaleString()} & Activate
              </button>
            </div>
          )}

          {method === 'visa' && (
            <div className="pg-in">
              <div style={S.mpesaLogo}>💳</div>
              <div style={S.title}>Card Payment</div>
              <p style={S.sub}>Card payments are coming soon. Please use M-Pesa to complete your subscription.</p>
              <button style={S.outlineBtn} onClick={reset}>← Use M-Pesa instead</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const S: Record<string, React.CSSProperties> = {
  page:       { minHeight: '100vh', background: '#fff', fontFamily: 'DM Sans, sans-serif' },
  leftInner:  { display: 'flex', flexDirection: 'column', gap: 36, width: '100%' },
  logoRow:    { display: 'flex', alignItems: 'center', gap: 12 },
  logoMark:   { width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(145deg, #F59E0B, #D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  logoSym:    { fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontWeight: 800, color: '#fff' },
  logoName:   { fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 700, color: '#F59E0B' },
  logoTag:    { fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.14em' },
  planBox:    { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '16px 18px' },
  planBoxLabel:{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', marginBottom: 6 },
  planBoxName: { fontFamily: 'Cormorant Garamond, serif', fontSize: 26, fontWeight: 700, marginBottom: 4 },
  planBoxPrice:{ fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  planBoxAmt: { fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontWeight: 700, color: '#fff' },
  planBoxPer: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginLeft: 3 },
  trustList:  { display: 'flex', flexDirection: 'column', gap: 10 },
  trustItem:  { fontSize: 13, color: 'rgba(255,255,255,0.55)' },
  back:       { background: 'transparent', border: 'none', color: '#9CA3AF', fontSize: 13, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', padding: '0 0 24px', textAlign: 'left', width: 'fit-content' },
  title:      { fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 700, color: '#0A1628', marginBottom: 8 },
  sub:        { fontSize: 14, color: '#6B7280', lineHeight: 1.7, marginBottom: 28 },
  methods:    { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 },
  methodBtn:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', background: '#FAFAFA', border: '1.5px solid rgba(10,22,40,0.09)', borderRadius: 14, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: '0.15s', width: '100%' },
  methodLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  methodIcon: { fontSize: 26 },
  methodName: { fontSize: 15, fontWeight: 700, color: '#0A1628', textAlign: 'left' },
  methodDesc: { fontSize: 12, color: '#9CA3AF', marginTop: 2, textAlign: 'left' },
  methodArrow:{ fontSize: 18, color: '#D97706' },
  secureNote: { fontSize: 12, color: '#9CA3AF', textAlign: 'center' },
  mpesaLogo:  { fontSize: 40, marginBottom: 12 },
  field:      { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 },
  label:      { fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em' },
  input:      { background: '#F9FAFB', border: '1.5px solid rgba(10,22,40,0.1)', borderRadius: 10, padding: '13px 16px', color: '#0A1628', fontSize: 16, fontFamily: 'DM Sans, sans-serif', outline: 'none', width: '100%' },
  err:        { fontSize: 12, color: '#DC2626', marginTop: 4 },
  pinNote:    { fontSize: 12, color: '#9CA3AF', marginBottom: 20, lineHeight: 1.6 },
  btn:        { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' },
  outlineBtn: { padding: '12px 24px', background: '#fff', color: '#D97706', border: '2px solid rgba(217,119,6,0.3)', borderRadius: 10, fontWeight: 700, fontSize: 14, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' },
};
