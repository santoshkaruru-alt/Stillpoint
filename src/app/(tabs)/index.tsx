import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { PathCard } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { continueLastSession } from '@/lib/navigation';
import { useSettings } from '@/store/settings';
import { space } from '@/theme';

function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 5) return 'Still awake';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Home() {
  const last = useSettings((s) => s.lastSession);

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="overline" tone="violet">
          Stillpoint
        </AppText>
        <AppText variant="display" accessibilityRole="header">
          {greeting()}
        </AppText>
        <AppText tone="muted">Where would you like to go today?</AppText>
      </View>

      {last ? (
        <PathCard
          title="Continue"
          subtitle={last.title}
          icon="play.fill"
          accent={last.kind === 'breath' ? 'teal' : 'violet'}
          onPress={continueLastSession}
          accessibilityHint="Starts your most recent session again"
        />
      ) : null}

      <View style={styles.paths}>
        <PathCard
          title="Meditate"
          subtitle="Guided sessions, 10 to 60 minutes"
          icon="sparkles"
          accent="violet"
          onPress={() => router.navigate('/meditate')}
        />
        <PathCard
          title="Breathe"
          subtitle="Paced breathing and breath holds"
          icon="wind"
          accent="teal"
          onPress={() => router.navigate('/breathe')}
        />
        <PathCard
          title="Journal"
          subtitle="Mood, notes and your progress"
          icon="book"
          accent="amber"
          onPress={() => router.navigate('/journal')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.sm, paddingTop: space.xl, paddingBottom: space.sm },
  paths: { gap: space.md },
});
