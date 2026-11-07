/**
 * Script parsing and timing estimates.
 *
 * A script is plain text with markers:
 *   [pause 10s]  fixed silence (the "s" is optional, decimals allowed)
 *   [silence]    elastic silence that absorbs leftover time
 * A blank line between paragraphs (without a marker) inserts a short
 * natural pause.
 */

export type ScriptToken =
  | { kind: 'speech'; text: string }
  | { kind: 'pause'; sec: number }
  | { kind: 'silence' };

/** Pause inserted between paragraphs that have no explicit marker. */
export const PARAGRAPH_PAUSE_SEC = 1.5;

const MARKER = /\[\s*(?:pause\s+(\d+(?:\.\d+)?)\s*s?|(silence))\s*\]/gi;

export function parseScript(script: string): ScriptToken[] {
  const tokens: ScriptToken[] = [];
  let last = 0;
  const pushText = (raw: string) => {
    const paragraphs = raw
      .split(/\n\s*\n/)
      .map((p) => p.replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    paragraphs.forEach((p, i) => {
      if (i > 0) tokens.push({ kind: 'pause', sec: PARAGRAPH_PAUSE_SEC });
      tokens.push({ kind: 'speech', text: p });
    });
  };

  for (const m of script.matchAll(MARKER)) {
    pushText(script.slice(last, m.index));
    if (m[2]) tokens.push({ kind: 'silence' });
    else tokens.push({ kind: 'pause', sec: Number(m[1]) });
    last = (m.index ?? 0) + m[0].length;
  }
  pushText(script.slice(last));
  return mergeAdjacentPauses(tokens);
}

function mergeAdjacentPauses(tokens: ScriptToken[]): ScriptToken[] {
  const out: ScriptToken[] = [];
  for (const t of tokens) {
    const prev = out[out.length - 1];
    if (t.kind === 'pause' && prev?.kind === 'pause') {
      prev.sec += t.sec;
    } else {
      out.push({ ...t });
    }
  }
  return out;
}

/**
 * Words per minute for device TTS at rate 1.0. iOS voices speak at roughly
 * 170-185 wpm at the default rate; we use a middle value. The runner
 * corrects for any real difference as the session plays.
 */
export const BASE_WPM = 175;
/** Extra time the voice takes at each sentence end. */
export const SENTENCE_GAP_SEC = 0.35;

export function countWords(text: string): number {
  const m = text.match(/[A-Za-z0-9’']+/g);
  return m ? m.length : 0;
}

export function countSentences(text: string): number {
  const m = text.match(/[.!?]+(\s|$)/g);
  return Math.max(1, m ? m.length : 0);
}

/** Estimated seconds to speak `text` at a given expo-speech rate. */
export function estimateSpeechSec(text: string, rate = 1): number {
  const words = countWords(text);
  if (words === 0) return 0;
  const wpm = BASE_WPM * Math.max(0.1, rate);
  return (words / wpm) * 60 + countSentences(text) * SENTENCE_GAP_SEC;
}
