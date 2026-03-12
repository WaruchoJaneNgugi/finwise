import React, { useState } from 'react';

interface AuthGateProps {
  hasProfile: boolean;
  onCreateProfile: (name: string, email: string, pin: string) => void;
  onUnlock: (pin: string) => boolean;
}

type AuthScreen = 'unlock' | 'create-1' | 'create-2';

export const AuthGate: React.FC<AuthGateProps> = ({ hasProfile, onCreateProfile, onUnlock }) => {
  const [screen, setScreen] = useState<AuthScreen>(hasProfile ? 'unlock' : 'create-1');

  // Create profile fields
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [pin, setPin]               = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError]     = useState('');

  // Unlock fields
  const [unlockPin, setUnlockPin]     = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [attempts, setAttempts]       = useState(0);

  const handleCreateStep1 = () => {
    if (!name.trim() || !email.trim()) return;
    setScreen('create-2');
  };

  const handleCreateFinish = () => {
    if (pin.length < 4) { setPinError('PIN must be at least 4 digits'); return; }
    if (pin !== confirmPin) { setPinError('PINs do not match'); return; }
    onCreateProfile(name.trim(), email.trim(), pin);
  };

  const handleUnlock = () => {
    if (!unlockPin.trim()) return;
    const ok = onUnlock(unlockPin);
    if (!ok) {
      setAttempts((a) => a + 1);
      setUnlockError(`Incorrect PIN${attempts >= 2 ? ' — check your profile PIN' : ''}`);
      setUnlockPin('');
    }
  };

  const handlePinInput = (setter: (v: string) => void, clear: () => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setter(val);
    clear();
  };

  return (
    <div style={S.overlay}>
      <style>{`
        @keyframes authFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .auth-card { animation: authFadeIn 0.4s ease forwards; }
      `}</style>

      <div style={S.bg} />

      <div style={S.card} className="auth-card">
        {/* Logo */}
        <div style={S.logoRow}>
          <div style={S.logoMark}><span style={S.logoSymbol}>Ƒ</span></div>
          <div>
            <div style={S.logoName}>FinWise</div>
            <div style={S.logoTagline}>YOUR MONEY, MASTERED</div>
          </div>
        </div>

        {/* UNLOCK */}
        {screen === 'unlock' && (
          <>
            <div style={S.title}>Welcome Back</div>
            <p style={S.subtitle}>Enter your PIN to unlock FinWise</p>
            <div style={S.pinWrap}>
              <input
                style={S.pinInput}
                type="password"
                inputMode="numeric"
                placeholder="••••••"
                value={unlockPin}
                onChange={handlePinInput(setUnlockPin, () => setUnlockError(''))}
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                autoFocus
                maxLength={6}
              />
            </div>
            {unlockError && <div style={S.errorMsg}>{unlockError}</div>}
            <button style={{ ...S.primaryBtn, opacity: !unlockPin.trim() ? 0.5 : 1 }} onClick={handleUnlock} disabled={!unlockPin.trim()}>
              Unlock →
            </button>
            <div style={S.forgotHint}>
              Your data is stored locally on this device. If you forget your PIN, you can{' '}
              <button style={S.linkBtn} onClick={() => { if (window.confirm('This will delete all your data. Continue?')) { localStorage.clear(); window.location.reload(); } }}>
                reset everything
              </button>.
            </div>
          </>
        )}

        {/* CREATE STEP 1 */}
        {screen === 'create-1' && (
          <>
            <div style={S.title}>Create Your Profile</div>
            <p style={S.subtitle}>Set up your private FinWise account — all data stays on this device</p>
            <div style={S.fields}>
              <div style={S.field}>
                <label style={S.label}>Your Name</label>
                <input style={S.input} placeholder="e.g. Amina" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div style={S.field}>
                <label style={S.label}>Email (for display only)</label>
                <input style={S.input} type="email" placeholder="amina@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <button style={{ ...S.primaryBtn, opacity: !name.trim() || !email.trim() ? 0.5 : 1 }}
              onClick={handleCreateStep1} disabled={!name.trim() || !email.trim()}>
              Continue →
            </button>
            <div style={S.privacyNote}>🔒 Your data never leaves this device</div>
          </>
        )}

        {/* CREATE STEP 2 - PIN */}
        {screen === 'create-2' && (
          <>
            <div style={S.title}>Set Your PIN</div>
            <p style={S.subtitle}>Choose a 4–6 digit PIN to protect your financial data</p>
            <div style={S.fields}>
              <div style={S.field}>
                <label style={S.label}>Create PIN (4–6 digits)</label>
                <input style={S.pinInput} type="password" inputMode="numeric" placeholder="••••" value={pin}
                  onChange={handlePinInput(setPin, () => setPinError(''))} maxLength={6} autoFocus />
              </div>
              <div style={S.field}>
                <label style={S.label}>Confirm PIN</label>
                <input style={S.pinInput} type="password" inputMode="numeric" placeholder="••••" value={confirmPin}
                  onChange={handlePinInput(setConfirmPin, () => setPinError(''))} maxLength={6}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateFinish()} />
              </div>
              {pinError && <div style={S.errorMsg}>{pinError}</div>}
            </div>
            <div style={S.btnRow}>
              <button style={S.backBtn} onClick={() => setScreen('create-1')}>← Back</button>
              <button style={{ ...S.primaryBtn, flex: 1, opacity: !pin || !confirmPin ? 0.5 : 1 }}
                onClick={handleCreateFinish} disabled={!pin || !confirmPin}>
                Create Account →
              </button>
            </div>
            <div style={S.pinHint}>Write your PIN down somewhere safe — it cannot be recovered.</div>
          </>
        )}
      </div>
    </div>
  );
};

const S: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  bg: { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(201,168,76,0.08) 0%, transparent 60%), #0A1628' },
  card: { position: 'relative', background: '#0F1F3D', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 420, boxShadow: '0 24px 60px rgba(0,0,0,0.6)' },
  logoRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 },
  logoMark: { width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(145deg, #C9A84C, #E8D08A)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoSymbol: { fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 800, color: '#0A1628' },
  logoName: { fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 700, color: '#E2C47A' },
  logoTagline: { fontSize: 9, color: '#3D5070', letterSpacing: '0.14em' },
  title: { fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 700, color: '#F0EDE4', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#9BAAC4', lineHeight: 1.6, marginBottom: 28 },
  fields: { display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 11, color: '#5A6B8A', textTransform: 'uppercase', letterSpacing: '0.07em' },
  input: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', color: '#F0EDE4', fontSize: 15, fontFamily: 'Karla, sans-serif' },
  pinWrap: { marginBottom: 16 },
  pinInput: { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 10, padding: '14px 16px', color: '#F0EDE4', fontSize: 24, fontFamily: 'Karla, sans-serif', letterSpacing: 8, textAlign: 'center' },
  errorMsg: { fontSize: 13, color: '#F87171', background: 'rgba(248,113,113,0.08)', padding: '10px 14px', borderRadius: 8, marginBottom: 12 },
  primaryBtn: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #C9A84C, #E2C47A)', color: '#0A1628', borderRadius: 12, fontWeight: 700, fontSize: 15, fontFamily: 'Karla, sans-serif', transition: '0.2s ease' },
  forgotHint: { fontSize: 12, color: '#3D5070', textAlign: 'center', marginTop: 20, lineHeight: 1.6 },
  linkBtn: { background: 'transparent', border: 'none', color: '#C9A84C', fontSize: 12, fontFamily: 'Karla, sans-serif', cursor: 'pointer', textDecoration: 'underline', padding: 0 },
  privacyNote: { fontSize: 12, color: '#3D5070', textAlign: 'center', marginTop: 16 },
  btnRow: { display: 'flex', gap: 10, marginBottom: 0 },
  backBtn: { padding: '14px 18px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#5A6B8A', fontSize: 14, fontFamily: 'Karla, sans-serif' },
  pinHint: { fontSize: 12, color: '#3D5070', textAlign: 'center', marginTop: 16 },
};
