import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { kvStorage } from './kv';
import type { AmbientBedId, Intention } from '@/models/types';
import type { ThemeName } from '@/theme/palettes';

export type ReduceMotionPref = 'system' | 'on' | 'off';
export type AppearancePref = 'system' | 'light' | 'dark';

export type LastSession =
  | { kind: 'meditation'; planId?: string; lengthMin?: number; segmentIndex: number; title: string; at: number }
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
  appearance: AppearancePref;
  themeName: ThemeName;
  reduceMotion: ReduceMotionPref;
  dimDuringSession: boolean;

  // Silent timer
  timerIntervalMin: number; // 0 = no interval bells
  timerBed: AmbientBedId;

  // Calendar reminder time on the web (minutes after midnight)
  calendarReminderMin: number;

  // Data
  lastBackupAt: number | null;

  // Content state
  intention: Intention;
  lastSession: LastSession | null;
  reminders: ReminderSettings;

  set: (patch: Partial<Omit<SettingsState, 'set'>>) => void;
}

export const defaultIntention: Intention = { identity: '', emotion: '', scene: '', letGo: '' };

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

      appearance: 'system',
      themeName: 'ocean',
      reduceMotion: 'system',
      dimDuringSession: true,

      timerIntervalMin: 0,
      timerBed: 'drift',
      calendarReminderMin: 7 * 60,
      lastBackupAt: null,

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
      version: 2,
      // v2 replaced the Sage, Sand and Mist palettes with Ocean, Forest and Dusk.
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<SettingsState>;
        if (version < 2) state.themeName = 'ocean';
        return state as SettingsState;
      },
      // Synchronous storage so settings are ready on the first render
      // (no flash of the safety screen for returning users).
      storage: kvStorage,
      partialize: ({ set: _set, ...rest }) => rest,
    },
  ),
);
