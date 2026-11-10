import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { bedLabels } from '@/audio/ambient';
import { TIMER_INTERVALS, TIMER_LENGTHS } from '@/engine/timer';
import { startTimer } from '@/lib/navigation';
import type { AmbientBedId } from '@/models/types';
import { useSettings } from '@/store/settings';
import { radius, space, useTheme } from '@/theme';

import { AppText } from './AppText';
import { Card } from './Card';
import { Icon } from './Icon';
import { Segmented } from './Segmented';

/** Unguided sits: tap a length to begin. Bells and sound tuck away below. */
export function SilentTimerCard() {
  const { c } = useTheme();
  const interval = useSettings((s) => s.timerIntervalMin);
  const bed = useSettings((s) => s.timerBed);
  const set = useSettings((s) => s.set);
  const [open, setOpen] = useState(false);

  return (
    <Card style={styles.card}>
      <View style={styles.head}>
        <View style={styles.flex}>
          <AppText variant="overline" tone="calm">
            Silent timer
          </AppText>
          <AppText variant="heading">Sit in stillness</AppText>
        </View>
        <Icon name="timer" size={22} color={c.calm} />
      </View>

      <View style={styles.lengths} accessibilityLabel="Choose a length to begin">
        {TIMER_LENGTHS.map((m) => (
          <Pressable
            key={m}
            onPress={() => startTimer(m)}
            accessibilityRole="button"
            accessibilityLabel={`Start a ${m} minute silent sit`}
            style={({ pressed }) => [styles.chip, { borderColor: c.lineStrong }, pressed && { backgroundColor: c.calmSoft, borderColor: c.calm }]}>
            <AppText variant="heading" style={{ color: c.text }}>
              {m}
            </AppText>
          </Pressable>
        ))}
      </View>
      <AppText variant="caption" tone="faint">
        Minutes. Tap one to begin.
      </AppText>

      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.optionsRow}>
        <AppText variant="caption" tone="muted" style={styles.flex}>
          {interval ? `Bell every ${interval} min` : 'No interval bells'} · {bedLabels[bed]}
        </AppText>
        <AppText variant="label" tone="calm">
          {open ? 'Done' : 'Bells and sound'}
        </AppText>
      </Pressable>

      {open ? (
        <View style={styles.options}>
          <AppText variant="label">Interval bells</AppText>
          <Segmented
            options={TIMER_INTERVALS.map((v) => ({ value: v, label: v ? `${v} min` : 'Off' }))}
            value={interval}
            onChange={(v) => set({ timerIntervalMin: v })}
          />
          <AppText variant="label">Sound</AppText>
          <Segmented
            wrap
            options={(['drift', 'tide', 'rain', 'deep', 'none'] as AmbientBedId[]).map((b) => ({ value: b, label: bedLabels[b] }))}
            value={bed}
            onChange={(v) => set({ timerBed: v })}
          />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.md },
  head: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1 },
  lengths: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    minWidth: 52,
    height: 52,
    paddingHorizontal: space.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 44 },
  options: { gap: space.sm },
});
