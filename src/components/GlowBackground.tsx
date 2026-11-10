import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { useReduceMotion } from '@/hooks/useReduceMotion';
import { useTheme, type Accent } from '@/theme';

interface Props {
  accent?: Accent;
  /** Vertical position of the light, 0 = top, 1 = bottom. */
  glowY?: number;
  /** Horizontal position of the light, 0 = left, 1 = right. */
  glowX?: number;
  /** Let the light breathe slowly (off when reduce motion is on). */
  pulse?: boolean;
  /** Draw faint ripple rings around the light. */
  ripples?: boolean;
}

/**
 * Quiet backdrop: a paper-like gradient, a soft sun (or moon at night)
 * and faint ripples, like light on still water. Decorative only.
 */
export function GlowBackground({ accent = 'calm', glowY = 0.1, glowX = 0.78, pulse = true, ripples = true }: Props) {
  const { c } = useTheme();
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReduceMotion();
  const breathe = useSharedValue(0.85);

  useEffect(() => {
    if (pulse && !reduceMotion) {
      breathe.value = withRepeat(withTiming(1, { duration: 7000, easing: Easing.inOut(Easing.sin) }), -1, true);
    } else {
      breathe.value = 0.92;
    }
  }, [pulse, reduceMotion, breathe]);

  const haloStyle = useAnimatedStyle(() => ({ opacity: breathe.value, transform: [{ scale: 0.96 + breathe.value * 0.06 }] }));

  const cx = width * glowX;
  const cy = height * glowY;
  const r = Math.max(width, 420) * 0.75;
  const tint = { calm: c.calmSoft, breath: c.breathSoft, warm: c.warmSoft }[accent];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <LinearGradient colors={[c.bg, c.bg, c.bgDeep]} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
      <Animated.View style={[StyleSheet.absoluteFill, haloStyle]}>
        <Svg width={width} height={height}>
          <Defs>
            <RadialGradient id="halo" cx={cx} cy={cy} r={r} gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor={c.halo} stopOpacity={1} />
              <Stop offset="0.35" stopColor={c.halo} stopOpacity={0.45} />
              <Stop offset="1" stopColor={c.halo} stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="tint" cx={width * (1 - glowX)} cy={height * 0.95} r={r * 0.9} gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor={tint} stopOpacity={1} />
              <Stop offset="1" stopColor={tint} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={width * (1 - glowX)} cy={height * 0.95} r={r * 0.9} fill="url(#tint)" />
          <Circle cx={cx} cy={cy} r={r} fill="url(#halo)" />
          {ripples
            ? [0.22, 0.36, 0.52].map((k, i) => (
                <Circle key={k} cx={cx} cy={cy} r={r * k} stroke={c.line} strokeWidth={1} fill="none" opacity={1 - i * 0.25} />
              ))
            : null}
        </Svg>
      </Animated.View>
    </View>
  );
}
