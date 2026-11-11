import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { sessionPlans } from '@content/sessionPlans';
import { AppText } from '@/components/AppText';
import { Card, CardGroup } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { MoodPicker } from '@/components/MoodPicker';
import { themeScene } from '@/components/Scene';
import { Screen } from '@/components/Screen';
import { SilentTimerCard } from '@/components/SilentTimerCard';
import { startMeditation } from '@/lib/navigation';
import { useSettings } from '@/store/settings';
import { makeStyles, space, useTheme } from '@/theme';

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    header: { gap: space.xs, paddingTop: space.md, paddingBottom: 150 },
    intention: { gap: space.sm },
    intentionTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    session: { flexDirection: 'row', alignItems: 'center', gap: space.lg, paddingHorizontal: space.lg, paddingVertical: space.lg },
    minutes: { width: 58, alignItems: 'center' },
    minutesNum: { fontSize: 46, lineHeight: 48, color: c.calm },
    sessionText: { flex: 1, gap: 2 },
    pressed: { opacity: 0.7 },
    note: { paddingHorizontal: space.md },
  }),
);

export default function MeditateTab() {
  const styles = useStyles();
  const { c, name } = useTheme();
  const intention = useSettings((s) => s.intention);
  const [mood, setMood] = useState<number | null>(null);
  const hasIntention = !!(intention.identity || intention.emotion || intention.scene);

  return (
    <Screen accent="calm" scene={themeScene[name]} sceneHeight={300}>
      <View style={styles.header}>
        <AppText variant="overline" tone="calm">
          Meditate
        </AppText>
        <AppText variant="display" accessibilityRole="header">
          Become who you are becoming
        </AppText>
      </View>

      <Pressable onPress={() => router.push('/intention')} accessibilityRole="button" accessibilityHint="Opens the intention builder">
        {({ pressed }) => (
          <Card style={[styles.intention, pressed && styles.pressed]}>
            <View style={styles.intentionTop}>
              <AppText variant="overline" tone="warm">
                {hasIntention ? 'Your intention' : 'Set your intention'}
              </AppText>
              <Icon name="pencil" size={16} color={c.textFaint} />
            </View>
            <AppText variant="quote" tone={hasIntention ? 'default' : 'muted'}>
              {hasIntention
                ? [intention.identity && `Becoming ${intention.identity}.`, intention.emotion && `Feeling ${intention.emotion}.`].filter(Boolean).join(' ') ||
                  'Your future scene is ready.'
                : 'Who you are becoming, how it feels, and one moment from your future.'}
            </AppText>
          </Card>
        )}
      </Pressable>

      <CardGroup>
        {sessionPlans.map((p) => (
          <Pressable
            key={p.lengthMin}
            onPress={() => startMeditation(p.lengthMin, 0, mood)}
            accessibilityRole="button"
            accessibilityLabel={`${p.name}, ${p.lengthMin} minutes. ${p.description}`}
            accessibilityHint="Starts this session"
            style={({ pressed }) => [styles.session, pressed && styles.pressed]}>
            <View style={styles.minutes}>
              <AppText variant="display" style={styles.minutesNum}>
                {p.lengthMin}
              </AppText>
              <AppText variant="overline" tone="faint">
                min
              </AppText>
            </View>
            <View style={styles.sessionText}>
              <AppText variant="heading">{p.name}</AppText>
              <AppText variant="caption" tone="muted">
                {p.description}
              </AppText>
            </View>
            <Icon name="play.fill" size={14} color={c.calm} />
          </Pressable>
        ))}
      </CardGroup>

      <SilentTimerCard />

      <Card>
        <MoodPicker label="Before you begin, how do you feel?" value={mood} onChange={setMood} accent="calm" />
      </Card>

      <AppText variant="caption" tone="faint" center style={styles.note}>
        Headphones recommended. Sit or lie somewhere safe and comfortable.
      </AppText>
    </Screen>
  );
}
