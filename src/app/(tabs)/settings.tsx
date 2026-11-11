import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { bedLabels, binauralLabels } from '@/audio/ambient';
import { listVoices, previewVoice, type VoiceOption } from '@/audio/voice/DeviceTTSProvider';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Segmented } from '@/components/Segmented';
import { Field, Section, ToggleRow } from '@/components/SettingRow';
import { Screen } from '@/components/Screen';
import { CalendarReminder } from '@/components/CalendarReminder';
import { Stepper } from '@/components/Stepper';
import { ThemePicker } from '@/components/ThemePicker';
import type { AmbientBedId } from '@/models/types';
import { clearAllData } from '@/db';
import { confirmAsync, notify } from '@/lib/dialog';
import { BackupError, parseBackup, summarize } from '@/lib/backupFormat';
import { isWeb } from '@/lib/platformSetup';
import { applyBackup, pickBackupText, saveBackup } from '@/services/backup';
import { ensurePermission, remindersSupported, syncReminders } from '@/services/notifications';
import { useSettings, type ReminderSettings } from '@/store/settings';
import { space, useTheme } from '@/theme';

const pct = (v: number) => `${Math.round(v * 100)}%`;

function sinceLabel(ts: number): string {
  const days = Math.floor((Date.now() - ts) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  return `on ${new Date(ts).toLocaleDateString()}`;
}

function formatTime(mins: number): string {
  const d = new Date(2000, 0, 1, Math.floor(mins / 60), mins % 60);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function SettingsTab() {
  const { c } = useTheme();
  const s = useSettings();
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [showVoices, setShowVoices] = useState(false);

  useEffect(() => {
    listVoices()
      .then(setVoices)
      .catch(() => setVoices([]));
  }, []);

  const currentVoice = voices.find((v) => v.id === s.voiceId)?.name ?? 'System default';

  const toggleBinaural = (on: boolean) => {
    if (on && !s.binauralNoticeSeen) {
      void confirmAsync(
        'Use headphones',
        'Binaural tones play a slightly different pitch in each ear. They only work with headphones, and should be kept quiet. Skip them if you have epilepsy or a seizure history.',
        'Turn on',
      ).then((ok) => ok && useSettings.getState().set({ binauralEnabled: true, binauralNoticeSeen: true }));
      return;
    }
    s.set({ binauralEnabled: on });
  };

  const updateReminders = async (patch: Partial<ReminderSettings>) => {
    const next = { ...s.reminders, ...patch };
    const turningOn = (patch.morningEnabled && !s.reminders.morningEnabled) || (patch.eveningEnabled && !s.reminders.eveningEnabled);
    if (turningOn && !(await ensurePermission())) {
      notify('Notifications are off', 'To get reminders, allow notifications for this app in the iPhone Settings app.');
      return;
    }
    s.set({ reminders: next });
    try {
      await syncReminders(next);
    } catch (e) {
      console.warn('Could not schedule reminders', e);
    }
  };

  const r = s.reminders;

  const backUp = () => {
    saveBackup().catch((e) => notify('Backup failed', String((e as Error).message ?? e)));
  };

  const restore = async () => {
    const text = await pickBackupText().catch(() => null);
    if (!text) return;
    try {
      const b = parseBackup(text);
      const when = b.exportedAt ? new Date(b.exportedAt).toLocaleDateString() : 'an unknown date';
      const ok = await confirmAsync(
        'Restore this backup?',
        `From ${when}: ${summarize(b)}. Nothing on this device is deleted; matching items are updated.`,
        'Restore',
      );
      if (!ok) return;
      applyBackup(b);
      notify('Restored', summarize(b));
    } catch (e) {
      notify('Could not restore', e instanceof BackupError ? e.message : 'That file could not be read.');
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="overline" tone="calm">
          Settings
        </AppText>
        <AppText variant="display" accessibilityRole="header">
          Make it yours
        </AppText>
      </View>

      <Section title="Appearance">
        <Field label="Mode" hint="System follows your phone's light or dark setting.">
          <Segmented
            options={[
              { value: 'system', label: 'System' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
            value={s.appearance}
            onChange={(v) => s.set({ appearance: v })}
          />
        </Field>
        <Field label="Theme">
          <ThemePicker value={s.themeName} onChange={(t) => s.set({ themeName: t })} />
        </Field>
      </Section>

      {isWeb ? (
        <Section title="Reminders">
          <CalendarReminder />
        </Section>
      ) : null}

      {remindersSupported ? (
      <Section title="Reminders">
        <ToggleRow label="Morning reminder" value={r.morningEnabled} onChange={(v) => void updateReminders({ morningEnabled: v })} />
        {r.morningEnabled ? (
          <Stepper
            label="Morning time"
            value={r.morningHour * 60 + r.morningMinute}
            onChange={(v) => void updateReminders({ morningHour: Math.floor(v / 60), morningMinute: v % 60 })}
            min={4 * 60}
            max={12 * 60}
            step={15}
            format={formatTime}
          />
        ) : null}
        <ToggleRow label="Evening reminder" value={r.eveningEnabled} onChange={(v) => void updateReminders({ eveningEnabled: v })} />
        {r.eveningEnabled ? (
          <Stepper
            label="Evening time"
            value={r.eveningHour * 60 + r.eveningMinute}
            onChange={(v) => void updateReminders({ eveningHour: Math.floor(v / 60), eveningMinute: v % 60 })}
            min={16 * 60}
            max={23 * 60 + 45}
            step={15}
            format={formatTime}
          />
        ) : null}
      </Section>
      ) : null}

      <Section title="Voice">
        <Stepper
          label="Speaking pace"
          value={s.voiceRate}
          onChange={(v) => s.set({ voiceRate: v })}
          min={0.5}
          max={1.1}
          step={0.04}
          format={pct}
          hint="Slower feels more spacious"
        />
        <Stepper
          label="Pitch"
          value={s.voicePitch}
          onChange={(v) => s.set({ voicePitch: v })}
          min={0.75}
          max={1.25}
          step={0.05}
          format={pct}
        />
        <Field label="Pauses" hint="Length of the short pauses between lines. The open silences adjust so sessions keep their length.">
          <Segmented
            options={[
              { value: 0.75, label: 'Short' },
              { value: 1, label: 'Normal' },
              { value: 1.35, label: 'Long' },
            ]}
            value={s.pauseScale}
            onChange={(v) => s.set({ pauseScale: v })}
          />
        </Field>
        <Pressable
          onPress={() => setShowVoices((x) => !x)}
          style={styles.voiceRow}
          accessibilityRole="button"
          accessibilityLabel={`Voice: ${currentVoice}`}
          accessibilityHint="Shows the voices installed on this phone"
          accessibilityState={{ expanded: showVoices }}>
          <View style={styles.flex}>
            <AppText variant="label">Voice</AppText>
            <AppText variant="caption" tone="faint">
              {currentVoice}
            </AppText>
          </View>
          <Icon name={showVoices ? 'chevron.up' : 'chevron.down'} size={16} color={c.textFaint} />
        </Pressable>
        {showVoices ? (
          <View style={styles.voiceList}>
            <AppText variant="caption" tone="faint">
              {isWeb
                ? 'Voices come from your device. On iPhone, Enhanced voices downloaded in Settings, Accessibility, Spoken Content, Voices can appear here too.'
                : 'For a more natural voice, download an Enhanced or Premium voice in iPhone Settings, Accessibility, Spoken Content, Voices. Then choose it here.'}
            </AppText>
            {[{ id: '', name: 'System default', quality: '' }, ...voices].map((v) => {
              const selected = (s.voiceId ?? '') === v.id;
              return (
                <Pressable
                  key={v.id || 'default'}
                  onPress={() => s.set({ voiceId: v.id || null })}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  style={styles.voiceOption}>
                  <AppText style={styles.flex} tone={selected ? 'calm' : 'default'}>
                    {v.name}
                    {v.quality === 'Enhanced' ? '  ·  Enhanced' : ''}
                  </AppText>
                  {selected ? <Icon name="checkmark" size={16} color={c.calm} /> : null}
                </Pressable>
              );
            })}
          </View>
        ) : null}
        <Button
          label="Preview voice"
          icon="speaker.wave.2"
          kind="secondary"
          size="md"
          onPress={() => previewVoice({ rate: s.voiceRate, pitch: s.voicePitch, voiceId: s.voiceId })}
        />
        <ToggleRow label="Show captions" hint="Display each spoken line on screen" value={s.showCaptions} onChange={(v) => s.set({ showCaptions: v })} />
      </Section>

      <Section title="Sound">
        <Stepper
          label="Ambience volume"
          value={s.ambientVolume}
          onChange={(v) => s.set({ ambientVolume: v })}
          min={0}
          max={1}
          step={0.1}
          format={pct}
        />
        <Field label="Ambience" hint="Auto follows each part of the session.">
          <Segmented
            wrap
            options={[
              { value: 'auto', label: 'Auto' },
              ...(['drift', 'tide', 'rain', 'deep', 'none'] as AmbientBedId[]).map((b) => ({ value: b, label: bedLabels[b] })),
            ]}
            value={s.ambientOverride ?? 'auto'}
            onChange={(v) => s.set({ ambientOverride: v === 'auto' ? null : (v as AmbientBedId) })}
          />
        </Field>
        <ToggleRow
          label="Binaural tones"
          hint={`Headphones only. ${Object.values(binauralLabels).slice(1).join(', ')}, matched to each part.`}
          value={s.binauralEnabled}
          onChange={toggleBinaural}
        />
        {s.binauralEnabled ? (
          <Stepper
            label="Binaural volume"
            value={s.binauralVolume}
            onChange={(v) => s.set({ binauralVolume: v })}
            min={0.1}
            max={1}
            step={0.05}
            format={pct}
          />
        ) : null}
      </Section>

      <Section title="Breathwork">
        <ToggleRow
          label="Haptics"
          hint={isWeb ? 'Works in Android browsers. iPhone browsers allow only light taps on iOS 18 or later, and not always. Keep Sound cues on.' : 'Feel each phase of the breath'}
          value={s.hapticsEnabled} onChange={(v) => s.set({ hapticsEnabled: v })} />
        <ToggleRow label="Sound cues" hint="Soft tones at each phase" value={s.breathSounds} onChange={(v) => s.set({ breathSounds: v })} />
      </Section>

      <Section title="Motion and screen">
        <Field label="Reduce motion" hint="System follows your iPhone accessibility setting.">
          <Segmented
            options={[
              { value: 'system', label: 'System' },
              { value: 'on', label: 'On' },
              { value: 'off', label: 'Off' },
            ]}
            value={s.reduceMotion}
            onChange={(v) => s.set({ reduceMotion: v })}
          />
        </Field>
        <ToggleRow
          label="Dim screen during sessions"
          hint="The screen stays on, dimmed, so the voice keeps playing"
          value={s.dimDuringSession}
          onChange={(v) => s.set({ dimDuringSession: v })}
        />
      </Section>

      <Section title="Your data">
        <View style={styles.dataRow}>
          <View style={styles.flex}>
            <AppText variant="label">Back up</AppText>
            <AppText variant="caption" tone="faint">
              {s.lastBackupAt ? `Last backup ${sinceLabel(s.lastBackupAt)}` : 'Not backed up yet'}
            </AppText>
          </View>
          <Button label="Back up" icon="square.and.arrow.up" kind="secondary" size="md" onPress={backUp} />
        </View>
        <AppText variant="caption" tone="faint">
          Saves your journal, sessions, breath holds, patterns and settings to one file. Keep it in Files or iCloud Drive.
        </AppText>
        <Button label="Restore from backup" icon="square.and.arrow.down" kind="secondary" size="md" onPress={restore} />
        <AppText variant="caption" tone="faint">
          Everything you write and every session you log stays on this phone. Nothing is uploaded.
        </AppText>
        <Button
          label="Clear history"
          icon="trash"
          kind="ghost"
          size="md"
          onPress={() =>
            void confirmAsync(
              'Clear all history?',
              'This deletes your sessions, breath holds and journal entries. Settings and your intention are kept. Back up first if you might want them later.',
              'Clear',
              true,
            ).then((ok) => ok && clearAllData())
          }
        />
      </Section>

      <Section title="Safety">
        <Button label="Safety guidance" icon="exclamationmark.shield" kind="secondary" size="md" onPress={() => router.push('/safety')} />
      </Section>

      <AppText variant="caption" tone="faint" center>
        Becoming 1.0 · A wellbeing tool, not medical treatment.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.xs, paddingTop: space.lg },
  flex: { flex: 1 },
  voiceRow: { flexDirection: 'row', alignItems: 'center', minHeight: 52, gap: space.md },
  voiceList: { gap: space.xs },
  voiceOption: { flexDirection: 'row', alignItems: 'center', minHeight: 44, gap: space.md },
  dataRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
});
