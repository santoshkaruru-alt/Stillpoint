import { backupFileName } from '@/lib/backupFormat';

import { collectBackup, markBackedUp } from './backupCore';

export { applyBackup } from './backupCore';

/**
 * Save the backup. On iPhone the share sheet offers "Save to Files";
 * elsewhere the file downloads. Must be called straight from a tap.
 */
export async function saveBackup(): Promise<'saved' | 'cancelled'> {
  const json = JSON.stringify(collectBackup(), null, 2);
  const name = backupFileName();
  const file = new File([json], name, { type: 'application/json' });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.canShare?.({ files: [file] }) && /iPhone|iPad|Android/i.test(navigator.userAgent)) {
    try {
      await navigator.share({ files: [file], title: 'Stillpoint backup' });
      markBackedUp();
      return 'saved';
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'cancelled';
      // Fall through to a download if sharing failed for another reason.
    }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  markBackedUp();
  return 'saved';
}

/** Open the file picker and return the chosen file's text (null if cancelled). */
export function pickBackupText(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.style.display = 'none';
    input.addEventListener('change', () => {
      const f = input.files?.[0];
      input.remove();
      if (!f) return resolve(null);
      f.text().then(resolve, () => resolve(null));
    });
    input.addEventListener('cancel', () => {
      input.remove();
      resolve(null);
    });
    document.body.appendChild(input);
    input.click();
  });
}
