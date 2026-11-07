import { router } from 'expo-router';

import { useSettings } from '@/store/settings';

/** Start a meditation of the given length (optionally from a segment, with a mood check-in). */
export function startMeditation(lengthMin: number, fromSegment = 0, moodBefore: number | null = null) {
  router.push({
    pathname: '/session/[length]',
    params: {
      length: String(lengthMin),
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
  if (last.kind === 'meditation') startMeditation(last.lengthMin, last.segmentIndex);
  else startBreath(last.patternId, last.intense);
}
