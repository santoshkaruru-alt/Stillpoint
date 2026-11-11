import { useEffect, useMemo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useReduceMotion } from '@/hooks/useReduceMotion';
import { useSvgId } from '@/hooks/useSvgId';
import { useTheme, type SceneColors, type ThemeName } from '@/theme';

/**
 * Painted landscapes drawn in code: original, tiny, offline, and recoloured
 * by the active theme (sunrise by day, moonlight and stars by night).
 * Gentle motion: drifting mist, breathing sunlight, shimmering water,
 * slow waves and twinkling stars. Still when reduce motion is on.
 */

export type SceneKind = 'lake' | 'forest' | 'sea';

/** Each theme's signature landscape. */
export const themeScene: Record<ThemeName, SceneKind> = { ocean: 'lake', forest: 'forest', dusk: 'lake' };

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A smooth ridge line: y for x, from layered sine waves. */
function ridgeFn(w: number, base: number, amp: number, seed: number) {
  const r = rng(seed);
  const waves = [0, 1, 2, 3].map((i) => ({ f: (1.2 + i * 1.7 + r()) / w, p: r() * Math.PI * 2, a: amp / (1 + i * 1.2) }));
  return (x: number) => base - waves.reduce((s, v) => s + v.a * Math.sin(x * v.f * Math.PI * 2 + v.p), 0) - amp * 0.3;
}

function ridgePath(w: number, bottom: number, y: (x: number) => number): string {
  const step = Math.max(4, w / 90);
  let d = `M0,${bottom} L0,${y(0).toFixed(1)}`;
  for (let x = step; x <= w + step; x += step) d += ` L${Math.min(x, w).toFixed(1)},${y(Math.min(x, w)).toFixed(1)}`;
  return `${d} L${w},${bottom} Z`;
}

/** Mirror a ridge around the horizon for a reflection in still water. */
function reflectionPath(w: number, horizon: number, depth: number, y: (x: number) => number): string {
  const step = Math.max(4, w / 90);
  let d = `M0,${horizon}`;
  for (let x = 0; x <= w + step; x += step) {
    const xx = Math.min(x, w);
    const up = horizon - y(xx);
    d += ` L${xx.toFixed(1)},${(horizon + Math.max(0, up) * depth).toFixed(1)}`;
  }
  return `${d} L${w},${horizon} Z`;
}

/** Pines standing along a ridge. */
function pinesPath(w: number, y: (x: number) => number, seed: number, spacing: number, height: number): string {
  const r = rng(seed);
  let d = '';
  for (let x = r() * spacing; x < w + spacing; x += spacing * (0.55 + r() * 0.9)) {
    const h = height * (0.6 + r() * 0.7);
    const base = y(x) + 2;
    const half = h * 0.28;
    // Three stacked tiers, narrowing to the tip.
    for (let t = 0; t < 3; t++) {
      const top = base - h * (0.45 + t * 0.27);
      const bottom = base - h * (t * 0.27);
      const hw = half * (1 - t * 0.24);
      d += `M${(x - hw).toFixed(1)},${bottom.toFixed(1)} L${x.toFixed(1)},${top.toFixed(1)} L${(x + hw).toFixed(1)},${bottom.toFixed(1)} Z `;
    }
  }
  return d;
}

function useLoop(duration: number, enabled: boolean, delay = 0, reverse = true): SharedValue<number> {
  const v = useSharedValue(0);
  useEffect(() => {
    if (enabled) {
      v.value = 0;
      v.value = withDelay(delay, withRepeat(withTiming(1, { duration, easing: reverse ? Easing.inOut(Easing.sin) : Easing.linear }), -1, reverse));
    } else {
      v.value = 0.5;
    }
  }, [enabled, duration, delay, reverse, v]);
  return v;
}

interface Props {
  kind: SceneKind;
  width: number;
  height: number;
  /** Fade the bottom of the scene into this colour (usually the page bg). */
  fadeTo?: string;
  /** Portion of the height (from the bottom) that fades out. */
  fadeLength?: number;
  animate?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Scene({ kind, width: w, height: h, fadeTo, fadeLength = 0.35, animate = true, style }: Props) {
  const { c } = useTheme();
  const sid = useSvgId();
  const s: SceneColors = c.scene;
  const reduceMotion = useReduceMotion();
  const live = animate && !reduceMotion;

  const geo = useMemo(() => {
    const horizon = kind === 'forest' ? h : h * (kind === 'sea' ? 0.6 : 0.64);
    const far = ridgeFn(w, h * (kind === 'sea' ? 0.585 : 0.5), h * (kind === 'sea' ? 0.025 : 0.08), 11);
    const mid = ridgeFn(w, h * (kind === 'forest' ? 0.63 : 0.575), h * 0.055, 23);
    const near = ridgeFn(w, h * (kind === 'forest' ? 0.8 : 0.625), h * (kind === 'forest' ? 0.05 : 0.03), 37);
    const r = rng(5);
    const stars = Array.from({ length: Math.round(w / 9) }, () => ({ x: r() * w, y: r() * h * 0.5, size: 0.5 + r() * 1.3, group: Math.floor(r() * 3) }));
    // Low in the sky, rising behind the far hills (or resting on the sea's
    // horizon), so it never sits behind headings or the breathing circle.
    const sun = { x: w * (kind === 'sea' ? 0.88 : 0.8), y: h * (kind === 'sea' ? 0.56 : kind === 'forest' ? 0.47 : 0.5), r: Math.max(16, Math.min(34, w * 0.065)) };
    const shimmer = Array.from({ length: 14 }, (_, i) => ({
      x: sun.x - w * 0.12 + r() * w * 0.24,
      y: horizon + 6 + i * ((h - horizon) / 16),
      len: w * (0.03 + r() * 0.08) * (1 - i / 22),
      group: i % 2,
    }));
    return {
      horizon,
      sun,
      stars,
      shimmer,
      far: ridgePath(w, kind === 'forest' ? h : horizon + 1, far),
      mid: kind === 'sea' ? null : ridgePath(w, kind === 'forest' ? h : horizon + 1, mid),
      near: kind === 'sea' ? null : ridgePath(w, kind === 'forest' ? h : horizon + 1, near),
      farRefl: kind === 'lake' ? reflectionPath(w, horizon, 0.7, far) : null,
      midRefl: kind === 'lake' ? reflectionPath(w, horizon, 0.75, mid) : null,
      nearRefl: kind === 'lake' ? reflectionPath(w, horizon, 0.85, near) : null,
      pinesMid: kind === 'forest' ? pinesPath(w, mid, 3, w / 26, h * 0.07) : null,
      pinesNear: kind === 'forest' ? pinesPath(w, near, 9, w / 16, h * 0.12) : null,
      waves: kind === 'sea' ? Array.from({ length: 9 }, (_, i) => horizon + 8 + i * i * ((h - horizon) / 70)) : [],
    };
  }, [kind, w, h]);

  // Motion
  const mist = useLoop(70_000, live, 0, false);
  const mist2 = useLoop(110_000, live, 0, false);
  const glow = useLoop(9000, live);
  const twinkleA = useLoop(3200, live);
  const twinkleB = useLoop(4100, live, 900);
  const twinkleC = useLoop(5300, live, 1700);
  const shimmerA = useLoop(2600, live);
  const shimmerB = useLoop(3400, live, 1300);
  const waves = useLoop(14_000, live, 0, false);

  const mistStyle = useAnimatedStyle(() => ({ transform: [{ translateX: -mist.value * w }] }));
  const mist2Style = useAnimatedStyle(() => ({ transform: [{ translateX: -w + mist2.value * w }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: 0.75 + glow.value * 0.25, transform: [{ scale: 0.94 + glow.value * 0.1 }] }));
  const tA = useAnimatedStyle(() => ({ opacity: 0.35 + twinkleA.value * 0.65 }));
  const tB = useAnimatedStyle(() => ({ opacity: 0.35 + twinkleB.value * 0.65 }));
  const tC = useAnimatedStyle(() => ({ opacity: 0.35 + twinkleC.value * 0.65 }));
  const shA = useAnimatedStyle(() => ({ opacity: 0.15 + shimmerA.value * 0.6 }));
  const shB = useAnimatedStyle(() => ({ opacity: 0.15 + shimmerB.value * 0.6 }));
  const waveStyle = useAnimatedStyle(() => ({ transform: [{ translateX: -waves.value * 60 }] }));
  const twinkles = [tA, tB, tC];

  const fill = StyleSheet.absoluteFill;
  const { sun, horizon } = geo;
  const shimmerColor = s.star ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.75)';

  return (
    <View
      style={[{ width: w, height: h, overflow: 'hidden' }, style]}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      {/* Sky */}
      <Svg width={w} height={h} style={fill}>
        <Defs>
          <LinearGradient id={sid('sky')} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={s.skyTop} />
            <Stop offset={String(Math.min(0.95, horizon / h))} stopColor={s.skyBottom} />
            <Stop offset="1" stopColor={s.skyBottom} />
          </LinearGradient>
        </Defs>
        <Rect width={w} height={h} fill={`url(#${sid('sky')})`} />
      </Svg>

      {/* Stars at night */}
      {s.star
        ? [0, 1, 2].map((g) => (
            <Animated.View key={g} style={[fill, twinkles[g]]}>
              <Svg width={w} height={h}>
                {geo.stars
                  .filter((st) => st.group === g)
                  .map((st, i) => (
                    <Circle key={i} cx={st.x} cy={st.y} r={st.size} fill={s.star!} />
                  ))}
              </Svg>
            </Animated.View>
          ))
        : null}

      {/* Sun or moon with a breathing glow */}
      <Animated.View style={[fill, glowStyle]}>
        <Svg width={w} height={h}>
          <Defs>
            <RadialGradient id={sid('sunGlow')} cx={sun.x} cy={sun.y} r={sun.r * 5} gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor={s.sunGlow} stopOpacity={1} />
              <Stop offset="1" stopColor={s.sunGlow} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={sun.x} cy={sun.y} r={sun.r * 5} fill={`url(#${sid('sunGlow')})`} />
        </Svg>
      </Animated.View>
      <Svg width={w} height={h} style={fill}>
        <Circle cx={sun.x} cy={sun.y} r={sun.r} fill={s.sun} opacity={s.star ? 0.92 : 0.95} />
      </Svg>

      {/* Distant mist behind the hills */}
      <Animated.View style={[{ position: 'absolute', top: 0, left: 0, width: w * 2, height: h }, mist2Style]}>
        <Svg width={w * 2} height={h}>
          <Defs>
            <RadialGradient id={sid('mistFar')} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={s.mist} stopOpacity={1} />
              <Stop offset="1" stopColor={s.mist} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          {[0, 1].map((k) => (
            <Ellipse key={k} cx={w * (0.4 + k)} cy={h * 0.5} rx={w * 0.55} ry={h * 0.07} fill={`url(#${sid('mistFar')})`} />
          ))}
        </Svg>
      </Animated.View>

      {/* Hills, water and trees */}
      <Svg width={w} height={h} style={fill}>
        <Defs>
          <LinearGradient id={sid('water')} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={s.water} stopOpacity={0.9} />
            <Stop offset="1" stopColor={s.ridgeNear} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Path d={geo.far} fill={s.ridgeFar} />
        {geo.mid ? <Path d={geo.mid} fill={s.ridgeMid} /> : null}
        {geo.pinesMid ? <Path d={geo.pinesMid} fill={s.ridgeMid} /> : null}
        {geo.near ? <Path d={geo.near} fill={s.ridgeNear} /> : null}
        {geo.pinesNear ? <Path d={geo.pinesNear} fill={s.ridgeNear} /> : null}
        {kind !== 'forest' ? <Rect x={0} y={horizon} width={w} height={h - horizon} fill={`url(#${sid('water')})`} /> : null}
        {geo.farRefl ? <Path d={geo.farRefl} fill={s.ridgeFar} opacity={0.32} /> : null}
        {geo.midRefl ? <Path d={geo.midRefl} fill={s.ridgeMid} opacity={0.3} /> : null}
        {geo.nearRefl ? <Path d={geo.nearRefl} fill={s.ridgeNear} opacity={0.35} /> : null}
      </Svg>

      {/* Light on the water */}
      {kind !== 'forest'
        ? [0, 1].map((g) => (
            <Animated.View key={g} style={[fill, g ? shB : shA]}>
              <Svg width={w} height={h}>
                {geo.shimmer
                  .filter((l) => l.group === g)
                  .map((l, i) => (
                    <Rect key={i} x={l.x - l.len / 2} y={l.y} width={l.len} height={1.4} rx={0.7} fill={shimmerColor} />
                  ))}
              </Svg>
            </Animated.View>
          ))
        : null}

      {/* Slow waves on the open sea */}
      {kind === 'sea' ? (
        <Animated.View style={[{ position: 'absolute', top: 0, left: 0, width: w + 120, height: h }, waveStyle]}>
          <Svg width={w + 120} height={h}>
            <G opacity={0.5}>
              {geo.waves.map((y, i) => {
                const amp = 1 + i * 0.6;
                const len = 30 + i * 9;
                let d = `M0,${y}`;
                for (let x = 0; x <= w + 120; x += len / 2) d += ` Q${x + len / 4},${y - amp} ${x + len / 2},${y}`;
                return <Path key={i} d={d} stroke={shimmerColor} strokeWidth={0.8 + i * 0.12} fill="none" opacity={0.25 + i * 0.05} />;
              })}
            </G>
          </Svg>
        </Animated.View>
      ) : null}

      {/* Low mist drifting across the scene */}
      <Animated.View style={[{ position: 'absolute', top: 0, left: 0, width: w * 2, height: h }, mistStyle]}>
        <Svg width={w * 2} height={h}>
          <Defs>
            <RadialGradient id={sid('mistNear')} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={s.mist} stopOpacity={1} />
              <Stop offset="1" stopColor={s.mist} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          {[0, 1].map((k) => (
            <Ellipse key={k} cx={w * (0.3 + k)} cy={kind === 'forest' ? h * 0.72 : horizon - h * 0.015} rx={w * 0.7} ry={h * 0.06} fill={`url(#${sid('mistNear')})`} />
          ))}
          {[0, 1].map((k) => (
            <Ellipse key={`b${k}`} cx={w * (0.85 + k)} cy={kind === 'forest' ? h * 0.86 : horizon + h * 0.02} rx={w * 0.45} ry={h * 0.035} fill={`url(#${sid('mistNear')})`} />
          ))}
        </Svg>
      </Animated.View>

      {/* Fade into the page */}
      {fadeTo ? (
        <Svg width={w} height={h} style={fill}>
          <Defs>
            <LinearGradient id={sid('fade')} x1="0" y1="0" x2="0" y2="1">
              <Stop offset={String(1 - fadeLength)} stopColor={fadeTo} stopOpacity={0} />
              <Stop offset="1" stopColor={fadeTo} stopOpacity={1} />
            </LinearGradient>
          </Defs>
          <Rect width={w} height={h} fill={`url(#${sid('fade')})`} />
        </Svg>
      ) : null}
    </View>
  );
}
