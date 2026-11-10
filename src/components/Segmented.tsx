import { Pressable, StyleSheet, View } from 'react-native';

import { radius, space, useTheme, type Accent } from '@/theme';

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

/** Row of soft pills, one selected. Used for small discrete choices. */
export function Segmented<T extends string | number>({ options, value, onChange, accent = 'calm', wrap }: Props<T>) {
  const { c } = useTheme();
  const soft = { calm: c.calmSoft, breath: c.breathSoft, warm: c.warmSoft }[accent];
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
              { borderColor: selected ? c[accent] : c.lineStrong, backgroundColor: selected ? soft : 'transparent' },
            ]}>
            <AppText variant="label" center style={{ color: selected ? c[accent] : c.textSoft }}>
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
    minHeight: 46,
    minWidth: 48,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
