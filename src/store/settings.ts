import Storage from 'expo-sqlite/kv-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AmbientBedId, Intention, SessionLength } from '@/models/types';

export type ReduceMotionPref = 'system' | 'on' | 'off';

export type LastSession =
  | { kind: 'meditation'; lengthMin: SessionLength; segmentIndex: number; title: string; at: number }
  | { kind: 'breath'; patternId: string; intense: boolean; title: string; at: number };

export interface ReminderSettings {
  morningEnabled: boolean;
  morningHour: number;
  morningMinute: number;
  eveningEnabled: boolean;
  eveningHour: number;
  eveningMinute: number;
}

export interface SettingsState {
  // Safety
  safetyAcknowledgedAt: number | null;

  // Voice
  voiceRate: number; // expo-speech rate, 1.0 = normal
  voicePitch: number;
  voiceId: string | null; // null = system default for language
  pauseScale: number; // multiplier on [pause Ns] markers
  showCaptions: boolean;

  // Sound
  ambientVolume: number; // 0..1
  ambientOverride: AmbientBedId | null; // null = follow each segment
  binauralEnabled: boolean;
  binauralVolume: number; // 0..1
  binauralNoticeSeen: boolean;

  // Breath
  hapticsEnabled: boolean;
  breathSounds: boolean;

  // Display
  reduceMotion: ReduceMotionPref;
  dimDuringSession: boolean;

  // Content state
  intention: Intention;
  lastSession: LastSession | null;
  reminders: ReminderSettings;

  set: (patch: Partial<Omit<SettingsState, 'set'>>) => void;
}

export const defaultIntention: Intention = { identity: '', emotion: '', scene: '' };

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      safetyAcknowledgedAt: null,

      voiceRate: 0.82,
      voicePitch: 0.95,
      voiceId: null,
      pauseScale: 1,
      showCaptions: true,

      ambientVolume: 0.6,
      ambientOverride: null,
      binauralEnabled: false,
      binauralVolume: 0.35,
      binauralNoticeSeen: false,

      hapticsEnabled: true,
      breathSounds: true,

      reduceMotion: 'system',
      dimDuringSession: true,

      intention: defaultIntention,
      lastSession: null,
      reminders: {
        morningEnabled: false,
        morningHour: 7,
        morningMinute: 0,
        eveningEnabled: false,
        eveningHour: 21,
        eveningMinute: 0,
      },

      set: (patch) => set(patch),
    }),
    {
      name: 'stillpoint-settings',
      version: 1,
      // Synchronous storage so settings are ready on the first render
      // (no flash of the safety screen for returning users).
      storage: createJSONStorage(() => ({
        getItem: (key) => Storage.getItemSync(key),
        setItem: (key, value) => Storage.setItemSync(key, value),
        removeItem: (key) => {
          Storage.removeItemSync(key);
        },
      })),
      partialize: ({ set: _set, ...rest }) => rest,
    },
  ),
);
