import { Pressable, StyleSheet, View } from 'react-native';

import { accentColor, colors, radius, space, type Accent } from '@/theme';

import { AppText } from './AppText';

interface Option<T> {
  value: T;
  label: string;
  accessibilityLabel?: string;
}

interface Props<T> {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  accent?: Accent;
  wrap?: boolean;
}

/** Row of pill buttons, one selected. Used for small discrete choices. */
export function Segmented<T extends string | number>({ options, value, onChange, accent = 'violet', wrap }: Props<T>) {
  return (
    <View style={[styles.row, wrap && styles.wrap]} accessibilityRole="radiogroup">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            onPress={() => onChange(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={o.accessibilityLabel ?? o.label}
            style={[
              styles.pill,
              !wrap && styles.flex,
              selected && { backgroundColor: accentColor[accent], borderColor: accentColor[accent] },
            ]}>
            <AppText variant="label" center style={{ color: selected ? colors.onAccent : colors.text }}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.sm },
  wrap: { flexWrap: 'wrap' },
  flex: { flex: 1 },
  pill: {
    minHeight: 48,
    minWidth: 48,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
});
