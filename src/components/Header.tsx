import React, { useState, useEffect, useRef } from 'react';
import type { AppView } from '../types';

interface HeaderProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  score: number;
  scoreLevel: string;
  userName?: string;
  onLock?: () => void;
  onExportExpenses?: () => void;
  onExportInvestments?: () => void;
  onExportNetWorth?: () => void;
}

const ALL_NAV: { id: AppView; label: string; icon: string }[] = [
  { id: 'advisor',     label: 'Advisor',    icon: '◆' },
  { id: 'dashboard',   label: 'Overview',   icon: '▦' },
  { id: 'expenses',    label: 'Expenses',   icon: '◎' },
  { id: 'investments', label: 'Invest',     icon: '◈' },
  { id: 'goals',       label: 'Goals',      icon: '◉' },
  { id: 'bills',       label: 'Bills',      icon: '◫' },
  { id: 'networth',    label: 'Net Worth',  icon: '◐' },
  { id: 'emergency',   label: 'Emergency',  icon: '🛡' },
  { id: 'insights',    label: 'Insights',   icon: '◑' },
  { id: 'chat',        label: 'AI Chat',    icon: '✦' },
  { id: 'alerts',      label: 'Alerts',     icon: '📡' },
];

// 4 always-visible tabs on mobile bottom bar
const PRIMARY_NAV = ALL_NAV.slice(0, 4);
// Remaining go into the "More" slide-up drawer
const MORE_NAV = ALL_NAV.slice(4);

const LEVEL_COLORS: Record<string, string> = {
  excellent: '#3DD68C', good: '#60A5FA', fair: '#FBBF24', poor: '#FB923C', critical: '#F87171',
};

export const Header: React.FC<HeaderProps> = ({
                                                activeView, onNavigate, score, scoreLevel,
                                                userName, onLock, onExportExpenses, onExportInvestments, onExportNetWorth,
                                              }) => {
  const scoreColor = LEVEL_COLORS[scoreLevel] || '#9BAAC4';
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const moreIsActive = MORE_NAV.some((n) => n.id === activeView);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const handleDrawerNav = (id: AppView) => {
    onNavigate(id);
    setDrawerOpen(false);
  };

  return (
      <>
        <style>{`
        /* ─── TOP HEADER ────────────────────────────────────── */
        .fw-header { position: sticky; top: 0; z-index: 200; transition: box-shadow 0.3s; }
        .fw-header.scrolled { box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
        .fw-header-bg {
          position: absolute; inset: 0;
          background: rgba(8,17,32,0.93);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border-bottom: 1px solid rgba(201,168,76,0.12);
          z-index: 0;
        }
        .fw-header-inner {
          position: relative; z-index: 1; max-width: 1300px;
          margin: 0 auto; padding: 0 24px; height: 66px;
          display: flex; align-items: center;
        }

        /* ─── LOGO ──────────────────────────────────────────── */
        .fw-logo { display: flex; align-items: center; gap: 11px; text-decoration: none; flex-shrink: 0; margin-right: 24px; }
        .fw-logo-mark {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(145deg, #C9A84C 0%, #E8D08A 50%, #B8922E 100%);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 12px rgba(201,168,76,0.35), inset 0 1px 0 rgba(255,255,255,0.3);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .fw-logo:hover .fw-logo-mark { transform: translateY(-1px) rotate(-3deg); box-shadow: 0 6px 20px rgba(201,168,76,0.45), inset 0 1px 0 rgba(255,255,255,0.3); }
        .fw-logo-symbol { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 800; color: #0A1628; line-height: 1; }
        .fw-logo-text { display: flex; flex-direction: column; gap: 1px; }
        .fw-logo-name { font-family: 'Cormorant Garamond', serif; font-size: 19px; font-weight: 700; color: #E2C47A; line-height: 1; }
        .fw-logo-tagline { font-family: 'Karla', sans-serif; font-size: 9.5px; font-weight: 500; color: #3D5070; letter-spacing: 0.14em; text-transform: uppercase; }

        /* ─── DESKTOP NAV ───────────────────────────────────── */
        .fw-nav-wrap { flex: 1; position: relative; overflow: hidden; min-width: 0; }
        /* Fade edges to hint overflow */
        .fw-nav-wrap::before, .fw-nav-wrap::after {
          content: ''; position: absolute; top: 0; bottom: 0; width: 28px; z-index: 2; pointer-events: none;
        }
        .fw-nav-wrap::before { left: 0; background: linear-gradient(to right, rgba(8,17,32,0.85), transparent); }
        .fw-nav-wrap::after  { right: 0; background: linear-gradient(to left, rgba(8,17,32,0.85), transparent); }
        .fw-nav { display: flex; align-items: center; gap: 1px; overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none; padding: 0 6px; }
        .fw-nav::-webkit-scrollbar { display: none; }
        .fw-nav-btn {
          position: relative; display: flex; align-items: center; gap: 6px;
          padding: 6px 13px; border-radius: 9px; border: 1px solid transparent;
          background: transparent; color: #4A5E7A;
          font-family: 'Karla', sans-serif; font-size: 13px; font-weight: 500;
          cursor: pointer; white-space: nowrap; outline: none;
          transition: color 0.18s, background 0.18s, border-color 0.18s;
          flex-shrink: 0;
        }
        .fw-nav-btn:hover { color: #C9A84C; background: rgba(201,168,76,0.07); }
        .fw-nav-btn.active { color: #E2C47A; background: rgba(201,168,76,0.1); border-color: rgba(201,168,76,0.22); }
        .fw-nav-btn.active .fw-nav-pip { opacity: 1; transform: translateX(-50%) scaleX(1); }
        .fw-nav-icon { font-size: 14px; opacity: 0.6; transition: opacity 0.18s; }
        .fw-nav-btn.active .fw-nav-icon, .fw-nav-btn:hover .fw-nav-icon { opacity: 1; }
        .fw-nav-pip {
          position: absolute; bottom: -1px; left: 50%;
          transform: translateX(-50%) scaleX(0); width: 18px; height: 2px; border-radius: 2px;
          background: linear-gradient(90deg, #C9A84C, #E2C47A);
          opacity: 0; transition: opacity 0.2s, transform 0.2s;
        }
        .fw-ai-badge {
          display: inline-flex; align-items: center; justify-content: center;
          width: 15px; height: 15px; border-radius: 4px;
          background: linear-gradient(135deg, #C9A84C, #E2C47A);
          color: #0A1628; font-size: 7px; font-weight: 800; margin-left: 2px;
        }

        /* ─── DIVIDER ───────────────────────────────────────── */
        .fw-divider { width: 1px; height: 28px; background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.08), transparent); margin: 0 16px; flex-shrink: 0; }

        /* ─── DESKTOP SCORE CHIP ────────────────────────────── */
        .fw-score-chip { display: flex; align-items: center; gap: 9px; padding: 6px 14px 6px 8px; border-radius: 50px; border: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.03); flex-shrink: 0; }
        .fw-score-ring { position: relative; width: 30px; height: 30px; flex-shrink: 0; }
        .fw-score-ring svg { transform: rotate(-90deg); }
        .fw-score-ring-track { fill: none; stroke: rgba(255,255,255,0.06); stroke-width: 2.5; }
        .fw-score-ring-fill { fill: none; stroke-width: 2.5; stroke-linecap: round; transition: stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1); }
        .fw-score-ring-val { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: 'Karla', sans-serif; font-size: 9px; font-weight: 700; }
        .fw-score-num { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 700; line-height: 1; }
        .fw-score-lbl { font-family: 'Karla', sans-serif; font-size: 9px; font-weight: 500; color: #3D5070; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 1px; }
        .fw-score-level { font-size: 10px; font-weight: 700; font-family: 'Karla', sans-serif; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 8px; border-radius: 20px; }

        /* ─── DESKTOP USER MENU ─────────────────────────────── */
        .fw-user-wrap { position: relative; flex-shrink: 0; margin-left: 10px; }
        .fw-user-btn { display: flex; align-items: center; gap: 7px; padding: 5px 9px; border-radius: 10px; background: transparent; border: 1px solid rgba(255,255,255,0.07); color: #9BAAC4; cursor: pointer; transition: 0.15s; }
        .fw-user-btn:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.12); }
        .fw-user-avatar { width: 26px; height: 26px; border-radius: 7px; background: rgba(201,168,76,0.15); border: 1px solid rgba(201,168,76,0.25); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #C9A84C; font-family: 'Cormorant Garamond', serif; }
        .fw-caret { font-size: 9px; color: #3D5070; }
        .fw-dropdown { position: absolute; top: calc(100% + 8px); right: 0; background: #0F1F3D; border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 8px; min-width: 190px; box-shadow: 0 16px 40px rgba(0,0,0,0.6); z-index: 300; animation: fw-drop-in 0.15s ease; }
        .fw-dropdown-header { padding: 8px 12px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 4px; }
        .fw-dropdown-name { font-size: 13px; font-weight: 600; color: #F0EDE4; }
        .fw-dropdown-sub { font-size: 11px; color: #3D5070; margin-top: 2px; }
        .fw-dropdown-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; color: #9BAAC4; font-family: 'Karla', sans-serif; font-size: 13px; cursor: pointer; background: transparent; border: none; width: 100%; text-align: left; transition: 0.15s; }
        .fw-dropdown-item:hover { background: rgba(255,255,255,0.04); color: #F0EDE4; }
        .fw-dropdown-item.danger:hover { color: #F87171; background: rgba(248,113,113,0.08); }
        .fw-dropdown-sep { height: 1px; background: rgba(255,255,255,0.06); margin: 4px 0; }

        /* ─── MOBILE SCORE (header, compact) ───────────────── */
        .fw-score-mobile { display: none; align-items: center; gap: 7px; padding: 5px 10px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.03); margin-left: auto; }
        .fw-score-mobile-num { font-family: 'Cormorant Garamond', serif; font-size: 17px; font-weight: 700; line-height: 1; }
        .fw-score-mobile-lbl { font-size: 9px; color: #3D5070; letter-spacing: 0.1em; text-transform: uppercase; }

        /* ─── MOBILE BOTTOM BAR ─────────────────────────────── */
        .fw-bottom-bar {
          display: none; position: fixed; bottom: 0; left: 0; right: 0;
          height: 64px; z-index: 200;
          background: rgba(7,14,28,0.97);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-top: 1px solid rgba(201,168,76,0.1);
          box-shadow: 0 -8px 32px rgba(0,0,0,0.4);
        }
        .fw-bottom-bar-inner { display: flex; align-items: center; justify-content: space-around; height: 100%; max-width: 500px; margin: 0 auto; padding: 0 8px; }
        .fw-tab-btn {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 3px; flex: 1; height: 100%; background: transparent; border: none;
          color: #3D5070; font-family: 'Karla', sans-serif;
          cursor: pointer; transition: color 0.2s; position: relative;
          -webkit-tap-highlight-color: transparent;
        }
        .fw-tab-btn.active, .fw-tab-btn.more-active { color: #E2C47A; }
        .fw-tab-icon { font-size: 20px; line-height: 1; transition: transform 0.15s; }
        .fw-tab-btn:active .fw-tab-icon { transform: scale(0.85); }
        .fw-tab-label { font-size: 10px; font-weight: 500; }
        .fw-tab-pip {
          position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%);
          width: 20px; height: 2.5px; border-radius: 2px;
          background: linear-gradient(90deg, #C9A84C, #E2C47A);
          opacity: 0; transition: opacity 0.2s;
        }
        .fw-tab-btn.active .fw-tab-pip, .fw-tab-btn.more-active .fw-tab-pip { opacity: 1; }

        /* ─── DRAWER OVERLAY ────────────────────────────────── */
        .fw-overlay {
          display: none; position: fixed; inset: 0; z-index: 350;
          background: rgba(0,0,0,0);
          transition: background 0.3s;
        }
        .fw-overlay.open { display: block; background: rgba(0,0,0,0.7); }

        /* ─── MORE DRAWER ───────────────────────────────────── */
        .fw-drawer {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 400;
          background: #0C1A2E;
          border: 1px solid rgba(201,168,76,0.18);
          border-bottom: none;
          border-radius: 22px 22px 0 0;
          transform: translateY(100%);
          transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
          box-shadow: 0 -24px 64px rgba(0,0,0,0.7);
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
        .fw-drawer.open { transform: translateY(0); }

        .fw-drawer-handle { display: flex; justify-content: center; padding: 14px 0 6px; }
        .fw-drawer-handle-bar { width: 38px; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.1); }

        .fw-drawer-head { padding: 4px 20px 16px; display: flex; align-items: center; justify-content: space-between; }
        .fw-drawer-head-title { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 600; color: #F0EDE4; }
        .fw-drawer-head-sub { font-size: 11px; color: #3D5070; margin-top: 2px; }
        .fw-drawer-close {
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.07);
          color: #5A6B8A; font-size: 14px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
        }

        .fw-drawer-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 0 16px 16px; }

        .fw-drawer-item {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 8px; padding: 18px 8px 16px;
          background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px; cursor: pointer;
          transition: background 0.15s, border-color 0.15s, transform 0.15s;
          -webkit-tap-highlight-color: transparent;
          opacity: 0; animation: none;
        }
        .fw-drawer.open .fw-drawer-item { animation: fw-item-pop 0.3s ease both; }
        .fw-drawer.open .fw-drawer-item:nth-child(1) { animation-delay: 0.05s; }
        .fw-drawer.open .fw-drawer-item:nth-child(2) { animation-delay: 0.09s; }
        .fw-drawer.open .fw-drawer-item:nth-child(3) { animation-delay: 0.12s; }
        .fw-drawer.open .fw-drawer-item:nth-child(4) { animation-delay: 0.15s; }
        .fw-drawer.open .fw-drawer-item:nth-child(5) { animation-delay: 0.18s; }
        .fw-drawer-item:active { transform: scale(0.93); }
        .fw-drawer-item.active { background: rgba(201,168,76,0.1); border-color: rgba(201,168,76,0.3); }
        .fw-drawer-icon { color:#9BAAC4;font-size: 24px; line-height: 1; }
        .fw-drawer-label { font-family: 'Karla', sans-serif; font-size: 12px; font-weight: 500; color: #9BAAC4; text-align: center; }
        .fw-drawer-item.active .fw-drawer-label { color: #E2C47A; font-weight: 600; }

        .fw-drawer-footer { display: flex; gap: 10px; padding: 4px 16px 20px; }
        .fw-drawer-footer-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px 8px; border-radius: 14px;
          font-family: 'Karla', sans-serif; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: 0.15s; border: 1px solid;
          -webkit-tap-highlight-color: transparent;
        }
        .fw-drawer-footer-btn.export { background: rgba(201,168,76,0.08); border-color: rgba(201,168,76,0.2); color: #C9A84C; }
        .fw-drawer-footer-btn.lock   { background: rgba(248,113,113,0.07); border-color: rgba(248,113,113,0.15); color: #F87171; }
        .fw-drawer-footer-btn:active { opacity: 0.75; transform: scale(0.97); }

        /* ─── RESPONSIVE ────────────────────────────────────── */
        @media (max-width: 1080px) { .fw-nav-btn { padding: 6px 10px; font-size: 12.5px; } }
        @media (max-width: 900px) {
          .fw-nav-wrap  { display: none; }
          .fw-divider   { display: none; }
          .fw-score-chip { display: none; }
          .fw-user-wrap { display: none; }
          .fw-logo-tagline { display: none; }
          .fw-score-mobile { display: flex; }
          .fw-bottom-bar { display: block; }
          body { padding-bottom: 64px; }
          .fw-header-inner { padding: 0 16px; }
        }
        @media (max-width: 480px) {
          .fw-header-inner { padding: 0 12px; }
          .fw-logo-name { font-size: 17px; }
          .fw-score-mobile-num { font-size: 15px; }
        }

        /* ─── KEYFRAMES ─────────────────────────────────────── */
        @keyframes fw-drop-in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fw-item-pop { from { opacity: 0; transform: translateY(14px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>

        {/* ── TOP HEADER ─────────────────────────────────────── */}
        <header className={`fw-header${scrolled ? ' scrolled' : ''}`}>
          <div className="fw-header-bg" />
          <div className="fw-header-inner">

            {/* Logo */}
            <a href="#" className="fw-logo" onClick={(e) => { e.preventDefault(); onNavigate('advisor'); }}>
              <div className="fw-logo-mark"><span className="fw-logo-symbol">Ƒ</span></div>
              <div className="fw-logo-text">
                <span className="fw-logo-name">FinWise</span>
                <span className="fw-logo-tagline">Your Money, Mastered</span>
              </div>
            </a>

            {/* Desktop scrollable nav with fade edges */}
            <div className="fw-nav-wrap">
              <nav className="fw-nav">
                {ALL_NAV.map((item) => (
                    <button
                        key={item.id}
                        className={`fw-nav-btn${activeView === item.id ? ' active' : ''}`}
                        onClick={() => onNavigate(item.id)}
                    >
                      <span className="fw-nav-icon">{item.icon}</span>
                      {item.label}
                      {item.id === 'chat' && <span className="fw-ai-badge">AI</span>}
                      <span className="fw-nav-pip" />
                    </button>
                ))}
              </nav>
            </div>

            <div className="fw-divider" />

            {/* Desktop score chip */}
            <div className="fw-score-chip">
              <div className="fw-score-ring">
                <svg width="30" height="30" viewBox="0 0 30 30">
                  <circle className="fw-score-ring-track" cx="15" cy="15" r="11" />
                  <circle className="fw-score-ring-fill" cx="15" cy="15" r="11" stroke={scoreColor}
                          style={{ strokeDasharray: `${(score / 100) * 69.1} 69.1`, filter: `drop-shadow(0 0 3px ${scoreColor})` }}
                  />
                </svg>
                <div className="fw-score-ring-val" style={{ color: scoreColor }}>{score}</div>
              </div>
              <div>
                <div className="fw-score-num" style={{ color: scoreColor }}>{score}</div>
                <div className="fw-score-lbl">Health Score</div>
              </div>
              <span className="fw-score-level" style={{ color: scoreColor, background: `${scoreColor}18`, border: `1px solid ${scoreColor}30` }}>
              {scoreLevel}
            </span>
            </div>

            {/* Desktop user menu */}
            <div className="fw-user-wrap" ref={menuRef}>
              <button className="fw-user-btn" onClick={() => setMenuOpen((o) => !o)}>
                <div className="fw-user-avatar">{userName ? userName[0].toUpperCase() : 'U'}</div>
                <span className="fw-caret">▾</span>
              </button>
              {menuOpen && (
                  <div className="fw-dropdown" onClick={() => setMenuOpen(false)}>
                    {userName && (
                        <div className="fw-dropdown-header">
                          <div className="fw-dropdown-name">{userName}</div>
                          <div className="fw-dropdown-sub">FinWise Profile</div>
                        </div>
                    )}
                    <button className="fw-dropdown-item" onClick={onExportExpenses}>↓ Export Expenses</button>
                    <button className="fw-dropdown-item" onClick={onExportInvestments}>↓ Export Investments</button>
                    <button className="fw-dropdown-item" onClick={onExportNetWorth}>↓ Export Net Worth</button>
                    <div className="fw-dropdown-sep" />
                    <button className="fw-dropdown-item danger" onClick={onLock}>🔒 Lock App</button>
                  </div>
              )}
            </div>

            {/* Mobile compact score (visible only on mobile) */}
            <div className="fw-score-mobile">
              <svg width="22" height="22" viewBox="0 0 22 22" style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2.5" />
                <circle cx="11" cy="11" r="8" fill="none" stroke={scoreColor} strokeWidth="2.5"
                        strokeLinecap="round"
                        style={{ strokeDasharray: `${(score / 100) * 50.3} 50.3`, filter: `drop-shadow(0 0 3px ${scoreColor})` }}
                />
              </svg>
              <div>
                <div className="fw-score-mobile-num" style={{ color: scoreColor }}>{score}</div>
                <div className="fw-score-mobile-lbl">Score</div>
              </div>
            </div>

          </div>
        </header>

        {/* ── MOBILE BOTTOM TAB BAR ───────────────────────────── */}
        <div className="fw-bottom-bar">
          <div className="fw-bottom-bar-inner">
            {PRIMARY_NAV.map((item) => (
                <button
                    key={item.id}
                    className={`fw-tab-btn${activeView === item.id ? ' active' : ''}`}
                    onClick={() => onNavigate(item.id)}
                >
                  <span className="fw-tab-icon">{item.icon}</span>
                  <span className="fw-tab-label">{item.label}</span>
                  <span className="fw-tab-pip" />
                </button>
            ))}

            {/* More → opens drawer */}
            <button
                className={`fw-tab-btn${moreIsActive ? ' more-active' : ''}`}
                onClick={() => setDrawerOpen(true)}
            >
            <span className="fw-tab-icon">
              {moreIsActive
                  ? MORE_NAV.find((n) => n.id === activeView)?.icon ?? '☰'
                  : '☰'}
            </span>
              <span className="fw-tab-label">More</span>
              <span className="fw-tab-pip" />
            </button>
          </div>
        </div>

        {/* ── DRAWER BACKDROP ─────────────────────────────────── */}
        <div className={`fw-overlay${drawerOpen ? ' open' : ''}`} onClick={() => setDrawerOpen(false)} />

        {/* ── MORE SLIDE-UP DRAWER ────────────────────────────── */}
        <div className={`fw-drawer${drawerOpen ? ' open' : ''}`}>
          <div className="fw-drawer-handle">
            <div className="fw-drawer-handle-bar" />
          </div>

          <div className="fw-drawer-head">
            <div>
              <div className="fw-drawer-head-title">More pages</div>
              <div className="fw-drawer-head-sub">Tap to navigate</div>
            </div>
            <button className="fw-drawer-close" onClick={() => setDrawerOpen(false)}>✕</button>
          </div>

          <div className="fw-drawer-grid">
            {MORE_NAV.map((item) => (
                <button
                    key={item.id}
                    className={`fw-drawer-item${activeView === item.id ? ' active' : ''}`}
                    onClick={() => handleDrawerNav(item.id)}
                >
                  <span className="fw-drawer-icon">{item.icon}</span>
                  <span className="fw-drawer-label">{item.label}</span>
                </button>
            ))}
          </div>

          <div className="fw-drawer-footer">
            <button
                className="fw-drawer-footer-btn export"
                onClick={() => { onExportExpenses?.(); setDrawerOpen(false); }}
            >
              ↓ Export CSV
            </button>
            <button
                className="fw-drawer-footer-btn lock"
                onClick={() => { onLock?.(); setDrawerOpen(false); }}
            >
              🔒 Lock App
            </button>
          </div>
        </div>

      </>
  );
};