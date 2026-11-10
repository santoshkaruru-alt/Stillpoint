import { StyleSheet, View } from 'react-native';

import { notify } from '@/lib/dialog';
import { useSettings } from '@/store/settings';
import { space } from '@/theme';

import { AppText } from './AppText';
import { Button } from './Button';
import { Stepper } from './Stepper';

function formatTime(mins: number): string {
  return new Date(2000, 0, 1, Math.floor(mins / 60), mins % 60).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** URL of the pre-built daily reminder for a time, next to the app's manifest. */
function reminderUrl(mins: number): string | null {
  if (typeof document === 'undefined') return null;
  const manifest = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
  const base = manifest ? manifest.href.replace(/manifest\.webmanifest.*$/, '') : `${location.origin}/`;
  const hhmm = `${String(Math.floor(mins / 60)).padStart(2, '0')}${String(mins % 60).padStart(2, '0')}`;
  return `${base}reminders/stillpoint-${hhmm}.ics`;
}

/**
 * Web reminders: browsers cannot schedule daily alerts, so we hand the
 * phone a repeating calendar event with an alert at the chosen time.
 */
export function CalendarReminder() {
  const mins = useSettings((s) => s.calendarReminderMin);
  const set = useSettings((s) => s.set);

  const add = () => {
    const url = reminderUrl(mins);
    if (!url) return;
    const win = window.open(url, '_blank');
    if (!win) window.location.href = url;
    setTimeout(() => notify('Check your calendar', `If asked, tap Add. Stillpoint will remind you every day at ${formatTime(mins)}. Change or delete it any time in the Calendar app.`), 400);
  };

  return (
    <View style={styles.wrap}>
      <AppText variant="caption" tone="faint">
        Your phone's Calendar can remind you every day, even when Stillpoint is closed. Do this twice for a morning and an evening reminder.
      </AppText>
      <Stepper
        label="Time"
        value={mins}
        onChange={(v) => set({ calendarReminderMin: v })}
        min={0}
        max={23 * 60 + 45}
        step={15}
        format={formatTime}
      />
      <Button label="Add to Calendar" icon="calendar" kind="secondary" size="md" onPress={add} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
});
