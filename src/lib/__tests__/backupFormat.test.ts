import { describe, expect, it } from '@jest/globals';

import type { BreathHold, JournalEntry, PracticeLog } from '@/models/types';

import { BackupError, backupFileName, buildBackup, mergeById, parseBackup, settingsToRestore, summarize } from '../backupFormat';

const practice = (id: string, durationSec = 600): PracticeLog => ({ id, kind: 'meditation', refId: '20', title: 'Return', startedAt: 1000, durationSec, completed: true });
const entry: JournalEntry = { id: 'j1', createdAt: 2000, practiceId: 'p1', moodBefore: 4, moodAfter: 7, note: 'calmer' };
const hold: BreathHold = { id: 'h1', practiceId: 'p1', patternId: 'power', round: 1, seconds: 62, createdAt: 3000 };

const sample = () =>
  buildBackup({
    settings: { voiceRate: 0.8, themeName: 'mist', voiceId: 'x', safetyAcknowledgedAt: 5, set: () => {} },
    customPatterns: [{ id: 'c1', kind: 'paced', name: 'Mine', summary: '', rounds: 3, phases: [{ type: 'inhale', sec: 4 }] }],
    history: { practices: [practice('p1')], journal: [entry], holds: [hold] },
    now: new Date('2026-11-10T09:00:00Z'),
  });

describe('backup format', () => {
  it('round-trips through JSON', () => {
    const b = sample();
    const parsed = parseBackup(JSON.stringify(b));
    expect(parsed.practices).toEqual([practice('p1')]);
    expect(parsed.journal).toEqual([entry]);
    expect(parsed.holds).toEqual([hold]);
    expect(parsed.customPatterns).toHaveLength(1);
    expect(parsed.exportedAt).toBe('2026-11-10T09:00:00.000Z');
  });

  it('never writes functions into the file', () => {
    expect(sample().settings).not.toHaveProperty('set');
  });

  it('rejects files that are not Stillpoint backups', () => {
    expect(() => parseBackup('not json')).toThrow(BackupError);
    expect(() => parseBackup(JSON.stringify({ app: 'penny', transactions: [] }))).toThrow('not a Stillpoint backup');
    expect(() => parseBackup('[]')).toThrow(BackupError);
  });

  it('refuses backups from a newer version', () => {
    expect(() => parseBackup(JSON.stringify({ ...sample(), version: 99 }))).toThrow('newer version');
  });

  it('drops malformed rows but keeps the good ones', () => {
    const raw = { ...sample(), practices: [practice('ok'), { id: 'bad' }, 'junk', null], holds: undefined };
    const parsed = parseBackup(JSON.stringify(raw));
    expect(parsed.practices.map((p) => p.id)).toEqual(['ok']);
    expect(parsed.holds).toEqual([]);
  });

  it('treats a damaged list as an error', () => {
    expect(() => parseBackup(JSON.stringify({ ...sample(), journal: 'oops' }))).toThrow('damaged');
  });

  it('merges by id, incoming wins, nothing is lost', () => {
    const merged = mergeById([practice('a', 60), practice('b', 60)], [practice('b', 999), practice('c', 60)]);
    expect(merged.map((p) => [p.id, p.durationSec])).toEqual([
      ['a', 60],
      ['b', 999],
      ['c', 60],
    ]);
    // Restoring the same data twice changes nothing.
    expect(mergeById(merged, merged)).toEqual(merged);
  });

  it('keeps device-specific settings when restoring', () => {
    const s = settingsToRestore(sample().settings);
    expect(s).toEqual({ voiceRate: 0.8, themeName: 'mist' });
  });

  it('names files by date and summarises contents', () => {
    expect(backupFileName(new Date(2026, 0, 5))).toBe('stillpoint-backup-2026-01-05.json');
    expect(summarize(sample())).toBe('1 session, 1 journal entry, 1 breath hold');
  });
});
