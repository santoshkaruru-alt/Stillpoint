import { audioContext, loadBuffer, masterGain } from './webAudio';

export type CueId = 'in' | 'out' | 'hold' | 'done' | 'bell';

const sources: Record<CueId, number> = {
  in: require('@/assets/audio/cue-in.wav'),
  out: require('@/assets/audio/cue-out.wav'),
  hold: require('@/assets/audio/cue-hold.wav'),
  done: require('@/assets/audio/cue-done.wav'),
  bell: require('@/assets/audio/bell.wav'),
};

export function preloadCues(ids: CueId[] = ['in', 'out', 'hold', 'done']) {
  ids.forEach((id) => void loadBuffer(sources[id]).catch(() => {}));
}

export function playCue(id: CueId, volume = 0.8) {
  loadBuffer(sources[id])
    .then((buffer) => {
      const c = audioContext();
      const g = c.createGain();
      g.gain.value = volume;
      const s = c.createBufferSource();
      s.buffer = buffer;
      s.connect(g);
      g.connect(masterGain());
      s.start();
    })
    .catch((e) => console.warn('Cue failed', e));
}
