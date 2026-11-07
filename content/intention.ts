import type { Intention } from '../src/models/types';

/**
 * Intention builder copy and fallbacks. The future-self script reads:
 *   "You are becoming {{identity}}."
 *   "You feel {{emotion}}."
 *   "{{scene}}"
 */

export const intentionPrompts: Record<keyof Intention, { label: string; lead: string; placeholder: string; examples: string[] }> = {
  identity: {
    label: 'Who are you becoming?',
    lead: 'You are becoming…',
    placeholder: 'someone calm, patient and generous',
    examples: [
      'someone who feels at home in their own body',
      'a patient, present parent',
      'a confident, clear-thinking leader',
      'someone who trusts themselves',
    ],
  },
  emotion: {
    label: 'What do you want to feel?',
    lead: 'You feel…',
    placeholder: 'grateful, free and full of energy',
    examples: ['deeply grateful', 'calm and safe', 'joyful and light', 'confident and free', 'loved and whole'],
  },
  scene: {
    label: 'One moment from your future',
    lead: 'Picture it happening now…',
    placeholder:
      'It is a bright morning. I wake up rested in our new home, make coffee, and smile because the work I love is waiting for me.',
    examples: [
      'I walk on stage, look out at the audience, and feel completely at ease.',
      'I am laughing at the dinner table with the people I love, healthy and relaxed.',
      'I open the email that says yes, and I feel calm, because I knew it was coming.',
    ],
  },
};

/** Used when a field is left empty, so the script always reads naturally. */
export const intentionDefaults: Intention = {
  identity: 'the calmest, kindest and most capable version of yourself',
  emotion: 'a quiet, steady joy',
  scene:
    'It is an ordinary morning, some time from now. You wake up rested, and everything you have been working towards has already arrived. You move through the day with ease, and you smile, because this is simply your life now.',
};
