import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Stepper } from '@/components/Stepper';
import { newId } from '@/db';
import { buildBreathSteps, estimateDurationSec, formatClock } from '@/engine/breath';
import type { PacedPattern } from '@/models/types';
import { useCustomPatterns } from '@/store/customPatterns';
import { colors, radius, space, type } from '@/theme';

const secs = (v: number) => (v === 0 ? 'off' : `${v}s`);

/** Build a custom paced pattern: inhale, hold, exhale, hold, rounds. */
export default function Builder() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useCustomPatterns((s) => s.patterns.find((p) => p.id === id));
  const save = useCustomPatterns((s) => s.save);
  const remove = useCustomPatterns((s) => s.remove);

  const phase = (t: string, fallback: number) => existing?.phases.find((p) => p.type === t)?.sec ?? fallback;
  const [name, setName] = useState(existing?.name ?? '');
  const [inhale, setInhale] = useState(phase('inhale', 4));
  const [holdIn, setHoldIn] = useState(phase('holdIn', 2));
  const [exhale, setExhale] = useState(phase('exhale', 6));
  const [holdOut, setHoldOut] = useState(phase('holdOut', 0));
  const [rounds, setRounds] = useState(existing?.rounds ?? 10);

  const pattern: PacedPattern = {
    id: existing?.id ?? `custom-${newId()}`,
    kind: 'paced',
    name: name.trim() || `${inhale}-${holdIn}-${exhale}-${holdOut}`,
    summary: `In ${inhale}, hold ${holdIn}, out ${exhale}, hold ${holdOut} · ${rounds} rounds`,
    rounds,
    phases: [
      { type: 'inhale', sec: inhale, cue: 'Breathe in' },
      { type: 'holdIn', sec: holdIn, cue: 'Hold' },
      { type: 'exhale', sec: exhale, cue: 'Breathe out' },
      { type: 'holdOut', sec: holdOut, cue: 'Rest' },
    ],
  };
  const total = estimateDurationSec(buildBreathSteps(pattern));

  const saveAndStart = () => {
    save(pattern);
    router.replace({ pathname: '/breath/[pattern]', params: { pattern: pattern.id } });
  };

  return (
    <Screen accent="teal" edges={['top', 'bottom']}>
      <View style={styles.header}>
        <AppText variant="title" accessibilityRole="header">
          {existing ? 'Edit pattern' : 'Build a pattern'}
        </AppText>
        <AppText tone="muted">Set each phase in seconds. Set a hold to 0 to skip it.</AppText>
      </View>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Name (optional)"
        placeholderTextColor={colors.textFaint}
        style={styles.input}
        accessibilityLabel="Pattern name"
        maxLength={40}
        returnKeyType="done"
      />

      <Card style={styles.card}>
        <Stepper label="Breathe in" value={inhale} onChange={setInhale} min={1} max={15} step={0.5} format={secs} accent="teal" />
        <Stepper label="Hold" value={holdIn} onChange={setHoldIn} min={0} max={30} step={0.5} format={secs} accent="teal" />
        <Stepper label="Breathe out" value={exhale} onChange={setExhale} min={1} max={20} step={0.5} format={secs} accent="teal" />
        <Stepper label="Hold empty" value={holdOut} onChange={setHoldOut} min={0} max={30} step={0.5} format={secs} accent="teal" />
        <Stepper label="Rounds" value={rounds} onChange={setRounds} min={1} max={99} accent="teal" />
      </Card>

      <AppText tone="muted" center accessibilityLiveRegion="polite">
        About {formatClock(total)} in total
      </AppText>

      <Button label="Save and start" icon="play.fill" accent="teal" size="xl" onPress={saveAndStart} />
      <Button
        label="Save"
        kind="secondary"
        onPress={() => {
          save(pattern);
          router.back();
        }}
      />
      {existing ? (
        <Button
          label="Delete pattern"
          kind="ghost"
          onPress={() => {
            remove(existing.id);
            router.back();
          }}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.sm, paddingTop: space.md },
  card: { gap: space.sm },
  input: {
    ...type.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    minHeight: 56,
  },
});
