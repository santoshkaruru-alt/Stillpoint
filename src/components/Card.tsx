import type { SFSymbol } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { accentColor, colors, radius, space, type Accent } from '@/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

interface PathCardProps {
  title: string;
  subtitle?: string;
  icon?: SFSymbol;
  accent?: Accent;
  onPress: () => void;
  right?: ReactNode;
  accessibilityHint?: string;
  compact?: boolean;
}

/** Large tappable card used for the main paths and session choices. */
export function PathCard({ title, subtitle, icon, accent = 'violet', onPress, right, accessibilityHint, compact }: PathCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [styles.card, styles.path, compact && styles.compact, pressed && styles.pressed]}>
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: `${accentColor[accent]}22`, borderColor: `${accentColor[accent]}55` }]}>
          <Icon name={icon} size={26} color={accentColor[accent]} />
        </View>
      ) : null}
      <View style={styles.text}>
        <AppText variant="heading">{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" tone="muted">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right ?? <Icon name="chevron.right" size={16} color={colors.textFaint} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(26, 27, 68, 0.72)',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space.lg,
  },
  path: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 96 },
  compact: { minHeight: 76, paddingVertical: space.md },
  pressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 2 },
});
