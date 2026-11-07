import type { SFSymbol } from 'expo-symbols';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { accentColor, colors, radius, space, touch, type Accent } from '@/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';

type Kind = 'primary' | 'secondary' | 'ghost' | 'danger';

interface Props {
  label: string;
  onPress: () => void;
  kind?: Kind;
  accent?: Accent;
  icon?: SFSymbol;
  size?: 'md' | 'lg' | 'xl';
  disabled?: boolean;
  accessibilityHint?: string;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  kind = 'primary',
  accent = 'violet',
  icon,
  size = 'lg',
  disabled,
  accessibilityHint,
  style,
}: Props) {
  const height = size === 'xl' ? 84 : size === 'lg' ? 60 : touch;
  const bg =
    kind === 'primary'
      ? accentColor[accent]
      : kind === 'danger'
        ? colors.danger
        : kind === 'secondary'
          ? colors.surfaceRaised
          : 'transparent';
  const fg = kind === 'primary' || kind === 'danger' ? colors.onAccent : colors.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.base,
        { minHeight: height, backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.8 : 1 },
        kind === 'secondary' && styles.outlined,
        style,
      ]}>
      <View style={styles.row}>
        {icon ? <Icon name={icon} size={size === 'xl' ? 30 : 22} color={fg} /> : null}
        <AppText variant={size === 'xl' ? 'heading' : 'label'} style={{ color: fg }}>
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    paddingHorizontal: space.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlined: { borderWidth: 1, borderColor: colors.borderStrong },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
});
