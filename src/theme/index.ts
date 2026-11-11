/**
 * Stillpoint design system: calm, natural palettes in light and dark,
 * a refined serif for headings (Cormorant Garamond) and a soft sans for
 * everything else (Manrope), generous space and quiet hairlines.
 *
 * Colours come from the active palette via useTheme(); this file holds the
 * scheme-independent tokens.
 */
import type { TextStyle } from 'react-native';

export { DEFAULT_THEME, palettes, themeLabels, type Palette, type SceneColors, type Scheme, type ThemeName } from './palettes';
export { makeStyles, ThemeProvider, useTheme } from './ThemeProvider';
export { withAlpha } from './color';

/** The three accent roles each palette provides. */
export type Accent = 'calm' | 'breath' | 'warm';

export const fonts = {
  serif: 'CormorantGaramond_500Medium',
  serifItalic: 'CormorantGaramond_500Medium_Italic',
  serifSemi: 'CormorantGaramond_600SemiBold',
  sans: 'Manrope_500Medium',
  sansMedium: 'Manrope_500Medium',
  sansSemi: 'Manrope_600SemiBold',
  sansBold: 'Manrope_700Bold',
} as const;

/**
 * Type scale. Sizes follow the system text size (Dynamic Type on iOS);
 * the largest styles cap their growth so layouts hold. Weights are kept
 * medium or heavier: the serif's light cuts are hard to read on a phone.
 */
export const type = {
  display: { fontFamily: fonts.serif, fontSize: 44, lineHeight: 50, letterSpacing: -0.2 },
  title: { fontFamily: fonts.serif, fontSize: 35, lineHeight: 41, letterSpacing: -0.1 },
  heading: { fontFamily: fonts.serifSemi, fontSize: 25, lineHeight: 30 },
  quote: { fontFamily: fonts.serifItalic, fontSize: 23, lineHeight: 32 },
  body: { fontFamily: fonts.sans, fontSize: 17, lineHeight: 26 },
  label: { fontFamily: fonts.sansSemi, fontSize: 16, lineHeight: 21, letterSpacing: 0.2 },
  caption: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 21 },
  overline: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  timer: { fontFamily: fonts.serif, fontSize: 80, lineHeight: 86, fontVariant: ['tabular-nums'] },
} satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof type;

export const maxScale: Partial<Record<TypeVariant, number>> = {
  display: 1.35,
  title: 1.4,
  timer: 1.25,
  quote: 1.5,
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
  lg: 26,
  pill: 999,
} as const;

/** Minimum touch target (Apple HIG is 44pt; we go larger for calm UI). */
export const touch = 52;

/** Slow, soft motion timings (ms). */
export const motion = {
  fade: 700,
  settle: 900,
} as const;
