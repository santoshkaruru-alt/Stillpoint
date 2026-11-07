import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { sessionPlans } from '@content/sessionPlans';
import { AppText } from '@/components/AppText';
import { Card, PathCard } from '@/components/Card';
import { MoodPicker } from '@/components/MoodPicker';
import { Screen } from '@/components/Screen';
import { startMeditation } from '@/lib/navigation';
import { useSettings } from '@/store/settings';
import { accentColor, colors, radius, space } from '@/theme';

export default function MeditateTab() {
  const intention = useSettings((s) => s.intention);
  const [mood, setMood] = useState<number | null>(null);
  const hasIntention = !!(intention.identity || intention.emotion || intention.scene);

  return (
    <Screen accent="violet">
      <View style={styles.header}>
        <AppText variant="overline" tone="violet">
          Meditate
        </AppText>
        <AppText variant="display" accessibilityRole="header">
          Become who you are becoming
        </AppText>
      </View>

      <PathCard
        title={hasIntention ? 'Your intention' : 'Set your intention'}
        subtitle={
          hasIntention
            ? [intention.identity && `Becoming ${intention.identity}`, intention.emotion && `Feeling ${intention.emotion}`]
                .filter(Boolean)
                .join(' · ') || 'Your future scene is ready'
            : 'Who you are becoming, how it feels, one future scene'
        }
        icon="scope"
        accent="amber"
        compact
        onPress={() => router.push('/intention')}
        accessibilityHint="Opens the intention builder"
      />

      <View style={styles.list}>
        {sessionPlans.map((p) => (
          <PathCard
            key={p.lengthMin}
            title={p.name}
            subtitle={p.description}
            accent="violet"
            onPress={() => startMeditation(p.lengthMin, 0, mood)}
            accessibilityHint={`Starts the ${p.lengthMin} minute session`}
            right={
              <View style={styles.minutes}>
                <AppText variant="heading" tone="violet">
                  {p.lengthMin}
                </AppText>
                <AppText variant="caption" tone="faint">
                  min
                </AppText>
              </View>
            }
          />
        ))}
      </View>

      <Card>
        <MoodPicker label="How do you feel before you begin?" value={mood} onChange={setMood} accent="violet" />
      </Card>

      <AppText variant="caption" tone="faint" center>
        Use headphones for the best experience. Sit or lie somewhere safe and comfortable.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.sm, paddingTop: space.xl },
  list: { gap: space.md },
  minutes: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: `${accentColor.violet}55`,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
