export default function DoodlePattern() {
  return (
    <svg viewBox="0 0 800 700" fill="none" xmlns="http://www.w3.org/2000/svg"
      className="doodle-pattern-drift"
      style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none', opacity: 0.35 }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id="doodleBlur"><feGaussianBlur stdDeviation="0.3" /></filter>
      </defs>

      {/* Row 1 — top */}
      <g stroke="#A78BFA" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.7">
        {/* Stars */}
        <path d="M45 30 l2 5 5 2 -5 2 -2 5 -2-5 -5-2 5-2z" />
        <path d="M150 18 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5-4 -4-1.5 4-1.5z" />
        <path d="M680 25 l2 5 5 2 -5 2 -2 5 -2-5 -5-2 5-2z" />
        <path d="M740 45 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5-4 -4-1.5 4-1.5z" />

        {/* Moon crescents */}
        <path d="M250 22 a10 10 0 1 1 -2 18 a8 8 0 1 0 2-18z" />
        <path d="M600 30 a8 8 0 1 1 -2 14 a6 6 0 1 0 2-14z" />

        {/* Hearts */}
        <path d="M90 50 c-1-2-4-4-4-7 0-2 2-4 4-2 2-2 4 0 4 2 0-2 2-4 4-2 2 2 2 5 0 7 -1 1-3 3-4 4z" />
        <path d="M380 15 c-1-2-4-4-4-7 0-2 2-4 4-2 2-2 4 0 4 2 0-2 2-4 4-2 2 2 2 5 0 7 -1 1-3 3-4 4z" />
        <path d="M700 60 c-1-2-4-4-4-7 0-2 2-4 4-2 2-2 4 0 4 2 0-2 2-4 4-2 2 2 2 5 0 7 -1 1-3 3-4 4z" />

        {/* Circles / dots */}
        <circle cx="190" cy="40" r="3" />
        <circle cx="500" cy="25" r="2.5" />
        <circle cx="650" cy="55" r="2" />

        {/* Camera */}
        <rect x="310" y="12" width="16" height="12" rx="2" />
        <circle cx="318" cy="18" r="3" />

        {/* Music note */}
        <path d="M430 20 v15 M430 20 q6-2 10 0 v10" />
        <circle cx="430" cy="35" r="2.5" />
        <circle cx="440" cy="30" r="2.5" />

        {/* Play button */}
        <polygon points="550,15 550,30 563,22.5" />
        <rect x="548" y="14" width="16" height="17" rx="4" />

        {/* Cloud */}
        <path d="M120 55 q0-8 7-8 2-5 8-5 8 0 9 5 3-2 6 0 3 4 0 8z" />
      </g>

      {/* Row 2 */}
      <g stroke="#C4B5FD" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6">
        {/* Lightning */}
        <path d="M50 90 l5-15 3 8 7-8 -5 15 -3-8z" />
        <path d="M720 85 l5-15 3 8 7-8 -5 15 -3-8z" />

        {/* Rocket */}
        <path d="M200 80 q0-12 8-18 0-4 8-4 0 4 8 4 8 6 8 18 -4 0 -8 2 -4 0 -8-2z" />
        <path d="M196 80 l-4 6 8 0" />
        <path d="M228 80 l4 6 -8 0" />

        {/* Planet with ring */}
        <circle cx="400" cy="90" r="8" />
        <ellipse cx="400" cy="90" rx="14" ry="4" />

        {/* Arrow up */}
        <path d="M530 75 l0 20 M522 82 l8-7 8 7" />

        {/* Star burst */}
        <path d="M630 80 l0 8 M626 84 l8 0 M628 78 l4 4 M636 78 l-4 4" />

        {/* Smiley */}
        <circle cx="100" cy="100" r="7" />
        <circle cx="97" cy="98" r="1" fill="#C4B5FD" />
        <circle cx="103" cy="98" r="1" fill="#C4B5FD" />
        <path d="M96 103 q4 3 8 0" />

        {/* Speech bubble */}
        <path d="M280 70 h20 a3 3 0 0 1 3 3 v10 a3 3 0 0 1-3 3 h-12 l-6 6 v-6 h-2 a3 3 0 0 1-3-3 v-10 a3 3 0 0 1 3-3z" />

        {/* Triangle */}
        <path d="M470 75 l10 18 h-20z" />

        {/* Diamond */}
        <path d="M580 85 l5-8 5 8 -5 8z" />

        {/* Hexagon */}
        <path d="M340 100 l6-4 6 4 0 8 -6 4 -6-4z" />

        {/* Small circles */}
        <circle cx="160" cy="95" r="2" />
        <circle cx="250" cy="105" r="1.5" />
        <circle cx="450" cy="100" r="2" />
        <circle cx="670" cy="95" r="1.5" />
      </g>

      {/* Row 3 */}
      <g stroke="#A78BFA" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.65">
        {/* Camera 2 */}
        <rect x="30" y="130" width="18" height="13" rx="2" />
        <circle cx="39" cy="136" r="4" />
        <path d="M36 130 l2-3 h6 l2 3" />

        {/* Laptop */}
        <rect x="130" y="125" width="28" height="18" rx="2" />
        <rect x="124" y="143" width="40" height="3" rx="1.5" />

        {/* Phone */}
        <rect x="300" y="120" width="12" height="22" rx="2" />
        <line x1="304" y1="139" x2="308" y2="139" />

        {/* Globe */}
        <circle cx="440" cy="135" r="10" />
        <ellipse cx="440" cy="135" rx="4" ry="10" />
        <line x1="430" y1="135" x2="450" y2="135" />

        {/* Bell */}
        <path d="M570 120 a8 8 0 0 1 12 0 v5 q3 2 3 5 h-18 q0-3 3-5z" />
        <circle cx="576" cy="133" r="1.5" />

        {/* Clock */}
        <circle cx="670" cy="130" r="9" />
        <path d="M670 124 v6 h4" />

        {/* Envelope */}
        <rect x="240" y="128" width="18" height="13" rx="1.5" />
        <path d="M240 128 l9 7 9-7" />

        {/* Thumbs up */}
        <path d="M510 128 v-6 q0-3 3-3 h2 q2 0 2 2 v4 h4 q2 0 2 2 l-1 6 q0 2-2 2 h-10 q-2 0-2-2 v-3z" />

        {/* Pizza slice */}
        <path d="M350 145 l10-18 h-20z" />
        <circle cx="346" cy="133" r="1" fill="#C4B5FD" />
        <circle cx="352" cy="136" r="1" fill="#C4B5FD" />
        <circle cx="356" cy="130" r="1" fill="#C4B5FD" />

        {/* Dots */}
        <circle cx="90" cy="135" r="2" />
        <circle cx="200" cy="140" r="1.5" />
        <circle cx="620" cy="140" r="2" />
        <circle cx="760" cy="130" r="1.5" />
      </g>

      {/* Row 4 */}
      <g stroke="#C4B5FD" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.55">
        {/* Sun */}
        <circle cx="80" cy="185" r="6" />
        <path d="M80 174 v-4 M80 196 v4 M68 185 h-4 M96 185 h4 M72 177 l-3-3 M88 193 l3 3 M72 193 l-3 3 M88 177 l3-3" />

        {/* Flower */}
        <circle cx="230" cy="180" r="3" fill="#C4B5FD" />
        <circle cx="230" cy="173" r="3" />
        <circle cx="237" cy="177" r="3" />
        <circle cx="237" cy="184" r="3" />
        <circle cx="230" cy="187" r="3" />
        <circle cx="223" cy="184" r="3" />
        <circle cx="223" cy="177" r="3" />

        {/* Butterfly */}
        <path d="M370 175 q-8-6-4-12 q6 2 8 8 q6-6 8-8 q4 6-4 12 q-4 3-8 0z" />

        {/* Tree */}
        <path d="M490 195 v-15 M482 180 l8-15 8 15" />

        {/* Mountain */}
        <path d="M600 195 l12-25 12 25" />
        <path d="M594 195 l8-18 8 18" />

        {/* Wave */}
        <path d="M140 195 q8-8 16 0 t16 0 t16 0" />

        {/* Lightning 2 */}
        <path d="M310 170 l4-12 2 6 5-6 -4 12 -2-6z" />

        {/* Infinity */}
        <path d="M540 182 q-5-5-8-1 q-3 4 0 5 q5 5 8 1 q3-4 0-5 M540 182 q5-5 8-1 q3 4 0 5 q-5 5-8 1 q-3-4 0-5" />

        {/* Ribbon / bow */}
        <path d="M700 180 l-8-5 v10z M700 180 l8-5 v10z" />

        {/* Cross / plus */}
        <path d="M180 175 v12 M174 181 h12" />

        {/* Target */}
        <circle cx="440" cy="185" r="7" />
        <circle cx="440" cy="185" r="3" />
        <circle cx="440" cy="185" r="0.8" fill="#C4B5FD" />

        {/* Dots */}
        <circle cx="15" cy="185" r="1.5" />
        <circle cx="770" cy="180" r="2" />
      </g>

      {/* Row 5 */}
      <g stroke="#A78BFA" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6">
        {/* Headphones */}
        <path d="M60 220 a12 12 0 0 1 20 0" />
        <rect x="56" y="220" width="5" height="8" rx="2" />
        <rect x="79" y="220" width="5" height="8" rx="2" />

        {/* Microphone */}
        <rect x="200" y="210" width="8" height="14" rx="4" />
        <path d="M196 220 q0 8 8 8 t8-8" />
        <line x1="204" y1="228" x2="204" y2="234" />
        <line x1="199" y1="234" x2="209" y2="234" />

        {/* Film / clapperboard */}
        <rect x="340" y="210" width="18" height="14" rx="1" />
        <path d="M340 210 l4-4 h14 l4 4" />

        {/* Gamepad */}
        <path d="M460 218 h20 a4 4 0 0 1 4 4 v2 a4 4 0 0 1-4 4 h-10 v-6 h-10 a4 4 0 0 1-4-4 v-2 a4 4 0 0 1 4-4z" />
        <circle cx="468" cy="224" r="1.5" />
        <circle cx="472" cy="224" r="1.5" />
        <circle cx="476" cy="222" r="1" />
        <circle cx="476" cy="226" r="1" />

        {/* Paper plane */}
        <path d="M590 215 l15 5-15 5 3-5z M605 220 l5 5 M605 220 l-2 7" />

        {/* Pin / location */}
        <path d="M690 210 a6 6 0 0 1 0 12 l-3 8 h6 l-3-8" />
        <circle cx="690" cy="216" r="2" />

        {/* Bookmark */}
        <path d="M130 210 h8 v18 l-4-3 -4 3z" />

        {/* Lightbulb */}
        <path d="M270 210 a7 7 0 0 1 0 12 M266 222 h8 M268 225 h4 M270 228 h2" />

        {/* Trophy */}
        <path d="M540 210 h14 v8 a7 7 0 0 1-14 0z M547 226 v4 M543 230 h8" />

        {/* Key */}
        <circle cx="400" cy="220" r="5" />
        <path d="M405 220 h10 M412 220 v3 M415 220 v-3" />

        {/* Dots */}
        <circle cx="40" cy="222" r="1.5" />
        <circle cx="760" cy="218" r="2" />
        <circle cx="320" cy="232" r="1" />
      </g>

      {/* Row 6 */}
      <g stroke="#C4B5FD" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.55">
        {/* Glasses */}
        <circle cx="100" cy="260" r="6" />
        <circle cx="118" cy="260" r="6" />
        <path d="M106 260 h6 M94 260 h-4 M124 260 h4" />

        {/* Cat face */}
        <path d="M250 250 l3-8 5 5 l5-5 3 8" />
        <circle cx="255" cy="258" r="3" />
        <circle cx="265" cy="258" r="3" />
        <circle cx="253" cy="257" r="0.8" fill="#C4B5FD" />
        <circle cx="263" cy="257" r="0.8" fill="#C4B5FD" />
        <path d="M258 262 l2 2 l2-2" />

        {/* Cactus */}
        <path d="M390 270 v-20 M390 258 q-8 0-8 6 v4 M390 262 q6-2 6 4 v2" />

        {/* Donut */}
        <circle cx="500" cy="260" r="8" />
        <circle cx="500" cy="260" r="3" />

        {/* Ghost */}
        <path d="M620 250 a8 8 0 0 1 0-14 h0 a8 8 0 0 1 0 14 l-3 4 h3 l3-4z" />
        <circle cx="617" cy="240" r="1" fill="#C4B5FD" />
        <circle cx="623" cy="240" r="1" fill="#C4B5FD" />

        {/* Ice cream */}
        <path d="M170 250 l-5 12 h10z" />
        <circle cx="170" cy="248" r="5" />

        {/* Rocket 2 */}
        <path d="M720 248 q0-10 6-14 q0-4 6-4 0 4 6 4 6 4 6 14" />
        <path d="M716 248 l-3 5 h6" />
        <path d="M742 248 l3 5 h-6" />
        <circle cx="726" cy="240" r="1.5" />

        {/* Wrench */}
        <path d="M40 260 l8 8 M48 260 l-4 4 4 4 4-4z" />

        {/* Compass */}
        <circle cx="310" cy="260" r="7" />
        <path d="M310 253 v14 M303 260 h14" />
        <path d="M310 255 l-2 5 2 3 2-3z" fill="#C4B5FD" />

        {/* Dots */}
        <circle cx="150" cy="268" r="1.5" />
        <circle cx="560" cy="270" r="2" />
        <circle cx="680" cy="265" r="1.5" />
      </g>

      {/* Row 7 */}
      <g stroke="#A78BFA" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6">
        {/* WiFi */}
        <path d="M80 300 a3 3 0 0 1 0-4 M74 296 a7 7 0 0 1 12 0 M68 292 a11 11 0 0 1 24 0" />

        {/* Battery */}
        <rect x="200" y="295" width="18" height="10" rx="2" />
        <rect x="218" y="298" width="3" height="4" rx="1" />
        <rect x="202" y="297" width="10" height="6" rx="1" />

        {/* Chat bubbles */}
        <path d="M340 292 h16 a2 2 0 0 1 2 2 v8 a2 2 0 0 1-2 2 h-8 l-4 4 v-4 h-4 a2 2 0 0 1-2-2 v-8 a2 2 0 0 1 2-2z" />
        <circle cx="345" cy="298" r="1" fill="#A78BFA" />
        <circle cx="349" cy="298" r="1" fill="#A78BFA" />
        <circle cx="353" cy="298" r="1" fill="#A78BFA" />

        {/* Star outline */}
        <path d="M470 288 l4 8 9 1-6 6 2 9-9-5-9 5 2-9-6-6 9-1z" />

        {/* Pie chart */}
        <circle cx="600" cy="300" r="8" />
        <path d="M600 300 L600 292 A8 8 0 0 1 607 296z" fill="#A78BFA" />

        {/* Settings gear */}
        <circle cx="140" cy="305" r="5" />
        <circle cx="140" cy="305" r="2" />
        <path d="M140 298 v-3 M140 312 v3 M133 305 h-3 M147 305 h3 M135 300 l-2-2 M145 310 l2 2 M135 310 l-2 2 M145 300 l2-2" />

        {/* Arrow right */}
        <path d="M690 300 h16 M702 294 l6 6-6 6" />

        {/* Map pin */}
        <path d="M540 290 a5 5 0 0 1 0 10 l-2 6 h4 l-2-6" />
        <circle cx="540" cy="295" r="1.5" />

        {/* Dots */}
        <circle cx="30" cy="302" r="1.5" />
        <circle cx="770" cy="305" r="2" />
        <circle cx="260" cy="310" r="1" />
        <circle cx="430" cy="308" r="1.5" />
      </g>

      {/* Row 8 */}
      <g stroke="#C4B5FD" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5">
        {/* Paint palette */}
        <path d="M80 345 a12 12 0 1 1 24 0 a12 12 0 1 1-24 0" />
        <circle cx="90" cy="340" r="1.5" fill="#C4B5FD" />
        <circle cx="96" cy="338" r="1.5" fill="#A78BFA" />
        <circle cx="88" cy="350" r="1.5" fill="#C4B5FD" />

        {/* Scissors */}
        <circle cx="210" cy="350" r="3" />
        <circle cx="222" cy="350" r="3" />
        <path d="M213 348 l8-8 M219 348 l-8-8" />

        {/* Pencil */}
        <path d="M350 335 l4-10 4 10" />
        <rect x="348" y="335" width="8" height="16" rx="1" />
        <line x1="348" y1="341" x2="356" y2="341" />

        {/* Chain link */}
        <rect x="480" y="342" width="10" height="8" rx="4" />
        <rect x="488" y="344" width="10" height="8" rx="4" />

        {/* Eye */}
        <path d="M620 340 a10 6 0 0 1 0 12 a10 6 0 0 1 0-12z" />
        <circle cx="620" cy="346" r="3" />
        <circle cx="620" cy="346" r="1" fill="#C4B5FD" />

        {/* Fish */}
        <path d="M150 348 q8-6 16 0 q-4-5 0-10 q-12 0-16 10z M166 348 l4-3 4 3" />

        {/* Cherry */}
        <circle cx="310" cy="350" r="4" />
        <circle cx="318" cy="350" r="4" />
        <path d="M310 346 q3-8 8-8" />
        <path d="M318 346 q0-8-4-8" />

        {/* Leaf */}
        <path d="M550 340 q10-12 20 0 q-10 4-20 0z M560 340 v10" />

        {/* Dots */}
        <circle cx="40" cy="348" r="1.5" />
        <circle cx="760" cy="345" r="2" />
        <circle cx="260" cy="355" r="1" />
        <circle cx="430" cy="350" r="1.5" />
      </g>

      {/* Row 9 */}
      <g stroke="#A78BFA" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.55">
        {/* Crown */}
        <path d="M100 390 l4-10 4 6 4-6 4 6 4-6 4 10z" />

        {/* Diamond */}
        <path d="M240 385 l6-8 6 8 -6 8z" />

        {/* Swirl */}
        <path d="M380 395 a4 4 0 0 1 0-8 a6 6 0 0 1 0 12 a8 8 0 0 1 0-16" />

        {/* Atom */}
        <circle cx="520" cy="392" r="2" fill="#A78BFA" />
        <ellipse cx="520" cy="392" rx="12" ry="4" />
        <ellipse cx="520" cy="392" rx="12" ry="4" transform="rotate(60 520 392)" />
        <ellipse cx="520" cy="392" rx="12" ry="4" transform="rotate(120 520 392)" />

        {/* Paw print */}
        <circle cx="670" cy="388" r="3" />
        <circle cx="664" cy="383" r="1.5" />
        <circle cx="670" cy="381" r="1.5" />
        <circle cx="676" cy="383" r="1.5" />

        {/* Cloud */}
        <path d="M170 395 q0-6 5-6 2-4 6-4 6 0 7 4 2-2 4 0 2 3 0 6z" />

        {/* Music notes group */}
        <path d="M440 385 v14 M440 385 q4-2 8 0 v8 M448 385 q4-2 8 0 v8" />

        {/* Umbrella */}
        <path d="M580 380 a10 10 0 0 1 20 0 M590 380 v18 M590 398 q-3 2-3 4" />

        {/* Compass needle */}
        <circle cx="310" cy="395" r="6" />
        <path d="M310 389 l-2 6 2 3 2-3z" fill="#A78BFA" />

        {/* Dots */}
        <circle cx="50" cy="392" r="1.5" />
        <circle cx="750" cy="388" r="2" />
      </g>

      {/* Row 10 — bottom area */}
      <g stroke="#C4B5FD" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5">
        {/* Globe */}
        <circle cx="120" cy="440" r="8" />
        <path d="M112 440 h16 M120 432 v16" />
        <path d="M114 434 q6 4 6 12" />

        {/* Flag */}
        <path d="M260 430 v20 M260 430 h12 l-3-4 3-4z" />

        {/* Hourglass */}
        <path d="M400 430 h12 l-6 8 6 8 h-12 l6-8z" />
        <line x1="398" y1="430" x2="414" y2="430" />
        <line x1="398" y1="446" x2="414" y2="446" />

        {/* Anchor */}
        <circle cx="540" cy="432" r="2" />
        <path d="M540 434 v12 M532 442 a8 8 0 0 0 16 0" />

        {/* Rocket 3 */}
        <path d="M680 428 q0-10 6-14 q0-4 6-4 0 4 6 4 6 4 6 14 M676 428 l-3 5 h6 M702 428 l3 5 h-6" />

        {/* Cat silhouette */}
        <path d="M180 440 l3-8 5 4 l5-4 3 8 q0 6-8 6 t-8-6z" />
        <circle cx="183" cy="434" r="0.8" fill="#C4B5FD" />
        <circle cx="189" cy="434" r="0.8" fill="#C4B5FD" />

        {/* Snake / squiggle */}
        <path d="M320 435 q5-8 10 0 t10 0 t10 0 t10 0" />

        {/* Paperclip */}
        <path d="M460 430 h4 a6 6 0 0 1 0 12 h-4 a8 8 0 0 0 0 12 h4" />

        {/* Star burst */}
        <path d="M600 435 l0 8 M596 439 l8 0 M598 433 l4 4 M606 433 l-4 4" />

        {/* Dots */}
        <circle cx="30" cy="438" r="1.5" />
        <circle cx="770" cy="435" r="2" />
        <circle cx="500" cy="445" r="1" />
      </g>

      {/* Row 11 */}
      <g stroke="#A78BFA" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5">
        {/* Moon */}
        <path d="M100 485 a10 10 0 1 1 -2 18 a8 8 0 1 0 2-18z" />

        {/* Rocket */}
        <path d="M250 478 q0-10 6-14 q0-4 6-4 0 4 6 4 6 4 6 14" />

        {/* Camera */}
        <rect x="400" y="480" width="16" height="12" rx="2" />
        <circle cx="408" cy="486" r="3" />

        {/* Heart */}
        <path d="M560 485 c-1-2-4-4-4-7 0-2 2-4 4-2 2-2 4 0 4 2 0-2 2-4 4-2 2 2 2 5 0 7 -1 1-3 3-4 4z" />

        {/* Music note */}
        <path d="M680 480 v14 M680 480 q5-2 8 0 v8" />
        <circle cx="680" cy="494" r="2" />

        {/* Smiley */}
        <circle cx="170" cy="490" r="6" />
        <circle cx="167" cy="488" r="0.8" fill="#A78BFA" />
        <circle cx="173" cy="488" r="0.8" fill="#A78BFA" />
        <path d="M166 493 q4 3 8 0" />

        {/* Star */}
        <path d="M330 480 l2 5 5 2 -5 2 -2 5 -2-5 -5-2 5-2z" />

        {/* Phone */}
        <rect x="490" y="478" width="10" height="18" rx="2" />

        {/* Dots */}
        <circle cx="40" cy="488" r="1.5" />
        <circle cx="600" cy="495" r="2" />
        <circle cx="760" cy="490" r="1.5" />
      </g>

      {/* Row 12 */}
      <g stroke="#C4B5FD" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.45">
        {/* Star */}
        <path d="M80 535 l2 5 5 2 -5 2 -2 5 -2-5 -5-2 5-2z" />

        {/* Moon */}
        <path d="M220 530 a8 8 0 1 1 -2 14 a6 6 0 1 0 2-14z" />

        {/* Planet */}
        <circle cx="360" cy="535" r="6" />
        <ellipse cx="360" cy="535" rx="10" ry="3" />

        {/* Cloud */}
        <path d="M500 540 q0-6 5-6 2-4 6-4 6 0 7 4 2-2 4 0 2 3 0 6z" />

        {/* Sun */}
        <circle cx="650" cy="535" r="5" />
        <path d="M650 526 v-3 M650 544 v3 M641 535 h-3 M659 535 h3" />

        {/* Lightning */}
        <path d="M160 530 l4-12 2 6 5-6 -4 12 -2-6z" />

        {/* Star burst */}
        <path d="M440 535 l0 6 M437 538 l6 0 M438 533 l4 4 M446 533 l-4 4" />

        {/* Dots */}
        <circle cx="30" cy="535" r="1.5" />
        <circle cx="770" cy="538" r="2" />
        <circle cx="580" cy="540" r="1" />
        <circle cx="300" cy="542" r="1.5" />
      </g>

      {/* Row 13 — very bottom */}
      <g stroke="#A78BFA" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.4">
        {/* Stars */}
        <path d="M120 580 l2 5 5 2 -5 2 -2 5 -2-5 -5-2 5-2z" />
        <path d="M350 575 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5-4 -4-1.5 4-1.5z" />
        <path d="M620 585 l2 5 5 2 -5 2 -2 5 -2-5 -5-2 5-2z" />

        {/* Moons */}
        <path d="M500 575 a7 7 0 1 1 -2 12 a5 5 0 1 0 2-12z" />
        <path d="M180 590 a6 6 0 1 1 -1.5 10 a4.5 4.5 0 1 0 1.5-10z" />

        {/* Hearts */}
        <path d="M700 580 c-1-2-3-3-3-5 0-2 1.5-3 3-1.5 1.5-1.5 3 0 3 1.5 0-1.5 1.5-3 3-1.5 1.5 1.5 1.5 4 0 5 -1 1-2 2-3 3z" />

        {/* Circles */}
        <circle cx="280" cy="585" r="2.5" />
        <circle cx="560" cy="590" r="2" />
        <circle cx="450" cy="580" r="1.5" />
        <circle cx="80" cy="595" r="1" />
        <circle cx="750" cy="590" r="1.5" />
      </g>
    </svg>
  );
}
