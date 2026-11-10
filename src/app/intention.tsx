import * as Speech from 'expo-speech';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { intentionPrompts } from '@content/intention';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { resolveIntention } from '@/engine/template';
import { startMeditation } from '@/lib/navigation';
import type { Intention } from '@/models/types';
import { defaultIntention, useSettings } from '@/store/settings';
import { makeStyles, radius, space, type, useTheme } from '@/theme';

const FIELDS: (keyof Intention)[] = ['identity', 'emotion', 'scene'];

/**
 * Intention builder: who you are becoming, the feeling, one future scene.
 * These are woven into the Future Self part of every meditation.
 */
export default function IntentionBuilder() {
  const styles = useStyles();
  const { c } = useTheme();
  const saved = useSettings((s) => s.intention);
  const set = useSettings((s) => s.set);
  const [draft, setDraft] = useState<Intention>(saved);

  useEffect(() => () => void Speech.stop(), []);

  const update = (key: keyof Intention, value: string) => setDraft((d) => ({ ...d, [key]: value }));
  const resolved = resolveIntention(draft);
  const preview = `You are becoming ${resolved.identity}. You feel ${resolved.emotion}. ${resolved.scene}`;

  const hear = () => {
    const voice = useSettings.getState();
    void Speech.stop();
    Speech.speak(preview, { rate: voice.voiceRate, pitch: voice.voicePitch, voice: voice.voiceId ?? undefined, language: 'en-US' });
  };

  const save = () => {
    set({ intention: draft });
    router.back();
  };

  const saveAndBegin = () => {
    set({ intention: draft });
    router.back();
    setTimeout(() => startMeditation(20), 250);
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.flex}>
      <Screen accent="warm" edges={['top', 'bottom']}>
        <View style={styles.header}>
          <AppText variant="overline" tone="warm">
            Intention
          </AppText>
          <AppText variant="title" accessibilityRole="header">
            Who are you becoming?
          </AppText>
          <AppText tone="muted">
            Write it as if it is already true. Your words are spoken back to you in the Future Self part of each session.
          </AppText>
        </View>

        {FIELDS.map((key) => {
          const p = intentionPrompts[key];
          const multiline = key === 'scene';
          return (
            <Card key={key} style={styles.card}>
              <AppText variant="label">{p.label}</AppText>
              <AppText variant="caption" tone="warm">
                {p.lead}
              </AppText>
              <TextInput
                value={draft[key]}
                onChangeText={(v) => update(key, v)}
                placeholder={p.placeholder}
                placeholderTextColor={c.textFaint}
                multiline={multiline}
                style={[styles.input, multiline && styles.multiline]}
                accessibilityLabel={p.label}
                accessibilityHint={p.lead}
                maxLength={multiline ? 600 : 120}
                returnKeyType={multiline ? 'default' : 'done'}
                blurOnSubmit={!multiline}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                {p.examples.map((ex) => (
                  <Pressable
                    key={ex}
                    onPress={() => update(key, ex)}
                    style={styles.chip}
                    accessibilityRole="button"
                    accessibilityLabel={`Use example: ${ex}`}>
                    <AppText variant="caption" tone="muted" numberOfLines={1}>
                      {ex}
                    </AppText>
                  </Pressable>
                ))}
              </ScrollView>
            </Card>
          );
        })}

        <Card style={styles.card}>
          <AppText variant="overline" tone="faint">
            How it will sound
          </AppText>
          <AppText style={styles.preview}>{preview}</AppText>
          <Button label="Hear it" icon="speaker.wave.2" kind="secondary" size="md" onPress={hear} />
        </Card>

        <Button label="Save and begin 20 min" icon="play.fill" accent="warm" size="xl" onPress={saveAndBegin} />
        <Button label="Save" kind="secondary" onPress={save} />
        <Button label="Clear all" kind="ghost" onPress={() => setDraft(defaultIntention)} />
      </Screen>
    </KeyboardAvoidingView>
  );
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
  flex: { flex: 1, backgroundColor: c.bg },
  header: { gap: space.sm, paddingTop: space.md },
  card: { gap: space.sm },
  input: {
    ...type.body,
    color: c.text,
    backgroundColor: c.surface,
    borderColor: c.line,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    minHeight: 52,
  },
  multiline: { minHeight: 120, textAlignVertical: 'top' },
  chips: { gap: space.sm, paddingVertical: space.xs },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: c.line,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    maxWidth: 280,
  },
  preview: { fontStyle: 'italic', color: c.textSoft },
  }),
);
