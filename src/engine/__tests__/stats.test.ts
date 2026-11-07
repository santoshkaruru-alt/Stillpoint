import { describe, expect, it } from '@jest/globals';

import type { BreathHold, JournalEntry, PracticeLog } from '@/models/types';

import { averageMoodLift, currentStreak, dayKey, holdTrend, longestStreak, minutesByDay, monthGrid, practiceDays, totalMinutes } from '../stats';

const day = (y: number, m: number, d: number, h = 9) => new Date(y, m - 1, d, h).getTime();
const practice = (ts: number, sec = 600): PracticeLog => ({ id: String(ts), kind: 'meditation', refId: '10', title: 't', startedAt: ts, durationSec: sec, completed: true });

describe('streaks', () => {
  const today = new Date(2026, 10, 7, 20); // 7 Nov 2026

  it('counts consecutive days ending today', () => {
    const days = practiceDays([practice(day(2026, 11, 7)), practice(day(2026, 11, 6)), practice(day(2026, 11, 5)), practice(day(2026, 11, 3))]);
    expect(currentStreak(days, today)).toBe(3);
  });

  it('keeps a streak alive through yesterday if today is not done yet', () => {
    const days = practiceDays([practice(day(2026, 11, 6)), practice(day(2026, 11, 5))]);
    expect(currentStreak(days, today)).toBe(2);
  });

  it('is zero after a missed day', () => {
    expect(currentStreak(practiceDays([practice(day(2026, 11, 5))]), today)).toBe(0);
    expect(currentStreak(new Set(), today)).toBe(0);
  });

  it('crosses month boundaries and counts several sessions in a day once', () => {
    const days = practiceDays([practice(day(2026, 11, 1, 7)), practice(day(2026, 11, 1, 21)), practice(day(2026, 10, 31)), practice(day(2026, 10, 30))]);
    expect(currentStreak(days, new Date(2026, 10, 1, 22))).toBe(3);
  });

  it('finds the longest streak', () => {
    const days = practiceDays([
      practice(day(2026, 1, 1)),
      practice(day(2026, 1, 2)),
      practice(day(2026, 1, 5)),
      practice(day(2026, 1, 6)),
      practice(day(2026, 1, 7)),
      practice(day(2026, 1, 8)),
    ]);
    expect(longestStreak(days)).toBe(4);
    expect(longestStreak(new Set())).toBe(0);
  });
});

describe('totals', () => {
  it('sums minutes and groups by day', () => {
    const list = [practice(day(2026, 11, 7, 7), 600), practice(day(2026, 11, 7, 20), 300), practice(day(2026, 11, 6), 1200)];
    expect(totalMinutes(list)).toBe(35);
    const byDay = minutesByDay(list);
    expect(byDay.get('2026-11-07')).toBe(15);
    expect(byDay.get('2026-11-06')).toBe(20);
  });

  it('formats local day keys', () => {
    expect(dayKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
});

describe('monthGrid', () => {
  it('builds Monday-first weeks covering the month', () => {
    const weeks = monthGrid(2026, 10, new Date(2026, 10, 7)); // November 2026 starts on a Sunday
    expect(weeks[0]).toHaveLength(7);
    expect(weeks[0][0].key).toBe('2026-10-26');
    expect(weeks[0][6]).toMatchObject({ key: '2026-11-01', inMonth: true });
    const flat = weeks.flat();
    expect(flat.filter((d) => d.inMonth)).toHaveLength(30);
    expect(flat.find((d) => d.isToday)?.key).toBe('2026-11-07');
    expect(flat[flat.length - 1].key).toBe('2026-12-06');
  });
});

describe('holdTrend', () => {
  const hold = (practiceId: string, round: number, seconds: number, createdAt: number): BreathHold => ({ id: `${practiceId}-${round}`, practiceId, patternId: 'power', round, seconds, createdAt });

  it('reports best and average per session, oldest first', () => {
    const trend = holdTrend([hold('b', 1, 60, 200), hold('b', 2, 90, 200), hold('a', 1, 40, 100), hold('a', 2, 50, 100), hold('a', 3, 45, 100)]);
    expect(trend.map((p) => p.practiceId)).toEqual(['a', 'b']);
    expect(trend[0]).toMatchObject({ best: 50, average: 45, rounds: 3 });
    expect(trend[1]).toMatchObject({ best: 90, average: 75, rounds: 2 });
  });

  it('keeps only the most recent sessions', () => {
    const holds = Array.from({ length: 30 }, (_, i) => hold(`p${i}`, 1, i, i));
    const trend = holdTrend(holds, 10);
    expect(trend).toHaveLength(10);
    expect(trend[0].best).toBe(20);
  });
});

describe('averageMoodLift', () => {
  const entry = (before: number | null, after: number | null): JournalEntry => ({ id: 'x', createdAt: 0, practiceId: null, moodBefore: before, moodAfter: after, note: '' });

  it('averages after minus before, ignoring incomplete entries', () => {
    expect(averageMoodLift([entry(4, 7), entry(6, 7), entry(null, 9), entry(5, null)])).toBe(2);
    expect(averageMoodLift([entry(null, 8)])).toBeNull();
  });
});
