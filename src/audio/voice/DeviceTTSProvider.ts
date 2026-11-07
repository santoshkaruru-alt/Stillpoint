import * as Speech from 'expo-speech';

import type { SpeechStep } from '@/engine/meditation';

import type { VoiceProvider, VoiceSettings } from './VoiceProvider';

/** Speaks lines with the device's built-in voices (works in Expo Go). */
export class DeviceTTSProvider implements VoiceProvider {
  readonly id = 'device-tts';
  private token = 0;
  private settings: VoiceSettings;

  constructor(settings: VoiceSettings) {
    this.settings = settings;
  }

  speak(step: SpeechStep, onDone: () => void) {
    const token = ++this.token;
    void Speech.stop();
    Speech.speak(step.text, {
      language: this.settings.language ?? 'en-US',
      rate: this.settings.rate,
      pitch: this.settings.pitch,
      voice: this.settings.voiceId ?? undefined,
      // Share the app's audio session so the voice mixes with ambience.
      useApplicationAudioSession: true,
      onDone: () => {
        if (token === this.token) onDone();
      },
      onError: () => {
        if (token === this.token) onDone();
      },
    });
  }

  pause() {
    void Speech.pause();
  }

  resume() {
    void Speech.resume();
  }

  stop() {
    this.token += 1; // ignore callbacks from the interrupted line
    void Speech.stop();
  }

  dispose() {
    this.stop();
  }
}

export interface VoiceOption {
  id: string;
  name: string;
  quality: string;
}

/** English voices installed on the device, best quality first. */
export async function listVoices(): Promise<VoiceOption[]> {
  const voices = await Speech.getAvailableVoicesAsync();
  const rank = (q: string) => (q === 'Enhanced' ? 0 : 1);
  return voices
    .filter((v) => v.language?.startsWith('en'))
    .map((v) => ({ id: v.identifier, name: `${v.name} (${v.language})`, quality: String(v.quality) }))
    .sort((a, b) => rank(a.quality) - rank(b.quality) || a.name.localeCompare(b.name));
}

/** Speak a short sample with the given settings. */
export function previewVoice(settings: VoiceSettings) {
  void Speech.stop();
  Speech.speak('Breathe in slowly. And let it go. You are exactly where you need to be.', {
    language: 'en-US',
    rate: settings.rate,
    pitch: settings.pitch,
    voice: settings.voiceId ?? undefined,
  });
}
