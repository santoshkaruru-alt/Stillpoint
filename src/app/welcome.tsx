import { StyleSheet, View } from 'react-native';

import { safetyAcknowledge, safetyFooter, safetyIntro, safetyTitle } from '@content/safety';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { SafetyList } from '@/components/SafetyList';
import { Screen } from '@/components/Screen';
import { useSettings } from '@/store/settings';
import { space } from '@/theme';

/** First-launch safety screen. The app stays locked until acknowledged. */
export default function Welcome() {
  const set = useSettings((s) => s.set);

  return (
    <Screen edges={['top', 'bottom']} accent="amber">
      <View style={styles.header}>
        <AppText variant="overline" tone="amber">
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
        accent="amber"
        size="xl"
        onPress={() => set({ safetyAcknowledgedAt: Date.now() })}
        accessibilityHint="Confirms you have read the safety guidance and opens the app"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.sm, paddingTop: space.xl },
});
