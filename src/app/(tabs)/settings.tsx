import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { bedLabels, binauralLabels } from '@/audio/ambient';
import { listVoices, previewVoice, type VoiceOption } from '@/audio/voice/DeviceTTSProvider';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Segmented } from '@/components/Segmented';
import { Field, Section, ToggleRow } from '@/components/SettingRow';
import { Screen } from '@/components/Screen';
import { Stepper } from '@/components/Stepper';
import type { AmbientBedId } from '@/models/types';
import { useSettings } from '@/store/settings';
import { colors, space } from '@/theme';

const pct = (v: number) => `${Math.round(v * 100)}%`;

export default function SettingsTab() {
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
      Alert.alert(
        'Use headphones',
        'Binaural tones play a slightly different pitch in each ear. They only work with headphones, and should be kept quiet. Skip them if you have epilepsy or a seizure history.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Turn on', onPress: () => s.set({ binauralEnabled: true, binauralNoticeSeen: true }) },
        ],
      );
      return;
    }
    s.set({ binauralEnabled: on });
  };

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="overline" tone="violet">
          Settings
        </AppText>
        <AppText variant="display" accessibilityRole="header">
          Make it yours
        </AppText>
      </View>

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
          <Icon name={showVoices ? 'chevron.up' : 'chevron.down'} size={16} color={colors.textFaint} />
        </Pressable>
        {showVoices ? (
          <View style={styles.voiceList}>
            <AppText variant="caption" tone="faint">
              For a more natural voice, download an Enhanced or Premium voice in iPhone Settings, Accessibility, Spoken Content, Voices. Then choose it here.
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
                  <AppText style={styles.flex} tone={selected ? 'violet' : 'default'}>
                    {v.name}
                    {v.quality === 'Enhanced' ? '  ·  Enhanced' : ''}
                  </AppText>
                  {selected ? <Icon name="checkmark" size={16} color={colors.violet} /> : null}
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
        <ToggleRow label="Haptics" hint="Feel each phase of the breath" value={s.hapticsEnabled} onChange={(v) => s.set({ hapticsEnabled: v })} />
        <ToggleRow label="Sound cues" hint="Soft tones at each phase" value={s.breathSounds} onChange={(v) => s.set({ breathSounds: v })} />
      </Section>

      <Section title="Display">
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.sm, paddingTop: space.xl },
  flex: { flex: 1 },
  voiceRow: { flexDirection: 'row', alignItems: 'center', minHeight: 52, gap: space.md },
  voiceList: { gap: space.xs },
  voiceOption: { flexDirection: 'row', alignItems: 'center', minHeight: 44, gap: space.md },
});
