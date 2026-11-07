import type { SFSymbol } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { safetyPoints } from '@content/safety';
import { colors, space } from '@/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';

/** The list of safety points shared by the welcome and pre-breathwork screens. */
export function SafetyList() {
  return (
    <View style={styles.list} accessibilityRole="list">
      {safetyPoints.map((p) => (
        <View key={p.text} style={styles.row} accessible accessibilityLabel={p.text}>
          <View style={styles.icon}>
            <Icon name={p.icon as SFSymbol} size={22} color={colors.amber} />
          </View>
          <AppText style={styles.text}>{p.text}</AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: space.md },
  row: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  icon: { width: 32, paddingTop: 2, alignItems: 'center' },
  text: { flex: 1 },
});
