import { StyleSheet, View } from 'react-native';

import { safetyAcknowledge, safetyFooter, safetyIntro, safetyTitle } from '@content/safety';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { themeScene } from '@/components/Scene';
import { SafetyList } from '@/components/SafetyList';
import { Screen } from '@/components/Screen';
import { useSettings } from '@/store/settings';
import { space, useTheme } from '@/theme';

/** First-launch safety screen. The app stays locked until acknowledged. */
export default function Welcome() {
  const set = useSettings((s) => s.set);
  const { name } = useTheme();

  return (
    <Screen edges={['top', 'bottom']} accent="warm" scene={themeScene[name]} sceneHeight={300}>
      <View style={styles.header}>
        <View style={styles.spacer} />
        <AppText variant="overline" tone="warm">
          Stillpoint
        </AppText>
        <AppText variant="display" accessibilityRole="header">
          {safetyTitle}
        </AppText>
        <AppText tone="muted">{safetyIntro}</AppText>
      </View>
      <Card>
        <SafetyList />
      </Card>
      <AppText variant="caption" tone="faint">
        {safetyFooter}
      </AppText>
      <Button
        label={safetyAcknowledge}
        accent="warm"
        size="xl"
        onPress={() => set({ safetyAcknowledgedAt: Date.now() })}
        accessibilityHint="Confirms you have read the safety guidance and opens the app"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.sm, paddingTop: space.lg },
  spacer: { height: 150 },
});
