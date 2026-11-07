import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { MoodPicker } from '@/components/MoodPicker';
import { Screen } from '@/components/Screen';
import { newId, saveJournal } from '@/db';
import { colors, radius, space, type } from '@/theme';

/** A standalone journal note with an optional mood rating. */
export default function NewNote() {
  const [mood, setMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const canSave = mood !== null || note.trim().length > 0;

  const save = () => {
    saveJournal({ id: newId(), createdAt: Date.now(), practiceId: null, moodBefore: null, moodAfter: mood, note: note.trim() });
    router.back();
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.flex}>
      <Screen accent="amber" edges={['top', 'bottom']}>
        <View style={styles.header}>
          <AppText variant="title" accessibilityRole="header">
            A note to yourself
          </AppText>
          <AppText tone="muted">What did you notice today? What are you grateful for?</AppText>
        </View>
        <Card>
          <MoodPicker label="How do you feel?" value={mood} onChange={setMood} />
        </Card>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Write freely…"
          placeholderTextColor={colors.textFaint}
          multiline
          autoFocus
          style={styles.input}
          accessibilityLabel="Note"
          maxLength={2000}
        />
        <Button label="Save" accent="amber" size="xl" onPress={save} disabled={!canSave} />
        <Button label="Cancel" kind="ghost" onPress={() => router.back()} />
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  header: { gap: space.sm, paddingTop: space.md },
  input: {
    ...type.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.md,
    minHeight: 180,
    textAlignVertical: 'top',
  },
});
