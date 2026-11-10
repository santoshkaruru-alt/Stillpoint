/**
 * Local-first storage for history: practice logs, journal entries and
 * breath holds. Everything stays on the device (SQLite).
 *
 * Writes bump `useDataVersion` so screens that read history re-render.
 */
import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';
import { create } from 'zustand';

import type { BreathHold, JournalEntry, PracticeKind, PracticeLog } from '@/models/types';

export const useDataVersion = create<{ v: number; bump: () => void }>((set) => ({
  v: 0,
  bump: () => set((s) => ({ v: s.v + 1 })),
}));

const SCHEMA_VERSION = 1;

let db: SQLiteDatabase | null = null;

function getDb(): SQLiteDatabase {
  if (db) return db;
  db = openDatabaseSync('stillpoint.db');
  migrate(db);
  return db;
}

function migrate(d: SQLiteDatabase) {
  const row = d.getFirstSync<{ user_version: number }>('PRAGMA user_version');
  const version = row?.user_version ?? 0;
  if (version < 1) {
    d.execSync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS practices (
        id TEXT PRIMARY KEY NOT NULL,
        kind TEXT NOT NULL,
        ref_id TEXT NOT NULL,
        title TEXT NOT NULL,
        started_at INTEGER NOT NULL,
        duration_sec INTEGER NOT NULL,
        completed INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_practices_started ON practices(started_at);
      CREATE TABLE IF NOT EXISTS journal (
        id TEXT PRIMARY KEY NOT NULL,
        created_at INTEGER NOT NULL,
        practice_id TEXT,
        mood_before INTEGER,
        mood_after INTEGER,
        note TEXT NOT NULL DEFAULT ''
      );
      CREATE INDEX IF NOT EXISTS idx_journal_created ON journal(created_at);
      CREATE TABLE IF NOT EXISTS breath_holds (
        id TEXT PRIMARY KEY NOT NULL,
        practice_id TEXT NOT NULL,
        pattern_id TEXT NOT NULL,
        round INTEGER NOT NULL,
        seconds REAL NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_holds_created ON breath_holds(created_at);
    `);
  }
  // Future migrations: if (version < 2) { ... }
  if (version < SCHEMA_VERSION) d.execSync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const bump = () => useDataVersion.getState().bump();

// ------------------------------------------------------------- practices

interface PracticeRow {
  id: string;
  kind: string;
  ref_id: string;
  title: string;
  started_at: number;
  duration_sec: number;
  completed: number;
}

const toPractice = (r: PracticeRow): PracticeLog => ({
  id: r.id,
  kind: r.kind as PracticeKind,
  refId: r.ref_id,
  title: r.title,
  startedAt: r.started_at,
  durationSec: r.duration_sec,
  completed: r.completed === 1,
});

export function savePractice(p: PracticeLog) {
  getDb().runSync(
    `INSERT OR REPLACE INTO practices (id, kind, ref_id, title, started_at, duration_sec, completed)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    p.id,
    p.kind,
    p.refId,
    p.title,
    p.startedAt,
    Math.round(p.durationSec),
    p.completed ? 1 : 0,
  );
  bump();
}

export function getPractice(id: string): PracticeLog | null {
  const r = getDb().getFirstSync<PracticeRow>('SELECT * FROM practices WHERE id = ?', id);
  return r ? toPractice(r) : null;
}

export function listPractices(sinceMs = 0): PracticeLog[] {
  return getDb()
    .getAllSync<PracticeRow>('SELECT * FROM practices WHERE started_at >= ? ORDER BY started_at DESC', sinceMs)
    .map(toPractice);
}

// --------------------------------------------------------------- journal

interface JournalRow {
  id: string;
  created_at: number;
  practice_id: string | null;
  mood_before: number | null;
  mood_after: number | null;
  note: string;
}

const toJournal = (r: JournalRow): JournalEntry => ({
  id: r.id,
  createdAt: r.created_at,
  practiceId: r.practice_id,
  moodBefore: r.mood_before,
  moodAfter: r.mood_after,
  note: r.note,
});

export function saveJournal(e: JournalEntry) {
  getDb().runSync(
    `INSERT OR REPLACE INTO journal (id, created_at, practice_id, mood_before, mood_after, note)
     VALUES (?, ?, ?, ?, ?, ?)`,
    e.id,
    e.createdAt,
    e.practiceId,
    e.moodBefore,
    e.moodAfter,
    e.note,
  );
  bump();
}

export function deleteJournal(id: string) {
  getDb().runSync('DELETE FROM journal WHERE id = ?', id);
  bump();
}

export function listJournal(limit = 200): JournalEntry[] {
  return getDb()
    .getAllSync<JournalRow>('SELECT * FROM journal ORDER BY created_at DESC LIMIT ?', limit)
    .map(toJournal);
}

// ----------------------------------------------------------- breath holds

interface HoldRow {
  id: string;
  practice_id: string;
  pattern_id: string;
  round: number;
  seconds: number;
  created_at: number;
}

export function saveHolds(holds: BreathHold[]) {
  if (holds.length === 0) return;
  const d = getDb();
  d.withTransactionSync(() => {
    for (const h of holds) {
      d.runSync(
        `INSERT OR REPLACE INTO breath_holds (id, practice_id, pattern_id, round, seconds, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        h.id,
        h.practiceId,
        h.patternId,
        h.round,
        h.seconds,
        h.createdAt,
      );
    }
  });
  bump();
}

export function listHolds(limit = 300): BreathHold[] {
  return getDb()
    .getAllSync<HoldRow>('SELECT * FROM breath_holds ORDER BY created_at DESC LIMIT ?', limit)
    .map((r) => ({
      id: r.id,
      practiceId: r.practice_id,
      patternId: r.pattern_id,
      round: r.round,
      seconds: r.seconds,
      createdAt: r.created_at,
    }));
}

/** Erase all history (settings are kept). */
export function clearAllData() {
  getDb().execSync('DELETE FROM practices; DELETE FROM journal; DELETE FROM breath_holds;');
  bump();
}

// ---------------------------------------------------------- backup / restore

export function exportHistory(): { practices: PracticeLog[]; journal: JournalEntry[]; holds: BreathHold[] } {
  return { practices: listPractices(), journal: listJournal(1_000_000), holds: listHolds(1_000_000) };
}

/** Add or update rows from a backup. Nothing is deleted. */
export function importHistory(data: { practices: PracticeLog[]; journal: JournalEntry[]; holds: BreathHold[] }) {
  const d = getDb();
  d.withTransactionSync(() => {
    for (const p of data.practices) {
      d.runSync(
        `INSERT OR REPLACE INTO practices (id, kind, ref_id, title, started_at, duration_sec, completed) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        p.id, p.kind, p.refId, p.title, p.startedAt, Math.round(p.durationSec), p.completed ? 1 : 0,
      );
    }
    for (const e of data.journal) {
      d.runSync(
        `INSERT OR REPLACE INTO journal (id, created_at, practice_id, mood_before, mood_after, note) VALUES (?, ?, ?, ?, ?, ?)`,
        e.id, e.createdAt, e.practiceId ?? null, e.moodBefore ?? null, e.moodAfter ?? null, e.note ?? '',
      );
    }
    for (const h of data.holds) {
      d.runSync(
        `INSERT OR REPLACE INTO breath_holds (id, practice_id, pattern_id, round, seconds, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
        h.id, h.practiceId, h.patternId, h.round, h.seconds, h.createdAt,
      );
    }
  });
  bump();
}
