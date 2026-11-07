import { intentionDefaults } from '@content/intention';

import type { Intention } from '@/models/types';

/** Trim, collapse whitespace, strip trailing punctuation for inline use. */
function cleanInline(s: string): string {
  return s.replace(/\s+/g, ' ').trim().replace(/[.!?,;:\s]+$/, '');
}

/** Ensure a free-text scene ends with sentence punctuation. */
function cleanSentence(s: string): string {
  const t = s.replace(/\s+/g, ' ').trim();
  if (!t) return t;
  return /[.!?]["')]?$/.test(t) ? t : `${t}.`;
}

/**
 * Rewrite first-person writing ("I walk in, my hands...") into the second
 * person the scripts use ("you walk in, your hands..."). Simple and
 * predictable: only clear pronoun forms are changed.
 */
export function toSecondPerson(text: string): string {
  const rules: [RegExp, string][] = [
    [/\bI am\b/g, 'you are'],
    [/\bI'm\b/g, "you're"],
    [/\bI’m\b/g, 'you’re'],
    [/\bI was\b/g, 'you were'],
    [/\bI've\b/g, "you've"],
    [/\bI’ve\b/g, 'you’ve'],
    [/\bI'll\b/g, "you'll"],
    [/\bI’ll\b/g, 'you’ll'],
    [/\bI'd\b/g, "you'd"],
    [/\bI’d\b/g, 'you’d'],
    [/\bI\b/g, 'you'],
    [/\bmyself\b/gi, 'yourself'],
    [/\bmine\b/gi, 'yours'],
    [/\bmy\b/gi, 'your'],
    [/\bme\b/gi, 'you'],
  ];
  let out = text;
  for (const [re, rep] of rules) out = out.replace(re, rep);
  // Capitalise the first letter of each sentence again.
  return out.replace(/(^|[.!?]\s+)([a-z])/g, (_m, pre: string, ch: string) => pre + ch.toUpperCase());
}

/** "Someone calm" reads mid-sentence as "someone calm"; names keep their capitals. */
function lowerLead(s: string): string {
  return s.replace(/^(A|An|The|Someone|Somebody|More|Less|Very|Deeply|Truly|Calm|Grateful|Happy|Free|Joyful)\b/, (w) => w.toLowerCase());
}

/** Resolve the values that will be spoken, using defaults for empty fields. */
export function resolveIntention(intention: Partial<Intention> | null | undefined): Intention {
  const identity = cleanInline(intention?.identity ?? '');
  const emotion = cleanInline(intention?.emotion ?? '');
  const scene = (intention?.scene ?? '').trim();
  return {
    identity: identity ? lowerLead(toSecondPerson(identity)) : intentionDefaults.identity,
    emotion: emotion ? lowerLead(toSecondPerson(emotion)) : intentionDefaults.emotion,
    scene: scene ? cleanSentence(toSecondPerson(scene)) : intentionDefaults.scene,
  };
}

/**
 * Replace {{identity}}, {{emotion}} and {{scene}} in a script. Unknown
 * placeholders are removed so they are never read aloud.
 */
export function fillTemplate(script: string, intention: Partial<Intention> | null | undefined): string {
  const values = resolveIntention(intention);
  return script.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, key: string) => {
    if (key === 'identity' || key === 'emotion' || key === 'scene') return values[key];
    return '';
  });
}

export function hasPlaceholders(script: string): boolean {
  return /\{\{\s*\w+\s*\}\}/.test(script);
}
