import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { SCALE_MIN } from '@/engine/breath';
import { useSvgId } from '@/hooks/useSvgId';
import { useTheme, withAlpha, type Accent } from '@/theme';

interface Props {
  size: number;
  /** Target scale for the current step (0..1). */
  scaleTo: number;
  /** Seconds remaining to reach the target (animation duration). */
  durationSec: number;
  /** Changes whenever a new step starts, to retrigger the animation. */
  stepKey: number;
  paused: boolean;
  reduceMotion: boolean;
  accent?: Accent;
  /** 0..1 progress ring, used when motion is reduced. */
  progress: number;
  children?: React.ReactNode;
}

/**
 * The breathing circle: a pool of soft light with ripples that open as you
 * breathe in and settle as you breathe out. With reduce motion on, it
 * stays still and shows a thin progress ring instead.
 */
export function BreathCircle({ size, scaleTo, durationSec, stepKey, paused, reduceMotion, accent = 'breath', progress, children }: Props) {
  const { c } = useTheme();
  const sid = useSvgId();
  const color = c[accent];
  const scale = useSharedValue(SCALE_MIN);

  useEffect(() => {
    if (reduceMotion) {
      cancelAnimation(scale);
      scale.value = 0.8;
      return;
    }
    if (paused) {
      cancelAnimation(scale);
      return;
    }
    scale.value = withTiming(scaleTo, {
      duration: Math.max(150, durationSec * 1000),
      easing: Easing.inOut(Easing.sin),
    });
  }, [stepKey, paused, reduceMotion, scaleTo, durationSec, scale]);

  const coreStyle = useAnimatedStyle(() => ({ transform: [{ scale: 0.55 + scale.value * 0.45 }] }));
  const ring1 = useAnimatedStyle(() => ({
    transform: [{ scale: 0.62 + scale.value * 0.42 }],
    opacity: 0.25 + scale.value * 0.45,
  }));
  const ring2 = useAnimatedStyle(() => ({
    transform: [{ scale: 0.6 + scale.value * 0.55 }],
    opacity: scale.value * 0.4,
  }));

  const r = size / 2;
  const ringR = r - 4;
  const circumference = 2 * Math.PI * ringR;

  return (
    <View style={{ width: size, height: size }}>
      {/* Outer ripples */}
      <Animated.View style={[StyleSheet.absoluteFill, ring2]} pointerEvents="none">
        <Svg width={size} height={size}>
          <Circle cx={r} cy={r} r={r - 2} stroke={withAlpha(color, 0.35)} strokeWidth={1} fill="none" />
        </Svg>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, ring1]} pointerEvents="none">
        <Svg width={size} height={size}>
          <Circle cx={r} cy={r} r={r * 0.86} stroke={withAlpha(color, 0.5)} strokeWidth={1} fill="none" />
        </Svg>
      </Animated.View>
      {/* Core: a pool of light */}
      <Animated.View style={[StyleSheet.absoluteFill, coreStyle]} pointerEvents="none">
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id={sid('pool')} cx="50%" cy="45%" r="55%">
              <Stop offset="0" stopColor={color} stopOpacity={c.scheme === 'dark' ? 0.42 : 0.3} />
              <Stop offset="0.7" stopColor={color} stopOpacity={c.scheme === 'dark' ? 0.16 : 0.12} />
              <Stop offset="1" stopColor={color} stopOpacity={0.04} />
            </RadialGradient>
          </Defs>
          <Circle cx={r} cy={r} r={r * 0.72} fill={`url(#${sid('pool')})`} />
          <Circle cx={r} cy={r} r={r * 0.72} stroke={withAlpha(color, 0.75)} strokeWidth={1.5} fill="none" />
        </Svg>
      </Animated.View>
      {reduceMotion ? (
        <Svg width={size} height={size} style={StyleSheet.absoluteFill} pointerEvents="none">
          <Circle cx={r} cy={r} r={ringR} stroke={c.line} strokeWidth={3} fill="none" />
          <Circle
            cx={r}
            cy={r}
            r={ringR}
            stroke={color}
            strokeWidth={3}
            fill="none"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            rotation={-90}
            origin={`${r}, ${r}`}
          />
        </Svg>
      ) : null}
      <View style={styles.center} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
});
