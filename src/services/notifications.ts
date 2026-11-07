import * as Notifications from 'expo-notifications';

import type { ReminderSettings } from '@/store/settings';

export const remindersSupported = true;

const MORNING_ID = 'stillpoint-morning';
const EVENING_ID = 'stillpoint-evening';

const morningLines = [
  'A few quiet minutes now can shape the whole day.',
  'Before the day begins: breathe, and choose who you will be.',
  'Your future self is waiting for a morning rehearsal.',
];
const eveningLines = [
  'Let the day go. A short practice before sleep?',
  'Time to slow down. Your breath is ready when you are.',
  'Close the day with gratitude.',
];

const pick = (lines: string[]) => lines[Math.floor(Math.random() * lines.length)];

/** Show reminders as banners even when the app is open. Call once at startup. */
export function configureNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const req = await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowSound: true, allowBadge: false } });
  return req.granted;
}

/** Replace any scheduled reminders with the current settings. */
export async function syncReminders(r: ReminderSettings): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(MORNING_ID).catch(() => {});
  await Notifications.cancelScheduledNotificationAsync(EVENING_ID).catch(() => {});
  if (r.morningEnabled) {
    await Notifications.scheduleNotificationAsync({
      identifier: MORNING_ID,
      content: { title: 'Good morning', body: pick(morningLines) },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: r.morningHour, minute: r.morningMinute },
    });
  }
  if (r.eveningEnabled) {
    await Notifications.scheduleNotificationAsync({
      identifier: EVENING_ID,
      content: { title: 'Evening practice', body: pick(eveningLines) },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: r.eveningHour, minute: r.eveningMinute },
    });
  }
}
