/**
 * Progress maths: streaks, totals, calendar grid and breath-hold trend.
 * Pure functions over plain data, unit-tested.
 */
import type { BreathHold, JournalEntry, PracticeLog } from '@/models/types';

/** Local calendar day, e.g. "2026-11-07". */
export function dayKey(ts: number | Date): string {
  const d = typeof ts === 'number' ? new Date(ts) : ts;
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + n);
  return x;
}

export function practiceDays(practices: PracticeLog[]): Set<string> {
  return new Set(practices.map((p) => dayKey(p.startedAt)));
}

/**
 * Current streak: consecutive days with practice ending today. If you
 * haven't practised yet today, a streak through yesterday still counts.
 */
export function currentStreak(days: Set<string>, today = new Date()): number {
  let cursor = days.has(dayKey(today)) ? today : addDays(today, -1);
  let n = 0;
  while (days.has(dayKey(cursor))) {
    n += 1;
    cursor = addDays(cursor, -1);
  }
  return n;
}

export function longestStreak(days: Set<string>): number {
  const sorted = [...days].sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const k of sorted) {
    const [y, m, d] = k.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    run = prev && dayKey(addDays(prev, 1)) === k ? run + 1 : 1;
    best = Math.max(best, run);
    prev = date;
  }
  return best;
}

export function totalMinutes(practices: PracticeLog[]): number {
  return Math.round(practices.reduce((s, p) => s + p.durationSec, 0) / 60);
}

export interface CalendarDay {
  key: string;
  date: number; // day of month
  inMonth: boolean;
  isToday: boolean;
}

/** Weeks (Monday first) covering the given month. */
export function monthGrid(year: number, month: number, today = new Date()): CalendarDay[][] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // Monday = 0
  let cursor = addDays(first, -offset);
  const weeks: CalendarDay[][] = [];
  const todayKey = dayKey(today);
  do {
    const week: CalendarDay[] = [];
    for (let i = 0; i < 7; i++) {
      week.push({ key: dayKey(cursor), date: cursor.getDate(), inMonth: cursor.getMonth() === month, isToday: dayKey(cursor) === todayKey });
      cursor = addDays(cursor, 1);
    }
    weeks.push(week);
  } while (cursor.getMonth() === month);
  return weeks;
}

/** Minutes practised per day, for the calendar. */
export function minutesByDay(practices: PracticeLog[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const p of practices) {
    const k = dayKey(p.startedAt);
    map.set(k, (map.get(k) ?? 0) + p.durationSec / 60);
  }
  return map;
}

export interface HoldPoint {
  practiceId: string;
  at: number;
  best: number;
  average: number;
  rounds: number;
}

/** Best and average hold per breathwork session, oldest first, last `limit`. */
export function holdTrend(holds: BreathHold[], limit = 20): HoldPoint[] {
  const byPractice = new Map<string, BreathHold[]>();
  for (const h of holds) {
    const list = byPractice.get(h.practiceId) ?? [];
    list.push(h);
    byPractice.set(h.practiceId, list);
  }
  const points: HoldPoint[] = [...byPractice.entries()].map(([practiceId, list]) => ({
    practiceId,
    at: Math.min(...list.map((h) => h.createdAt)),
    best: Math.max(...list.map((h) => h.seconds)),
    average: list.reduce((s, h) => s + h.seconds, 0) / list.length,
    rounds: list.length,
  }));
  return points.sort((a, b) => a.at - b.at).slice(-limit);
}

/** Average mood change across entries that have both a before and after. */
export function averageMoodLift(entries: JournalEntry[]): number | null {
  const pairs = entries.filter((e) => e.moodBefore !== null && e.moodAfter !== null);
  if (pairs.length === 0) return null;
  return pairs.reduce((s, e) => s + (e.moodAfter! - e.moodBefore!), 0) / pairs.length;
}
