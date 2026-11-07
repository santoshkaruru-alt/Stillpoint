import { unlockAudio } from '@/audio/webAudio';

export const isWeb = true;

let primedSpeech = false;

/**
 * Browsers only allow sound after a tap. On every tap we make sure the
 * audio engine is running (iOS suspends it when the app is backgrounded),
 * and on the first tap we "prime" speech synthesis with a silent utterance
 * so later spoken lines are allowed to play from timers.
 */
function onUserGesture() {
  try {
    unlockAudio();
  } catch {
    // no Web Audio support
  }
  if (!primedSpeech && 'speechSynthesis' in window) {
    primedSpeech = true;
    try {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      window.speechSynthesis.speak(u);
    } catch {
      // ignore
    }
  }
}

let done = false;

export function setupPlatform() {
  if (done || typeof window === 'undefined') return;
  done = true;
  for (const evt of ['touchend', 'click', 'keydown'] as const) {
    window.addEventListener(evt, onUserGesture, { capture: true, passive: true });
  }
}
