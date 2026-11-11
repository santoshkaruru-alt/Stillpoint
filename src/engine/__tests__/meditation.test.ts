import { describe, expect, it } from '@jest/globals';

import { segments } from '@content/segments';
import { planFor } from '@content/sessionPlans';

import type { Segment, Session } from '@/models/types';

import { assembleSession } from '../assemble';
import { MeditationRunner, type RunnerEvent } from '../meditation';

const T0 = 5_000_000;
const at = (sec: number) => T0 + sec * 1000;

function seg(id: Segment['id'], steps: Segment['steps']): Segment {
  const plannedSec = steps.reduce((s, x) => s + (x.kind === 'speech' ? x.estSec : x.sec), 0);
  return { id, title: id, subtitle: '', variant: 'short', durationSec: plannedSec, plannedSec, steps, ambient: { bed: 'drift', level: 1, binaural: 'off' } };
}

/** Two tiny segments: speech 5s, pause 10s, speech 5s, silence 20s | speech 5s, pause 5s */
function tinySession(): Session {
  const a = seg('settle', [
    { kind: 'speech', id: 'a0', text: 'one', estSec: 5 },
    { kind: 'pause', id: 'a1', sec: 10, elastic: false },
    { kind: 'speech', id: 'a2', text: 'two', estSec: 5 },
    { kind: 'pause', id: 'a3', sec: 20, elastic: true },
  ]);
  const b = seg('closing', [
    { kind: 'speech', id: 'b0', text: 'three', estSec: 5 },
    { kind: 'pause', id: 'b1', sec: 5, elastic: false },
  ]);
  return { id: 's', planId: 'test', lengthMin: 10, name: 'tiny', segments: [a, b], totalSec: 50, createdAt: 0 };
}

const types = (events: RunnerEvent[]) => events.map((e) => (e.type === 'speak' ? `speak:${e.step.text}` : e.type === 'segment' ? `segment:${e.segmentIndex}` : e.type));

describe('MeditationRunner', () => {
  it('speaks, waits for silence, and moves through segments', () => {
    const r = new MeditationRunner(tinySession());
    expect(types(r.start(T0))).toEqual(['segment:0', 'speak:one']);
    expect(r.tick(at(3))).toEqual([]); // still speaking
    expect(r.speechDone(at(5))).toEqual([]); // entered 10s pause
    expect(r.currentStatus).toBe('silent');
    expect(r.tick(at(14.9))).toEqual([]);
    expect(types(r.tick(at(15)))).toEqual(['speak:two']);
    r.speechDone(at(20));
    expect(types(r.tick(at(40)))).toEqual(['segment:1', 'speak:three']);
    r.speechDone(at(45));
    expect(types(r.tick(at(50)))).toEqual(['finished']);
    expect(r.currentStatus).toBe('finished');
  });

  it('absorbs slow speech by shortening the next silence (but not below the floor)', () => {
    const r = new MeditationRunner(tinySession());
    r.start(T0);
    r.speechDone(at(9)); // voice took 9s instead of 5s → pause should end on schedule at 15s
    expect(r.tick(at(14.9))).toEqual([]);
    expect(types(r.tick(at(15)))).toEqual(['speak:two']);
  });

  it('never cuts a fixed pause below its catch-up floor', () => {
    const r = new MeditationRunner(tinySession());
    r.start(T0);
    r.speechDone(at(30)); // hugely late; 10s pause floor = 3.5s
    expect(r.tick(at(33))).toEqual([]);
    expect(types(r.tick(at(33.5)))).toEqual(['speak:two']);
  });

  it('lets elastic silence soak up drift so the session ends on time', () => {
    const r = new MeditationRunner(tinySession());
    r.start(T0);
    r.speechDone(at(5));
    r.tick(at(15));
    r.speechDone(at(26)); // second line ran 6s long; elastic should end at 40 as planned
    expect(r.tick(at(39.9))).toEqual([]);
    expect(types(r.tick(at(40)))).toEqual(['segment:1', 'speak:three']);
  });

  it('extends silence when the voice is faster than estimated', () => {
    const r = new MeditationRunner(tinySession());
    r.start(T0);
    r.speechDone(at(2)); // 3s early → pause runs 13s to stay on schedule
    expect(r.tick(at(14.9))).toEqual([]);
    expect(types(r.tick(at(15)))).toEqual(['speak:two']);
  });

  it('pause freezes time and resume continues where it left off', () => {
    const r = new MeditationRunner(tinySession());
    r.start(T0);
    r.speechDone(at(5));
    r.pause(at(8));
    expect(r.tick(at(100))).toEqual([]);
    expect(r.speechDone(at(100))).toEqual([]);
    r.resume(at(100));
    expect(r.tick(at(106.9))).toEqual([]);
    expect(types(r.tick(at(107)))).toEqual(['speak:two']);
    expect(r.active(at(107))).toBeCloseTo(15);
  });

  it('skips to the next segment and re-anchors the schedule', () => {
    const r = new MeditationRunner(tinySession());
    r.start(T0);
    expect(types(r.skipSegment(at(2)))).toEqual(['segment:1', 'speak:three']);
    expect(r.segmentIndex).toBe(1);
    r.speechDone(at(7));
    expect(r.tick(at(11.9))).toEqual([]);
    expect(types(r.tick(at(12)))).toEqual(['finished']);
  });

  it('skipping the last segment finishes', () => {
    const r = new MeditationRunner(tinySession());
    r.start(T0, 1);
    expect(types(r.skipSegment(at(1)))).toEqual(['finished']);
  });

  it('can start from a later segment (continue)', () => {
    const r = new MeditationRunner(tinySession());
    expect(types(r.start(T0, 1))).toEqual(['segment:1', 'speak:three']);
    expect(r.position(at(0))).toBe(40);
  });

  it('moves on if the voice never reports done', () => {
    const r = new MeditationRunner(tinySession());
    r.start(T0);
    r.tick(at(17));
    expect(r.currentStatus).toBe('speaking');
    r.tick(at(18.1)); // 5*2 + 8 = 18s timeout
    expect(r.currentStatus).toBe('silent');
  });

  it('reports position and remaining time', () => {
    const r = new MeditationRunner(tinySession());
    r.start(T0);
    r.speechDone(at(5));
    expect(r.position(at(10))).toBeCloseTo(10);
    expect(r.remaining(at(10))).toBeCloseTo(40);
  });

  it('plays a real 10 minute session end to end in about 10 minutes', () => {
    const session = assembleSession(planFor(10)!, segments, { voiceRate: 0.82 });
    const r = new MeditationRunner(session);
    let t = 0;
    let events = r.start(at(0));
    let speaks = 0;
    // Simulate a voice that is 15% slower than estimated, ticking every 250ms.
    let speakingUntil = -1;
    while (r.currentStatus !== 'finished' && t < 3600) {
      for (const e of events) {
        if (e.type === 'speak') {
          speaks += 1;
          speakingUntil = t + e.step.estSec * 1.15;
        }
      }
      t += 0.25;
      events = speakingUntil >= 0 && t >= speakingUntil ? ((speakingUntil = -1), r.speechDone(at(t))) : r.tick(at(t));
    }
    expect(r.currentStatus).toBe('finished');
    expect(speaks).toBe(session.segments.reduce((n, s) => n + s.steps.filter((x) => x.kind === 'speech').length, 0));
    expect(Math.abs(t - 600)).toBeLessThan(15);
  });
});
