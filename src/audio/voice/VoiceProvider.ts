import type { SpeechStep } from '@/engine/meditation';

/**
 * The seam between the meditation engine and whatever produces the voice.
 *
 * v1 ships DeviceTTSProvider (iOS speech synthesis via expo-speech).
 * RecordedVoiceProvider plays pre-made audio files keyed by step id, and
 * falls back to TTS for any line without a file. A cloud TTS provider
 * (e.g. ElevenLabs) would generate files ahead of time and hand them to
 * RecordedVoiceProvider, so the engine never changes.
 */
export interface VoiceProvider {
  readonly id: string;
  /** Speak one line. Call onDone once when it finishes naturally. */
  speak(step: SpeechStep, onDone: () => void): void;
  pause(): void;
  resume(): void;
  /** Stop immediately. onDone for the current line is not called. */
  stop(): void;
  dispose(): void;
}

export interface VoiceSettings {
  rate: number;
  pitch: number;
  voiceId: string | null;
  language?: string;
}
