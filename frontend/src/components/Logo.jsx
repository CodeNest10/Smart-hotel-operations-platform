import React from 'react';

/**
 * SmartHotel logo mark — hotel building + smart WiFi arcs + golden beacon.
 * Designed to render crisply at any size (16px favicon → 512px splash).
 *
 * Props:
 *   size        – pixel size of the square mark  (default 36)
 *   showText    – render the wordmark beside the mark (default true)
 *   textColor   – color of the wordmark text (default '#1A1A1A')
 *   variant     – 'default' | 'white'  (white = all-white wordmark for dark backgrounds)
 */
function Logo({ size = 36, showText = true, variant = 'default' }) {
  const isWhite = variant === 'white';
  const smartColor  = isWhite ? 'rgba(255,255,255,0.55)' : '#767676';
  const hotelColor  = isWhite ? '#FFFFFF'                : '#0A1628';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, userSelect: 'none' }}>

      {/* ── Mark ─────────────────────────────────────── */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="SmartHotel logo"
        role="img"
        style={{ flexShrink: 0, display: 'block' }}
      >
        <defs>
          <linearGradient id="lbg" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#0B1F3A"/>
            <stop offset="100%" stopColor="#0055A5"/>
          </linearGradient>
          <linearGradient id="lbld" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#FFFFFF"/>
            <stop offset="100%" stopColor="#D6E8FF"/>
          </linearGradient>
          <linearGradient id="lwin" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#003580"/>
            <stop offset="100%" stopColor="#001A50"/>
          </linearGradient>
          <filter id="lglow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width="100" height="100" rx="22" fill="url(#lbg)"/>

        {/* Ground glow */}
        <ellipse cx="50" cy="93" rx="32" ry="7" fill="#0070CC" opacity="0.22"/>

        {/* WiFi arcs */}
        <path d="M26 17 Q50 1 74 17"  stroke="#FFC72C" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.35"/>
        <path d="M32 14 Q50 2 68 14"  stroke="#FFC72C" strokeWidth="2.8" fill="none" strokeLinecap="round" opacity="0.60"/>
        <path d="M38 20 Q50 12 62 20" stroke="#FFC72C" strokeWidth="3.2" fill="none" strokeLinecap="round" opacity="0.90"/>

        {/* Beacon */}
        <circle cx="50" cy="26" r="4.5" fill="#FFC72C" filter="url(#lglow)"/>
        <circle cx="50" cy="26" r="2"   fill="#FFFFFF"/>

        {/* Roof */}
        <path d="M14 49 L50 26 L86 49 Z" fill="url(#lbld)"/>

        {/* Building body */}
        <rect x="18" y="47" width="64" height="50" rx="3" fill="url(#lbld)"/>

        {/* Windows row 1 */}
        <rect x="23" y="54" width="14" height="11" rx="2" fill="url(#lwin)" opacity="0.70"/>
        <rect x="43" y="54" width="14" height="11" rx="2" fill="url(#lwin)" opacity="0.70"/>
        <rect x="63" y="54" width="14" height="11" rx="2" fill="url(#lwin)" opacity="0.70"/>
        {/* Window shine */}
        <rect x="23" y="54" width="14" height="3" rx="1" fill="#FFFFFF" opacity="0.25"/>
        <rect x="43" y="54" width="14" height="3" rx="1" fill="#FFFFFF" opacity="0.25"/>
        <rect x="63" y="54" width="14" height="3" rx="1" fill="#FFFFFF" opacity="0.25"/>

        {/* Windows row 2 */}
        <rect x="23" y="70" width="14" height="11" rx="2" fill="url(#lwin)" opacity="0.70"/>
        <rect x="63" y="70" width="14" height="11" rx="2" fill="url(#lwin)" opacity="0.70"/>
        <rect x="23" y="70" width="14" height="3"  rx="1" fill="#FFFFFF" opacity="0.20"/>
        <rect x="63" y="70" width="14" height="3"  rx="1" fill="#FFFFFF" opacity="0.20"/>

        {/* Door */}
        <rect x="43" y="68" width="14" height="29" rx="2.5" fill="url(#lwin)" opacity="0.75"/>
        <circle cx="54" cy="83" r="1.5" fill="#FFC72C" opacity="0.9"/>

        {/* Building edge highlight */}
        <rect x="18" y="47" width="64" height="50" rx="3" fill="none" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.18"/>
      </svg>

      {/* ── Wordmark ──────────────────────────────────── */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, gap: 1 }}>
          <span style={{
            fontSize: size * 0.28,
            fontWeight: 400,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: smartColor,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}>
            Smart
          </span>
          <span style={{
            fontSize: size * 0.38,
            fontWeight: 900,
            letterSpacing: '-0.02em',
            color: hotelColor,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}>
            Hotel
          </span>
        </div>
      )}
    </div>
  );
}

export default Logo;
