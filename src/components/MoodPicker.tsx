import { Pressable, StyleSheet, View } from 'react-native';

import { radius, space, useTheme, type Accent } from '@/theme';

import { AppText } from './AppText';

export const moodWords: Record<number, string> = {
  1: 'Very low',
  2: 'Low',
  3: 'Heavy',
  4: 'Unsettled',
  5: 'Okay',
  6: 'Steady',
  7: 'Good',
  8: 'Light',
  9: 'Bright',
  10: 'Wonderful',
};

interface Props {
  value: number | null;
  onChange: (v: number | null) => void;
  label: string;
  accent?: Accent;
}

/** 1 to 10 mood check-in. Tap the selected value again to clear it. */
export function MoodPicker({ value, onChange, label, accent = 'warm' }: Props) {
  const { c } = useTheme();
  const soft = { calm: c.calmSoft, breath: c.breathSoft, warm: c.warmSoft }[accent];
  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <AppText variant="label">{label}</AppText>
        <AppText variant="caption" tone="muted">
          {value ? `${value} · ${moodWords[value]}` : 'Optional'}
        </AppText>
      </View>
      <View style={styles.grid} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {[
          [1, 2, 3, 4, 5],
          [6, 7, 8, 9, 10],
        ].map((row) => (
          <View key={row[0]} style={styles.row}>
            {row.map((n) => {
              const selected = value === n;
              return (
                <Pressable
                  key={n}
                  onPress={() => onChange(selected ? null : n)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${n}, ${moodWords[n]}`}
                  style={[
                    styles.cell,
                    { borderColor: selected ? c[accent] : c.lineStrong, backgroundColor: selected ? soft : 'transparent' },
                  ]}>
                  <AppText variant="heading" style={{ color: selected ? c[accent] : c.textSoft }}>
                    {n}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.md },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  grid: { gap: space.sm },
  row: { flexDirection: 'row', gap: space.sm },
  cell: {
    flex: 1,
    minHeight: 50,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
