import type { ReminderSettings } from '@/store/settings';

/**
 * Browsers cannot schedule local daily notifications without a push
 * server, so reminders are native-only. These stubs keep the API shared.
 */
export const remindersSupported = false;

export function configureNotifications() {}

export async function ensurePermission(): Promise<boolean> {
  return false;
}

export async function syncReminders(_r: ReminderSettings): Promise<void> {}
