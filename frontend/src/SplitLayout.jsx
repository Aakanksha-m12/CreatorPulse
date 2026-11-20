import CreatorPulseLogo from './CreatorPulseLogo';
import DoodleBackground from './DoodleBackground';
import DoodlePattern from './DoodlePattern';
import CreatorIllustration from './CreatorIllustration';
import CreatorVideoIllustration from './CreatorVideoIllustration';

const features = [
  { icon: '📱', color: 'purple', title: 'Multi-Platform Management', desc: 'YouTube, Instagram, TikTok — all in one place' },
  { icon: '📊', color: 'green', title: 'Smart Analytics', desc: 'Track growth, engagement, and performance' },
  { icon: '⏰', color: 'orange', title: 'Best Time to Post', desc: 'Smart scheduling recommendations' },
  { icon: '💡', color: 'pink', title: 'Content Ideas', desc: 'Smart script & caption generator' },
];

const ri = [
  { x: 50, y: 50, s: 80, a: 'rr1', t: 'ring' },
  { x: 50, y: 50, s: 130, a: 'rr2', t: 'ring' },
  { x: 50, y: 50, s: 190, a: 'rr3', t: 'ring' },
  { x: 15, y: 10, s: 28, a: 'rf1', d: 'M6 0 L18 9 L6 18 Z', c: '#EC4899' },
  { x: 82, y: 15, s: 24, a: 'rf2', d: 'M12 2a10 10 0 00-7 17h14a10 10 0 00-7-17z M8 2h8 M12 2v6', c: '#8B5CF6' },
  { x: 8, y: 30, s: 22, a: 'rf3', d: 'M12 21c-3.3-2.5-9-6.5-9-11C3 7 5.5 4 8.5 4c1.9 0 3.5 1 4.5 2.5C14 5 15.6 4 17.5 4 20.5 4 23 7 23 10c0 4.5-5.7 8.5-9 11z', c: '#F59E0B' },
  { x: 88, y: 35, s: 20, a: 'rf4', d: 'M9 18h6 M10 22h4 M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z', c: '#EC4899' },
  { x: 5, y: 58, s: 26, a: 'rf1', d: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2', c: '#8B5CF6' },
  { x: 92, y: 58, s: 22, a: 'rf2', d: 'M12 6v12 M6 12h12', c: '#22C55E' },
  { x: 12, y: 78, s: 24, a: 'rf3', d: 'M8 3l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z', c: '#F59E0B' },
  { x: 85, y: 82, s: 26, a: 'rf4', d: 'M19 14l-7 7m0 0l-7-7m7 7V3', c: '#EC4899' },
  { x: 50, y: 3, s: 18, a: 'rf1', d: 'M22 11.08V12a10 10 0 11-5.93-9.14', c: '#8B5CF6' },
  { x: 48, y: 97, s: 20, a: 'rf2', d: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2', c: '#EC4899' },
  { x: 3, y: 50, s: 12, a: 'rf3', d: 'M12 2l2.4 7.2H22l-6.4 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2L2 9.2h7.6z', c: '#F59E0B' },
  { x: 95, y: 48, s: 12, a: 'rf4', d: 'M12 2l2.4 7.2H22l-6.4 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2L2 9.2h7.6z', c: '#F59E0B' },
  { x: 30, y: 85, s: 10, a: 'rf1', t: 'dot', c: '#8B5CF6' },
  { x: 70, y: 8, s: 8, a: 'rf2', t: 'dot', c: '#EC4899' },
  { x: 20, y: 45, s: 6, a: 'rf3', t: 'dot', c: '#F59E0B' },
  { x: 78, y: 70, s: 7, a: 'rf4', t: 'dot', c: '#22C55E' },
  { x: 25, y: 12, s: 20, a: 'rf1', d: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', c: '#22C55E' },
  { x: 68, y: 25, s: 18, a: 'rf2', d: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z', c: '#06B6D4' },
  { x: 35, y: 42, s: 22, a: 'rf3', d: 'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z', c: '#F97316' },
  { x: 72, y: 50, s: 16, a: 'rf4', d: 'M18 20V10 M12 20V4 M6 20v-6', c: '#3B82F6' },
  { x: 18, y: 65, s: 20, a: 'rf1', d: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0', c: '#EC4899' },
  { x: 80, y: 78, s: 18, a: 'rf2', d: 'M22 12a10 10 0 11-20 0 10 10 0 0120 0z M2 12h20', c: '#F59E0B' },
  { x: 7, y: 92, s: 22, a: 'rf3', d: 'M8 2v4 M16 2v4 M3 10h18 M21 14V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h8', c: '#8B5CF6' },
  { x: 90, y: 5, s: 16, a: 'rf4', d: 'M12 2a10 10 0 110 20 10 10 0 010-20z M12 6v6l4 2', c: '#22C55E' },
  { x: 45, y: 18, s: 14, a: 'rf1', d: 'M9 18V5l12-2v13 M9 18a3 3 0 01-3 3h-1a3 3 0 01-3-3v-1a3 3 0 013-3h1a3 3 0 013 3z', c: '#06B6D4' },
  { x: 15, y: 75, s: 16, a: 'rf2', d: 'M22 3H2l8 9.46V19l4 2v-8.54L22 3z', c: '#F97316' },
  { x: 60, y: 90, s: 14, a: 'rf3', d: 'M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6', c: '#3B82F6' },
  { x: 40, y: 70, s: 18, a: 'rf4', d: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22v-7', c: '#EC4899' },
  { x: 30, y: 28, s: 12, a: 'rf1', d: 'M12 8v8 M8 12h8', c: '#F59E0B' },
  { x: 75, y: 42, s: 12, a: 'rf2', d: 'M12 22a10 10 0 110-20 10 10 0 010 20z M8 14s1.5 2 4 2 4-2 4-2', c: '#8B5CF6' },
  { x: 55, y: 12, s: 6, a: 'rf1', t: 'dot', c: '#F97316' },
  { x: 22, y: 55, s: 7, a: 'rf2', t: 'dot', c: '#3B82F6' },
  { x: 45, y: 92, s: 9, a: 'rf3', t: 'dot', c: '#F59E0B' },
  { x: 92, y: 22, s: 5, a: 'rf4', t: 'dot', c: '#8B5CF6' },
  { x: 38, y: 5, s: 8, a: 'rf1', t: 'dot', c: '#22C55E' },
  { x: 5, y: 20, s: 7, a: 'rf2', t: 'dot', c: '#EC4899' },
  { x: 95, y: 92, s: 6, a: 'rf3', t: 'dot', c: '#06B6D4' },
  { x: 12, y: 18, s: 10, a: 'rf1', t: 'dot', c: '#3B82F6' },
  { x: 88, y: 45, s: 8, a: 'rf2', t: 'dot', c: '#F97316' },
  { x: 65, y: 95, s: 7, a: 'rf3', t: 'dot', c: '#06B6D4' },
  { x: 42, y: 32, s: 10, a: 'rf4', t: 'dot', c: '#EC4899' },
  { x: 56, y: 72, s: 6, a: 'rf1', t: 'dot', c: '#8B5CF6' },
  { x: 33, y: 48, s: 20, a: 'rf1', d: 'M20 12a8 8 0 11-16 0 8 8 0 0116 0z M12 2v4 M22 12h-4 M12 20v4 M4 12H2', c: '#3B82F6' },
  { x: 62, y: 5, s: 16, a: 'rf2', d: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z', c: '#EC4899' },
  { x: 95, y: 70, s: 14, a: 'rf3', d: 'M12 2l1 7h7l-6 5 2 7-6-4-6 4 2-7-6-5h7z', c: '#F59E0B' },
];

export default function SplitLayout({ children }) {
  return (
    <div className="app-wrapper">
      <DoodleBackground />
      <div className="split-layout">
        <div className="split-left">
          <div className="bg-glow-1" />
          <div className="bg-glow-2" />
          <DoodlePattern />

          <div className="left-brand">
            <div className="logo-glow">
              <CreatorPulseLogo size={56} />
            </div>
            <div className="left-brand-text">
              <h2>CreatorPulse</h2>
              <p>Manage every post from one place</p>
            </div>
          </div>

          <div className="left-content">
            <div className="left-illustration">
              <CreatorIllustration />
            </div>

            <div className="left-features">
              {features.map((f, i) => (
                <div key={i} className="feature-item" style={{ animationDelay: `${0.1 + i * 0.12}s` }}>
                  <div className={`feature-icon ${f.color}`}>{f.icon}</div>
                  <div className="feature-text">
                    <h4>{f.title}</h4>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="trust-badges">
              <div className="trust-item">
                <div className="trust-stars">★★★★★</div>
                <div className="trust-info">
                  <div className="trust-number" style={{ animationDelay: '0.7s' }}>15K+</div>
                  <div className="trust-label">Creators Trust Us</div>
                </div>
              </div>
              <div className="trust-item">
                <div className="trust-stars">★★★★★</div>
                <div className="trust-info">
                  <div className="trust-number" style={{ animationDelay: '0.9s' }}>4.9★</div>
                  <div className="trust-label">Average Rating</div>
                </div>
              </div>
            </div>

            <div className="left-footer">
              <div className="footer-links">
                <span>© 2026 CreatorPulse</span>
                <span>Privacy</span>
                <span>Terms</span>
                <span>Contact</span>
              </div>
            </div>
          </div>
        </div>

        <div className="split-right">
          <div className="rg-glow" />
          <div className="big-ring" />
          <div className="big-ring-2" />
          <div className="big-orb" />
          <div className="right-bg-video">
            <CreatorVideoIllustration />
          </div>
          {ri.map((ic, i) => {
            if (ic.t === 'ring') {
              return <div key={i} className={`ri-ring ${ic.a}`} style={{ width: ic.s, height: ic.s }} />;
            }
            if (ic.t === 'dot') {
              return <div key={i} className={`ri-dot ${ic.a}`} style={{ left: `${ic.x}%`, top: `${ic.y}%`, width: ic.s, height: ic.s, background: ic.c }} />;
            }
            return (
              <div key={i} className={`ri-icon ${ic.a}`} style={{ left: `${ic.x}%`, top: `${ic.y}%` }}>
                <svg width={ic.s} height={ic.s} viewBox="0 0 24 24" fill="none" stroke={ic.c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={ic.d} />
                </svg>
              </div>
            );
          })}
          <div className="right-inner">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
