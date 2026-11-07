/**
 * Stillpoint design tokens. Dark-first: deep indigo fading to near-black,
 * soft violet and teal glows, large readable type.
 */

export const colors = {
  bg: '#07071A',
  bgTop: '#14123A',
  surface: '#111232',
  surfaceRaised: '#1A1B44',
  border: 'rgba(196, 190, 255, 0.12)',
  borderStrong: 'rgba(196, 190, 255, 0.28)',

  text: '#EEEDFF',
  textMuted: '#B4B2D9',
  textFaint: '#7D7BA8',

  /** Meditation accent */
  violet: '#A797FF',
  violetDeep: '#5B4BD6',
  /** Breath accent */
  teal: '#6FE0CF',
  tealDeep: '#1F8F86',
  /** Journal / heart accent */
  amber: '#F6C08E',
  amberDeep: '#B4693A',

  danger: '#FF7A7A',
  dangerDeep: '#B3262E',
  onAccent: '#0B0A22',
} as const;

export const glow = {
  violet: 'rgba(132, 110, 255, 0.55)',
  teal: 'rgba(80, 210, 190, 0.45)',
  amber: 'rgba(246, 170, 110, 0.40)',
} as const;

export type Accent = 'violet' | 'teal' | 'amber';

export const accentColor: Record<Accent, string> = {
  violet: colors.violet,
  teal: colors.teal,
  amber: colors.amber,
};

export const accentDeep: Record<Accent, string> = {
  violet: colors.violetDeep,
  teal: colors.tealDeep,
  amber: colors.amberDeep,
};

/**
 * Type scale. Sizes scale with the system Dynamic Type setting
 * (React Native's allowFontScaling is on by default); the biggest styles
 * cap their multiplier so layouts don't break at the largest sizes.
 */
export const type = {
  display: { fontSize: 40, lineHeight: 46, fontWeight: '300' as const, letterSpacing: -0.5 },
  title: { fontSize: 30, lineHeight: 36, fontWeight: '400' as const, letterSpacing: -0.3 },
  heading: { fontSize: 22, lineHeight: 28, fontWeight: '500' as const },
  body: { fontSize: 18, lineHeight: 26, fontWeight: '400' as const },
  label: { fontSize: 16, lineHeight: 22, fontWeight: '600' as const, letterSpacing: 0.2 },
  caption: { fontSize: 15, lineHeight: 20, fontWeight: '400' as const },
  overline: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600' as const,
    letterSpacing: 1.6,
    textTransform: 'uppercase' as const,
  },
  timer: { fontSize: 64, lineHeight: 72, fontWeight: '200' as const, fontVariant: ['tabular-nums' as const] },
};

export type TypeVariant = keyof typeof type;

export const maxScale: Partial<Record<TypeVariant, number>> = {
  display: 1.4,
  title: 1.5,
  timer: 1.3,
};

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 12,
  md: 18,
  lg: 28,
  pill: 999,
} as const;

/** Minimum touch target (Apple HIG is 44pt; we go larger for calm UI). */
export const touch = 52;
