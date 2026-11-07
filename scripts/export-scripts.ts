/**
 * Exports every spoken line with its stable id, for recording a voice
 * pack or generating audio with a TTS API.
 *
 *   npm run export:scripts
 *
 * Writes exports/voice-lines.json and exports/voice-lines.csv. Lines that
 * contain the user's intention are marked personal: they must be spoken
 * live (device TTS, or a TTS API call at session start).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { segments } from '../content/segments';
import { parseScript } from '../src/engine/script';
import type { ScriptVariant } from '../src/models/types';

const variants: ScriptVariant[] = ['short', 'medium', 'long'];
const rows: { id: string; segment: string; variant: string; personal: boolean; text: string }[] = [];

for (const seg of Object.values(segments)) {
  for (const variant of variants) {
    // Ids match the assembler: one counter across speech and pause tokens.
    parseScript(seg.scripts[variant]).forEach((t, i) => {
      if (t.kind !== 'speech') return;
      rows.push({ id: `${seg.id}.${variant}.${i}`, segment: seg.id, variant, personal: /\{\{/.test(t.text), text: t.text });
    });
  }
}

const out = join(__dirname, '..', 'exports');
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'voice-lines.json'), JSON.stringify(rows, null, 2));
const csv = ['id,segment,variant,personal,text', ...rows.map((r) => [r.id, r.segment, r.variant, r.personal, `"${r.text.replace(/"/g, '""')}"`].join(','))];
writeFileSync(join(out, 'voice-lines.csv'), csv.join('\n'));
console.log(`${rows.length} lines (${rows.filter((r) => r.personal).length} personal) -> ${out}`);
