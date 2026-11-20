export default function CreatorIllustration() {
  return (
    <svg viewBox="0 0 420 320" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: 420 }}>
      {/* Background glow */}
      <ellipse cx="210" cy="160" rx="180" ry="140" fill="url(#illumBg)" opacity="0.4" />

      {/* Laptop frame */}
      <rect x="80" y="50" width="260" height="170" rx="10" fill="#1E293B" stroke="rgba(139,92,246,0.15)" strokeWidth="1.5" />
      <rect x="88" y="58" width="244" height="140" rx="6" fill="#0F172A" />
      {/* Screen content - header */}
      <rect x="100" y="70" width="220" height="3" rx="1.5" fill="rgba(139,92,246,0.25)" />
      {/* Screen content - chart bars */}
      <rect x="100" y="85" width="28" height="45" rx="3" fill="url(#barGrad1)" opacity="0.8" />
      <rect x="134" y="95" width="28" height="35" rx="3" fill="url(#barGrad1)" opacity="0.6" />
      <rect x="168" y="75" width="28" height="55" rx="3" fill="url(#barGrad2)" opacity="0.8" />
      <rect x="202" y="88" width="28" height="42" rx="3" fill="url(#barGrad1)" opacity="0.5" />
      <rect x="236" y="80" width="28" height="50" rx="3" fill="url(#barGrad2)" opacity="0.7" />
      <rect x="270" y="92" width="28" height="38" rx="3" fill="url(#barGrad1)" opacity="0.4" />
      {/* Growth line */}
      <path d="M100 130 L120 118 L140 125 L160 110 L180 115 L200 100 L220 108 L240 95 L260 102 L280 88" stroke="url(#lineGrad)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* Dots on line */}
      <circle cx="120" cy="118" r="2.5" fill="#8B5CF6" opacity="0.7" />
      <circle cx="200" cy="100" r="3" fill="#EC4899" opacity="0.8" />
      <circle cx="280" cy="88" r="3" fill="#8B5CF6" opacity="0.9" />
      {/* Post cards */}
      <rect x="100" y="148" width="95" height="32" rx="5" fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.1)" strokeWidth="0.8" />
      <rect x="105" y="156" width="12" height="12" rx="3" fill="rgba(236,72,153,0.3)" />
      <rect x="122" y="158" width="40" height="3" rx="1.5" fill="rgba(255,255,255,0.15)" />
      <rect x="122" y="164" width="25" height="2" rx="1" fill="rgba(255,255,255,0.08)" />
      <rect x="205" y="148" width="95" height="32" rx="5" fill="rgba(236,72,153,0.08)" stroke="rgba(236,72,153,0.1)" strokeWidth="0.8" />
      <rect x="210" y="156" width="12" height="12" rx="3" fill="rgba(139,92,246,0.3)" />
      <rect x="227" y="158" width="40" height="3" rx="1.5" fill="rgba(255,255,255,0.15)" />
      <rect x="227" y="164" width="25" height="2" rx="1" fill="rgba(255,255,255,0.08)" />
      {/* Laptop base */}
      <rect x="70" y="215" width="280" height="8" rx="4" fill="#1E293B" stroke="rgba(139,92,246,0.1)" strokeWidth="1" />
      <rect x="180" y="223" width="60" height="4" rx="2" fill="#334155" />

      {/* Social icons floating */}
      {/* Instagram */}
      <g opacity="0.5" className="d-bounce" style={{ transformOrigin: '60px 130px' }}>
        <rect x="46" y="117" width="28" height="28" rx="7" stroke="#EC4899" strokeWidth="1.5" fill="none" />
        <circle cx="60" cy="131" r="6.5" stroke="#EC4899" strokeWidth="1.3" fill="none" />
        <circle cx="70" cy="121" r="2" fill="#EC4899" />
      </g>
      {/* YouTube */}
      <g opacity="0.5" className="d-float" style={{ transformOrigin: '380px 100px' }}>
        <rect x="352" y="88" width="36" height="25" rx="12" stroke="#EF4444" strokeWidth="1.5" fill="none" />
        <polygon points="363,96 363,105 371,100.5" fill="#EF4444" />
      </g>
      {/* Heart */}
      <g opacity="0.4" className="d-sway" style={{ transformOrigin: '45px 35px' }}>
        <path d="M18 32c-2.5-1.9-6.8-4.9-6.8-8.4 0-2.3 1.9-4 3.5-4 1.4 0 2.7.8 3.3 1.9.6-1.1 1.9-1.9 3.3-1.9 1.6 0 3.5 1.7 3.5 4 0 3.5-4.3 6.5-6.8 8.4z" stroke="#EC4899" strokeWidth="1.3" fill="none" />
      </g>

      {/* Calendar icon */}
      <g opacity="0.4" className="d-drift" style={{ transformOrigin: '350px 250px' }}>
        <rect x="340" y="237" width="22" height="22" rx="3" stroke="#8B5CF6" strokeWidth="1.3" fill="none" />
        <line x1="340" y1="244" x2="362" y2="244" stroke="#8B5CF6" strokeWidth="0.8" />
        <line x1="346" y1="234" x2="346" y2="240" stroke="#8B5CF6" strokeWidth="1" />
        <line x1="356" y1="234" x2="356" y2="240" stroke="#8B5CF6" strokeWidth="1" />
      </g>

      {/* Sparkle */}
      <g opacity="0.6" className="d-spin" style={{ transformOrigin: '390px 270px', animationDuration: '4s' }}>
        <path d="M390 258v24M378 270h24" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M382 262l16 16M398 262l-16 16" stroke="#8B5CF6" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      </g>

      {/* Stats label */}
      <g className="badge-glow">
        <rect x="290" y="265" width="95" height="40" rx="8" fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.1)" strokeWidth="0.8" />
        <text x="337" y="280" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7" fontFamily="Inter">Engagement</text>
        <text x="337" y="295" textAnchor="middle" fill="url(#textGrad)" fontSize="14" fontFamily="Poppins" fontWeight="700" className="badge-value">+127%</text>
      </g>

      {/* Notification dot */}
      <circle cx="88" cy="58" r="4" fill="#EC4899" opacity="0.6" />

      <defs>
        <radialGradient id="illumBg" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="barGrad1" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="barGrad2" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#EC4899" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#EC4899" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="textGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
    </svg>
  );
}
