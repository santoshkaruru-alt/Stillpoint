import { describe, expect, it } from '@jest/globals';

import { breathPresetById, breathPresets } from '@content/breathPresets';

import type { PacedPattern, PowerPattern } from '@/models/types';

import { BreathRunner, buildBreathSteps, estimateDurationSec, formatClock, PREPARE_SEC, SCALE_MAX, SCALE_MIN, totalRounds } from '../breath';

const box = breathPresetById('box') as PacedPattern;
const power = breathPresetById('power') as PowerPattern;

describe('buildBreathSteps', () => {
  it('expands a paced pattern into prepare + phases x rounds', () => {
    const steps = buildBreathSteps(box);
    expect(steps[0].phase).toBe('prepare');
    expect(steps).toHaveLength(1 + box.phases.length * box.rounds);
    expect(steps.slice(1, 5).map((s) => s.phase)).toEqual(['inhale', 'holdIn', 'exhale', 'holdOut']);
    expect(totalRounds(steps)).toBe(box.rounds);
  });

  it('computes the duration of box breathing', () => {
    expect(estimateDurationSec(buildBreathSteps(box))).toBe(PREPARE_SEC + 16 * box.rounds);
  });

  it('keeps circle size through holds and supports scale overrides', () => {
    const steps = buildBreathSteps(box);
    expect(steps[1].scaleTo).toBe(SCALE_MAX); // inhale
    expect(steps[2].scaleTo).toBe(SCALE_MAX); // hold in stays big
    expect(steps[3].scaleTo).toBe(SCALE_MIN); // exhale
    expect(steps[4].scaleTo).toBe(SCALE_MIN); // hold out stays small

    const sigh = buildBreathSteps(breathPresetById('sigh')!);
    expect(sigh[1].scaleTo).toBe(0.85);
    expect(sigh[2].scaleTo).toBe(1);
  });

  it('skips zero-length phases from the custom builder', () => {
    const custom: PacedPattern = {
      id: 'c',
      kind: 'paced',
      name: 'c',
      summary: '',
      rounds: 2,
      phases: [
        { type: 'inhale', sec: 4 },
        { type: 'holdIn', sec: 0 },
        { type: 'exhale', sec: 6 },
        { type: 'holdOut', sec: 0 },
      ],
    };
    const steps = buildBreathSteps(custom);
    expect(steps.map((s) => s.phase)).toEqual(['prepare', 'inhale', 'exhale', 'inhale', 'exhale']);
  });

  it('builds power rounds with breaths, an open hold and a recovery breath', () => {
    const steps = buildBreathSteps(power);
    const round1 = steps.filter((s) => s.round === 1);
    expect(round1.filter((s) => s.phase === 'inhale' && s.breath !== undefined)).toHaveLength(power.breathsPerRound);
    const retention = round1.find((s) => s.phase === 'retention')!;
    expect(retention.sec).toBeNull();
    expect(retention.maxSec).toBe(power.maxHoldSec);
    expect(round1.slice(-3).map((s) => s.phase)).toEqual(['inhale', 'holdIn', 'exhale']);
    expect(round1.slice(-2)[0].sec).toBe(power.recoveryHoldSec);
    expect(totalRounds(steps)).toBe(3);
  });

  it('every preset produces valid steps', () => {
    for (const p of breathPresets) {
      const steps = buildBreathSteps(p);
      expect(steps.length).toBeGreaterThan(1);
      for (const s of steps) {
        if (s.sec !== null) expect(s.sec).toBeGreaterThan(0);
        expect(s.scaleTo).toBeGreaterThanOrEqual(SCALE_MIN);
        expect(s.scaleTo).toBeLessThanOrEqual(SCALE_MAX);
      }
    }
  });
});

describe('BreathRunner', () => {
  const t0 = 1_000_000;
  const ms = (sec: number) => t0 + sec * 1000;

  it('moves through phases on time', () => {
    const r = new BreathRunner(buildBreathSteps(box));
    let snap = r.start(t0);
    expect(snap.step.phase).toBe('prepare');
    expect(snap.changed).toBe(true);

    snap = r.tick(ms(1));
    expect(snap.changed).toBe(false);
    expect(snap.remaining).toBeCloseTo(2);

    snap = r.tick(ms(3.01));
    expect(snap.step.phase).toBe('inhale');
    expect(snap.changed).toBe(true);

    snap = r.tick(ms(3 + 4 + 4 + 0.5));
    expect(snap.step.phase).toBe('exhale');
    expect(snap.elapsed).toBeCloseTo(0.5);
  });

  it('does not drift when ticks are late (overshoot carries over)', () => {
    const r = new BreathRunner(buildBreathSteps(box));
    r.start(t0);
    // A single very late tick should land on the correct step.
    const snap = r.tick(ms(3 + 16 * 2 + 5));
    expect(snap.step.round).toBe(3);
    expect(snap.step.phase).toBe('holdIn');
    expect(snap.elapsed).toBeCloseTo(1);
  });

  it('pauses and resumes without losing time', () => {
    const r = new BreathRunner(buildBreathSteps(box));
    r.start(t0);
    r.tick(ms(4)); // 1s into inhale
    r.pause(ms(4));
    let snap = r.tick(ms(60));
    expect(snap.paused).toBe(true);
    expect(snap.step.phase).toBe('inhale');
    expect(snap.elapsed).toBeCloseTo(1);
    r.resume(ms(60));
    snap = r.tick(ms(62));
    expect(snap.step.phase).toBe('inhale');
    expect(snap.elapsed).toBeCloseTo(3);
    expect(r.activeSeconds(ms(62))).toBeCloseTo(6);
  });

  it('finishes after the last step', () => {
    const steps = buildBreathSteps(box);
    const r = new BreathRunner(steps);
    r.start(t0);
    const snap = r.tick(ms(estimateDurationSec(steps) + 1));
    expect(snap.finished).toBe(true);
    expect(r.isFinished).toBe(true);
  });

  it('logs retention holds per round when the user taps', () => {
    const p: PowerPattern = { ...power, breathsPerRound: 2, rounds: 2 };
    const steps = buildBreathSteps(p);
    const r = new BreathRunner(steps);
    r.start(t0);

    const breathing = PREPARE_SEC + 2 * (p.inhaleSec + p.exhaleSec);
    let snap = r.tick(ms(breathing + 0.1));
    expect(snap.step.phase).toBe('retention');
    expect(snap.remaining).toBeNull();

    // Stays in the hold until tapped.
    snap = r.tick(ms(breathing + 50));
    expect(snap.step.phase).toBe('retention');

    snap = r.endHold(ms(breathing + 42));
    expect(r.holds).toEqual([{ round: 1, seconds: 42, capped: false }]);
    expect(snap.step.label).toBe('Recovery breath');

    // Round 2: recovery (2.5 + hold + 3) then breathing, then hold again.
    const round2HoldStart = breathing + 42 + 2.5 + p.recoveryHoldSec + 3 + 2 * (p.inhaleSec + p.exhaleSec);
    snap = r.tick(ms(round2HoldStart + 0.1));
    expect(snap.step.phase).toBe('retention');
    expect(snap.step.round).toBe(2);
    r.endHold(ms(round2HoldStart + 75.04));
    expect(r.holds[1]).toEqual({ round: 2, seconds: 75, capped: false });
  });

  it('ends a retention hold automatically at the safety cap', () => {
    const p: PowerPattern = { ...power, breathsPerRound: 1, rounds: 1, maxHoldSec: 30 };
    const r = new BreathRunner(buildBreathSteps(p));
    r.start(t0);
    const holdStart = PREPARE_SEC + p.inhaleSec + p.exhaleSec;
    const snap = r.tick(ms(holdStart + 31));
    expect(r.holds).toEqual([{ round: 1, seconds: 30, capped: true }]);
    expect(snap.step.label).toBe('Recovery breath');
    expect(snap.elapsed).toBeCloseTo(1);
  });

  it('records an in-progress hold when stopped early', () => {
    const p: PowerPattern = { ...power, breathsPerRound: 1, rounds: 1 };
    const r = new BreathRunner(buildBreathSteps(p));
    r.start(t0);
    const holdStart = PREPARE_SEC + p.inhaleSec + p.exhaleSec;
    r.tick(ms(holdStart + 1));
    r.stop(ms(holdStart + 20));
    expect(r.holds).toEqual([{ round: 1, seconds: 20, capped: false }]);
    expect(r.isFinished).toBe(true);
  });

  it('ignores endHold outside a retention step', () => {
    const r = new BreathRunner(buildBreathSteps(box));
    r.start(t0);
    r.endHold(ms(1));
    expect(r.holds).toHaveLength(0);
    expect(r.currentIndex).toBe(0);
  });
});

describe('formatClock', () => {
  it('formats seconds as m:ss', () => {
    expect(formatClock(0)).toBe('0:00');
    expect(formatClock(65)).toBe('1:05');
    expect(formatClock(599.6)).toBe('10:00');
  });
});
