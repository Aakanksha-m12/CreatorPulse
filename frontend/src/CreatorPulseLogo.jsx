export default function CreatorPulseLogo({ size = 56, showText = true }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background circle with gradient */}
      <circle cx="28" cy="28" r="27" fill="url(#cpGrad)" />
      {/* Camera body */}
      <rect x="14" y="20" width="28" height="18" rx="5" fill="white" fillOpacity="0.9" />
      <circle cx="28" cy="29" r="6" fill="var(--primary)" />
      <circle cx="28" cy="29" r="4" fill="url(#cpGrad)" />
      <rect x="30" y="19" width="8" height="4" rx="2" fill="white" fillOpacity="0.7" />
      {/* Pulse line */}
      <path d="M4 28 L16 28 L19 22 L22 35 L25 26 L28 32 L31 20 L34 30 L36 26 L40 28" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.4" />
      {/* Spotlight glow */}
      <circle cx="28" cy="14" r="10" fill="white" fillOpacity="0.08" />
      <defs>
        <linearGradient id="cpGrad" x1="0" y1="0" x2="56" y2="56">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
    </svg>
  );
}
