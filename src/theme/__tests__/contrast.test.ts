import { describe, expect, it } from '@jest/globals';

import { palettes, type Palette } from '../palettes';

function lum(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

export function contrast(a: string, b: string): number {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

const all: [string, Palette][] = Object.entries(palettes).flatMap(([name, p]) => [
  [`${name}/light`, p.light],
  [`${name}/dark`, p.dark],
]);

describe('palette contrast (WCAG AA)', () => {
  it.each(all)('%s: text colours on the background and on cards', (_n, p) => {
    for (const bg of [p.bg, p.bgDeep, p.cardSolid]) {
      expect(contrast(p.text, bg)).toBeGreaterThanOrEqual(7);
      expect(contrast(p.textSoft, bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(p.textFaint, bg)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each(all)('%s: labels on accent and danger buttons', (_n, p) => {
    for (const a of [p.calm, p.breath, p.warm]) expect(contrast(p.onAccent, a)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(p.onDanger, p.danger)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(all)('%s: accents read as text on the background', (_n, p) => {
    for (const a of [p.calm, p.breath, p.warm, p.danger]) expect(contrast(a, p.bg)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(all)('%s: chart line stands out from cards (3:1)', (_n, p) => {
    expect(contrast(p.chart, p.cardSolid)).toBeGreaterThanOrEqual(3);
  });
});
