import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { backupFileName } from '@/lib/backupFormat';

import { collectBackup, markBackedUp } from './backupCore';

export { applyBackup } from './backupCore';

/** Write the backup file and open the share sheet (Save to Files, AirDrop, Mail...). */
export async function saveBackup(): Promise<'saved' | 'cancelled'> {
  const json = JSON.stringify(collectBackup(), null, 2);
  const file = new File(Paths.cache, backupFileName());
  if (file.exists) file.delete();
  file.create();
  await file.write(json);
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json', dialogTitle: 'Save your Becoming backup' });
  markBackedUp();
  return 'saved';
}

/** Let the user pick a backup file and return its text (null if cancelled). */
export async function pickBackupText(): Promise<string | null> {
  const res = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'public.json', '*/*'], copyToCacheDirectory: true });
  if (res.canceled || !res.assets?.[0]) return null;
  return new File(res.assets[0].uri).text();
}
