/**
 * Shared Web Audio context for the web build (ambient beds, binaural
 * tones, cues). Web Audio is used instead of <audio> elements because
 * iPhone browsers ignore programmatic volume on <audio>, which would break
 * fades and level controls. Only imported by *.web.ts files.
 */
import { Asset } from 'expo-asset';

type AudioCtor = typeof AudioContext;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

export function audioContext(): AudioContext {
  if (!ctx) {
    const C: AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext: AudioCtor }).webkitAudioContext;
    ctx = new C();
    master = ctx.createGain();
    master.connect(ctx.destination);
  }
  return ctx;
}

export function masterGain(): GainNode {
  audioContext();
  return master!;
}

/**
 * Ask iOS to treat this page's sound as media playback, so it plays even
 * with the ring/silent switch on (Safari 17+; ignored elsewhere).
 */
export function preferPlaybackSession() {
  const nav = navigator as Navigator & { audioSession?: { type: string } };
  try {
    if (nav.audioSession) nav.audioSession.type = 'playback';
  } catch {
    // not supported
  }
}

/** Must run inside a tap: starts (or restarts) the audio engine. */
export function unlockAudio() {
  preferPlaybackSession();
  const c = audioContext();
  if (c.state !== 'running') void c.resume();
  // A one-sample silent buffer completes the unlock on older iOS.
  const b = c.createBuffer(1, 1, 22050);
  const s = c.createBufferSource();
  s.buffer = b;
  s.connect(c.destination);
  s.start(0);
}

const buffers = new Map<number, Promise<AudioBuffer>>();

export function loadBuffer(mod: number): Promise<AudioBuffer> {
  let p = buffers.get(mod);
  if (!p) {
    const uri = Asset.fromModule(mod).uri;
    p = fetch(uri)
      .then((r) => r.arrayBuffer())
      .then(
        (data) =>
          new Promise<AudioBuffer>((resolve, reject) => {
            // Callback form works on every Safari version.
            audioContext().decodeAudioData(data, resolve, reject);
          }),
      );
    p.catch(() => buffers.delete(mod));
    buffers.set(mod, p);
  }
  return p;
}
