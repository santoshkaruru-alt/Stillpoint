import { audioContext, preferPlaybackSession } from './webAudio';

/** Web: prefer media playback and wake the audio engine if it was suspended. */
export async function ensureAudioSession() {
  preferPlaybackSession();
  const c = audioContext();
  if (c.state !== 'running') {
    try {
      await c.resume();
    } catch {
      // resumes on the next tap
    }
  }
}
