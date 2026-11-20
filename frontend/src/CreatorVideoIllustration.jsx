export default function CreatorVideoIllustration() {
  return (
    <svg viewBox="0 0 520 440" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: 520 }}>
      <defs>
        <radialGradient id="ringLight" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#EC4899" stopOpacity="0.08" />
          <stop offset="40%" stopColor="#8B5CF6" stopOpacity="0.12" />
          <stop offset="70%" stopColor="#EC4899" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="flashGlow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#C4B5FD" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="phoneBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#EC4899" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E1B4B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="textGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Background ambient glow */}
      <ellipse cx="260" cy="220" rx="240" ry="200" fill="url(#ringLight)" />

      {/* Ring light behind */}
      <circle cx="260" cy="210" r="140" fill="none" stroke="rgba(139,92,246,0.06)" strokeWidth="1.5" />
      <circle cx="260" cy="210" r="120" fill="none" stroke="rgba(236,72,153,0.04)" strokeWidth="1" />

      {/* Camera flash rays */}
      <g className="flash-ray" style={{ transformOrigin: '260px 210px', animation: 'flashRay 2.5s ease-out infinite' }}>
        <polygon points="260,210 300,80 320,90" fill="rgba(255,255,255,0.04)" />
        <polygon points="260,210 400,160 410,180" fill="rgba(255,255,255,0.03)" />
        <polygon points="260,210 180,60 200,70" fill="rgba(255,255,255,0.04)" />
        <polygon points="260,210 420,250 410,270" fill="rgba(255,255,255,0.03)" />
        <polygon points="260,210 120,180 130,200" fill="rgba(255,255,255,0.03)" />
      </g>
      <g className="flash-burst" style={{ transformOrigin: '260px 210px', animation: 'flashBurst 1.8s ease-out infinite 0.3s' }}>
        <polygon points="260,210 350,50 370,65" fill="rgba(196,181,253,0.06)" />
        <polygon points="260,210 150,40 170,55" fill="rgba(251,207,232,0.05)" />
        <polygon points="260,210 430,200 440,220" fill="rgba(196,181,253,0.04)" />
        <polygon points="260,210 90,230 100,250" fill="rgba(251,207,232,0.04)" />
      </g>
      <g className="flash-spark" style={{ transformOrigin: '260px 210px', animation: 'flashSpark 1.2s ease-out infinite 0.6s' }}>
        <polygon points="260,210 370,120 380,135" fill="rgba(255,255,255,0.05)" />
        <polygon points="260,210 140,120 150,135" fill="rgba(255,255,255,0.04)" />
        <polygon points="260,210 370,300 380,285" fill="rgba(255,255,255,0.04)" />
        <polygon points="260,210 140,300 150,285" fill="rgba(255,255,255,0.03)" />
      </g>

      {/* Flash glow overlay */}
      <circle cx="260" cy="210" r="180" fill="url(#flashGlow)" className="flash-glow" style={{ animation: 'flashGlow 1.5s ease-out infinite 0.2s' }} />

      {/* Creator silhouette / person */}
      <g>
        {/* Shoulders */}
        <path d="M175 340 Q190 300 200 280 L320 280 Q330 300 345 340 Z" fill="#1E293B" opacity="0.8" />
        <path d="M180 340 Q195 310 200 290 L320 290 Q325 310 340 340 Z" fill="rgba(139,92,246,0.05)" />

        {/* Neck */}
        <rect x="242" y="260" width="36" height="30" rx="6" fill="#2A1B3D" />

        {/* Hair flowing */}
        <path d="M200 180 Q190 140 210 110 Q230 80 260 70 Q290 80 310 110 Q330 140 320 180 Q330 220 340 260 Q310 240 300 220 Q290 240 270 230 Q250 240 240 220 Q220 240 210 220 Q200 240 180 260 Q190 220 200 180 Z" fill="url(#hairGrad)" opacity="0.9" />
        <path d="M210 170 Q205 140 220 115 Q240 85 260 75 Q280 85 300 115 Q315 140 310 170" fill="#2D1B69" opacity="0.6" />

        {/* Face silhouette */}
        <path d="M230 170 Q230 140 245 125 Q260 112 280 125 Q290 140 290 170 Q290 200 280 220 Q275 235 260 240 Q245 235 240 220 Q230 200 230 170 Z" fill="#3D205E" />

        {/* Face highlight */}
        <path d="M240 175 Q240 150 252 138 Q260 132 270 138 Q278 150 278 175 Q278 195 270 210 Q265 220 260 222 Q255 220 250 210 Q242 195 240 175 Z" fill="rgba(139,92,246,0.08)" />

        {/* Hair strands */}
        <path d="M205 170 Q198 130 215 100 Q225 85 240 78" stroke="rgba(139,92,246,0.15)" strokeWidth="1.5" fill="none" />
        <path d="M315 170 Q322 130 305 100 Q295 85 280 78" stroke="rgba(236,72,153,0.12)" strokeWidth="1.5" fill="none" />
      </g>

      {/* Smartphone held up */}
      <g>
        {/* Phone body */}
        <rect x="205" y="120" width="110" height="180" rx="16" fill="url(#phoneBody)" stroke="rgba(139,92,246,0.15)" strokeWidth="1.5" filter="url(#glow)" />
        {/* Phone screen */}
        <rect x="212" y="128" width="96" height="155" rx="10" fill="url(#screenGrad)" />
        {/* Status bar */}
        <rect x="218" y="136" width="84" height="3" rx="1.5" fill="rgba(255,255,255,0.06)" />
        {/* REC indicator */}
        <circle cx="224" cy="142" r="3" fill="#EF4444" className="rec-dot" style={{ animation: 'recPulse 1s ease-in-out infinite' }} />
        <text x="232" y="145" textAnchor="start" fill="#EF4444" fontSize="6" fontFamily="Inter" fontWeight="600" opacity="0.8">REC</text>

        {/* Creator avatar on screen */}
        <circle cx="260" cy="180" r="22" fill="rgba(139,92,246,0.15)" />
        <circle cx="260" cy="180" r="16" fill="rgba(139,92,246,0.25)" />
        <circle cx="260" cy="180" r="9" fill="rgba(236,72,153,0.3)" />
        {/* Sparkle on avatar */}
        <path d="M260 168 L261 174 L267 175 L261 176 L260 182 L259 176 L253 175 L259 174 Z" fill="rgba(255,255,255,0.3)" className="avatar-sparkle" style={{ animation: 'avatarSpin 3s linear infinite', transformOrigin: '260px 180px' }} />

        {/* Video icons overlay on screen */}
        <rect x="218" y="210" width="30" height="16" rx="4" fill="rgba(139,92,246,0.1)" stroke="rgba(139,92,246,0.15)" strokeWidth="0.5" />
        <polygon points="224,215 224,222 231,218.5" fill="rgba(139,92,246,0.4)" />
        <rect x="255" y="210" width="30" height="16" rx="4" fill="rgba(236,72,153,0.1)" stroke="rgba(236,72,153,0.15)" strokeWidth="0.5" />
        <polygon points="261,215 261,222 268,218.5" fill="rgba(236,72,153,0.4)" />

        {/* Like count on screen */}
        <rect x="218" y="232" width="84" height="14" rx="4" fill="rgba(255,255,255,0.03)" />
        <path d="M222 239 L224 235 L226 239 L230 235 L232 239" stroke="#EC4899" strokeWidth="0.8" fill="none" opacity="0.5" />
        <text x="238" y="242" textAnchor="start" fill="rgba(255,255,255,0.2)" fontSize="5.5" fontFamily="Inter">2.4M likes</text>

        {/* Bottom gesture bar */}
        <rect x="246" y="290" width="28" height="3" rx="1.5" fill="rgba(255,255,255,0.08)" />

        {/* Camera lens */}
        <circle cx="260" cy="120" r="5" fill="#1E293B" stroke="rgba(139,92,246,0.2)" strokeWidth="1" />
        <circle cx="260" cy="120" r="2.5" fill="rgba(139,92,246,0.15)" />
      </g>

      {/* Fame indicators — floating hearts */}
      <g className="heart-float" style={{ animation: 'heartUp 3s ease-in-out infinite', transformOrigin: '100px 140px' }}>
        <path d="M95 145c-1.8-1.4-4.9-3.6-4.9-6.2 0-1.7 1.4-3 2.6-3 1 0 2 .6 2.4 1.4.4-.8 1.4-1.4 2.4-1.4 1.2 0 2.6 1.3 2.6 3 0 2.6-3.1 4.8-4.9 6.2z" fill="#EC4899" opacity="0.3" />
      </g>
      <g className="heart-float" style={{ animation: 'heartUp 3.8s ease-in-out infinite 0.8s', transformOrigin: '430px 100px' }}>
        <path d="M425 105c-1.8-1.4-4.9-3.6-4.9-6.2 0-1.7 1.4-3 2.6-3 1 0 2 .6 2.4 1.4.4-.8 1.4-1.4 2.4-1.4 1.2 0 2.6 1.3 2.6 3 0 2.6-3.1 4.8-4.9 6.2z" fill="#EC4899" opacity="0.25" />
      </g>
      <g className="heart-float" style={{ animation: 'heartUp 4.2s ease-in-out infinite 1.5s', transformOrigin: '80px 270px' }}>
        <path d="M75 275c-1.8-1.4-4.9-3.6-4.9-6.2 0-1.7 1.4-3 2.6-3 1 0 2 .6 2.4 1.4.4-.8 1.4-1.4 2.4-1.4 1.2 0 2.6 1.3 2.6 3 0 2.6-3.1 4.8-4.9 6.2z" fill="#EC4899" opacity="0.2" />
      </g>

      {/* Stars / sparkles */}
      <g className="star-spin" style={{ animation: 'starSpin 4s linear infinite', transformOrigin: '440px 180px' }}>
        <path d="M440 170 L441 177 L448 178 L441 179 L440 186 L439 179 L432 178 L439 177 Z" fill="#F59E0B" opacity="0.25" />
      </g>
      <g className="star-spin" style={{ animation: 'starSpin 5s linear infinite 1s', transformOrigin: '80px 100px' }}>
        <path d="M80 90 L81 97 L88 98 L81 99 L80 106 L79 99 L72 98 L79 97 Z" fill="#F59E0B" opacity="0.2" />
      </g>
      <g className="star-spin" style={{ animation: 'starSpin 3.5s linear infinite 2s', transformOrigin: '120px 340px' }}>
        <path d="M120 332 L121 338 L127 339 L121 340 L120 346 L119 340 L113 339 L119 338 Z" fill="#F59E0B" opacity="0.15" />
      </g>

      {/* Large sparkle bursts near phone */}
      <g className="sparkle-burst" style={{ animation: 'sparklePop 2s ease-out infinite', transformOrigin: '170px 130px' }}>
        <path d="M170 120 L172 128 L180 130 L172 132 L170 140 L168 132 L160 130 L168 128 Z" fill="rgba(255,255,255,0.15)" filter="url(#softGlow)" />
      </g>
      <g className="sparkle-burst" style={{ animation: 'sparklePop 2.5s ease-out infinite 0.5s', transformOrigin: '360px 150px' }}>
        <path d="M360 140 L362 148 L370 150 L362 152 L360 160 L358 152 L350 150 L358 148 Z" fill="rgba(255,255,255,0.12)" filter="url(#softGlow)" />
      </g>
      <g className="sparkle-burst" style={{ animation: 'sparklePop 1.8s ease-out infinite 0.9s', transformOrigin: '155px 250px' }}>
        <path d="M155 242 L157 248 L163 250 L157 252 L155 258 L153 252 L147 250 L153 248 Z" fill="rgba(255,255,255,0.1)" filter="url(#softGlow)" />
      </g>

      {/* Large sparkle */}
      <g className="sparkle-burst" style={{ animation: 'sparklePop 3s ease-out infinite 1.2s', transformOrigin: '400px 280px' }}>
        <path d="M400 268 L403 278 L413 281 L403 284 L400 294 L397 284 L387 281 L397 278 Z" fill="#8B5CF6" opacity="0.12" filter="url(#softGlow)" />
      </g>

      {/* Camera flash effect on screen */}
      <rect x="212" y="128" width="96" height="155" rx="10" fill="rgba(255,255,255,0.06)" className="screen-flash" style={{ animation: 'screenFlash 2s ease-out infinite 0.4s' }} />

      {/* Social media platform icons */}
      {/* TikTok */}
      <g opacity="0.3"  style={{ transformOrigin: '30px 200px', animation: 'floatSm 4s ease-in-out infinite' }}>
        <text x="30" y="205" textAnchor="middle" fill="#EC4899" fontSize="18" fontFamily="Inter" fontWeight="200">♪</text>
      </g>
      {/* Instagram */}
      <g opacity="0.25"  style={{ transformOrigin: '490px 220px', animation: 'floatSm 5s ease-in-out infinite 1s' }}>
        <text x="490" y="225" textAnchor="middle" fill="#EC4899" fontSize="16" fontFamily="Inter" fontWeight="200">◍</text>
      </g>
      {/* YouTube */}
      <g opacity="0.2"  style={{ transformOrigin: '60px 320px', animation: 'floatSm 4.5s ease-in-out infinite 2s' }}>
        <text x="60" y="325" textAnchor="middle" fill="#EF4444" fontSize="16" fontFamily="Inter" fontWeight="200">▶</text>
      </g>

      {/* Trending / fire icon */}
      <g opacity="0.15"  style={{ transformOrigin: '480px 350px', animation: 'floatSm 3.5s ease-in-out infinite 0.5s' }}>
        <text x="480" y="355" textAnchor="middle" fill="#F59E0B" fontSize="20" fontFamily="Inter" fontWeight="200">♨</text>
      </g>

      {/* Engagement stats panel */}
      <g>
        <rect x="340" y="370" width="120" height="48" rx="10" fill="rgba(139,92,246,0.06)" stroke="rgba(139,92,246,0.08)" strokeWidth="0.8" />
        <text x="400" y="388" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="7" fontFamily="Inter">Engagement</text>
        <text x="400" y="406" textAnchor="middle" fill="url(#textGrad)" fontSize="18" fontFamily="Poppins" fontWeight="700">+127%</text>
      </g>

      {/* Followers count */}
      <g>
        <rect x="50" y="375" width="100" height="40" rx="10" fill="rgba(236,72,153,0.05)" stroke="rgba(236,72,153,0.08)" strokeWidth="0.8" />
        <text x="100" y="391" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="6" fontFamily="Inter">Followers</text>
        <text x="100" y="405" textAnchor="middle" fill="#EC4899" fontSize="13" fontFamily="Poppins" fontWeight="600">2.4M</text>
      </g>

      {/* Verification / blue tick */}
      <g opacity="0.3"  style={{ transformOrigin: '280px 340px', animation: 'floatSm 3s ease-in-out infinite' }}>
        <circle cx="280" cy="340" r="10" fill="#3B82F6" opacity="0.15" />
        <path d="M276 340 L279 343 L284 337" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.4" />
      </g>
    </svg>
  );
}
