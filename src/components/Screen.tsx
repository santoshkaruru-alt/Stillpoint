import { LinearGradient } from 'expo-linear-gradient';
import { Children, type ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View, type ViewStyle } from 'react-native';
import Animated, { FadeInDown, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets, type Edge } from 'react-native-safe-area-context';

import { useReduceMotion } from '@/hooks/useReduceMotion';
import { makeStyles, space, useTheme, withAlpha, type Accent } from '@/theme';

import { GlowBackground } from './GlowBackground';
import { Scene, type SceneKind } from './Scene';

interface Props {
  children: ReactNode;
  accent?: Accent;
  scroll?: boolean;
  edges?: Edge[];
  contentStyle?: ViewStyle;
  glowY?: number;
  /** A painted landscape at the top of the page, behind the header. */
  scene?: SceneKind;
  sceneHeight?: number;
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    flex: { flex: 1 },
    content: { paddingHorizontal: space.lg, paddingBottom: space.xxl * 2, gap: space.lg },
    scene: { position: 'absolute', top: 0, left: 0 },
    statusFade: { position: 'absolute', top: 0, left: 0, right: 0 },
  }),
);

/**
 * Standard page. Content scrolls up underneath the status bar, like a
 * native app, with a soft fade behind the clock once you scroll, rather
 * than being clipped at the safe-area line.
 */
export function Screen({ children, accent = 'calm', scroll = true, edges = ['top'], contentStyle, glowY, scene, sceneHeight = 340 }: Props) {
  const styles = useStyles();
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const reduceMotion = useReduceMotion();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const fadeStyle = useAnimatedStyle(() => ({ opacity: interpolate(scrollY.value, [0, 40], [scene ? 0 : 0.6, 1], 'clamp') }));

  const top = edges.includes('top') ? insets.top : 0;
  const bottom = edges.includes('bottom') ? insets.bottom : 0;

  const items = Children.toArray(children).map((child, i) =>
    reduceMotion ? (
      child
    ) : (
      <Animated.View key={`in-${i}`} entering={FadeInDown.duration(520).delay(60 + i * 70)}>
        {child}
      </Animated.View>
    ),
  );

  if (!scroll) {
    return (
      <View style={styles.root}>
        <GlowBackground accent={accent} glowY={glowY} />
        <SafeAreaView edges={edges} style={styles.flex}>
          <View style={[styles.flex, styles.content, { paddingTop: space.md }, contentStyle]}>{children}</View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <GlowBackground accent={accent} glowY={glowY} ripples={!scene} />
      <Animated.ScrollView
        style={styles.flex}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: top + space.md, paddingBottom: space.xxl * 2 + bottom }, contentStyle]}>
        {scene ? (
          <Scene kind={scene} width={width} height={sceneHeight + top} fadeTo={c.bg} fadeLength={0.42} style={styles.scene} />
        ) : null}
        {items}
      </Animated.ScrollView>
      {/* Soft veil behind the status bar so scrolled text fades out under the clock. */}
      <Animated.View pointerEvents="none" style={[styles.statusFade, { height: top + 14 }, fadeStyle]}>
        <LinearGradient colors={[c.bg, withAlpha(c.bg.length === 7 ? c.bg : '#000000', 0)]} locations={[0.65, 1]} style={StyleSheet.absoluteFill} />
      </Animated.View>
    </View>
  );
}
