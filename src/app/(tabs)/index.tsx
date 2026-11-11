import { router } from 'expo-router';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { lineForToday } from '@content/dailyLines';
import { planFor } from '@content/sessionPlans';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { CardGroup, PathCard } from '@/components/Card';
import { themeScene } from '@/components/Scene';
import { Screen } from '@/components/Screen';
import { continueLastSession, startMeditation } from '@/lib/navigation';
import { useSettings } from '@/store/settings';
import { space, useTheme } from '@/theme';

function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 5) return 'Still awake';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function todayLabel(date = new Date()): string {
  return date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function Home() {
  const { name } = useTheme();
  const { height } = useWindowDimensions();
  const last = useSettings((s) => s.lastSession);
  const sceneHeight = Math.round(Math.min(560, Math.max(380, height * 0.6)));

  // Mornings suggest the short session; later, the 20 minute one.
  const suggested = planFor(new Date().getHours() < 12 ? 'reset' : 'return')!;

  return (
    <Screen scene={themeScene[name]} sceneHeight={sceneHeight}>
      <View style={styles.header}>
        <AppText variant="overline" tone="muted">
          {todayLabel()}
        </AppText>
        <AppText variant="display" accessibilityRole="header">
          {greeting()}
        </AppText>
      </View>

      {/* Let the landscape breathe */}
      <View style={{ height: sceneHeight * 0.5 }} />

      <AppText variant="quote" center style={styles.line}>
        {lineForToday()}
      </AppText>

      <View style={styles.begin}>
        <Button
          label={`Begin · ${suggested.name}, ${suggested.lengthMin} min`}
          size="xl"
          onPress={() => startMeditation(suggested.id)}
          accessibilityHint="Starts today's suggested meditation"
        />
        {last ? (
          <Button
            label={`Continue: ${last.title}`}
            kind="ghost"
            size="md"
            icon="play.fill"
            onPress={continueLastSession}
            accessibilityHint="Starts your most recent session again"
          />
        ) : null}
      </View>

      <CardGroup>
        <PathCard bare title="Meditate" subtitle="Guided journeys, 10 to 60 minutes" icon="sparkles" accent="calm" onPress={() => router.navigate('/meditate')} />
        <PathCard bare title="Breathe" subtitle="Paced breathing and breath holds" icon="wind" accent="breath" onPress={() => router.navigate('/breathe')} />
        <PathCard bare title="Journal" subtitle="Mood, notes and your progress" icon="book" accent="warm" onPress={() => router.navigate('/journal')} />
      </CardGroup>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.xs, paddingTop: space.md },
  line: { maxWidth: 340, alignSelf: 'center' },
  begin: { gap: space.xs },
});
