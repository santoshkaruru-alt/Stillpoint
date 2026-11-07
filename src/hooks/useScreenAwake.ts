import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useEffect } from 'react';
import { AppState } from 'react-native';

/**
 * Keeps the screen on while a session is open. Unlike useKeepAwake, it
 * never throws if the lock is refused or released early, and it asks
 * again when the app returns to the foreground (browsers drop the lock
 * whenever the page is hidden).
 */
export function useScreenAwake(tag: string) {
  useEffect(() => {
    const activate = () => {
      activateKeepAwakeAsync(tag).catch(() => {});
    };
    activate();
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') activate();
    });
    return () => {
      sub.remove();
      try {
        Promise.resolve(deactivateKeepAwake(tag)).catch(() => {});
      } catch {
        // the lock was never granted
      }
    };
  }, [tag]);
}
