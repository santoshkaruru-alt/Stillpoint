import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { useReduceMotion } from '@/hooks/useReduceMotion';

/**
 * An ensō: the single brushed circle of Zen calligraphy. Drawn as a filled
 * shape whose width swells and tapers like ink from a brush, with a few
 * faint dry-brush strands for texture. Purely decorative.
 */

interface Point {
  x: number;
  y: number;
}

function strokePath(size: number, opts: { r: number; width: number; start: number; sweep: number; seed: number; taperIn?: number }): string {
  const { r, width, start, sweep, seed } = opts;
  const taperIn = opts.taperIn ?? 0.55;
  const c = size / 2;
  const steps = 120;
  const outer: Point[] = [];
  const inner: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = ((start + sweep * t) * Math.PI) / 180;
    // Brush pressure: firm press, gentle swell, long dry taper.
    const press = t < 0.08 ? taperIn + (1 - taperIn) * (t / 0.08) : 1;
    const taper = t > 0.62 ? Math.pow(1 - (t - 0.62) / 0.38, 0.85) : 1;
    const swell = 0.85 + 0.15 * Math.sin(Math.PI * t * 1.3 + seed);
    const w = Math.max(0.6, width * press * taper * swell);
    const wobble = 1 + 0.012 * Math.sin(3 * a + seed) + 0.007 * Math.sin(7 * a + seed * 2);
    const rr = r * wobble;
    outer.push({ x: c + Math.cos(a) * (rr + w / 2), y: c + Math.sin(a) * (rr + w / 2) });
    inner.push({ x: c + Math.cos(a) * (rr - w / 2), y: c + Math.sin(a) * (rr - w / 2) });
  }
  const f = (p: Point) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  return `M${f(outer[0])} ${outer.slice(1).map((p) => `L${f(p)}`).join(' ')} L${f(inner[inner.length - 1])} ${inner
    .slice(0, -1)
    .reverse()
    .map((p) => `L${f(p)}`)
    .join(' ')} Z`;
}

interface Props {
  size: number;
  color: string;
  /** Overall opacity of the ink. */
  opacity?: number;
  /** Brush width as a share of the size. */
  weight?: number;
  /** Slowly turn (respects reduce motion). */
  drift?: boolean;
}

export function Enso({ size, color, opacity = 1, weight = 0.075, drift = false }: Props) {
  const reduceMotion = useReduceMotion();
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (drift && !reduceMotion) {
      rotation.value = withRepeat(withTiming(360, { duration: 240_000, easing: Easing.linear }), -1, false);
    } else {
      rotation.value = 0;
    }
  }, [drift, reduceMotion, rotation]);

  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));

  const paths = useMemo(() => {
    const r = size * 0.4;
    const w = size * weight;
    return {
      main: strokePath(size, { r, width: w, start: 128, sweep: 322, seed: 1.7 }),
      strands: [
        strokePath(size, { r: r + w * 0.38, width: w * 0.12, start: 140, sweep: 250, seed: 0.4, taperIn: 0.2 }),
        strokePath(size, { r: r - w * 0.4, width: w * 0.1, start: 150, sweep: 205, seed: 2.9, taperIn: 0.2 }),
        strokePath(size, { r: r + w * 0.1, width: w * 0.08, start: 300, sweep: 120, seed: 4.1, taperIn: 0.3 }),
      ],
    };
  }, [size, weight]);

  return (
    <View style={{ width: size, height: size, opacity }} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View style={style}>
        <Svg width={size} height={size}>
          <Path d={paths.main} fill={color} />
          {paths.strands.map((d, i) => (
            <Path key={i} d={d} fill={color} opacity={0.35} />
          ))}
        </Svg>
      </Animated.View>
    </View>
  );
}
