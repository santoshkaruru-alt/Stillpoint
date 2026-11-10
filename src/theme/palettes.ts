/**
 * Colour palettes. Each theme has a light ("day") and dark ("night")
 * version. Three accents per palette:
 *   calm   - meditation, primary actions
 *   breath - breathwork
 *   warm   - journal, intention, safety
 * Text colours meet WCAG AA (4.5:1) on `bg`; accents carry white or ink
 * text at 4.5:1 or better (see src/theme/__tests__/contrast.test.ts).
 */

export type ThemeName = 'sage' | 'sand' | 'mist';
export type Scheme = 'light' | 'dark';

export interface Palette {
  scheme: Scheme;
  bg: string;
  bgDeep: string;
  surface: string;
  surfaceRaised: string;
  line: string;
  lineStrong: string;
  text: string;
  textSoft: string;
  textFaint: string;
  calm: string;
  calmSoft: string;
  breath: string;
  breathSoft: string;
  warm: string;
  warmSoft: string;
  onAccent: string;
  danger: string;
  onDanger: string;
  /** Soft light behind content (sun by day, moon by night). */
  halo: string;
  /** Hold-trend chart line, validated against the card surface. */
  chart: string;
  /** Opaque colour matching cards, for chart dot rings. */
  cardSolid: string;
  shadow: string;
  scrim: string;
  tabBar: string;
}

export const themeLabels: Record<ThemeName, { name: string; description: string }> = {
  sage: { name: 'Sage', description: 'Moss, stone and rice paper' },
  sand: { name: 'Sand', description: 'Clay, driftwood and sea glass' },
  mist: { name: 'Mist', description: 'Mountain dusk and still water' },
};

export const palettes: Record<ThemeName, Record<Scheme, Palette>> = {
  sage: {
    light: {
      scheme: 'light',
      bg: '#F2F0E9',
      bgDeep: '#E7E5DA',
      surface: '#FAF9F4',
      surfaceRaised: '#FFFFFF',
      line: 'rgba(43, 48, 36, 0.10)',
      lineStrong: 'rgba(43, 48, 36, 0.22)',
      text: '#24281F',
      textSoft: '#51574B',
      textFaint: '#61675B',
      calm: '#516C4D',
      calmSoft: 'rgba(90, 117, 86, 0.12)',
      breath: '#436B72',
      breathSoft: 'rgba(74, 120, 128, 0.12)',
      warm: '#8C5834',
      warmSoft: 'rgba(162, 99, 63, 0.12)',
      onAccent: '#FFFFFF',
      danger: '#AE4129',
      onDanger: '#FFFFFF',
      halo: 'rgba(214, 196, 150, 0.55)',
      chart: '#4A7880',
      cardSolid: '#FAF9F4',
      shadow: '#3A3A28',
      scrim: 'rgba(242, 240, 233, 0.92)',
      tabBar: 'rgba(246, 245, 239, 0.94)',
    },
    dark: {
      scheme: 'dark',
      bg: '#111411',
      bgDeep: '#0A0C0A',
      surface: 'rgba(236, 233, 222, 0.045)',
      surfaceRaised: 'rgba(236, 233, 222, 0.08)',
      line: 'rgba(236, 233, 222, 0.09)',
      lineStrong: 'rgba(236, 233, 222, 0.20)',
      text: '#ECE9DE',
      textSoft: '#B5B5A7',
      textFaint: '#8A8D80',
      calm: '#A9BE9F',
      calmSoft: 'rgba(169, 190, 159, 0.13)',
      breath: '#93BFC0',
      breathSoft: 'rgba(147, 191, 192, 0.13)',
      warm: '#E0AD8A',
      warmSoft: 'rgba(224, 173, 138, 0.13)',
      onAccent: '#111411',
      danger: '#E8846E',
      onDanger: '#1A0E0B',
      halo: 'rgba(196, 206, 176, 0.16)',
      chart: '#5E9A9C',
      cardSolid: '#1A1D19',
      shadow: '#000000',
      scrim: 'rgba(5, 6, 5, 0.9)',
      tabBar: 'rgba(17, 20, 17, 0.94)',
    },
  },
  sand: {
    light: {
      scheme: 'light',
      bg: '#F5EEE4',
      bgDeep: '#EADFCE',
      surface: '#FCF8F2',
      surfaceRaised: '#FFFFFF',
      line: 'rgba(60, 40, 22, 0.10)',
      lineStrong: 'rgba(60, 40, 22, 0.22)',
      text: '#2E241C',
      textSoft: '#5F5246',
      textFaint: '#6E6053',
      calm: '#885639',
      calmSoft: 'rgba(154, 95, 66, 0.12)',
      breath: '#3D6A62',
      breathSoft: 'rgba(69, 122, 114, 0.12)',
      warm: '#7C5C1E',
      warmSoft: 'rgba(132, 100, 33, 0.12)',
      onAccent: '#FFFFFF',
      danger: '#AE4129',
      onDanger: '#FFFFFF',
      halo: 'rgba(230, 180, 130, 0.45)',
      chart: '#457A72',
      cardSolid: '#FCF8F2',
      shadow: '#4A3220',
      scrim: 'rgba(245, 238, 228, 0.92)',
      tabBar: 'rgba(248, 243, 235, 0.94)',
    },
    dark: {
      scheme: 'dark',
      bg: '#16120E',
      bgDeep: '#0D0A08',
      surface: 'rgba(240, 230, 216, 0.045)',
      surfaceRaised: 'rgba(240, 230, 216, 0.08)',
      line: 'rgba(240, 230, 216, 0.09)',
      lineStrong: 'rgba(240, 230, 216, 0.20)',
      text: '#F0E6D8',
      textSoft: '#BFB09E',
      textFaint: '#918472',
      calm: '#E2A684',
      calmSoft: 'rgba(226, 166, 132, 0.13)',
      breath: '#8FC3B8',
      breathSoft: 'rgba(143, 195, 184, 0.13)',
      warm: '#D9B66A',
      warmSoft: 'rgba(217, 182, 106, 0.13)',
      onAccent: '#16120E',
      danger: '#E8846E',
      onDanger: '#1A0E0B',
      halo: 'rgba(226, 166, 132, 0.15)',
      chart: '#5E9C90',
      cardSolid: '#201B16',
      shadow: '#000000',
      scrim: 'rgba(8, 6, 4, 0.9)',
      tabBar: 'rgba(22, 18, 14, 0.94)',
    },
  },
  mist: {
    light: {
      scheme: 'light',
      bg: '#EEF0F3',
      bgDeep: '#E1E5EC',
      surface: '#F8F9FB',
      surfaceRaised: '#FFFFFF',
      line: 'rgba(30, 38, 56, 0.10)',
      lineStrong: 'rgba(30, 38, 56, 0.22)',
      text: '#212632',
      textSoft: '#525A69',
      textFaint: '#5D6575',
      calm: '#526492',
      calmSoft: 'rgba(86, 104, 154, 0.12)',
      breath: '#356C7A',
      breathSoft: 'rgba(59, 120, 134, 0.12)',
      warm: '#7C597F',
      warmSoft: 'rgba(133, 98, 140, 0.12)',
      onAccent: '#FFFFFF',
      danger: '#AE4129',
      onDanger: '#FFFFFF',
      halo: 'rgba(170, 186, 222, 0.55)',
      chart: '#3B7886',
      cardSolid: '#F8F9FB',
      shadow: '#1E2638',
      scrim: 'rgba(238, 240, 243, 0.92)',
      tabBar: 'rgba(243, 245, 247, 0.94)',
    },
    dark: {
      scheme: 'dark',
      bg: '#0F121A',
      bgDeep: '#090B10',
      surface: 'rgba(230, 233, 240, 0.045)',
      surfaceRaised: 'rgba(230, 233, 240, 0.08)',
      line: 'rgba(230, 233, 240, 0.09)',
      lineStrong: 'rgba(230, 233, 240, 0.20)',
      text: '#E6E9F0',
      textSoft: '#AFB6C4',
      textFaint: '#828A9A',
      calm: '#AAB8DD',
      calmSoft: 'rgba(170, 184, 221, 0.13)',
      breath: '#8CC4CE',
      breathSoft: 'rgba(140, 196, 206, 0.13)',
      warm: '#CFAED5',
      warmSoft: 'rgba(207, 174, 213, 0.13)',
      onAccent: '#0F121A',
      danger: '#E8846E',
      onDanger: '#1A0E0B',
      halo: 'rgba(170, 184, 221, 0.16)',
      chart: '#5E97A3',
      cardSolid: '#181C25',
      shadow: '#000000',
      scrim: 'rgba(4, 5, 8, 0.9)',
      tabBar: 'rgba(15, 18, 26, 0.94)',
    },
  },
};
