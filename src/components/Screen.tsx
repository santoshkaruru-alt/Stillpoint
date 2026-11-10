import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { makeStyles, space, type Accent } from '@/theme';

import { GlowBackground } from './GlowBackground';

interface Props {
  children: ReactNode;
  accent?: Accent;
  scroll?: boolean;
  edges?: Edge[];
  contentStyle?: ViewStyle;
  glowY?: number;
}

/** Standard page: gradient + glow background, safe area, optional scroll. */
export function Screen({ children, accent = 'calm', scroll = true, edges = ['top'], contentStyle, glowY }: Props) {
  const styles = useStyles();
  return (
    <View style={styles.root}>
      <GlowBackground accent={accent} glowY={glowY} />
      <SafeAreaView edges={edges} style={styles.flex}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={[styles.content, contentStyle]}
            contentInsetAdjustmentBehavior="automatic"
            showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, styles.content, contentStyle]}>{children}</View>
        )}
      </SafeAreaView>
    </View>
  );
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
  root: { flex: 1, backgroundColor: c.bg },
  flex: { flex: 1 },
  content: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.xxl * 2, gap: space.lg },
  }),
);
