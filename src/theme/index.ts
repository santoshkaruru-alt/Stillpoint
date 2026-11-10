/**
 * Stillpoint design system: calm, natural palettes in light and dark,
 * a refined serif for headings (Cormorant Garamond) and a soft sans for
 * everything else (Manrope), generous space and quiet hairlines.
 *
 * Colours come from the active palette via useTheme(); this file holds the
 * scheme-independent tokens.
 */
import type { TextStyle } from 'react-native';

export { palettes, themeLabels, type Palette, type Scheme, type ThemeName } from './palettes';
export { makeStyles, ThemeProvider, useTheme } from './ThemeProvider';
export { withAlpha } from './color';

/** The three accent roles each palette provides. */
export type Accent = 'calm' | 'breath' | 'warm';

export const fonts = {
  serifLight: 'CormorantGaramond_300Light',
  serif: 'CormorantGaramond_400Regular',
  serifItalic: 'CormorantGaramond_400Regular_Italic',
  serifMedium: 'CormorantGaramond_500Medium',
  sans: 'Manrope_400Regular',
  sansMedium: 'Manrope_500Medium',
  sansSemi: 'Manrope_600SemiBold',
} as const;

/**
 * Type scale. Sizes follow the system text size (Dynamic Type on iOS);
 * the largest styles cap their growth so layouts hold.
 */
export const type = {
  display: { fontFamily: fonts.serifLight, fontSize: 44, lineHeight: 50, letterSpacing: -0.3 },
  title: { fontFamily: fonts.serif, fontSize: 34, lineHeight: 40, letterSpacing: -0.2 },
  heading: { fontFamily: fonts.serifMedium, fontSize: 25, lineHeight: 30 },
  quote: { fontFamily: fonts.serifItalic, fontSize: 22, lineHeight: 31 },
  body: { fontFamily: fonts.sans, fontSize: 17, lineHeight: 26 },
  label: { fontFamily: fonts.sansSemi, fontSize: 15, lineHeight: 20, letterSpacing: 0.3 },
  caption: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20 },
  overline: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },
  timer: { fontFamily: fonts.serifLight, fontSize: 80, lineHeight: 86, fontVariant: ['tabular-nums'] },
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
