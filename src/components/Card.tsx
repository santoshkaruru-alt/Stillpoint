import type { SFSymbol } from 'expo-symbols';
import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { makeStyles, radius, space, useTheme, type Accent } from '@/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';

const useStyles = makeStyles((c) =>
  StyleSheet.create({
  card: {
    backgroundColor: c.surface,
    borderColor: c.line,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: space.lg,
    ...(c.scheme === 'light'
      ? { shadowColor: c.shadow, shadowOpacity: 0.06, shadowRadius: 24, shadowOffset: { width: 0, height: 10 } }
      : {}),
  },
  group: { paddingVertical: space.xs, paddingHorizontal: 0 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: c.line, marginLeft: space.lg + 44 + space.md },
  path: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 88 },
  bare: { paddingHorizontal: space.lg, paddingVertical: space.md },
  compact: { minHeight: 72 },
  pressed: { opacity: 0.7 },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
  }),
);

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const styles = useStyles();
  return <View style={[styles.card, style]}>{children}</View>;
}

/** A card holding several rows separated by hairlines. */
export function CardGroup({ children }: { children: ReactNode }) {
  const styles = useStyles();
  const items = Children.toArray(children).filter(isValidElement);
  return (
    <View style={[styles.card, styles.group]}>
      {items.map((child, i) => (
        <Fragment key={child.key ?? i}>
          {i > 0 ? <View style={styles.divider} /> : null}
          {child}
        </Fragment>
      ))}
    </View>
  );
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
  /** Render as a row inside a CardGroup rather than its own card. */
  bare?: boolean;
}

/** Large tappable row used for the main paths and session choices. */
export function PathCard({ title, subtitle, icon, accent = 'calm', onPress, right, accessibilityHint, compact, bare }: PathCardProps) {
  const styles = useStyles();
  const { c } = useTheme();
  const soft = { calm: c.calmSoft, breath: c.breathSoft, warm: c.warmSoft }[accent];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        bare ? styles.bare : styles.card,
        styles.path,
        compact && styles.compact,
        pressed && styles.pressed,
      ]}>
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: soft }]}>
          <Icon name={icon} size={22} color={c[accent]} />
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
      {right ?? <Icon name="chevron.right" size={14} color={c.textFaint} />}
    </Pressable>
  );
}
