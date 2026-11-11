import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { useTheme, withAlpha } from '@/theme';

import { Scene, themeScene, type SceneKind } from './Scene';

/**
 * A full-screen landscape for the players, under a soft veil so text and
 * controls stay easy to read. The scene fades into the page at the bottom,
 * where the controls sit.
 */
export function SceneBackdrop({ kind, veil = 0.3, animate = true }: { kind?: SceneKind; veil?: number; animate?: boolean }) {
  const { c, name } = useTheme();
  const { width, height } = useWindowDimensions();
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Scene kind={kind ?? themeScene[name]} width={width} height={height} fadeTo={c.bg} fadeLength={0.32} animate={animate} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: withAlpha(c.bg, veil) }]} />
    </View>
  );
}
