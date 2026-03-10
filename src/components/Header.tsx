import React, { useState, useEffect } from 'react';
import type { AppView } from '../types';

interface HeaderProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  score: number;
  scoreLevel: string;
}

const NAV_ITEMS: { id: AppView; label: string; icon: string }[] = [
  { id: 'advisor',     label: 'Advisor',     icon: '◆' },
  { id: 'dashboard',   label: 'Overview',    icon: '▦' },
  { id: 'expenses',    label: 'Expenses',    icon: '◎' },
  { id: 'investments', label: 'Investments', icon: '◈' },
  { id: 'insights',    label: 'Insights',    icon: '◉' },
];

const LEVEL_COLORS: Record<string, string> = {
  excellent: '#3DD68C',
  good:      '#60A5FA',
  fair:      '#FBBF24',
  poor:      '#FB923C',
  critical:  '#F87171',
};

export const Header: React.FC<HeaderProps> = ({ activeView, onNavigate, score, scoreLevel }) => {
  const scoreColor = LEVEL_COLORS[scoreLevel] || '#9BAAC4';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
      <>
        <style>{`
        .fw-header {
          position: sticky;
          top: 0;
          z-index: 200;
          transition: all 0.3s ease;
        }
        .fw-header.scrolled {
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        }
        .fw-header-bg {
          position: absolute;
          inset: 0;
          background: rgba(8, 17, 32, 0.88);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border-bottom: 1px solid rgba(201,168,76,0.12);
          z-index: 0;
        }
        .fw-header-inner {
          position: relative;
          z-index: 1;
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 28px;
          height: 66px;
          display: flex;
          align-items: center;
          gap: 0;
        }

        /* ── LOGO ── */
        .fw-logo {
          display: flex;
          align-items: center;
          gap: 11px;
          text-decoration: none;
          flex-shrink: 0;
          margin-right: 40px;
        }
        .fw-logo-mark {
          position: relative;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(145deg, #C9A84C 0%, #E8D08A 50%, #B8922E 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 12px rgba(201,168,76,0.35), inset 0 1px 0 rgba(255,255,255,0.3);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .fw-logo:hover .fw-logo-mark {
          transform: translateY(-1px) rotate(-3deg);
          box-shadow: 0 6px 20px rgba(201,168,76,0.45), inset 0 1px 0 rgba(255,255,255,0.3);
        }
        .fw-logo-symbol {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          font-weight: 800;
          color: #0A1628;
          line-height: 1;
          letter-spacing: -0.5px;
        }
        .fw-logo-text {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .fw-logo-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 19px;
          font-weight: 700;
          color: #E2C47A;
          line-height: 1;
          letter-spacing: 0.01em;
        }
        .fw-logo-tagline {
          font-family: 'Karla', sans-serif;
          font-size: 9.5px;
          font-weight: 500;
          color: #3D5070;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        /* ── DESKTOP NAV ── */
        .fw-nav {
          display: flex;
          align-items: center;
          gap: 2px;
          flex: 1;
        }
        .fw-nav-btn {
          position: relative;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 7px 15px;
          border-radius: 9px;
          border: 1px solid transparent;
          background: transparent;
          color: #4A5E7A;
          font-family: 'Karla', sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          letter-spacing: 0.01em;
          cursor: pointer;
          transition: color 0.18s ease, background 0.18s ease, border-color 0.18s ease;
          white-space: nowrap;
          outline: none;
        }
        .fw-nav-btn:hover {
          color: #C9A84C;
          background: rgba(201,168,76,0.07);
        }
        .fw-nav-btn.active {
          color: #E2C47A;
          background: rgba(201,168,76,0.1);
          border-color: rgba(201,168,76,0.22);
        }
        .fw-nav-btn.active .fw-nav-indicator {
          opacity: 1;
          transform: scaleX(1);
        }
        .fw-nav-icon {
          font-size: 10px;
          opacity: 0.7;
          transition: opacity 0.18s ease;
        }
        .fw-nav-btn.active .fw-nav-icon,
        .fw-nav-btn:hover .fw-nav-icon { opacity: 1; }

        .fw-nav-indicator {
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 20px;
          height: 2px;
          border-radius: 2px;
          background: linear-gradient(90deg, #C9A84C, #E2C47A);
          opacity: 0;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        /* ── DIVIDER ── */
        .fw-divider {
          width: 1px;
          height: 28px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.08), transparent);
          margin: 0 20px;
          flex-shrink: 0;
        }

        /* ── SCORE CHIP ── */
        .fw-score-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 16px 7px 10px;
          border-radius: 50px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          flex-shrink: 0;
          cursor: default;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .fw-score-chip:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.12);
        }
        .fw-score-ring {
          position: relative;
          width: 30px;
          height: 30px;
          flex-shrink: 0;
        }
        .fw-score-ring svg {
          transform: rotate(-90deg);
        }
        .fw-score-ring-track {
          fill: none;
          stroke: rgba(255,255,255,0.06);
          stroke-width: 2.5;
        }
        .fw-score-ring-fill {
          fill: none;
          stroke-width: 2.5;
          stroke-linecap: round;
          transition: stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1);
        }
        .fw-score-ring-val {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Karla', sans-serif;
          font-size: 9px;
          font-weight: 700;
          line-height: 1;
        }
        .fw-score-text {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .fw-score-number {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          font-weight: 700;
          line-height: 1;
        }
        .fw-score-label {
          font-family: 'Karla', sans-serif;
          font-size: 9.5px;
          font-weight: 500;
          color: #3D5070;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .fw-score-level {
          font-size: 10px;
          font-weight: 700;
          font-family: 'Karla', sans-serif;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: 20px;
        }

        /* ── BOTTOM NAVBAR (MOBILE) ── */
        .fw-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 70px;
          background: rgba(8, 17, 32, 0.95);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border-top: 1px solid rgba(201, 168, 76, 0.15);
          z-index: 200;
          padding: 0 8px;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
        }
        .fw-bottom-nav-container {
          display: flex;
          justify-content: space-around;
          align-items: center;
          height: 100%;
          max-width: 600px;
          margin: 0 auto;
        }
        .fw-bottom-nav-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          background: transparent;
          border: none;
          color: #4A5E7A;
          font-family: 'Karla', sans-serif;
          font-size: 11px;
          font-weight: 500;
          padding: 8px 12px;
          border-radius: 12px;
          transition: all 0.2s ease;
          cursor: pointer;
          flex: 0 1 auto;
          min-width: 60px;
        }
        .fw-bottom-nav-btn.active {
          color: #E2C47A;
          background: rgba(201, 168, 76, 0.12);
        }
        .fw-bottom-nav-icon {
          font-size: 20px;
          line-height: 1;
          margin-bottom: 2px;
        }
        .fw-bottom-nav-label {
          font-size: 10px;
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }

        /* Add padding to main content to account for bottom nav on mobile */
        .fw-main-content {
          padding-bottom: 0;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .fw-nav { display: none; }
          .fw-divider { display: none; }
          .fw-score-chip { padding: 6px 12px 6px 8px; }
          .fw-logo { margin-right: 0; }
          .fw-logo-tagline { display: none; }
          
          /* Show bottom nav on mobile */
          .fw-bottom-nav { display: block; }
          
          /* Adjust header for mobile */
          .fw-header-inner { 
            padding: 0 16px; 
            justify-content: space-between;
          }
          
          /* Add padding to body for bottom nav */
          body { padding-bottom: 70px; }
        }
        @media (max-width: 480px) {
          .fw-header-inner { padding: 0 12px; }
          .fw-score-number { font-size: 17px; }
          .fw-score-level { font-size: 9px; padding: 2px 6px; }
          .fw-bottom-nav-btn { min-width: 50px; padding: 6px 8px; }
          .fw-bottom-nav-icon { font-size: 18px; }
          .fw-bottom-nav-label { font-size: 9px; }
        }
      `}</style>

        <header className={`fw-header${scrolled ? ' scrolled' : ''}`}>
          <div className="fw-header-bg" />

          <div className="fw-header-inner">
            {/* Logo */}
            <a href="#" className="fw-logo" onClick={(e) => { e.preventDefault(); onNavigate('advisor'); }}>
              <div className="fw-logo-mark">
                <span className="fw-logo-symbol">Ƒ</span>
              </div>
              <div className="fw-logo-text">
                <span className="fw-logo-name">FinWise</span>
                <span className="fw-logo-tagline">Your Money, Mastered</span>
              </div>
            </a>

            {/* Desktop nav */}
            <nav className="fw-nav">
              {NAV_ITEMS.map((item) => (
                  <button
                      key={item.id}
                      className={`fw-nav-btn${activeView === item.id ? ' active' : ''}`}
                      onClick={() => onNavigate(item.id)}
                  >
                    <span className="fw-nav-icon">{item.icon}</span>
                    {item.label}
                    <span className="fw-nav-indicator" />
                  </button>
              ))}
            </nav>

            <div className="fw-divider" />

            {/* Score chip */}
            <div className="fw-score-chip">
              <div className="fw-score-ring">
                <svg width="30" height="30" viewBox="0 0 30 30">
                  <circle className="fw-score-ring-track" cx="15" cy="15" r="11" />
                  <circle
                      className="fw-score-ring-fill"
                      cx="15" cy="15" r="11"
                      stroke={scoreColor}
                      style={{
                        strokeDasharray: `${(score / 100) * 69.1} 69.1`,
                        filter: `drop-shadow(0 0 3px ${scoreColor})`,
                      }}
                  />
                </svg>
                <div className="fw-score-ring-val" style={{ color: scoreColor }}>{score}</div>
              </div>
              <div className="fw-score-text">
                <span className="fw-score-number" style={{ color: scoreColor }}>{score}</span>
                <span className="fw-score-label">Health Score</span>
              </div>
              <span
                  className="fw-score-level"
                  style={{
                    color: scoreColor,
                    background: `${scoreColor}18`,
                    border: `1px solid ${scoreColor}30`,
                  }}
              >
              {scoreLevel}
            </span>
            </div>
          </div>
        </header>

        {/* Mobile Bottom Navigation */}
        <nav className="fw-bottom-nav">
          <div className="fw-bottom-nav-container">
            {NAV_ITEMS.map((item) => (
                <button
                    key={item.id}
                    className={`fw-bottom-nav-btn${activeView === item.id ? ' active' : ''}`}
                    onClick={() => onNavigate(item.id)}
                >
                  <span className="fw-bottom-nav-icon">{item.icon}</span>
                  <span className="fw-bottom-nav-label">{item.label}</span>
                </button>
            ))}
          </div>
        </nav>
      </>
  );
};