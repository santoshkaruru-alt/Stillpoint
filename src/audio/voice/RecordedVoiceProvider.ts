import { createAudioPlayer, type AudioPlayer, type AudioSource } from 'expo-audio';

import type { SpeechStep } from '@/engine/meditation';

import type { VoiceProvider } from './VoiceProvider';

/**
 * Plays recorded voice files keyed by step id (e.g. "future.long.4"),
 * falling back to another provider (usually TTS) for missing lines.
 *
 * To use: generate a manifest with `npm run export:scripts`, record or
 * synthesise one file per speech line, then build a map like
 *   { 'settle.short.0': require('@/assets/voice/settle.short.0.m4a'), ... }
 * and pass it here. Recorded audio also keeps playing reliably with the
 * screen locked, unlike device TTS.
 *
 * Note: lines in the future-self segment contain the user's own words, so
 * they need TTS (or a cloud TTS call at session start) rather than fixed
 * recordings.
 */
export class RecordedVoiceProvider implements VoiceProvider {
  readonly id = 'recorded';
  private player: AudioPlayer | null = null;
  private sub: { remove: () => void } | null = null;
  private usingFallback = false;
  private token = 0;

  constructor(
    private readonly files: Record<string, AudioSource>,
    private readonly fallback: VoiceProvider,
  ) {}

  speak(step: SpeechStep, onDone: () => void) {
    this.stop();
    const token = ++this.token;
    const source = this.files[step.id];
    if (!source) {
      this.usingFallback = true;
      this.fallback.speak(step, onDone);
      return;
    }
    this.usingFallback = false;
    const p = createAudioPlayer(source);
    this.player = p;
    this.sub = p.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish && token === this.token) onDone();
    });
    p.play();
  }

  pause() {
    if (this.usingFallback) this.fallback.pause();
    else this.player?.pause();
  }

  resume() {
    if (this.usingFallback) this.fallback.resume();
    else this.player?.play();
  }

  stop() {
    this.token += 1;
    this.fallback.stop();
    this.sub?.remove();
    this.sub = null;
    this.player?.remove();
    this.player = null;
  }

  dispose() {
    this.stop();
    this.fallback.dispose();
  }
}
