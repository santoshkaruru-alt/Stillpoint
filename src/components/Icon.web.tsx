import Svg, { Circle, Path } from 'react-native-svg';

import { useTheme } from '@/theme';

/**
 * Web stand-ins for the SF Symbols used by the native app. Simple 24x24
 * line drawings; `fill` shapes are solid. Unknown names draw a dot.
 */
interface Glyph {
  d?: string;
  fill?: string;
  circles?: [number, number, number][];
  filledCircles?: [number, number, number][];
}

const glyphs: Record<string, Glyph> = {
  house: { d: 'M3 11 12 4l9 7M5.5 9.5V20h13V9.5M10 20v-5.5h4V20' },
  sparkles: { d: 'M11 3l1.8 5.7L18.5 10.5 12.8 12.3 11 18l-1.8-5.7L3.5 10.5l5.7-1.8zM19 3v4M17 5h4' },
  wind: { d: 'M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h8' },
  book: { d: 'M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5zM5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3' },
  gearshape: {
    d: 'M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1',
    circles: [[12, 12, 5.5], [12, 12, 2]],
  },
  'play.fill': { fill: 'M7 4.5v15a.8.8 0 0 0 1.2.7l12-7.5a.8.8 0 0 0 0-1.4l-12-7.5A.8.8 0 0 0 7 4.5z' },
  'pause.fill': { fill: 'M6 4h4v16H6zM14 4h4v16h-4z' },
  'stop.fill': { fill: 'M6.5 5h11A1.5 1.5 0 0 1 19 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 17.5v-11A1.5 1.5 0 0 1 6.5 5z' },
  'forward.end.fill': { fill: 'M4 5v14l11-7zM16 5h3v14h-3z' },
  plus: { d: 'M12 5v14M5 12h14' },
  minus: { d: 'M5 12h14' },
  checkmark: { d: 'M5 12.5l4.5 4.5L19 7' },
  xmark: { d: 'M6 6l12 12M18 6 6 18' },
  'chevron.left': { d: 'M15 5l-7 7 7 7' },
  'chevron.right': { d: 'M9 5l7 7-7 7' },
  'chevron.up': { d: 'M5 15l7-7 7 7' },
  'chevron.down': { d: 'M5 9l7 7 7-7' },
  scope: { d: 'M12 2v4M12 18v4M2 12h4M18 12h4', circles: [[12, 12, 7.5]], filledCircles: [[12, 12, 2]] },
  'slider.horizontal.3': { d: 'M4 6h16M4 12h16M4 18h16', filledCircles: [[9, 6, 2.2], [15, 12, 2.2], [7, 18, 2.2]] },
  'speaker.wave.2': { d: 'M4 9.5h3.5L12 5v14l-4.5-4.5H4zM15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11' },
  'square.and.pencil': { d: 'M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5M18.5 3.5l2 2L12 14l-3 1 1-3z' },
  trash: { d: 'M4 6.5h16M9 6.5V4h6v2.5M6.5 6.5l1 13.5h9l1-13.5M10 10v6.5M14 10v6.5' },
  'lungs.fill': {
    fill: 'M11 5v6.5c0 4-1.2 8.5-4.5 8.5C4.4 20 3 18.4 3 15.8 3 11 5.5 7.5 8 7.5c1 0 1.6.6 1.9 1.4V5zM13 5v6.5c0 4 1.2 8.5 4.5 8.5 2.1 0 3.5-1.6 3.5-4.2 0-4.8-2.5-8.3-5-8.3-1 0-1.6.6-1.9 1.4V5z',
  },
  headphones: { d: 'M4 15v-3a8 8 0 0 1 16 0v3M4 15h3v5H5a1 1 0 0 1-1-1zM20 15h-3v5h2a1 1 0 0 0 1-1z' },
  pencil: { d: 'M4 20l1-4L16 5l3 3L8 19zM14 7l3 3' },
  square: { d: 'M5 5h14v14H5z' },
  'moon.stars': { d: 'M19.5 14.5A7.5 7.5 0 1 1 9.5 4.5a6 6 0 0 0 10 10zM17 3v3M15.5 4.5h3' },
  heart: { d: 'M12 20s-8-4.8-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6.2-8 11-8 11z' },
  leaf: { d: 'M5 19C5 10 10.5 5 20 4c-.5 9.5-5.5 15-15 15zM5 19l8-8' },
  'arrow.up.circle': { d: 'M12 16.5v-9M8 11l4-4 4 4', circles: [[12, 12, 9]] },
  bolt: { d: 'M13 2.5 5 13.5h6.5L10.5 21.5 19 10h-6.5z' },
  'exclamationmark.shield': { d: 'M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6zM12 8v5M12 16v.5' },
  'exclamationmark.triangle': { d: 'M12 4 2.8 19.5h18.4zM12 10v4.5M12 17v.5' },
  car: { d: 'M3.5 16.5v-4l2-5h13l2 5v4zM3.5 12.5h17', circles: [[7.5, 16.5, 1.8], [16.5, 16.5, 1.8]] },
  drop: { d: 'M12 3.5c-3 4.5-6 7.5-6 11a6 6 0 0 0 12 0c0-3.5-3-6.5-6-11z' },
  'figure.seated.side': { d: 'M9 7.5v6h6l2 6.5M9 13.5 7 20M9 10h4', circles: [[9, 4.5, 2]] },
  stethoscope: { d: 'M6 3v6a4 4 0 0 0 8 0V3M10 13v3a4 4 0 0 0 8 0v-2.5', circles: [[18, 11.5, 2]] },
  'play.circle': { d: 'M10 8.5v7l5.5-3.5z', circles: [[12, 12, 9]] },
};

// Filled variants used by the native tab bar map to the outline drawings.
const alias: Record<string, string> = {
  'house.fill': 'house',
  'book.fill': 'book',
  'gearshape.fill': 'gearshape',
};

interface Props {
  name: string;
  size?: number;
  color?: string;
}

export function Icon({ name, size = 22, color: colorProp }: Props) {
  const { c } = useTheme();
  const color = colorProp ?? c.text;
  const g = glyphs[alias[name] ?? name] ?? { filledCircles: [[12, 12, 3]] };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no" pointerEvents="none">
      {g.d ? <Path d={g.d} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none" /> : null}
      {g.fill ? <Path d={g.fill} fill={color} /> : null}
      {g.circles?.map(([cx, cy, r]) => (
        <Circle key={`${cx}-${cy}-${r}`} cx={cx} cy={cy} r={r} stroke={color} strokeWidth={1.5} fill="none" />
      ))}
      {g.filledCircles?.map(([cx, cy, r]) => (
        <Circle key={`f${cx}-${cy}-${r}`} cx={cx} cy={cy} r={r} fill={color} />
      ))}
    </Svg>
  );
}
