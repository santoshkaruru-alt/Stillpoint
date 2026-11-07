import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

import type { AmbientSettings } from '@/models/types';

import { bedSources, binauralSources, type MixLevels } from './ambientShared';

export { bedLabels, binauralLabels, type MixLevels } from './ambientShared';

interface Layer {
  player: AudioPlayer;
  current: number;
  target: number;
  step: number;
}

const FADE_TICK_MS = 50;

/**
 * Ambient and binaural layers with smooth fades. Each sound is a looping
 * player; switching scenes crossfades between them. Players that fade to
 * silence are paused to save battery.
 */
export class AmbientMixer {
  private layers = new Map<string, Layer>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private paused = false;
  private master = 1;

  private layer(key: string, source: number): Layer {
    let l = this.layers.get(key);
    if (!l) {
      const player = createAudioPlayer(source);
      player.loop = true;
      player.volume = 0;
      l = { player, current: 0, target: 0, step: 0 };
      this.layers.set(key, l);
    }
    return l;
  }

  /** Move to a segment's ambience over `fadeMs`. */
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
      this.rampTo(l, target, fadeMs);
    }
    this.ensureTimer();
  }

  /** Fade every layer out (session end). Resolves when silent. */
  fadeOut(fadeMs = 8000): Promise<void> {
    for (const l of this.layers.values()) this.rampTo(l, 0, fadeMs);
    this.ensureTimer();
    return new Promise((resolve) => setTimeout(resolve, fadeMs + 100));
  }

  pause() {
    this.paused = true;
    for (const l of this.layers.values()) l.player.pause();
  }

  resume() {
    this.paused = false;
    for (const l of this.layers.values()) if (l.current > 0 || l.target > 0) l.player.play();
  }

  /** Overall multiplier, e.g. for ducking. */
  setMaster(v: number) {
    this.master = v;
    for (const l of this.layers.values()) l.player.volume = l.current * this.master;
  }

  dispose() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    for (const l of this.layers.values()) {
      try {
        l.player.pause();
        l.player.remove();
      } catch {
        // already released
      }
    }
    this.layers.clear();
  }

  private rampTo(l: Layer, target: number, fadeMs: number) {
    l.target = Math.max(0, Math.min(1, target));
    const ticks = Math.max(1, fadeMs / FADE_TICK_MS);
    l.step = (l.target - l.current) / ticks;
    if (l.target > 0 && !this.paused && !l.player.playing) l.player.play();
  }

  private ensureTimer() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      if (this.paused) return;
      let active = false;
      for (const l of this.layers.values()) {
        if (l.current === l.target) continue;
        active = true;
        const next = l.current + l.step;
        l.current = (l.step > 0 && next >= l.target) || (l.step < 0 && next <= l.target) ? l.target : next;
        l.player.volume = l.current * this.master;
        if (l.current === 0 && l.target === 0) l.player.pause();
      }
      if (!active && this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    }, FADE_TICK_MS);
  }
}
