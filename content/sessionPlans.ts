import type { SessionPlan } from '../src/models/types';

/**
 * How each guided session is assembled. `weight` is roughly each part's
 * spoken length in minutes plus its share of open silence (deeper parts get
 * more). `weight` sets each segment's share
 * of the total time; silence stretches or shrinks to fit. Remove a segment
 * from a plan, change its variant, or rebalance weights here.
 */
export const sessionPlans: SessionPlan[] = [
  {
    id: 'reset',
    lengthMin: 10,
    name: 'Reset',
    description: 'A short, complete journey. Good for mornings and breaks.',
    segments: [
      { id: 'settle', variant: 'short', weight: 1.01 },
      { id: 'breath', variant: 'short', weight: 1.32 },
      { id: 'present', variant: 'short', weight: 1.41 },
      { id: 'release', variant: 'short', weight: 1.57 },
      { id: 'heart', variant: 'short', weight: 1.62 },
      { id: 'future', variant: 'short', weight: 2.24 },
      { id: 'closing', variant: 'short', weight: 0.83 },
    ],
  },
  {
    id: 'return',
    lengthMin: 20,
    name: 'Return',
    description: 'Room to drop in, open your heart and rehearse your future.',
    segments: [
      { id: 'settle', variant: 'short', weight: 1.05 },
      { id: 'breath', variant: 'short', weight: 1.39 },
      { id: 'body', variant: 'medium', weight: 3.25 },
      { id: 'present', variant: 'medium', weight: 2.68 },
      { id: 'release', variant: 'medium', weight: 3.37 },
      { id: 'heart', variant: 'medium', weight: 3.15 },
      { id: 'future', variant: 'medium', weight: 4.23 },
      { id: 'closing', variant: 'short', weight: 0.87 },
    ],
  },
  {
    id: 'deep',
    lengthMin: 45,
    name: 'Deep Change',
    description: 'Long silences to go beyond thinking and feel a new state.',
    segments: [
      { id: 'settle', variant: 'medium', weight: 2.27 },
      { id: 'breath', variant: 'medium', weight: 2.71 },
      { id: 'body', variant: 'long', weight: 7.74 },
      { id: 'present', variant: 'long', weight: 6.36 },
      { id: 'release', variant: 'long', weight: 7.60 },
      { id: 'heart', variant: 'long', weight: 6.98 },
      { id: 'future', variant: 'long', weight: 9.42 },
      { id: 'closing', variant: 'medium', weight: 1.93 },
    ],
  },
  {
    id: 'journey',
    lengthMin: 60,
    name: 'Full Journey',
    description: 'The complete practice, with the most space to rest and rehearse.',
    segments: [
      { id: 'settle', variant: 'long', weight: 4.51 },
      { id: 'breath', variant: 'long', weight: 6.06 },
      { id: 'body', variant: 'long', weight: 8.93 },
      { id: 'present', variant: 'long', weight: 8.03 },
      { id: 'release', variant: 'long', weight: 8.80 },
      { id: 'heart', variant: 'long', weight: 8.41 },
      { id: 'future', variant: 'long', weight: 11.33 },
      { id: 'closing', variant: 'long', weight: 3.93 },
    ],
  },
  {
    id: 'centres',
    lengthMin: 30,
    name: 'Centres of Light',
    description: 'Breathe light into eight centres, from the base of the spine to the crown.',
    segments: [
      { id: 'settle', variant: 'short', weight: 2.39 },
      { id: 'breath', variant: 'medium', weight: 4.40 },
      { id: 'centres', variant: 'long', weight: 15.28 },
      { id: 'heart', variant: 'short', weight: 4.94 },
      { id: 'closing', variant: 'medium', weight: 2.99 },
    ],
  },
];

/** Find a plan by id ("return"), or by length for older links ("20"). */
export const planFor = (key: string | number | undefined) =>
  sessionPlans.find((p) => p.id === key) ?? sessionPlans.find((p) => p.lengthMin === Number(key) && p.id !== 'centres');
