import { useReducedMotion } from 'react-native-reanimated';

import { useSettings } from '@/store/settings';

/** True when animations should be minimised (system setting or app override). */
export function useReduceMotion(): boolean {
  const system = useReducedMotion();
  const pref = useSettings((s) => s.reduceMotion);
  if (pref === 'on') return true;
  if (pref === 'off') return false;
  return system;
}
