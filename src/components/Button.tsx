import type { SFSymbol } from 'expo-symbols';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { fonts, radius, space, touch, useTheme, type Accent } from '@/theme';

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
  accent = 'calm',
  icon,
  size = 'lg',
  disabled,
  accessibilityHint,
  style,
}: Props) {
  const { c } = useTheme();
  const height = size === 'xl' ? 76 : size === 'lg' ? 58 : touch;
  const fill = kind === 'primary' ? c[accent] : kind === 'danger' ? c.danger : 'transparent';
  const fg = kind === 'primary' ? c.onAccent : kind === 'danger' ? c.onDanger : kind === 'ghost' ? c.textSoft : c.text;

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
        { minHeight: height, backgroundColor: fill, opacity: disabled ? 0.4 : pressed ? 0.78 : 1 },
        kind === 'secondary' && { borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.lineStrong },
        pressed && styles.pressed,
        style,
      ]}>
      <View style={styles.row}>
        {icon ? <Icon name={icon} size={size === 'xl' ? 24 : 18} color={fg} /> : null}
        <AppText
          variant="label"
          style={[{ color: fg }, size === 'xl' && styles.xlLabel, kind === 'ghost' && styles.ghostLabel]}>
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
  pressed: { transform: [{ scale: 0.985 }] },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  xlLabel: { fontSize: 17, letterSpacing: 0.6, fontFamily: fonts.sansSemi },
  ghostLabel: { fontFamily: fonts.sansMedium },
});
