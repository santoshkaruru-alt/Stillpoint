import type { SessionPlan } from '../src/models/types';

/**
 * How each session length is assembled. `weight` sets each segment's share
 * of the total time; silence stretches or shrinks to fit. Remove a segment
 * from a plan, change its variant, or rebalance weights here.
 */
export const sessionPlans: SessionPlan[] = [
  {
    lengthMin: 10,
    name: 'Reset',
    description: 'A short, complete journey. Good for mornings and breaks.',
    segments: [
      { id: 'settle', variant: 'short', weight: 0.9 },
      { id: 'breath', variant: 'short', weight: 1.1 },
      { id: 'body', variant: 'short', weight: 1.3 },
      { id: 'present', variant: 'short', weight: 1.2 },
      { id: 'heart', variant: 'short', weight: 1.4 },
      { id: 'future', variant: 'short', weight: 1.6 },
      { id: 'closing', variant: 'short', weight: 0.8 },
    ],
  },
  {
    lengthMin: 20,
    name: 'Return',
    description: 'Room to drop in, open your heart and rehearse your future.',
    segments: [
      { id: 'settle', variant: 'medium', weight: 1 },
      { id: 'breath', variant: 'medium', weight: 1.2 },
      { id: 'body', variant: 'medium', weight: 1.5 },
      { id: 'present', variant: 'medium', weight: 1.4 },
      { id: 'heart', variant: 'medium', weight: 1.6 },
      { id: 'future', variant: 'medium', weight: 1.9 },
      { id: 'closing', variant: 'medium', weight: 0.9 },
    ],
  },
  {
    lengthMin: 45,
    name: 'Deep Change',
    description: 'Long silences to go beyond thinking and feel a new state.',
    segments: [
      { id: 'settle', variant: 'long', weight: 0.8 },
      { id: 'breath', variant: 'long', weight: 1.2 },
      { id: 'body', variant: 'long', weight: 1.6 },
      { id: 'present', variant: 'long', weight: 1.6 },
      { id: 'heart', variant: 'long', weight: 1.6 },
      { id: 'future', variant: 'long', weight: 2.1 },
      { id: 'closing', variant: 'long', weight: 0.8 },
    ],
  },
  {
    lengthMin: 60,
    name: 'Full Journey',
    description: 'The complete practice, with the most space to rest and rehearse.',
    segments: [
      { id: 'settle', variant: 'long', weight: 0.8 },
      { id: 'breath', variant: 'long', weight: 1.2 },
      { id: 'body', variant: 'long', weight: 1.7 },
      { id: 'present', variant: 'long', weight: 1.9 },
      { id: 'heart', variant: 'long', weight: 1.7 },
      { id: 'future', variant: 'long', weight: 2.3 },
      { id: 'closing', variant: 'long', weight: 0.8 },
    ],
  },
];

export const planFor = (lengthMin: number) => sessionPlans.find((p) => p.lengthMin === lengthMin);
