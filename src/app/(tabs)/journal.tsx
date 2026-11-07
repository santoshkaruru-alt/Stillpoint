import { router } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { HistoryCalendar } from '@/components/HistoryCalendar';
import { HoldChart } from '@/components/HoldChart';
import { moodWords } from '@/components/MoodPicker';
import { Screen } from '@/components/Screen';
import { deleteJournal, listHolds, listJournal, listPractices, useDataVersion } from '@/db';
import { averageMoodLift, currentStreak, holdTrend, longestStreak, minutesByDay, practiceDays, totalMinutes } from '@/engine/stats';
import type { JournalEntry, PracticeLog } from '@/models/types';
import { colors, space } from '@/theme';

export default function JournalTab() {
  const version = useDataVersion((s) => s.v);
  const { width } = useWindowDimensions();

  const data = useMemo(() => {
    void version;
    const practices = listPractices();
    const journal = listJournal();
    const days = practiceDays(practices);
    return {
      practices,
      journal,
      streak: currentStreak(days),
      longest: longestStreak(days),
      minutes: totalMinutes(practices),
      byDay: minutesByDay(practices),
      trend: holdTrend(listHolds()),
      lift: averageMoodLift(journal),
      byId: new Map(practices.map((p) => [p.id, p])),
    };
  }, [version]);

  const chartWidth = width - space.lg * 2 - space.lg * 2;

  return (
    <Screen accent="amber">
      <View style={styles.header}>
        <AppText variant="overline" tone="amber">
          Journal
        </AppText>
        <AppText variant="display" accessibilityRole="header">
          Your practice
        </AppText>
      </View>

      <View style={styles.tiles}>
        <Tile value={String(data.streak)} label="day streak" sub={`Best ${data.longest}`} />
        <Tile value={String(data.minutes)} label="minutes" sub={`${data.practices.length} ${data.practices.length === 1 ? 'session' : 'sessions'}`} />
        <Tile
          value={data.lift === null ? '–' : `${data.lift >= 0 ? '+' : ''}${data.lift.toFixed(1)}`}
          label="mood lift"
          sub="per session"
        />
      </View>

      <Button label="Write a note" icon="square.and.pencil" accent="amber" onPress={() => router.push('/journal/new')} />

      <Card>
        <HistoryCalendar minutes={data.byDay} />
      </Card>

      <Card style={styles.card}>
        <AppText variant="heading" accessibilityRole="header">
          Breath-hold trend
        </AppText>
        <AppText variant="caption" tone="faint">
          Best exhale hold in each Power rounds session
        </AppText>
        <HoldChart points={data.trend} width={chartWidth} />
      </Card>

      <View style={styles.section}>
        <AppText variant="heading" accessibilityRole="header">
          Entries
        </AppText>
        {data.journal.length === 0 ? (
          <AppText tone="faint">After a session, your mood and notes appear here.</AppText>
        ) : (
          data.journal.slice(0, 50).map((e) => <EntryRow key={e.id} entry={e} practice={e.practiceId ? data.byId.get(e.practiceId) : undefined} />)
        )}
      </View>
    </Screen>
  );
}

function Tile({ value, label, sub }: { value: string; label: string; sub: string }) {
  return (
    <View style={styles.tile} accessible accessibilityLabel={`${value} ${label}. ${sub}`}>
      <AppText variant="title">{value}</AppText>
      <AppText variant="caption" tone="muted">
        {label}
      </AppText>
      <AppText variant="caption" tone="faint" numberOfLines={2}>
        {sub}
      </AppText>
    </View>
  );
}

function EntryRow({ entry, practice }: { entry: JournalEntry; practice?: PracticeLog }) {
  const when = new Date(entry.createdAt).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  const mood =
    entry.moodBefore !== null && entry.moodAfter !== null
      ? `Mood ${entry.moodBefore} → ${entry.moodAfter}`
      : entry.moodAfter !== null
        ? `Mood ${entry.moodAfter} · ${moodWords[entry.moodAfter]}`
        : entry.moodBefore !== null
          ? `Mood before ${entry.moodBefore}`
          : null;

  const confirmDelete = () =>
    Alert.alert('Delete this entry?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteJournal(entry.id) },
    ]);

  return (
    <Pressable onLongPress={confirmDelete} accessibilityHint="Long press to delete" accessibilityActions={[{ name: 'delete', label: 'Delete entry' }]} onAccessibilityAction={confirmDelete}>
      <Card style={styles.entry}>
        <View style={styles.entryTop}>
          <AppText variant="caption" tone="faint">
            {when}
          </AppText>
          {mood ? (
            <AppText variant="caption" tone="amber">
              {mood}
            </AppText>
          ) : null}
        </View>
        {practice ? <AppText variant="label">{practice.title}</AppText> : null}
        {entry.note ? <AppText>{entry.note}</AppText> : null}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.sm, paddingTop: space.xl },
  tiles: { flexDirection: 'row', gap: space.sm },
  tile: {
    flex: 1,
    backgroundColor: 'rgba(26, 27, 68, 0.72)',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: space.md,
    gap: 2,
  },
  card: { gap: space.sm },
  section: { gap: space.md },
  entry: { gap: space.xs, paddingVertical: space.md },
  entryTop: { flexDirection: 'row', justifyContent: 'space-between', gap: space.md },
});
