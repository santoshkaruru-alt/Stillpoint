/**
 * Meditation runner: plays an assembled Session step by step.
 *
 * Pure TypeScript and clock-injected (every method takes `now` in ms), so
 * it is unit-tested without audio. The player screen feeds it events
 * (tick, speechDone, pause, skip) and carries out the actions it returns
 * (speak this line, switch ambience, finish).
 *
 * Timing stays on schedule: each silence ends at its planned position in
 * the session rather than after a fixed delay. If the voice runs slower or
 * faster than estimated, the following silences absorb the difference
 * (within limits), so a 20 minute session still ends near 20 minutes.
 */
import type { ScriptStep, Session } from '@/models/types';

export type SpeechStep = Extract<ScriptStep, { kind: 'speech' }>;

export type RunnerEvent =
  | { type: 'segment'; segmentIndex: number }
  | { type: 'speak'; step: SpeechStep; segmentIndex: number }
  | { type: 'finished' };

export type RunnerStatus = 'idle' | 'speaking' | 'silent' | 'finished';

interface FlatStep {
  step: ScriptStep;
  segmentIndex: number;
  plannedStart: number;
  plannedDur: number;
}

/** A fixed pause may shrink to this share of its planned length to catch up. */
export const CATCH_UP_FACTOR = 0.35;
/** ...but never below this many seconds. */
export const MIN_GAP_SEC = 1;
/** A fixed pause may stretch to this multiple (+ 3 s) to wait for the schedule. */
export const MAX_STRETCH = 2.5;
/** If the voice never reports "done", move on after est * 2 + this. */
export const SPEECH_TIMEOUT_PAD_SEC = 8;

export class MeditationRunner {
  readonly session: Session;
  private flat: FlatStep[];
  private index = -1;
  private status: RunnerStatus = 'idle';
  private startedAt = 0;
  private pausedAt: number | null = null;
  private pausedTotal = 0;
  /** active seconds - planned seconds: maps the plan onto real time. */
  private offset = 0;
  private stepEnteredAt = 0; // active seconds
  private silenceEndsAt = 0; // active seconds

  constructor(session: Session) {
    this.session = session;
    this.flat = [];
    let t = 0;
    session.segments.forEach((seg, segmentIndex) => {
      for (const step of seg.steps) {
        const dur = step.kind === 'speech' ? step.estSec : step.sec;
        this.flat.push({ step, segmentIndex, plannedStart: t, plannedDur: dur });
        t += dur;
      }
    });
  }

  get totalPlannedSec(): number {
    const last = this.flat[this.flat.length - 1];
    return last ? last.plannedStart + last.plannedDur : 0;
  }

  get segmentIndex(): number {
    return this.index < 0 ? 0 : (this.flat[this.index]?.segmentIndex ?? this.session.segments.length - 1);
  }

  get currentStatus(): RunnerStatus {
    return this.status;
  }

  get isPaused(): boolean {
    return this.pausedAt !== null;
  }

  get currentStep(): ScriptStep | null {
    return this.flat[this.index]?.step ?? null;
  }

  /** Seconds of active (unpaused) time since start. */
  active(now: number): number {
    if (this.status === 'idle') return 0;
    const pausedNow = this.pausedAt !== null ? now - this.pausedAt : 0;
    return (now - this.startedAt - this.pausedTotal - pausedNow) / 1000;
  }

  /** Position in the plan (seconds), for progress display. */
  position(now: number): number {
    if (this.status === 'finished') return this.totalPlannedSec;
    const f = this.flat[this.index];
    if (!f) return 0;
    const inStep = Math.min(f.plannedDur, Math.max(0, this.active(now) - this.stepEnteredAt));
    return f.plannedStart + inStep;
  }

  remaining(now: number): number {
    return Math.max(0, this.totalPlannedSec - this.position(now));
  }

  /** Start, optionally from a given segment (used by "Continue"). */
  start(now: number, fromSegment = 0): RunnerEvent[] {
    this.startedAt = now;
    this.status = 'silent';
    const first = Math.max(0, this.flat.findIndex((f) => f.segmentIndex === Math.min(fromSegment, this.session.segments.length - 1)));
    this.offset = -this.flat[first].plannedStart;
    return this.enter(first, now, true);
  }

  tick(now: number): RunnerEvent[] {
    if (this.pausedAt !== null) return [];
    const a = this.active(now);
    if (this.status === 'silent' && a >= this.silenceEndsAt) {
      return this.enter(this.index + 1, now);
    }
    if (this.status === 'speaking') {
      const f = this.flat[this.index];
      const est = f.step.kind === 'speech' ? f.step.estSec : 0;
      if (a - this.stepEnteredAt > est * 2 + SPEECH_TIMEOUT_PAD_SEC) return this.enter(this.index + 1, now);
    }
    return [];
  }

  /** The voice finished the current line. */
  speechDone(now: number): RunnerEvent[] {
    if (this.status !== 'speaking' || this.pausedAt !== null) return [];
    return this.enter(this.index + 1, now);
  }

  pause(now: number) {
    if (this.pausedAt === null && this.status !== 'finished' && this.status !== 'idle') this.pausedAt = now;
  }

  resume(now: number) {
    if (this.pausedAt !== null) {
      this.pausedTotal += now - this.pausedAt;
      this.pausedAt = null;
    }
  }

  /** Jump to the start of the next segment (or finish if on the last). */
  skipSegment(now: number): RunnerEvent[] {
    if (this.status === 'finished' || this.status === 'idle') return [];
    this.resume(now);
    const current = this.segmentIndex;
    const next = this.flat.findIndex((f) => f.segmentIndex > current);
    if (next < 0) return this.finish();
    this.offset = this.active(now) - this.flat[next].plannedStart;
    return this.enter(next, now, true);
  }

  /** End now (e.g. the user tapped End). */
  stop(): RunnerEvent[] {
    if (this.status === 'finished') return [];
    return this.finish();
  }

  private finish(): RunnerEvent[] {
    this.status = 'finished';
    this.index = this.flat.length;
    return [{ type: 'finished' }];
  }

  private enter(i: number, now: number, forceSegmentEvent = false): RunnerEvent[] {
    const events: RunnerEvent[] = [];
    // Consecutive silences are entered in one go if their time has passed.
    for (;;) {
      if (i >= this.flat.length) {
        events.push(...this.finish());
        return events;
      }
      const prevSeg = this.index >= 0 && this.index < this.flat.length ? this.flat[this.index].segmentIndex : -1;
      const f = this.flat[i];
      this.index = i;
      const a = this.active(now);
      this.stepEnteredAt = a;
      if (forceSegmentEvent || f.segmentIndex !== prevSeg) {
        events.push({ type: 'segment', segmentIndex: f.segmentIndex });
        forceSegmentEvent = false;
      }

      if (f.step.kind === 'speech') {
        this.status = 'speaking';
        events.push({ type: 'speak', step: f.step, segmentIndex: f.segmentIndex });
        return events;
      }

      // Silence: end at the planned position, within catch-up/stretch limits.
      const planned = f.plannedDur;
      const scheduledEnd = f.plannedStart + planned + this.offset;
      const minDur = f.step.elastic ? Math.min(planned, MIN_GAP_SEC * 2) : Math.min(planned, Math.max(MIN_GAP_SEC, planned * CATCH_UP_FACTOR));
      const maxDur = f.step.elastic ? Infinity : planned * MAX_STRETCH + 3;
      const dur = Math.min(maxDur, Math.max(minDur, scheduledEnd - a));
      this.status = 'silent';
      this.silenceEndsAt = a + dur;
      if (dur > 0) return events;
      i += 1;
    }
  }
}
