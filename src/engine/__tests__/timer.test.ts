import { describe, expect, it } from '@jest/globals';

import { bellsBetween, SilentTimer } from '../timer';

const T0 = 1_000_000;
const at = (sec: number) => T0 + sec * 1000;

describe('bellsBetween', () => {
  it('rings on each interval, not at the start or the end', () => {
    expect(bellsBetween(0, 1200, 1200, 300)).toEqual([300, 600, 900]);
    expect(bellsBetween(0, 299, 1200, 300)).toEqual([]);
    expect(bellsBetween(299, 301, 1200, 300)).toEqual([300]);
  });

  it('never rings twice for the same moment', () => {
    expect(bellsBetween(300, 300.5, 1200, 300)).toEqual([]);
  });

  it('does nothing without an interval', () => {
    expect(bellsBetween(0, 1200, 1200, 0)).toEqual([]);
  });
});

describe('SilentTimer', () => {
  it('counts down and finishes on time with interval bells', () => {
    const t = new SilentTimer(10, 5);
    t.start(T0);
    expect(t.tick(at(100))).toEqual({ bells: [], finished: false });
    expect(t.tick(at(301))).toEqual({ bells: [300], finished: false });
    expect(t.remaining(at(301))).toBeCloseTo(299);
    expect(t.tick(at(600))).toEqual({ bells: [], finished: true });
    expect(t.finished).toBe(true);
    expect(t.tick(at(700))).toEqual({ bells: [], finished: false });
  });

  it('catches up on a late tick without losing bells', () => {
    const t = new SilentTimer(20, 5);
    t.start(T0);
    expect(t.tick(at(950)).bells).toEqual([300, 600, 900]);
  });

  it('freezes while paused', () => {
    const t = new SilentTimer(5);
    t.start(T0);
    t.tick(at(60));
    t.pause(at(60));
    expect(t.tick(at(500))).toEqual({ bells: [], finished: false });
    expect(t.elapsed(at(500))).toBeCloseTo(60);
    t.resume(at(500));
    expect(t.elapsed(at(530))).toBeCloseTo(90);
    expect(t.tick(at(500 + 240)).finished).toBe(true);
  });

  it('reports zero before starting', () => {
    const t = new SilentTimer(10);
    expect(t.elapsed(at(50))).toBe(0);
    expect(t.remaining(at(50))).toBe(600);
  });
});
