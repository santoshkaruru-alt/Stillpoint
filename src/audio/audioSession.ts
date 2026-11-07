import { setAudioModeAsync } from 'expo-audio';

let configured = false;

/**
 * Configure the iOS audio session once: play even with the silent switch
 * on, keep playing in the background (needs a dev build for full lock
 * screen support; Expo Go keeps going while audio is playing), and mix
 * politely with other apps.
 */
export async function ensureAudioSession() {
  if (configured) return;
  configured = true;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'duckOthers',
    });
  } catch (e) {
    configured = false;
    console.warn('Audio session setup failed', e);
  }
}
