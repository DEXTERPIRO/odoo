/**
 * neu.js — Neumorphic Design System Tokens
 * Single source of truth for all visual tokens.
 * Import N (values) and pre-built style objects in every component.
 */

// ─── Raw Token Values ────────────────────────────────────────────────────────
export const N = {
  // Colors
  bg:              '#E0E5EC',
  fg:              '#3D4852',
  muted:           '#6B7280',
  accent:          '#6C63FF',
  accentLight:     '#8B84FF',
  accentSecondary: '#38B2AC',
  danger:          '#E53E3E',
  warning:         '#D97706',
  white:           '#fff',

  // Shadow Primitives
  shadow:          '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255,0.5)',
  shadowHover:     '12px 12px 20px rgb(163,177,198,0.7), -12px -12px 20px rgba(255,255,255,0.6)',
  shadowSm:        '5px 5px 10px rgb(163,177,198,0.6), -5px -5px 10px rgba(255,255,255,0.5)',
  shadowInset:     'inset 6px 6px 10px rgb(163,177,198,0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
  shadowInsetDeep: 'inset 10px 10px 20px rgb(163,177,198,0.7), inset -10px -10px 20px rgba(255,255,255,0.6)',
  shadowInsetSm:   'inset 3px 3px 6px rgb(163,177,198,0.6), inset -3px -3px 6px rgba(255,255,255,0.5)',

  // Radii
  radius:      '32px',
  radiusMd:    '20px',
  radiusBtn:   '16px',
  radiusInner: '12px',
  radiusPill:  '9999px',

  // Typography
  font:        "'DM Sans', system-ui, sans-serif",
  fontDisplay: "'Plus Jakarta Sans', system-ui, sans-serif",

  // Transitions
  transition: 'all 300ms ease-out',
};

// ─── Pre-built Style Objects ─────────────────────────────────────────────────

/** Standard extruded card */
export const card = {
  background:   N.bg,
  borderRadius: N.radius,
  boxShadow:    N.shadow,
  padding:      '32px',
  transition:   N.transition,
  fontFamily:   N.font,
};

/** Smaller card variant */
export const cardSm = {
  background:   N.bg,
  borderRadius: N.radiusMd,
  boxShadow:    N.shadow,
  padding:      '20px',
  transition:   N.transition,
  fontFamily:   N.font,
};

/** Hovered card (spread over card to override shadow + transform) */
export const cardHover = {
  boxShadow: N.shadowHover,
  transform: 'translateY(-2px)',
};

/** Standard neumorphic button */
export const btn = {
  background:   N.bg,
  borderRadius: N.radiusBtn,
  boxShadow:    N.shadow,
  border:       'none',
  cursor:       'pointer',
  transition:   N.transition,
  fontFamily:   N.font,
  fontWeight:   600,
  color:        N.fg,
  padding:      '12px 24px',
  fontSize:     '14px',
  display:      'inline-flex',
  alignItems:   'center',
  justifyContent: 'center',
  gap:          '8px',
  minHeight:    '44px',
};

export const btnHover = {
  boxShadow: N.shadowHover,
  transform: 'translateY(-1px)',
};

export const btnActive = {
  boxShadow: N.shadowInsetSm,
  transform: 'translateY(0.5px)',
};

/** Accent (violet) primary button */
export const btnPrimary = {
  ...btn,
  background: N.accent,
  color:      '#fff',
};

export const btnPrimaryHover = {
  boxShadow: N.shadowHover,
  transform: 'translateY(-1px)',
  background: N.accentLight,
};

export const btnPrimaryActive = {
  transform: 'translateY(0.5px)',
  boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.25), inset -4px -4px 8px rgba(255,255,255,0.1)',
};

/** Danger (red) button */
export const btnDanger = {
  ...btn,
  background: '#E53E3E',
  color:      '#fff',
};

/** Inset input well */
export const input = {
  background:    N.bg,
  borderRadius:  N.radiusBtn,
  boxShadow:     N.shadowInset,
  border:        'none',
  outline:       'none',
  padding:       '14px 18px',
  fontSize:      '15px',
  fontFamily:    N.font,
  color:         N.fg,
  width:         '100%',
  boxSizing:     'border-box',
  transition:    N.transition,
};

export const inputFocus = {
  boxShadow: N.shadowInsetDeep,
};

/** Uppercase micro-label */
export const label = {
  display:       'block',
  fontSize:      '11px',
  fontWeight:    700,
  color:         N.muted,
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
  marginBottom:  '8px',
  fontFamily:    N.font,
};

/** Deep-drilled icon well (circle) */
export const iconWell = (size = 48) => ({
  background:     N.bg,
  borderRadius:   '50%',
  boxShadow:      N.shadowInsetDeep,
  width:          size,
  height:         size,
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'center',
  flexShrink:     0,
});

/** Inset pill badge */
export const badge = (color = N.muted) => ({
  background:   N.bg,
  borderRadius: N.radiusPill,
  boxShadow:    N.shadowInsetSm,
  padding:      '4px 14px',
  fontSize:     '12px',
  fontWeight:   700,
  color,
  fontFamily:   N.font,
  display:      'inline-block',
});

/** Extruded pill badge */
export const badgeRaised = (color = N.muted) => ({
  background:   N.bg,
  borderRadius: N.radiusPill,
  boxShadow:    N.shadowSm,
  padding:      '4px 14px',
  fontSize:     '12px',
  fontWeight:   700,
  color,
  fontFamily:   N.font,
  display:      'inline-block',
});

/** Inset track (for progress bars, sliders) */
export const track = {
  background:   N.bg,
  borderRadius: N.radiusPill,
  boxShadow:    N.shadowInsetSm,
  overflow:     'hidden',
};

/** Page wrapper — always use this as the outermost container */
export const page = {
  minHeight:  '100vh',
  background: N.bg,
  fontFamily: N.font,
  color:      N.fg,
};
