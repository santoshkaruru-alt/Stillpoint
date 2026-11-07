import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { powerSafetyIntro, powerSafetyTitle, safetyFooter } from '@content/safety';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Segmented } from '@/components/Segmented';
import { SafetyList } from '@/components/SafetyList';
import { Screen } from '@/components/Screen';
import { findPattern } from '@/store/customPatterns';
import { space } from '@/theme';

const BREATH_OPTIONS = [30, 35, 40] as const;

/** Shown every time before intense breathwork. Requires a tap to continue. */
export default function BreathSafety() {
  const { pattern: patternId } = useLocalSearchParams<{ pattern: string }>();
  const pattern = findPattern(patternId);
  const [breaths, setBreaths] = useState<number>(pattern?.kind === 'power' ? pattern.breathsPerRound : 30);

  const start = () => {
    router.replace({
      pathname: '/breath/[pattern]',
      params: pattern?.kind === 'power' ? { pattern: patternId, breaths: String(breaths) } : { pattern: patternId },
    });
  };

  return (
    <Screen accent="amber" edges={['top', 'bottom']}>
      <View style={styles.header}>
        <AppText variant="overline" tone="amber">
          {pattern?.name ?? 'Breathwork'}
        </AppText>
        <AppText variant="title" accessibilityRole="header">
          {powerSafetyTitle}
        </AppText>
        <AppText tone="muted">{powerSafetyIntro}</AppText>
      </View>
      <Card>
        <SafetyList />
      </Card>
      {pattern?.kind === 'power' ? (
        <View style={styles.choice}>
          <AppText variant="label">Breaths per round</AppText>
          <Segmented
            options={BREATH_OPTIONS.map((n) => ({ value: n, label: String(n) }))}
            value={breaths}
            onChange={setBreaths}
            accent="amber"
          />
        </View>
      ) : null}
      <AppText variant="caption" tone="faint">
        {safetyFooter} A large Stop button stays on screen the whole time.
      </AppText>
      <Button label="I understand, begin" accent="amber" size="xl" onPress={start} />
      <Button label="Not now" kind="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.sm, paddingTop: space.md },
  choice: { gap: space.sm },
});
