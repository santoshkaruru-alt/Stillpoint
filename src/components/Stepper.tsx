import { Pressable, StyleSheet, View } from 'react-native';

import { radius, space, useTheme, type Accent } from '@/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';

interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
  accent?: Accent;
  hint?: string;
}

const round = (v: number) => Math.round(v * 100) / 100;

/**
 * Minus / value / plus control. Exposed to VoiceOver as an adjustable
 * element, so swiping up and down changes the value.
 */
export function Stepper({ label, value, onChange, min, max, step = 1, format = String, accent = 'calm', hint }: Props) {
  const { c } = useTheme();
  const dec = () => onChange(Math.max(min, round(value - step)));
  const inc = () => onChange(Math.min(max, round(value + step)));

  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ text: format(value) }}
      accessibilityHint={hint}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => (e.nativeEvent.actionName === 'increment' ? inc() : dec())}>
      <View style={styles.text}>
        <AppText variant="label">{label}</AppText>
        {hint ? (
          <AppText variant="caption" tone="faint">
            {hint}
          </AppText>
        ) : null}
      </View>
      <View style={styles.controls}>
        <Pressable onPress={dec} disabled={value <= min} style={[styles.btn, { borderColor: c.lineStrong }, value <= min && styles.disabled]} hitSlop={6}>
          <Icon name="minus" size={18} color={c[accent]} />
        </Pressable>
        <AppText variant="heading" style={styles.value}>
          {format(value)}
        </AppText>
        <Pressable onPress={inc} disabled={value >= max} style={[styles.btn, { borderColor: c.lineStrong }, value >= max && styles.disabled]} hitSlop={6}>
          <Icon name="plus" size={18} color={c[accent]} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 56 },
  text: { flex: 1 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  btn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.35 },
  value: { minWidth: 64, textAlign: 'center', fontVariant: ['tabular-nums'] },
});
