import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { monthGrid } from '@/engine/stats';
import { makeStyles, radius, space, useTheme, withAlpha } from '@/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** Month view with a soft dot on every day you practised. */
export function HistoryCalendar({ minutes }: { minutes: Map<string, number> }) {
  const styles = useStyles();
  const { c } = useTheme();
  const today = new Date();
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const weeks = monthGrid(cursor.y, cursor.m, today);
  const title = new Date(cursor.y, cursor.m, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const isCurrent = cursor.y === today.getFullYear() && cursor.m === today.getMonth();
  const shift = (d: number) =>
    setCursor(({ y, m }) => {
      const n = new Date(y, m + d, 1);
      return { y: n.getFullYear(), m: n.getMonth() };
    });

  const daysPractised = weeks.flat().filter((d) => d.inMonth && minutes.has(d.key)).length;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Pressable onPress={() => shift(-1)} accessibilityRole="button" accessibilityLabel="Previous month" hitSlop={10} style={styles.nav}>
          <Icon name="chevron.left" size={16} color={c.textSoft} />
        </Pressable>
        <View style={styles.title}>
          <AppText variant="label" center accessibilityRole="header">
            {title}
          </AppText>
          <AppText variant="caption" tone="faint" center>
            {daysPractised} {daysPractised === 1 ? 'day' : 'days'} practised
          </AppText>
        </View>
        <Pressable
          onPress={() => shift(1)}
          disabled={isCurrent}
          accessibilityRole="button"
          accessibilityLabel="Next month"
          hitSlop={10}
          style={[styles.nav, isCurrent && styles.disabled]}>
          <Icon name="chevron.right" size={16} color={c.textSoft} />
        </Pressable>
      </View>
      <View style={styles.row}>
        {WEEKDAYS.map((d, i) => (
          <AppText key={i} variant="caption" tone="faint" center style={styles.cell}>
            {d}
          </AppText>
        ))}
      </View>
      {weeks.map((week) => (
        <View key={week[0].key} style={styles.row}>
          {week.map((d) => {
            const mins = d.inMonth ? (minutes.get(d.key) ?? 0) : 0;
            const level = mins === 0 ? 0 : mins < 10 ? 1 : mins < 25 ? 2 : 3;
            return (
              <View
                key={d.key}
                style={styles.cell}
                accessible={d.inMonth}
                accessibilityLabel={`${d.key}${mins ? `, ${Math.round(mins)} minutes` : ', no practice'}`}>
                <View
                  style={[
                    styles.day,
                    level > 0 && { backgroundColor: level === 3 ? c.calm : withAlpha(c.calm, level === 1 ? 0.22 : 0.45) },
                    d.isToday && styles.today,
                  ]}>
                  <AppText variant="caption" style={{ color: !d.inMonth ? 'transparent' : level === 3 ? c.onAccent : level > 0 ? c.text : c.textSoft }}>
                    {d.date}
                  </AppText>
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
  wrap: { gap: space.xs },
  header: { flexDirection: 'row', alignItems: 'center', paddingBottom: space.sm },
  title: { flex: 1 },
  nav: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.3 },
  row: { flexDirection: 'row' },
  cell: { flex: 1, alignItems: 'center', paddingVertical: 2 },
  day: { width: 36, height: 36, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  today: { borderWidth: 1.5, borderColor: c.warm },
  }),
);
