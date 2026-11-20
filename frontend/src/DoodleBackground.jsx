import { useMemo } from 'react';

const icons = [
  // Social media icons
  { type: 'svg', w: 22, h: 22, view: '0 0 32 32', content: <><rect x="2" y="2" width="28" height="28" rx="7" strokeWidth="1.6" /><circle cx="16" cy="16" r="6" strokeWidth="1.3" /><circle cx="24" cy="8" r="1.6" /></>, cls: 'd-bounce' },
  { type: 'svg', w: 24, h: 24, view: '0 0 36 36', content: <><rect x="2" y="7" width="32" height="22" rx="11" strokeWidth="1.6" /><path d="M15 12 L15 24 L24 18 Z" /></>, cls: 'd-float' },
  { type: 'svg', w: 20, h: 20, view: '0 0 34 34', content: <><rect x="4" y="24" width="4" height="8" strokeWidth="1.3" /><rect x="11" y="16" width="4" height="16" strokeWidth="1.3" /><rect x="18" y="20" width="4" height="12" strokeWidth="1.3" /><rect x="25" y="10" width="4" height="22" strokeWidth="1.3" /></>, cls: 'd-drift' },
  { type: 'svg', w: 18, h: 18, view: '0 0 28 28', content: <><rect x="3" y="8" width="22" height="15" rx="4" strokeWidth="1.3" /><circle cx="14" cy="15" r="5" strokeWidth="1.1" /><rect x="17" y="6" width="6" height="3" rx="1.5" strokeWidth="0.8" /></>, cls: 'd-sway' },
  { type: 'svg', w: 18, h: 18, view: '0 0 26 26', content: <><rect x="2" y="3" width="22" height="20" rx="4" strokeWidth="1.3" /><line x1="8" y1="3" x2="8" y2="23" strokeWidth="0.8" /><line x1="18" y1="3" x2="18" y2="23" strokeWidth="0.8" /><line x1="2" y1="12" x2="24" y2="12" strokeWidth="0.6" /></>, cls: 'd-spin' },
  { type: 'svg', w: 16, h: 16, view: '0 0 24 24', content: <><path d="M12 21C12 21 3 15 3 9C3 6 5 4 7 4C9 4 12 6.5 12 6.5C12 6.5 15 4 17 4C19 4 21 6 21 9C21 15 12 21 12 21Z" strokeWidth="1.3" /></>, cls: 'd-bounce' },
  { type: 'svg', w: 18, h: 18, view: '0 0 28 28', content: <><path d="M3 3H25V19H8L3 24V3Z" strokeWidth="1.3" /></>, cls: 'd-float' },
  { type: 'svg', w: 18, h: 18, view: '0 0 30 30', content: <><path d="M5 22 L11 14 L16 18 L22 8 L28 12" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /><path d="M22 8 L28 8 L28 14" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" /><path d="M5 22 L5 16" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" /></>, cls: 'd-drift' },
  { type: 'svg', w: 14, h: 14, view: '0 0 20 20', content: <><circle cx="6" cy="15" r="3" strokeWidth="1" /><path d="M9 15 L9 3 L17 5 L17 12" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" /><circle cx="15" cy="12" r="2.5" strokeWidth="0.8" /></>, cls: 'd-sway' },
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><line x1="8" y1="3" x2="5" y2="19" strokeWidth="1.1" strokeLinecap="round" /><line x1="16" y1="3" x2="13" y2="19" strokeWidth="1.1" strokeLinecap="round" /><line x1="3" y1="8" x2="20" y2="8" strokeWidth="1.1" strokeLinecap="round" /><line x1="3" y1="14" x2="20" y2="14" strokeWidth="1.1" strokeLinecap="round" /></>, cls: 'd-bounce' },
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><path d="M11 2C7 2 4 5 4 9C4 14 11 20 11 20C11 20 18 14 18 9C18 5 15 2 11 2Z" strokeWidth="1.1" /><circle cx="11" cy="9" r="3" strokeWidth="0.8" /></>, cls: 'd-float' },
  { type: 'svg', w: 16, h: 16, view: '0 0 26 26', content: <><path d="M16 2 L6 16 H12 L9 24 L21 9 H14 Z" strokeWidth="1.2" strokeLinejoin="round" /></>, cls: 'd-bounce' },
  { type: 'svg', w: 18, h: 18, view: '0 0 30 30', content: <><path d="M22 11 A9 9 0 1 1 12 2 A7.5 7.5 0 0 0 22 11 Z" strokeWidth="1.2" /></>, cls: 'd-drift' },
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><circle cx="11" cy="10" r="6.5" strokeWidth="1.2" /><path d="M13 16 L13 20" strokeWidth="1" /><path d="M9 16 L9 20" strokeWidth="1" /></>, cls: 'd-sway' },
  { type: 'svg', w: 14, h: 14, view: '0 0 20 20', content: <><circle cx="7" cy="7" r="5" strokeWidth="1.1" /><circle cx="13" cy="13" r="5" strokeWidth="1.1" /></>, cls: 'd-rise' },
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><path d="M11 3 L13 8 L18 9 L14.5 12.5 L15.5 18 L11 15 L6.5 18 L7.5 12.5 L4 9 L9 8 Z" strokeWidth="1" strokeLinejoin="round" /></>, cls: 'd-spin' },
  // Creator-tool doodles
  { type: 'svg', w: 16, h: 16, view: '0 0 26 26', content: <><path d="M6 22 L6 13 L12 13 L12 9 L18 9 L18 5 L22 5 L22 22" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></>, cls: 'd-rise' },
  { type: 'svg', w: 16, h: 16, view: '0 0 26 26', content: <><path d="M2 22 L10 14 L14 18 L22 8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M18 8 L22 8 L22 12" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" /></>, cls: 'd-float' },
  { type: 'svg', w: 16, h: 16, view: '0 0 26 26', content: <><path d="M4 5 L22 13 L4 21 Z" strokeWidth="1.2" strokeLinejoin="round" /></>, cls: 'd-sway' },
  { type: 'svg', w: 15, h: 15, view: '0 0 26 26', content: <><circle cx="13" cy="13" r="9" strokeWidth="1.2" /><path d="M13 7 L13 13 L17 15" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" /></>, cls: 'd-spin' },
  { type: 'svg', w: 16, h: 16, view: '0 0 28 28', content: <><path d="M5 23 L5 9 L11 9 L11 5 L23 5 L23 23" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M9 14 H20 M9 18 H20" strokeWidth="0.9" strokeLinecap="round" /></>, cls: 'd-drift' },
  { type: 'svg', w: 15, h: 15, view: '0 0 24 24', content: <><path d="M5 12 C5 5 19 5 19 12 C19 19 5 19 5 12 Z" strokeWidth="1.2" strokeLinecap="round" /><path d="M12 2 V4 M12 20 V22 M2 12 H4 M20 12 H22" strokeWidth="0.8" strokeLinecap="round" /></>, cls: 'd-bounce' },
  { type: 'svg', w: 15, h: 15, view: '0 0 24 24', content: <><path d="M4 9 H20 M4 15 H20 M6 9 L8 3 H16 L18 9 M6 15 L8 21 H16 L18 15" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></>, cls: 'd-sway' },
  { type: 'svg', w: 15, h: 15, view: '0 0 24 24', content: <><path d="M9 3 L14 3 L14 6 L18 8 L18 11 L15 12 L15 21 L9 21 L9 3 Z" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></>, cls: 'd-float' },
  { type: 'svg', w: 15, h: 15, view: '0 0 26 26', content: <><path d="M4 9 C4 4 22 4 22 9 C22 14 4 14 4 9 Z" strokeWidth="1.2" strokeLinecap="round" /><path d="M6 12 L6 17 L19 17 L19 12" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" /></>, cls: 'd-drift' },
  { type: 'svg', w: 15, h: 15, view: '0 0 26 26', content: <><circle cx="13" cy="13" r="8" strokeWidth="1.2" /><path d="M13 9 L17 16 L13 14 L9 16 Z" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" /></>, cls: 'd-rise' },
  { type: 'svg', w: 15, h: 15, view: '0 0 26 26', content: <><path d="M3 13 H23 M13 3 C18 8 18 18 13 23 C8 18 8 8 13 3 Z" strokeWidth="1.2" strokeLinecap="round" /></>, cls: 'd-bounce' },
  { type: 'svg', w: 15, h: 15, view: '0 0 26 26', content: <><circle cx="13" cy="13" r="5" strokeWidth="1.1" /><path d="M13 3 V7 M13 19 V23 M3 13 H7 M19 13 H23" strokeWidth="0.9" strokeLinecap="round" /></>, cls: 'd-spin' },
  { type: 'svg', w: 15, h: 15, view: '0 0 26 26', content: <><path d="M10 5 L16 5 L16 9 L22 9 L22 21 L4 21 L4 9 L10 9 Z" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" /><path d="M10 5 C10 2 16 2 16 5" strokeWidth="1" strokeLinecap="round" /></>, cls: 'd-float' },
  { type: 'svg', w: 15, h: 15, view: '0 0 26 26', content: <><path d="M4 5 L22 5 M4 10 L22 10 M4 15 L22 15" strokeWidth="1" strokeLinecap="round" /><path d="M12 5 L12 21" strokeWidth="0.8" strokeLinecap="round" /><circle cx="12" cy="16" r="2.4" strokeWidth="0.9" /></>, cls: 'd-sway' },
  { type: 'svg', w: 15, h: 15, view: '0 0 26 26', content: <><path d="M12 2 L15 9 L22 10 L16.5 15 L17.8 22 L12 18.5 L6.2 22 L7.5 15 L2 10 L9 9 Z" strokeWidth="0.9" strokeLinejoin="round" /></>, cls: 'd-drift' },
  // Creator-themed: play button, camera, mic, pen, hashtag, trending up, bell, globe, palette, film reel
  { type: 'svg', w: 16, h: 16, view: '0 0 26 26', content: <><circle cx="13" cy="13" r="10" strokeWidth="1.2" /><path d="M10 8 L18 13 L10 18 Z" fill="white" fillOpacity="0.3" strokeWidth="0.8" /></>, cls: 'd-bounce' },
  { type: 'svg', w: 16, h: 16, view: '0 0 26 26', content: <><rect x="3" y="6" width="20" height="14" rx="3" strokeWidth="1.2" /><circle cx="13" cy="13" r="4" strokeWidth="1" /><circle cx="19" cy="8" r="1.2" strokeWidth="0.8" /></>, cls: 'd-float' },
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><path d="M11 3 L11 12" strokeWidth="1.5" strokeLinecap="round" /><path d="M7 8 L11 3 L15 8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" /><path d="M4 14 L4 17 C4 18.5 7 20 11 20 C15 20 18 18.5 18 17 L18 14" strokeWidth="1.2" strokeLinecap="round" /></>, cls: 'd-sway' },
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><path d="M11 2 L13 8 L19 8 L14 12 L16 18 L11 14 L6 18 L8 12 L3 8 L9 8 Z" strokeWidth="0.9" strokeLinejoin="round" /></>, cls: 'd-rise' },
  { type: 'svg', w: 15, h: 15, view: '0 0 24 24', content: <><path d="M4 4 L8 4 L8 8 L4 8 Z M13 4 L17 4 L17 8 L13 8 Z M4 13 L8 13 L8 17 L4 17 Z M16 13 L20 13 L20 17 L16 17 Z" strokeWidth="1.2" strokeLinejoin="round" fill="none" /><path d="M8 6 L13 6 M6 8 L6 13 M17 8 L17 13 M8 17 L13 17 M13 13 L16 16" strokeWidth="0.7" strokeLinecap="round" /></>, cls: 'd-spin' },
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><path d="M3 17 L8 11 L12 14 L19 5" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 5 L19 5 L19 9" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" /></>, cls: 'd-drift' },
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><path d="M11 2 C7 2 4 5 4 8 C4 11 11 16 11 16 C11 16 18 11 18 8 C18 5 15 2 11 2 Z" strokeWidth="1.2" /><circle cx="11" cy="8" r="2.5" strokeWidth="0.9" /></>, cls: 'd-bounce' },
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><circle cx="11" cy="11" r="8" strokeWidth="1.1" /><path d="M3 11 H19 M11 3 C8 7 8 15 11 19 M11 3 C14 7 14 15 11 19" strokeWidth="0.7" /></>, cls: 'd-sway' },
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><rect x="3" y="3" width="16" height="16" rx="3" strokeWidth="1.1" /><path d="M3 8 L19 8 M8 3 L8 19 M13 3 L13 19 M18 3 L18 19" strokeWidth="0.5" /><circle cx="11" cy="11" r="2" strokeWidth="0.8" /></>, cls: 'd-float' },
  { type: 'svg', w: 15, h: 15, view: '0 0 24 24', content: <><rect x="2" y="4" width="20" height="16" rx="2" strokeWidth="1.1" /><path d="M2 8 L22 8" strokeWidth="0.7" /><circle cx="6" cy="6" r="1" fill="white" fillOpacity="0.4" /><circle cx="9" cy="6" r="1" fill="white" fillOpacity="0.4" /><path d="M6 12 L10 15 L18 10" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" /></>, cls: 'd-drift' },
  // EXTRA DOODLES — social & creator icons
  // YouTube play circle
  { type: 'svg', w: 16, h: 16, view: '0 0 26 26', content: <><rect x="2" y="5" width="22" height="16" rx="4" strokeWidth="1.2" /><path d="M10 9 L10 17 L18 13 Z" fill="white" fillOpacity="0.25" strokeWidth="0.8" /></>, cls: 'd-rise' },
  // Instagram frame
  { type: 'svg', w: 14, h: 14, view: '0 0 24 24', content: <><rect x="2" y="2" width="20" height="20" rx="5" strokeWidth="1.2" /><circle cx="12" cy="12" r="5" strokeWidth="1" /><circle cx="17.5" cy="6.5" r="1.3" strokeWidth="0.8" /></>, cls: 'd-spin' },
  // Music note
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><path d="M8 18 L8 5 L19 2 L19 15" strokeWidth="1.2" strokeLinecap="round" /><circle cx="6" cy="18" r="2.5" strokeWidth="1" /><circle cx="17" cy="15" r="2.5" strokeWidth="1" /></>, cls: 'd-bounce' },
  // Headphones
  { type: 'svg', w: 15, h: 15, view: '0 0 24 24', content: <><path d="M3 14 C3 8 9 3 12 3 C15 3 21 8 21 14" strokeWidth="1.2" strokeLinecap="round" fill="none" /><rect x="1" y="13" width="4" height="6" rx="2" strokeWidth="1" /><rect x="19" y="13" width="4" height="6" rx="2" strokeWidth="1" /></>, cls: 'd-float' },
  // Megaphone / speaker
  { type: 'svg', w: 15, h: 15, view: '0 0 24 24', content: <><path d="M4 9 L4 15 L8 15 L15 20 L15 4 L8 9 Z" strokeWidth="1.2" strokeLinejoin="round" /><path d="M18 9 C19 10 19 14 18 15" strokeWidth="1" strokeLinecap="round" /></>, cls: 'd-sway' },
  // Pen tool
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><path d="M13 2 L20 9 L9 20 L2 20 L2 13 Z" strokeWidth="1.1" strokeLinejoin="round" /><path d="M11 4 L18 11" strokeWidth="0.8" /></>, cls: 'd-drift' },
  // Bookmark / save
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><path d="M5 2 L17 2 L17 20 L11 16 L5 20 Z" strokeWidth="1.2" strokeLinejoin="round" /></>, cls: 'd-rise' },
  // Trophy
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><path d="M6 2 H16 V11 C16 14 14 16 11 16 C8 16 6 14 6 11 Z" strokeWidth="1.1" /><path d="M6 5 H3 V8 C3 10 5 11 6 10" strokeWidth="0.9" /><path d="M16 5 H19 V8 C19 10 17 11 16 10" strokeWidth="0.9" /><path d="M9 16 L9 19 L11 20 L13 19 L13 16" strokeWidth="0.9" /></>, cls: 'd-spin' },
  // Diamond gem
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><path d="M4 8 L11 2 L18 8 L11 20 Z" strokeWidth="1.1" strokeLinejoin="round" /><path d="M4 8 L18 8" strokeWidth="0.7" /><path d="M8 8 L6 20 M14 8 L16 20" strokeWidth="0.6" /></>, cls: 'd-bounce' },
  // Clock / timer
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><circle cx="11" cy="11" r="9" strokeWidth="1.1" /><path d="M11 6 L11 11 L15 13" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" /></>, cls: 'd-sway' },
  // Rocket
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><path d="M11 2 C11 2 6 8 6 14 L11 16 L16 14 C16 8 11 2 11 2 Z" strokeWidth="1.1" strokeLinejoin="round" /><circle cx="11" cy="9" r="1.5" strokeWidth="0.8" /><path d="M6 14 L3 17 M16 14 L19 17" strokeWidth="0.8" strokeLinecap="round" /></>, cls: 'd-float' },
  // Puzzle piece
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><path d="M2 7 L7 7 L7 5 C8 4 9 5 8 7 L8 7 L15 7 L15 5 C16 4 17 5 16 7 L16 7 L20 7 L20 10 L17 10 L17 12 C16 13 15 12 16 10 L20 10 L20 15 L16 15 L16 13 C15 12 14 13 15 15 L15 15 L15 20 L10 20 L10 16 C9 15 8 16 9 18 L9 18 L7 18 L7 15 C6 14 5 15 6 17 L2 17 L2 12 L5 12 L5 10 C6 9 7 10 6 12 L2 12 Z" strokeWidth="0.8" strokeLinejoin="round" fill="none" /></>, cls: 'd-drift' },
  // WiFi signal
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><path d="M3 9 C7 5 15 5 19 9" strokeWidth="1.1" strokeLinecap="round" fill="none" /><path d="M6 12 C8.5 9.5 13.5 9.5 16 12" strokeWidth="1" strokeLinecap="round" fill="none" /><circle cx="11" cy="15" r="1.5" strokeWidth="1" /></>, cls: 'd-bounce' },
  // Lightning bolt
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><path d="M12 2 L6 12 L10 12 L8 20 L16 10 L12 10 Z" strokeWidth="1.1" strokeLinejoin="round" /></>, cls: 'd-spin' },
  // Compass
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><circle cx="11" cy="11" r="9" strokeWidth="1.1" /><path d="M11 5 L13 10 L11 11 L9 10 Z" strokeWidth="0.8" fill="white" fillOpacity="0.2" /><path d="M11 17 L9 12 L11 11 L13 12 Z" strokeWidth="0.8" /></>, cls: 'd-rise' },
  // Eye / views
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><path d="M1 11 C4 5 18 5 21 11 C18 17 4 17 1 11 Z" strokeWidth="1.1" /><circle cx="11" cy="11" r="3" strokeWidth="1" /></>, cls: 'd-sway' },
  // Thumbs up
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><path d="M7 10 L7 20 L3 20 L3 10 Z" strokeWidth="1.1" strokeLinejoin="round" /><path d="M7 10 L10 3 C11 2 13 3 13 5 L13 8 L19 8 C20 8 21 9 21 10 L20 17 C20 18 19 19 18 19 L7 19" strokeWidth="1.1" strokeLinejoin="round" /></>, cls: 'd-float' },
  // Cursor / mouse pointer
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><path d="M4 2 L4 17 L8 13 L13 13 Z" strokeWidth="1.1" strokeLinejoin="round" /></>, cls: 'd-drift' },
  // Gear / settings
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><circle cx="11" cy="11" r="3" strokeWidth="1" /><path d="M11 1 V4 M11 18 V21 M1 11 H4 M18 11 H21 M4 4 L6 6 M16 16 L18 18 M18 4 L16 6 M6 16 L4 18" strokeWidth="0.9" strokeLinecap="round" /></>, cls: 'd-spin' },
  // Chat bubble with dots
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><path d="M2 3 H20 V15 H8 L4 19 V15 H2 Z" strokeWidth="1.1" strokeLinejoin="round" /><circle cx="7" cy="9" r="1" fill="white" fillOpacity="0.4" /><circle cx="11" cy="9" r="1" fill="white" fillOpacity="0.4" /><circle cx="15" cy="9" r="1" fill="white" fillOpacity="0.4" /></>, cls: 'd-bounce' },
  // Sharing / network nodes
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><circle cx="5" cy="5" r="2.5" strokeWidth="1" /><circle cx="17" cy="5" r="2.5" strokeWidth="1" /><circle cx="11" cy="17" r="2.5" strokeWidth="1" /><path d="M7 6 L15 6 M6 7 L10 15 M16 7 L12 15" strokeWidth="0.8" strokeLinecap="round" /></>, cls: 'd-sway' },
  // Award ribbon
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><circle cx="11" cy="8" r="5" strokeWidth="1.1" /><path d="M8 12 L6 20 L11 17 L16 20 L14 12" strokeWidth="1" strokeLinejoin="round" fill="none" /></>, cls: 'd-rise' },
  // Filter funnel
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><path d="M2 3 H20 L14 11 V18 L10 20 V11 Z" strokeWidth="1.1" strokeLinejoin="round" /></>, cls: 'd-float' },
  // Code brackets
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><path d="M7 5 L3 11 L7 17" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" /><path d="M15 5 L19 11 L15 17" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" /><path d="M12 3 L10 19" strokeWidth="1" strokeLinecap="round" /></>, cls: 'd-spin' },
  // Link chain
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><rect x="2" y="8" width="7" height="6" rx="3" strokeWidth="1.1" transform="rotate(-45 5.5 11)" /><rect x="13" y="8" width="7" height="6" rx="3" strokeWidth="1.1" transform="rotate(-45 16.5 11)" /></>, cls: 'd-drift' },
  // Calendar
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><rect x="2" y="4" width="18" height="16" rx="2" strokeWidth="1.1" /><path d="M2 9 L20 9" strokeWidth="0.8" /><path d="M7 2 V5 M15 2 V5" strokeWidth="1.1" strokeLinecap="round" /><circle cx="7" cy="13" r="1" fill="white" fillOpacity="0.4" /><circle cx="11" cy="13" r="1" fill="white" fillOpacity="0.4" /><circle cx="15" cy="13" r="1" fill="white" fillOpacity="0.4" /></>, cls: 'd-bounce' },
  // Pie chart
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><circle cx="11" cy="11" r="9" strokeWidth="1.1" /><path d="M11 2 A9 9 0 0 1 20 11 L11 11 Z" strokeWidth="0.8" fill="white" fillOpacity="0.15" /><path d="M11 11 L2 11 A9 9 0 0 0 6 18" strokeWidth="0.8" fill="none" /></>, cls: 'd-sway' },
  // Search magnifier
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><circle cx="9" cy="9" r="6" strokeWidth="1.2" /><path d="M14 14 L20 20" strokeWidth="1.5" strokeLinecap="round" /></>, cls: 'd-rise' },
  // Stack layers
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><path d="M2 8 L11 3 L20 8 L11 13 Z" strokeWidth="1.1" strokeLinejoin="round" fill="none" /><path d="M2 12 L11 17 L20 12" strokeWidth="0.9" strokeLinecap="round" fill="none" /></>, cls: 'd-float' },
  // Image / photo frame
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><rect x="2" y="3" width="18" height="16" rx="2" strokeWidth="1.1" /><path d="M2 15 L7 10 L11 14 L15 9 L20 14" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" fill="none" /><circle cx="7" cy="8" r="1.5" strokeWidth="0.8" /></>, cls: 'd-drift' },
  // Upload arrow
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><path d="M11 3 L11 15" strokeWidth="1.2" strokeLinecap="round" /><path d="M7 7 L11 3 L15 7" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" /><path d="M3 15 L3 18 C3 19 4 20 5 20 L17 20 C18 20 19 19 19 18 L19 15" strokeWidth="1" strokeLinecap="round" /></>, cls: 'd-spin' },
  // Download arrow
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><path d="M11 3 L11 15" strokeWidth="1.2" strokeLinecap="round" /><path d="M7 12 L11 16 L15 12" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" /><path d="M3 15 L3 18 C3 19 4 20 5 20 L17 20 C18 20 19 19 19 18 L19 15" strokeWidth="1" strokeLinecap="round" /></>, cls: 'd-bounce' },
  // Heart pulse / health
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><path d="M11 18 C7 14 2 10 2 7 C2 4 5 3 7 3 C9 3 10 4 11 5 C12 4 13 3 15 3 C17 3 20 4 20 7 C20 10 15 14 11 18 Z" strokeWidth="1" fill="none" /><path d="M5 11 H8 L10 8 L12 13 L14 10 L17 11" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></>, cls: 'd-sway' },
  // Target / bullseye
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><circle cx="11" cy="11" r="9" strokeWidth="1" /><circle cx="11" cy="11" r="5" strokeWidth="0.8" /><circle cx="11" cy="11" r="1.5" fill="white" fillOpacity="0.3" /></>, cls: 'd-drift' },
  // Clipboard
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><rect x="3" y="4" width="16" height="16" rx="2" strokeWidth="1.1" /><path d="M7 4 L7 2 L15 2 L15 4" strokeWidth="1" strokeLinecap="round" /><path d="M7 9 L15 9 M7 12 L15 12 M7 15 L12 15" strokeWidth="0.7" strokeLinecap="round" /></>, cls: 'd-bounce' },
  // Bell notification
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><path d="M8 17 C8 18.5 9 20 11 20 C13 20 14 18.5 14 17" strokeWidth="0.9" /><path d="M4 14 C4 9 7 5 11 5 C15 5 18 9 18 14 Z" strokeWidth="1.1" /><circle cx="11" cy="3" r="1.2" strokeWidth="0.8" /></>, cls: 'd-rise' },
  // Globe network
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><circle cx="11" cy="11" r="9" strokeWidth="1" /><ellipse cx="11" cy="11" rx="4" ry="9" strokeWidth="0.7" /><path d="M2 11 H20" strokeWidth="0.6" /><path d="M4 6 H18 M4 16 H18" strokeWidth="0.5" /></>, cls: 'd-float' },
  // Palette / color wheel
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><path d="M11 2 C6 2 2 6 2 11 C2 14 4 17 7 18 C8 15 10 14 11 14 C13 14 14 15 14 17 C16 17 19 15 19 12 C19 6 15 2 11 2 Z" strokeWidth="1.1" /><circle cx="7" cy="8" r="1.3" strokeWidth="0.7" fill="white" fillOpacity="0.3" /><circle cx="11" cy="6" r="1.3" strokeWidth="0.7" fill="white" fillOpacity="0.3" /><circle cx="15" cy="8" r="1.3" strokeWidth="0.7" fill="white" fillOpacity="0.3" /></>, cls: 'd-spin' },
  // Film reel / cinema
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><rect x="2" y="3" width="18" height="16" rx="3" strokeWidth="1.1" /><circle cx="7" cy="7" r="1.5" strokeWidth="0.7" /><circle cx="15" cy="7" r="1.5" strokeWidth="0.7" /><circle cx="7" cy="15" r="1.5" strokeWidth="0.7" /><circle cx="15" cy="15" r="1.5" strokeWidth="0.7" /><circle cx="11" cy="11" r="2.5" strokeWidth="0.8" /></>, cls: 'd-sway' },
  // Handshake / collab
  { type: 'svg', w: 15, h: 15, view: '0 0 24 24', content: <><path d="M3 10 L8 10 L10 12 L14 8 L16 10 L21 10" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" /><path d="M10 12 L8 14 L10 16 L12 14" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /><path d="M14 8 L16 10 L14 12 L12 10" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></>, cls: 'd-drift' },
  // Shield / security
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><path d="M11 2 L3 6 V12 C3 16 7 19 11 21 C15 19 19 16 19 12 V6 Z" strokeWidth="1.1" strokeLinejoin="round" /><path d="M8 11 L10 13 L14 9" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" /></>, cls: 'd-bounce' },
  // Zap / flash
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><path d="M13 2 L5 12 L10 12 L8 20 L17 10 L12 10 Z" strokeWidth="1" strokeLinejoin="round" fill="none" /></>, cls: 'd-rise' },
  // Tag / label
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><path d="M2 12 L2 3 L11 3 L20 12 L11 20 Z" strokeWidth="1.1" strokeLinejoin="round" /><circle cx="6" cy="7" r="1.5" strokeWidth="0.8" fill="white" fillOpacity="0.3" /></>, cls: 'd-float' },
  // Seedling / growth
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><path d="M11 20 L11 10" strokeWidth="1.2" strokeLinecap="round" /><path d="M11 10 C11 6 7 4 4 5 C4 8 7 10 11 10 Z" strokeWidth="1" fill="none" /><path d="M11 12 C11 9 15 7 18 8 C18 11 15 12 11 12 Z" strokeWidth="1" fill="none" /><path d="M7 20 L15 20" strokeWidth="0.8" strokeLinecap="round" /></>, cls: 'd-sway' },
  // Layer / stack
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><path d="M11 3 L2 8 L11 13 L20 8 Z" strokeWidth="1" strokeLinejoin="round" fill="none" /><path d="M2 12 L11 17 L20 12" strokeWidth="0.9" strokeLinecap="round" fill="none" /></>, cls: 'd-drift' },
  // Smiley / emoji
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><circle cx="11" cy="11" r="9" strokeWidth="1.1" /><circle cx="8" cy="9" r="1" fill="white" fillOpacity="0.4" /><circle cx="14" cy="9" r="1" fill="white" fillOpacity="0.4" /><path d="M7 14 C8 16 14 16 15 14" strokeWidth="0.9" strokeLinecap="round" fill="none" /></>, cls: 'd-spin' },
  // Cursor click
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><circle cx="11" cy="11" r="3" strokeWidth="1.1" /><circle cx="11" cy="11" r="7" strokeWidth="0.7" strokeDasharray="2 3" /></>, cls: 'd-bounce' },
  // Waves / water
  { type: 'svg', w: 16, h: 14, view: '0 0 26 22', content: <><path d="M1 8 C4 5 8 11 13 8 C18 5 22 11 25 8" strokeWidth="1" strokeLinecap="round" fill="none" /><path d="M1 13 C4 10 8 16 13 13 C18 10 22 16 25 13" strokeWidth="0.8" strokeLinecap="round" fill="none" /></>, cls: 'd-sway' },
  // Dot grid
  { type: 'svg', w: 14, h: 14, view: '0 0 22 22', content: <><circle cx="5" cy="5" r="1.5" fill="white" fillOpacity="0.4" /><circle cx="11" cy="5" r="1.5" fill="white" fillOpacity="0.4" /><circle cx="17" cy="5" r="1.5" fill="white" fillOpacity="0.4" /><circle cx="5" cy="11" r="1.5" fill="white" fillOpacity="0.4" /><circle cx="11" cy="11" r="1.5" fill="white" fillOpacity="0.4" /><circle cx="17" cy="11" r="1.5" fill="white" fillOpacity="0.4" /><circle cx="5" cy="17" r="1.5" fill="white" fillOpacity="0.4" /><circle cx="11" cy="17" r="1.5" fill="white" fillOpacity="0.4" /><circle cx="17" cy="17" r="1.5" fill="white" fillOpacity="0.4" /></>, cls: 'd-float' },
  // Tiny decorative shapes
  { type: 'shape', shape: 'circle', cls: 'd-bounce' },
  { type: 'shape', shape: 'circle', cls: 'd-rise' },
  { type: 'shape', shape: 'circle', cls: 'd-drift' },
  { type: 'shape', shape: 'diamond', cls: 'd-sway' },
  { type: 'shape', shape: 'diamond', cls: 'd-spin' },
  { type: 'shape', shape: 'plus', cls: 'd-bounce' },
  { type: 'shape', shape: 'plus', cls: 'd-rise' },
  { type: 'shape', shape: 'cross', cls: 'd-drift' },
  { type: 'shape', shape: 'cross', cls: 'd-rise' },
  { type: 'shape', shape: 'star', cls: 'd-spin' },
  { type: 'shape', shape: 'triangle', cls: 'd-float' },
  { type: 'shape', shape: 'triangle', cls: 'd-bounce' },
  { type: 'shape', shape: 'square', cls: 'd-rise' },
  { type: 'shape', shape: 'square', cls: 'd-sway' },
  { type: 'shape', shape: 'ring', cls: 'd-float' },
  { type: 'shape', shape: 'ring', cls: 'd-sway' },
  { type: 'shape', shape: 'sparkle', cls: 'd-rise' },
  { type: 'shape', shape: 'sparkle', cls: 'd-spin' },
  { type: 'shape', shape: 'sparkle', cls: 'd-bounce' },
  { type: 'shape', shape: 'dotdot', cls: 'd-drift' },
  { type: 'shape', shape: 'dotdot', cls: 'd-sway' },
];

const positions = [
  { top: '3%', left: '18%' }, { top: '6%', left: '70%' }, { top: '9%', left: '42%' },
  { top: '11%', left: '88%' }, { top: '13%', left: '28%' }, { top: '15%', left: '55%' },
  { top: '17%', left: '78%' }, { top: '19%', left: '12%' }, { top: '21%', left: '50%' },
  { top: '23%', left: '35%' }, { top: '25%', left: '92%' }, { top: '27%', left: '64%' },
  { top: '29%', left: '20%' }, { top: '31%', left: '46%' }, { top: '33%', left: '8%' },
  { top: '35%', left: '82%' }, { top: '37%', left: '30%' }, { top: '39%', left: '58%' },
  { top: '41%', left: '72%' }, { top: '43%', left: '15%' }, { top: '45%', left: '40%' },
  { top: '47%', left: '88%' }, { top: '49%', left: '26%' }, { top: '51%', left: '62%' },
  { top: '53%', left: '10%' }, { top: '55%', left: '78%' }, { top: '57%', left: '34%' },
  { top: '59%', left: '52%' }, { top: '61%', left: '92%' }, { top: '63%', left: '18%' },
  { top: '65%', left: '68%' }, { top: '67%', left: '38%' }, { top: '69%', left: '6%' },
  { top: '71%', left: '84%' }, { top: '73%', left: '24%' }, { top: '75%', left: '56%' },
  { top: '77%', left: '74%' }, { top: '79%', left: '14%' }, { top: '81%', left: '48%' },
  { top: '83%', left: '64%' }, { top: '85%', left: '30%' }, { top: '87%', left: '10%' },
  { top: '89%', left: '80%' }, { top: '91%', left: '42%' }, { top: '93%', left: '22%' },
  { top: '95%', left: '58%' }, { top: '97%', left: '36%' }, { top: '5%', left: '96%' },
  { top: '9%', left: '6%' }, { top: '13%', left: '94%' }, { top: '17%', left: '4%' },
  { top: '21%', left: '96%' }, { top: '25%', left: '6%' }, { top: '29%', left: '94%' },
  { top: '33%', left: '4%' }, { top: '37%', left: '96%' }, { top: '41%', left: '6%' },
  { top: '45%', left: '94%' }, { top: '49%', left: '4%' }, { top: '53%', left: '96%' },
  { top: '57%', left: '6%' }, { top: '61%', left: '94%' }, { top: '65%', left: '4%' },
  { top: '69%', left: '96%' }, { top: '73%', left: '6%' }, { top: '77%', left: '94%' },
  { top: '81%', left: '4%' }, { top: '85%', left: '96%' }, { top: '89%', left: '6%' },
  { top: '93%', left: '94%' }, { top: '97%', left: '4%' },
];

function DoodleIcon({ icon, pos, variant }) {
  const base = {
    position: 'absolute',
    top: pos.top,
    left: pos.left,
    opacity: variant.opacity,
    transform: variant.rotate ? `rotate(${variant.rotate}deg)` : undefined,
    animationDelay: variant.delay,
    pointerEvents: 'none',
  };
  if (icon.type === 'svg') {
    const w = Math.round(icon.w * variant.scale);
    const h = Math.round(icon.h * variant.scale);
    return (
      <svg className={icon.cls} style={base} width={w} height={h} viewBox={icon.view} fill="none" stroke="white">
        {icon.content}
      </svg>
    );
  }
  const sz = Math.round((4 + (variant.rotate % 9)) * variant.scale);
  const s = { ...base };
  if (icon.shape === 'circle') {
    return <div className={icon.cls} style={{ ...s, width: sz, height: sz, borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />;
  }
  if (icon.shape === 'diamond') {
    return <div className={icon.cls} style={{ ...s, width: sz, height: sz, background: 'rgba(255,255,255,0.4)', transform: 'rotate(45deg)' }} />;
  }
  if (icon.shape === 'plus') {
    return <span className={icon.cls} style={{ ...s, fontSize: sz + 6, color: 'rgba(255,255,255,0.5)' }}>+</span>;
  }
  if (icon.shape === 'cross') {
    return <span className={icon.cls} style={{ ...s, fontSize: sz + 8, color: 'rgba(255,255,255,0.4)' }}>✕</span>;
  }
  if (icon.shape === 'star') {
    return <span className={icon.cls} style={{ ...s, fontSize: sz + 4, color: 'rgba(255,255,255,0.5)' }}>✦</span>;
  }
  if (icon.shape === 'triangle') {
    return <span className={icon.cls} style={{ ...s, fontSize: sz + 4, color: 'rgba(255,255,255,0.45)' }}>▲</span>;
  }
  if (icon.shape === 'square') {
    return <div className={icon.cls} style={{ ...s, width: sz, height: sz, background: 'rgba(255,255,255,0.35)' }} />;
  }
  if (icon.shape === 'ring') {
    return <div className={icon.cls} style={{ ...s, width: sz, height: sz, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.45)' }} />;
  }
  if (icon.shape === 'sparkle') {
    return <span className={icon.cls} style={{ ...s, fontSize: sz + 5, color: 'rgba(255,255,255,0.55)' }}>✧</span>;
  }
  if (icon.shape === 'dotdot') {
    return (
      <span className={icon.cls} style={{ ...s, display: 'inline-flex', flexDirection: 'column', gap: 3 }}>
        <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', display: 'block' }} />
        <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', display: 'block' }} />
      </span>
    );
  }
  return null;
}

function GradientOrbs() {
  return (
    <div className="doodle-orbs" aria-hidden="true">
      <div className="doodle-orb orb-1" />
      <div className="doodle-orb orb-2" />
      <div className="doodle-orb orb-3" />
    </div>
  );
}

function WavePattern() {
  return (
    <svg className="doodle-wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 60 C360 120, 720 0, 1080 60 C1260 90, 1380 30, 1440 60" fill="none" stroke="rgba(139,92,246,0.08)" strokeWidth="1.5" />
      <path d="M0 80 C320 20, 640 100, 960 40 C1200 0, 1360 80, 1440 50" fill="none" stroke="rgba(236,72,153,0.06)" strokeWidth="1" />
    </svg>
  );
}

function FloatingParticles() {
  const particles = useMemo(() =>
    Array.from({ length: 18 }).map((_, i) => ({
      left: (i * 5.7 + 3) % 100,
      size: 2 + (i % 4),
      delay: (i * 1.3) % 8,
      dur: 6 + (i % 5) * 2,
      opacity: 0.15 + (i % 3) * 0.08,
    })), []);
  return (
    <div className="doodle-particles" aria-hidden="true">
      {particles.map((p, i) => (
        <div
          key={i}
          className="doodle-particle"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}

export default function DoodleBackground() {
  const items = useMemo(() => {
    return icons.map((icon, i) => {
      const seed = i * 2654435761 % 1000;
      return {
        ...icon,
        pos: positions[i % positions.length],
        variant: {
          opacity: 0.1 + ((seed % 7) / 100),
          scale: 0.85 + ((seed % 5) / 10),
          rotate: (seed % 46) - 23,
          delay: `${(seed % 14) * 0.25}s`,
        },
      };
    });
  }, []);
  return (
    <div className="doodle-bg">
      <GradientOrbs />
      <WavePattern />
      <FloatingParticles />
      {items.map((item, i) => <DoodleIcon key={i} icon={item} pos={item.pos} variant={item.variant} />)}
    </div>
  );
}
