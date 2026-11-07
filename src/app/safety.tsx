import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { safetyFooter, safetyIntro, safetyTitle } from '@content/safety';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { SafetyList } from '@/components/SafetyList';
import { Screen } from '@/components/Screen';
import { space } from '@/theme';

/** Safety guidance, reachable any time from Settings. */
export default function SafetyInfo() {
  return (
    <Screen accent="amber" edges={['top', 'bottom']}>
      <View style={styles.header}>
        <AppText variant="title" accessibilityRole="header">
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
      <Button label="Close" kind="secondary" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.sm, paddingTop: space.md },
});
