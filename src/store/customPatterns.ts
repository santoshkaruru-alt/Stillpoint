import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { breathPresetById } from '@content/breathPresets';
import type { BreathPattern, PacedPattern } from '@/models/types';

import { kvStorage } from './kv';

interface CustomPatternsState {
  patterns: PacedPattern[];
  save: (p: PacedPattern) => void;
  remove: (id: string) => void;
}

export const useCustomPatterns = create<CustomPatternsState>()(
  persist(
    (set) => ({
      patterns: [],
      save: (p) =>
        set((s) => ({ patterns: [p, ...s.patterns.filter((x) => x.id !== p.id)] })),
      remove: (id) => set((s) => ({ patterns: s.patterns.filter((x) => x.id !== id) })),
    }),
    { name: 'stillpoint-custom-patterns', version: 1, storage: kvStorage },
  ),
);

/** Look up a built-in preset or a saved custom pattern. */
export function findPattern(id: string): BreathPattern | undefined {
  return breathPresetById(id) ?? useCustomPatterns.getState().patterns.find((p) => p.id === id);
}
