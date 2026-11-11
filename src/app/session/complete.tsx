import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { MoodPicker } from '@/components/MoodPicker';
import { themeScene } from '@/components/Scene';
import { Screen } from '@/components/Screen';
import { getPractice, newId, saveJournal } from '@/db';
import { formatClock } from '@/engine/breath';
import { makeStyles, radius, space, type, useTheme } from '@/theme';

/**
 * After a meditation or breathwork session: mood check-in and a short note.
 * Both are optional; "Done" without input saves nothing extra.
 */
export default function Complete() {
  const styles = useStyles();
  const { c, name } = useTheme();
  const params = useLocalSearchParams<{ practiceId?: string; kind?: string; title?: string; moodBefore?: string }>();
  const practice = params.practiceId ? getPractice(params.practiceId) : null;
  const moodBefore = params.moodBefore ? Number(params.moodBefore) : null;
  const accent = params.kind === 'breath' ? 'breath' : 'calm';

  const [moodAfter, setMoodAfter] = useState<number | null>(null);
  const [note, setNote] = useState('');

  const done = () => {
    if (moodAfter !== null || moodBefore !== null || note.trim()) {
      saveJournal({
        id: newId(),
        createdAt: Date.now(),
        practiceId: practice?.id ?? null,
        moodBefore,
        moodAfter,
        note: note.trim(),
      });
    }
    router.back();
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.flex}>
      <Screen accent={accent} edges={['top', 'bottom']} scene={params.kind === 'breath' ? 'sea' : themeScene[name]} sceneHeight={240}>
        <View style={styles.header}>
          <AppText variant="overline" tone={accent}>
            {params.title ?? 'Session'}
            {practice ? ` · ${formatClock(practice.durationSec)}` : ''}
          </AppText>
          <AppText variant="title" accessibilityRole="header">
            Take a moment to notice how you feel.
          </AppText>
          {moodBefore ? (
            <AppText tone="muted">You started at {moodBefore} out of 10.</AppText>
          ) : null}
        </View>

        <Card style={styles.card}>
          <MoodPicker label="How do you feel now?" value={moodAfter} onChange={setMoodAfter} accent={accent} />
        </Card>

        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="A few words about this session (optional)"
          placeholderTextColor={c.textFaint}
          multiline
          style={styles.input}
          accessibilityLabel="Session note"
          maxLength={1000}
        />

        <Button label="Done" accent={accent} size="xl" onPress={done} />
      </Screen>
    </KeyboardAvoidingView>
  );
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
  flex: { flex: 1, backgroundColor: c.bg },
  header: { gap: space.sm, paddingTop: 120 },
  card: { gap: space.md },
  input: {
    ...type.body,
    color: c.text,
    backgroundColor: c.surface,
    borderColor: c.line,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.md,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  }),
);
