import { Pressable, StyleSheet, View } from 'react-native';

import { palettes, radius, space, themeLabels, useTheme, type ThemeName } from '@/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';

/** Palette choice shown as small paintings of each theme in the current mode. */
export function ThemePicker({ value, onChange }: { value: ThemeName; onChange: (t: ThemeName) => void }) {
  const { c } = useTheme();
  return (
    <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel="Colour theme">
      {(Object.keys(palettes) as ThemeName[]).map((name) => {
        const p = palettes[name][c.scheme];
        const selected = name === value;
        return (
          <Pressable
            key={name}
            onPress={() => onChange(name)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`${themeLabels[name].name}: ${themeLabels[name].description}`}
            style={[styles.option, { borderColor: selected ? c.text : c.line }]}>
            <View style={[styles.swatch, { backgroundColor: p.bg }]}>
              <View style={[styles.sun, { backgroundColor: p.halo }]} />
              <View style={styles.dots}>
                {[p.calm, p.breath, p.warm].map((col) => (
                  <View key={col} style={[styles.dot, { backgroundColor: col }]} />
                ))}
              </View>
              {selected ? (
                <View style={[styles.check, { backgroundColor: p.text }]}>
                  <Icon name="checkmark" size={12} color={p.bg} />
                </View>
              ) : null}
            </View>
            <AppText variant="label" center style={{ color: selected ? c.text : c.textSoft }}>
              {themeLabels[name].name}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.sm },
  option: { flex: 1, borderWidth: 1, borderRadius: radius.md, padding: space.xs, paddingBottom: space.sm, gap: space.sm },
  swatch: { height: 72, borderRadius: radius.sm, overflow: 'hidden', justifyContent: 'flex-end', padding: space.sm },
  sun: { position: 'absolute', width: 64, height: 64, borderRadius: 32, top: -18, right: -14 },
  dots: { flexDirection: 'row', gap: 5 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  check: { position: 'absolute', top: 6, left: 6, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
