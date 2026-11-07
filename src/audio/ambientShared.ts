import type { AmbientBedId, BinauralPresetId } from '@/models/types';

export const bedSources: Record<Exclude<AmbientBedId, 'none'>, number> = {
  drift: require('@/assets/audio/bed-drift.wav'),
  tide: require('@/assets/audio/bed-tide.wav'),
  rain: require('@/assets/audio/bed-rain.wav'),
  deep: require('@/assets/audio/bed-deep.wav'),
};

export const binauralSources: Record<Exclude<BinauralPresetId, 'off'>, number> = {
  alpha: require('@/assets/audio/binaural-alpha.wav'),
  theta: require('@/assets/audio/binaural-theta.wav'),
  delta: require('@/assets/audio/binaural-delta.wav'),
};

export const bedLabels: Record<AmbientBedId, string> = {
  none: 'Silence',
  drift: 'Drift',
  tide: 'Tide',
  rain: 'Rain',
  deep: 'Deep',
};

export const binauralLabels: Record<BinauralPresetId, string> = {
  off: 'Off',
  alpha: 'Alpha · 10 Hz',
  theta: 'Theta · 6 Hz',
  delta: 'Delta · 3 Hz',
};

export interface MixLevels {
  ambientVolume: number;
  /** Replace each segment's bed with this one (null = follow the script). */
  bedOverride: AmbientBedId | null;
  binauralEnabled: boolean;
  binauralVolume: number;
}
