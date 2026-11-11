/**
 * Colour palettes. Each theme has a light ("day") and dark ("night")
 * version, plus matching colours for the painted scenes. Three accents per palette:
 *   calm   - meditation, primary actions
 *   breath - breathwork
 *   warm   - journal, intention, safety
 * Text colours meet WCAG AA (4.5:1) on `bg`; accents carry white or ink
 * text at 4.5:1 or better (see src/theme/__tests__/contrast.test.ts).
 */

export type ThemeName = 'ocean' | 'forest' | 'dusk';
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
  /** Colours for the painted landscape scenes. */
  scene: SceneColors;
}

export interface SceneColors {
  skyTop: string;
  skyBottom: string;
  /** Sun by day, moon by night. */
  sun: string;
  sunGlow: string;
  ridgeFar: string;
  ridgeMid: string;
  ridgeNear: string;
  water: string;
  mist: string;
  /** Stars (only drawn at night). */
  star: string | null;
}

export const themeLabels: Record<ThemeName, { name: string; description: string }> = {
  ocean: { name: 'Ocean', description: 'Still water and deep sea blue' },
  forest: { name: 'Forest', description: 'Pine, moss and morning mist' },
  dusk: { name: 'Dusk', description: 'Twilight violet and first stars' },
};

export const palettes: Record<ThemeName, Record<Scheme, Palette>> = {
  ocean: {
    light: {
      scheme: 'light',
      bg: '#EDF3F6',
      bgDeep: '#DCE7EE',
      surface: '#F8FBFC',
      surfaceRaised: '#FFFFFF',
      line: 'rgba(16, 44, 64, 0.10)',
      lineStrong: 'rgba(16, 44, 64, 0.22)',
      text: '#11273A',
      textSoft: '#3D5466',
      textFaint: '#4E6577',
      calm: '#1C6A86',
      calmSoft: 'rgba(28, 106, 134, 0.12)',
      breath: '#21716F',
      breathSoft: 'rgba(33, 113, 111, 0.12)',
      warm: '#A65A3C',
      warmSoft: 'rgba(166, 90, 60, 0.12)',
      onAccent: '#FFFFFF',
      danger: '#AE4129',
      onDanger: '#FFFFFF',
      halo: 'rgba(255, 214, 170, 0.55)',
      chart: '#1C6A86',
      cardSolid: '#F8FBFC',
      shadow: '#0E2A3D',
      scrim: 'rgba(237, 243, 246, 0.92)',
      tabBar: 'rgba(243, 248, 250, 0.94)',
      scene: {
        skyTop: '#B7D4E4',
        skyBottom: '#F7E4D2',
        sun: '#FFF4E6',
        sunGlow: 'rgba(255, 210, 160, 0.75)',
        ridgeFar: '#A7C2D3',
        ridgeMid: '#7A9FB6',
        ridgeNear: '#45708C',
        water: '#8CB2C6',
        mist: 'rgba(255, 255, 255, 0.55)',
        star: null,
      },
    },
    dark: {
      scheme: 'dark',
      bg: '#091925',
      bgDeep: '#050F17',
      surface: 'rgba(220, 238, 246, 0.05)',
      surfaceRaised: 'rgba(220, 238, 246, 0.09)',
      line: 'rgba(220, 238, 246, 0.10)',
      lineStrong: 'rgba(220, 238, 246, 0.22)',
      text: '#E4F0F5',
      textSoft: '#A8BFCB',
      textFaint: '#8099A8',
      calm: '#7CC4DD',
      calmSoft: 'rgba(124, 196, 221, 0.14)',
      breath: '#7FD3C6',
      breathSoft: 'rgba(127, 211, 198, 0.14)',
      warm: '#F2A889',
      warmSoft: 'rgba(242, 168, 137, 0.14)',
      onAccent: '#06202C',
      danger: '#E8846E',
      onDanger: '#1A0E0B',
      halo: 'rgba(124, 196, 221, 0.18)',
      chart: '#4FA3BF',
      cardSolid: '#122431',
      shadow: '#000000',
      scrim: 'rgba(3, 9, 14, 0.9)',
      tabBar: 'rgba(9, 25, 37, 0.94)',
      scene: {
        skyTop: '#04101A',
        skyBottom: '#163650',
        sun: '#E6F0F5',
        sunGlow: 'rgba(160, 205, 232, 0.35)',
        ridgeFar: '#1C3D55',
        ridgeMid: '#122B40',
        ridgeNear: '#0A1E2E',
        water: '#10304A',
        mist: 'rgba(150, 195, 222, 0.12)',
        star: '#E6F0F5',
      },
    },
  },
  forest: {
    light: {
      scheme: 'light',
      bg: '#EEF4EE',
      bgDeep: '#DEE9DD',
      surface: '#F8FBF7',
      surfaceRaised: '#FFFFFF',
      line: 'rgba(20, 48, 30, 0.10)',
      lineStrong: 'rgba(20, 48, 30, 0.22)',
      text: '#15291B',
      textSoft: '#405747',
      textFaint: '#526857',
      calm: '#2B6A4A',
      calmSoft: 'rgba(43, 106, 74, 0.12)',
      breath: '#25706D',
      breathSoft: 'rgba(37, 112, 109, 0.12)',
      warm: '#98602F',
      warmSoft: 'rgba(152, 96, 47, 0.12)',
      onAccent: '#FFFFFF',
      danger: '#AE4129',
      onDanger: '#FFFFFF',
      halo: 'rgba(250, 226, 160, 0.55)',
      chart: '#2B6A4A',
      cardSolid: '#F8FBF7',
      shadow: '#13301E',
      scrim: 'rgba(238, 244, 238, 0.92)',
      tabBar: 'rgba(244, 249, 243, 0.94)',
      scene: {
        skyTop: '#C8E0D2',
        skyBottom: '#F4EDD8',
        sun: '#FFF7E2',
        sunGlow: 'rgba(255, 228, 160, 0.7)',
        ridgeFar: '#A5C3B0',
        ridgeMid: '#6D987E',
        ridgeNear: '#3A684F',
        water: '#8DB6A4',
        mist: 'rgba(255, 255, 255, 0.6)',
        star: null,
      },
    },
    dark: {
      scheme: 'dark',
      bg: '#0B1711',
      bgDeep: '#060E09',
      surface: 'rgba(222, 240, 228, 0.05)',
      surfaceRaised: 'rgba(222, 240, 228, 0.09)',
      line: 'rgba(222, 240, 228, 0.10)',
      lineStrong: 'rgba(222, 240, 228, 0.22)',
      text: '#E4EFE6',
      textSoft: '#A8BFAE',
      textFaint: '#7F9786',
      calm: '#8DCFA6',
      calmSoft: 'rgba(141, 207, 166, 0.14)',
      breath: '#84CFC8',
      breathSoft: 'rgba(132, 207, 200, 0.14)',
      warm: '#E8B07E',
      warmSoft: 'rgba(232, 176, 126, 0.14)',
      onAccent: '#0B1A12',
      danger: '#E8846E',
      onDanger: '#1A0E0B',
      halo: 'rgba(141, 207, 166, 0.16)',
      chart: '#5FA67B',
      cardSolid: '#14221A',
      shadow: '#000000',
      scrim: 'rgba(3, 8, 5, 0.9)',
      tabBar: 'rgba(11, 23, 17, 0.94)',
      scene: {
        skyTop: '#06130E',
        skyBottom: '#173628',
        sun: '#E6F0E8',
        sunGlow: 'rgba(170, 222, 190, 0.28)',
        ridgeFar: '#1D3E30',
        ridgeMid: '#142E23',
        ridgeNear: '#0B1F17',
        water: '#11302A',
        mist: 'rgba(170, 222, 190, 0.11)',
        star: '#E6F0E8',
      },
    },
  },
  dusk: {
    light: {
      scheme: 'light',
      bg: '#F1EFF6',
      bgDeep: '#E3DFEE',
      surface: '#FAF9FC',
      surfaceRaised: '#FFFFFF',
      line: 'rgba(36, 30, 70, 0.10)',
      lineStrong: 'rgba(36, 30, 70, 0.22)',
      text: '#211D36',
      textSoft: '#4E4966',
      textFaint: '#5F5A78',
      calm: '#54489A',
      calmSoft: 'rgba(84, 72, 154, 0.12)',
      breath: '#2A7385',
      breathSoft: 'rgba(42, 115, 133, 0.12)',
      warm: '#A64F61',
      warmSoft: 'rgba(166, 79, 97, 0.12)',
      onAccent: '#FFFFFF',
      danger: '#AE4129',
      onDanger: '#FFFFFF',
      halo: 'rgba(255, 196, 180, 0.55)',
      chart: '#54489A',
      cardSolid: '#FAF9FC',
      shadow: '#1E1840',
      scrim: 'rgba(241, 239, 246, 0.92)',
      tabBar: 'rgba(246, 244, 250, 0.94)',
      scene: {
        skyTop: '#B5B1DE',
        skyBottom: '#F7D3C4',
        sun: '#FFEDE2',
        sunGlow: 'rgba(255, 186, 166, 0.7)',
        ridgeFar: '#A6A0CE',
        ridgeMid: '#7B73AE',
        ridgeNear: '#4B4484',
        water: '#9C96CA',
        mist: 'rgba(255, 255, 255, 0.45)',
        star: null,
      },
    },
    dark: {
      scheme: 'dark',
      bg: '#110E21',
      bgDeep: '#0A0815',
      surface: 'rgba(236, 233, 248, 0.05)',
      surfaceRaised: 'rgba(236, 233, 248, 0.09)',
      line: 'rgba(236, 233, 248, 0.10)',
      lineStrong: 'rgba(236, 233, 248, 0.22)',
      text: '#ECE9F6',
      textSoft: '#B3AECB',
      textFaint: '#8B85A7',
      calm: '#B2A7F0',
      calmSoft: 'rgba(178, 167, 240, 0.14)',
      breath: '#86CBD8',
      breathSoft: 'rgba(134, 203, 216, 0.14)',
      warm: '#F0A6B2',
      warmSoft: 'rgba(240, 166, 178, 0.14)',
      onAccent: '#15112A',
      danger: '#E8846E',
      onDanger: '#1A0E0B',
      halo: 'rgba(178, 167, 240, 0.16)',
      chart: '#8A7FD0',
      cardSolid: '#1C1830',
      shadow: '#000000',
      scrim: 'rgba(5, 4, 12, 0.9)',
      tabBar: 'rgba(17, 14, 33, 0.94)',
      scene: {
        skyTop: '#07051A',
        skyBottom: '#2A2352',
        sun: '#F1EEFF',
        sunGlow: 'rgba(190, 180, 240, 0.3)',
        ridgeFar: '#2A2553',
        ridgeMid: '#1C1840',
        ridgeNear: '#110E2A',
        water: '#1E1946',
        mist: 'rgba(190, 180, 240, 0.1)',
        star: '#F1EEFF',
      },
    },
  },
};

export const DEFAULT_THEME: ThemeName = 'ocean';
