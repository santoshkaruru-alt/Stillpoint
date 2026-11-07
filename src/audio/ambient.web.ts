import type { AmbientSettings } from '@/models/types';

import { bedSources, binauralSources, type MixLevels } from './ambientShared';
import { audioContext, loadBuffer, masterGain } from './webAudio';

export { bedLabels, binauralLabels, type MixLevels } from './ambientShared';

interface Layer {
  gain: GainNode;
  source: AudioBufferSourceNode | null;
  starting: boolean;
  target: number;
  stopTimer: ReturnType<typeof setTimeout> | null;
}

/**
 * Web version of the ambient mixer, on Web Audio: each bed loops
 * gaplessly through its own gain node, and fades are scheduled ramps.
 * Same API as the native AmbientMixer.
 */
export class AmbientMixer {
  private layers = new Map<string, Layer>();
  private out: GainNode;
  private disposed = false;

  constructor() {
    const c = audioContext();
    this.out = c.createGain();
    this.out.connect(masterGain());
  }

  setScene(scene: AmbientSettings, levels: MixLevels, fadeMs = 4000) {
    const bed = levels.bedOverride ?? scene.bed;
    const bedKey = bed === 'none' ? null : `bed:${bed}`;
    const binKey = levels.binauralEnabled && scene.binaural !== 'off' ? `bin:${scene.binaural}` : null;

    if (bedKey && bed !== 'none') this.layer(bedKey, bedSources[bed]);
    if (binKey && scene.binaural !== 'off') this.layer(binKey, binauralSources[scene.binaural]);

    for (const [key, l] of this.layers) {
      let target = 0;
      if (key === bedKey) target = levels.ambientVolume * scene.level;
      if (key === binKey) target = levels.binauralVolume * 0.6;
      this.ramp(l, target, fadeMs);
    }
  }

  fadeOut(fadeMs = 8000): Promise<void> {
    for (const l of this.layers.values()) this.ramp(l, 0, fadeMs);
    return new Promise((resolve) => setTimeout(resolve, fadeMs + 100));
  }

  pause() {
    void audioContext().suspend();
  }

  resume() {
    void audioContext().resume();
  }

  setMaster(v: number) {
    this.out.gain.value = v;
  }

  dispose() {
    this.disposed = true;
    for (const l of this.layers.values()) {
      if (l.stopTimer) clearTimeout(l.stopTimer);
      try {
        l.source?.stop();
      } catch {
        // already stopped
      }
      l.gain.disconnect();
    }
    this.layers.clear();
    this.out.disconnect();
    // A paused session leaves the engine suspended; wake it for cues.
    void audioContext().resume();
  }

  private layer(key: string, mod: number): Layer {
    let l = this.layers.get(key);
    if (!l) {
      const g = audioContext().createGain();
      g.gain.value = 0;
      g.connect(this.out);
      l = { gain: g, source: null, starting: false, target: 0, stopTimer: null };
      this.layers.set(key, l);
    }
    if (!l.source && !l.starting) {
      const layer = l;
      layer.starting = true;
      loadBuffer(mod)
        .then((buffer) => {
          layer.starting = false;
          if (this.disposed || layer.source) return;
          const s = audioContext().createBufferSource();
          s.buffer = buffer;
          s.loop = true;
          s.connect(layer.gain);
          s.start();
          layer.source = s;
        })
        .catch((e) => {
          layer.starting = false;
          console.warn('Ambient sound failed to load', e);
        });
    }
    return l;
  }

  private ramp(l: Layer, target: number, fadeMs: number) {
    const c = audioContext();
    const now = c.currentTime;
    const g = l.gain.gain;
    l.target = Math.max(0, Math.min(1, target));
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(l.target, now + fadeMs / 1000);
    if (l.stopTimer) clearTimeout(l.stopTimer);
    l.stopTimer = null;
    if (l.target === 0) {
      // Stop silent loops after the fade to save battery.
      l.stopTimer = setTimeout(() => {
        if (l.target === 0 && l.source) {
          try {
            l.source.stop();
          } catch {
            // ignore
          }
          l.source = null;
        }
      }, fadeMs + 200);
    }
  }
}
