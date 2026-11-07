import * as Haptics from 'expo-haptics';

import type { StepPhase } from '@/engine/breath';

/** One distinct feel per breath phase, so you can practise eyes closed. */
export function phaseHaptic(phase: StepPhase) {
  switch (phase) {
    case 'inhale':
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    case 'exhale':
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    case 'holdIn':
    case 'holdOut':
    case 'retention':
      return Haptics.selectionAsync();
    default:
      return Promise.resolve();
  }
}

/** Gentle per-second pulse during longer inhales and exhales. */
export function tickHaptic() {
  return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function doneHaptic() {
  return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
