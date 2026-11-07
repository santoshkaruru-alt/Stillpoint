import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

import { ensureAudioSession } from './audioSession';

export type CueId = 'in' | 'out' | 'hold' | 'done' | 'bell';

const sources: Record<CueId, number> = {
  in: require('@/assets/audio/cue-in.wav'),
  out: require('@/assets/audio/cue-out.wav'),
  hold: require('@/assets/audio/cue-hold.wav'),
  done: require('@/assets/audio/cue-done.wav'),
  bell: require('@/assets/audio/bell.wav'),
};

const players: Partial<Record<CueId, AudioPlayer>> = {};

function player(id: CueId): AudioPlayer {
  let p = players[id];
  if (!p) {
    p = createAudioPlayer(sources[id]);
    players[id] = p;
  }
  return p;
}

/** Load cue sounds ahead of time so the first cue is not late. */
export function preloadCues(ids: CueId[] = ['in', 'out', 'hold', 'done']) {
  void ensureAudioSession();
  ids.forEach(player);
}

export function playCue(id: CueId, volume = 0.8) {
  try {
    const p = player(id);
    p.volume = volume;
    void p.seekTo(0);
    p.play();
  } catch (e) {
    console.warn('Cue failed', e);
  }
}
