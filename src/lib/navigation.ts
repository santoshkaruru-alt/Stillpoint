import { router } from 'expo-router';

import { useSettings } from '@/store/settings';

/** Start a guided session by plan id (optionally from a segment, with a mood check-in). */
export function startMeditation(planId: string, fromSegment = 0, moodBefore: number | null = null) {
  router.push({
    pathname: '/session/[plan]',
    params: {
      plan: planId,
      from: String(fromSegment),
      ...(moodBefore ? { mood: String(moodBefore) } : {}),
    },
  });
}

/**
 * Start a breathwork pattern. Patterns flagged as intense go through the
 * safety acknowledgement screen first, every time.
 */
export function startBreath(patternId: string, requiresSafetyCheck = false) {
  if (requiresSafetyCheck) {
    router.push({ pathname: '/breath/safety', params: { pattern: patternId } });
  } else {
    router.push({ pathname: '/breath/[pattern]', params: { pattern: patternId } });
  }
}

export function continueLastSession() {
  const last = useSettings.getState().lastSession;
  if (!last) return;
  if (last.kind === 'meditation') startMeditation(last.planId ?? String(last.lengthMin ?? 20), last.segmentIndex);
  else startBreath(last.patternId, last.intense);
}

/** Start a silent, unguided sit. */
export function startTimer(minutes: number) {
  router.push({ pathname: '/timer/[minutes]', params: { minutes: String(minutes) } });
}
