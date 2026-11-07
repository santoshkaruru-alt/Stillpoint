/**
 * Breathwork presets. Edit timings, rounds and cue text here.
 * Times are in seconds.
 */
import type { BreathPattern } from '../src/models/types';

export const breathPresets: BreathPattern[] = [
  {
    id: 'box',
    kind: 'paced',
    name: 'Box',
    summary: 'In 4, hold 4, out 4, hold 4. Steady and focusing.',
    rounds: 10,
    phases: [
      { type: 'inhale', sec: 4, cue: 'Breathe in through your nose' },
      { type: 'holdIn', sec: 4, cue: 'Hold gently' },
      { type: 'exhale', sec: 4, cue: 'Breathe out slowly' },
      { type: 'holdOut', sec: 4, cue: 'Rest on empty' },
    ],
  },
  {
    id: '478',
    kind: 'paced',
    name: '4-7-8',
    summary: 'In 4, hold 7, out 8. A wind-down before sleep.',
    rounds: 4,
    phases: [
      { type: 'inhale', sec: 4, cue: 'Quietly in through your nose' },
      { type: 'holdIn', sec: 7, cue: 'Hold, soft shoulders' },
      { type: 'exhale', sec: 8, cue: 'Long breath out through your mouth' },
    ],
  },
  {
    id: 'coherent',
    kind: 'paced',
    name: 'Coherent',
    summary: '5.5 seconds in, 5.5 out. Even, smooth, heart-centred.',
    rounds: 27,
    phases: [
      { type: 'inhale', sec: 5.5, cue: 'Breathe in slowly, as if through your heart' },
      { type: 'exhale', sec: 5.5, cue: 'Breathe out slowly, staying with your heart' },
    ],
  },
  {
    id: 'sigh',
    kind: 'paced',
    name: 'Physiological sigh',
    summary: 'Two inhales, one long exhale. The quickest way to calm down.',
    rounds: 10,
    phases: [
      { type: 'inhale', sec: 2.5, cue: 'Breathe in through your nose', scaleTo: 0.85 },
      { type: 'inhale', sec: 1, cue: 'Sip in a little more', scaleTo: 1 },
      { type: 'exhale', sec: 6, cue: 'Long, slow sigh out through your mouth' },
    ],
  },
  {
    id: 'rising',
    kind: 'paced',
    name: 'Rising breath',
    summary: 'Draw energy up the spine with a gentle squeeze and hold.',
    requiresSafetyCheck: true,
    rounds: 7,
    intro:
      'Sit tall. On each breath in, gently engage your core and pelvic floor and move your attention slowly from the base of your spine up to the top of your head. Hold with a light squeeze at the top, then let everything go.',
    phases: [
      { type: 'inhale', sec: 7, cue: 'Squeeze low, draw the breath up your spine' },
      { type: 'holdIn', sec: 7, cue: 'Hold, gentle squeeze, attention at the crown' },
      { type: 'exhale', sec: 5, cue: 'Release everything, let it pour out' },
      { type: 'holdOut', sec: 2, cue: 'Soften' },
    ],
  },
  {
    id: 'power',
    kind: 'power',
    name: 'Power rounds',
    summary: '30 to 40 deep breaths, an exhale hold, a recovery breath. 3 rounds.',
    requiresSafetyCheck: true,
    logsHolds: true,
    breathsPerRound: 30,
    inhaleSec: 1.6,
    exhaleSec: 1.4,
    recoveryHoldSec: 15,
    rounds: 3,
    maxHoldSec: 180,
    intro:
      'Breathe in fully, let the breath fall out without forcing. After the last breath, breathe out and hold on empty for as long as feels comfortable. Tap when you need to breathe.',
  },
];

export const breathPresetById = (id: string) => breathPresets.find((p) => p.id === id);
