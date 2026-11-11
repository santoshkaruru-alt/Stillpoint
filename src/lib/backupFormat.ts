/**
 * Backup file format. Pure functions (no storage access), unit-tested.
 *
 * A backup is one JSON file holding settings, custom breath patterns and
 * all history. Restoring merges by id: nothing on the device is deleted,
 * and restoring the same file twice changes nothing.
 */
import type { BreathHold, JournalEntry, PacedPattern, PracticeLog } from '@/models/types';

// The file format keeps its original id so older backups still restore.
export const BACKUP_APP = 'stillpoint';
export const BACKUP_VERSION = 1;

export interface BackupHistory {
  practices: PracticeLog[];
  journal: JournalEntry[];
  holds: BreathHold[];
}

export interface Backup extends BackupHistory {
  app: typeof BACKUP_APP;
  version: number;
  exportedAt: string;
  /** Persisted settings state (voice, sound, appearance, intention...). */
  settings: Record<string, unknown>;
  customPatterns: PacedPattern[];
}

export function buildBackup(parts: {
  settings: Record<string, unknown>;
  customPatterns: PacedPattern[];
  history: BackupHistory;
  now?: Date;
}): Backup {
  // Functions (e.g. the store's setter) never go into the file.
  const settings = Object.fromEntries(Object.entries(parts.settings).filter(([, v]) => typeof v !== 'function'));
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: (parts.now ?? new Date()).toISOString(),
    settings,
    customPatterns: parts.customPatterns,
    ...parts.history,
  };
}

export function backupFileName(now = new Date()): string {
  const d = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return `becoming-backup-${d}.json`;
}

export class BackupError extends Error {}

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const isStr = (v: unknown) => typeof v === 'string' && v.length > 0;
const isNum = (v: unknown) => typeof v === 'number' && Number.isFinite(v);

function cleanList<T>(raw: unknown, valid: (x: Record<string, unknown>) => boolean): T[] {
  if (raw === undefined) return [];
  if (!Array.isArray(raw)) throw new BackupError('This backup file is damaged.');
  return raw.filter((x) => isObj(x) && valid(x)) as T[];
}

/** Parse and validate a backup file. Throws BackupError with a readable message. */
export function parseBackup(text: string): Backup {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new BackupError('That file is not a Becoming backup.');
  }
  if (!isObj(data) || data.app !== BACKUP_APP) throw new BackupError('That file is not a Becoming backup.');
  if (!isNum(data.version) || (data.version as number) > BACKUP_VERSION) {
    throw new BackupError('This backup was made by a newer version of Becoming. Update the app, then try again.');
  }
  return {
    app: BACKUP_APP,
    version: data.version as number,
    exportedAt: isStr(data.exportedAt) ? (data.exportedAt as string) : '',
    settings: isObj(data.settings) ? data.settings : {},
    customPatterns: cleanList<PacedPattern>(data.customPatterns, (p) => isStr(p.id) && p.kind === 'paced' && Array.isArray(p.phases)),
    practices: cleanList<PracticeLog>(data.practices, (p) => isStr(p.id) && isNum(p.startedAt) && isNum(p.durationSec)),
    journal: cleanList<JournalEntry>(data.journal, (j) => isStr(j.id) && isNum(j.createdAt)),
    holds: cleanList<BreathHold>(data.holds, (h) => isStr(h.id) && isNum(h.seconds) && isNum(h.createdAt)),
  };
}

/** Merge two lists by id; items from `incoming` win. */
export function mergeById<T extends { id: string }>(existing: T[], incoming: T[]): T[] {
  const map = new Map(existing.map((x) => [x.id, x]));
  for (const x of incoming) map.set(x.id, x);
  return [...map.values()];
}

/**
 * Settings to apply from a backup. Device-specific choices (the chosen
 * voice may not exist on another phone) and the safety acknowledgement
 * (the user has already seen it here) are left as they are.
 */
export function settingsToRestore(saved: Record<string, unknown>): Record<string, unknown> {
  const skip = new Set(['voiceId', 'safetyAcknowledgedAt', 'lastBackupAt']);
  return Object.fromEntries(Object.entries(saved).filter(([k, v]) => !skip.has(k) && typeof v !== 'function'));
}

export function summarize(b: Backup): string {
  const n = (k: number, one: string, many: string) => `${k} ${k === 1 ? one : many}`;
  return [n(b.practices.length, 'session', 'sessions'), n(b.journal.length, 'journal entry', 'journal entries'), n(b.holds.length, 'breath hold', 'breath holds')].join(', ');
}
