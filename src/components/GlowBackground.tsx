import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useReduceMotion } from '@/hooks/useReduceMotion';
import { colors, glow, type Accent } from '@/theme';

interface Props {
  accent?: Accent;
  /** Vertical position of the glow centre, 0 = top, 1 = bottom. */
  glowY?: number;
  /** Slowly breathe the glow (disabled when reduce motion is on). */
  pulse?: boolean;
}

/**
 * Full-screen dark gradient with a soft radial glow. Purely decorative,
 * hidden from screen readers.
 */
export function GlowBackground({ accent = 'violet', glowY = 0.12, pulse = true }: Props) {
  const reduceMotion = useReduceMotion();
  const opacity = useSharedValue(0.85);

  useEffect(() => {
    if (pulse && !reduceMotion) {
      opacity.value = withRepeat(
        withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      );
    } else {
      opacity.value = 0.9;
    }
  }, [pulse, reduceMotion, opacity]);

  const glowStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const id = `glow-${accent}`;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <LinearGradient colors={[colors.bgTop, colors.bg, colors.bg]} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFill} />
      <Animated.View style={[StyleSheet.absoluteFill, glowStyle]}>
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient id={id} cx="50%" cy={`${glowY * 100}%`} rx="75%" ry="45%" fx="50%" fy={`${glowY * 100}%`}>
              <Stop offset="0" stopColor={glow[accent]} stopOpacity={0.55} />
              <Stop offset="0.45" stopColor={glow[accent]} stopOpacity={0.14} />
              <Stop offset="1" stopColor={colors.bg} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
        </Svg>
      </Animated.View>
    </View>
  );
}
