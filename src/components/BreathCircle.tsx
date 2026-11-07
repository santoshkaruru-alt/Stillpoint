import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { SCALE_MIN } from '@/engine/breath';
import { accentColor, accentDeep, glow, type Accent } from '@/theme';

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
 * The breathing orb. Grows on inhale, shrinks on exhale, rests on holds.
 * With reduce motion on, it stays still and shows a progress ring instead.
 */
export function BreathCircle({ size, scaleTo, durationSec, stepKey, paused, reduceMotion, accent = 'teal', progress, children }: Props) {
  const scale = useSharedValue(SCALE_MIN);

  useEffect(() => {
    if (reduceMotion) {
      cancelAnimation(scale);
      scale.value = 0.82;
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
    // Restart on every new step and on resume.
  }, [stepKey, paused, reduceMotion, scaleTo, durationSec, scale]);

  const orbStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.75 + scale.value * 0.45 }],
    opacity: 0.35 + scale.value * 0.5,
  }));

  const r = size / 2;
  const ringR = r - 6;
  const circumference = 2 * Math.PI * ringR;

  return (
    <View style={{ width: size, height: size }} accessibilityElementsHidden={false}>
      <Animated.View style={[StyleSheet.absoluteFill, haloStyle]} pointerEvents="none">
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id="halo" cx="50%" cy="50%" r="50%">
              <Stop offset="0.45" stopColor={glow[accent]} stopOpacity={0.5} />
              <Stop offset="1" stopColor={glow[accent]} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={r} cy={r} r={r} fill="url(#halo)" />
        </Svg>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, orbStyle]} pointerEvents="none">
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id="orb" cx="42%" cy="38%" r="65%">
              <Stop offset="0" stopColor={accentColor[accent]} stopOpacity={0.95} />
              <Stop offset="0.7" stopColor={accentDeep[accent]} stopOpacity={0.85} />
              <Stop offset="1" stopColor={accentDeep[accent]} stopOpacity={0.6} />
            </RadialGradient>
          </Defs>
          <Circle cx={r} cy={r} r={r * 0.72} fill="url(#orb)" />
        </Svg>
      </Animated.View>
      {reduceMotion ? (
        <Svg width={size} height={size} style={StyleSheet.absoluteFill} pointerEvents="none">
          <Circle cx={r} cy={r} r={ringR} stroke="rgba(255,255,255,0.15)" strokeWidth={4} fill="none" />
          <Circle
            cx={r}
            cy={r}
            r={ringR}
            stroke={accentColor[accent]}
            strokeWidth={4}
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
