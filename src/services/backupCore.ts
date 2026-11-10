/**
 * Collects everything for a backup and applies a restored one. Shared by
 * native (backup.ts) and web (backup.web.ts); only file handling differs.
 */
import { exportHistory, importHistory } from '@/db';
import { buildBackup, mergeById, settingsToRestore, type Backup } from '@/lib/backupFormat';
import { useCustomPatterns } from '@/store/customPatterns';
import { useSettings, type SettingsState } from '@/store/settings';

export function collectBackup(): Backup {
  return buildBackup({
    settings: useSettings.getState() as unknown as Record<string, unknown>,
    customPatterns: useCustomPatterns.getState().patterns,
    history: exportHistory(),
  });
}

export function applyBackup(b: Backup) {
  importHistory(b);
  useCustomPatterns.setState((s) => ({ patterns: mergeById(s.patterns, b.customPatterns) }));
  useSettings.getState().set(settingsToRestore(b.settings) as Partial<SettingsState>);
}

export function markBackedUp() {
  useSettings.getState().set({ lastBackupAt: Date.now() });
}
