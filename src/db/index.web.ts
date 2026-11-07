/**
 * Web version of the history store. Same API as the native SQLite store
 * (src/db/index.ts), backed by localStorage so it works on any browser
 * without special server headers. Data stays in this browser only.
 */
import { create } from 'zustand';

import type { BreathHold, JournalEntry, PracticeLog } from '@/models/types';

export const useDataVersion = create<{ v: number; bump: () => void }>((set) => ({
  v: 0,
  bump: () => set((s) => ({ v: s.v + 1 })),
}));

const KEYS = {
  practices: 'stillpoint-db-practices',
  journal: 'stillpoint-db-journal',
  holds: 'stillpoint-db-holds',
} as const;

function read<T>(key: string): T[] {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, rows: T[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(rows));
  } catch (e) {
    console.warn('Could not save history', e);
  }
  useDataVersion.getState().bump();
}

function upsert<T extends { id: string }>(key: string, row: T) {
  write(key, [row, ...read<T>(key).filter((r) => r.id !== row.id)]);
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ------------------------------------------------------------- practices

export function savePractice(p: PracticeLog) {
  upsert(KEYS.practices, { ...p, durationSec: Math.round(p.durationSec) });
}

export function getPractice(id: string): PracticeLog | null {
  return read<PracticeLog>(KEYS.practices).find((p) => p.id === id) ?? null;
}

export function listPractices(sinceMs = 0): PracticeLog[] {
  return read<PracticeLog>(KEYS.practices)
    .filter((p) => p.startedAt >= sinceMs)
    .sort((a, b) => b.startedAt - a.startedAt);
}

// --------------------------------------------------------------- journal

export function saveJournal(e: JournalEntry) {
  upsert(KEYS.journal, e);
}

export function deleteJournal(id: string) {
  write(KEYS.journal, read<JournalEntry>(KEYS.journal).filter((e) => e.id !== id));
}

export function listJournal(limit = 200): JournalEntry[] {
  return read<JournalEntry>(KEYS.journal)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
}

// ----------------------------------------------------------- breath holds

export function saveHolds(holds: BreathHold[]) {
  if (holds.length === 0) return;
  const ids = new Set(holds.map((h) => h.id));
  write(KEYS.holds, [...holds, ...read<BreathHold>(KEYS.holds).filter((h) => !ids.has(h.id))]);
}

export function listHolds(limit = 300): BreathHold[] {
  return read<BreathHold>(KEYS.holds)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
}

export function clearAllData() {
  for (const k of Object.values(KEYS)) {
    try {
      window.localStorage.removeItem(k);
    } catch {
      // ignore
    }
  }
  useDataVersion.getState().bump();
}
