/**
 * Breath timer logic. Pure TypeScript: no React Native imports, so it is
 * unit-tested directly. The UI calls tick(now) on a short interval and
 * reacts to step changes (animation, haptics, sound).
 */
import type { BreathPattern, BreathPhaseType } from '@/models/types';

export type StepPhase = BreathPhaseType | 'prepare' | 'retention';

export interface BreathStep {
  phase: StepPhase;
  /** Fixed duration in seconds, or null for an open-ended retention hold. */
  sec: number | null;
  /** Retention holds end automatically at this cap (safety). */
  maxSec?: number;
  /** 1-based round number (0 for the prepare step). */
  round: number;
  /** For power rounds: 1-based breath count within the round. */
  breath?: number;
  label: string;
  cue?: string;
  /** Circle size this step animates towards (0..1). */
  scaleTo: number;
}

export const PREPARE_SEC = 3;
export const SCALE_MIN = 0.42;
export const SCALE_MAX = 1;

const defaultLabel: Record<StepPhase, string> = {
  prepare: 'Get ready',
  inhale: 'Breathe in',
  holdIn: 'Hold',
  exhale: 'Breathe out',
  holdOut: 'Hold',
  retention: 'Hold on empty',
};

function scaleFor(phase: StepPhase, prev: number): number {
  if (phase === 'inhale') return SCALE_MAX;
  if (phase === 'exhale' || phase === 'retention' || phase === 'prepare') return SCALE_MIN;
  return prev; // holds keep the current size
}

/** Expand a pattern into a flat list of timed steps. */
export function buildBreathSteps(pattern: BreathPattern): BreathStep[] {
  const steps: BreathStep[] = [
    { phase: 'prepare', sec: PREPARE_SEC, round: 0, label: defaultLabel.prepare, scaleTo: SCALE_MIN },
  ];
  let scale = SCALE_MIN;

  if (pattern.kind === 'paced') {
    for (let r = 1; r <= pattern.rounds; r++) {
      for (const ph of pattern.phases) {
        if (ph.sec <= 0) continue;
        scale = ph.scaleTo ?? scaleFor(ph.type, scale);
        steps.push({ phase: ph.type, sec: ph.sec, round: r, label: defaultLabel[ph.type], cue: ph.cue, scaleTo: scale });
      }
    }
    return steps;
  }

  // Power rounds
  for (let r = 1; r <= pattern.rounds; r++) {
    for (let b = 1; b <= pattern.breathsPerRound; b++) {
      const last = b === pattern.breathsPerRound;
      steps.push({
        phase: 'inhale',
        sec: pattern.inhaleSec,
        round: r,
        breath: b,
        label: `${b}`,
        cue: b === 1 ? 'Fully in through the belly and chest' : undefined,
        scaleTo: SCALE_MAX,
      });
      steps.push({
        phase: 'exhale',
        sec: pattern.exhaleSec,
        round: r,
        breath: b,
        label: last ? 'Let it all go' : `${b}`,
        cue: last ? 'Breathe out and hold' : undefined,
        scaleTo: SCALE_MIN,
      });
    }
    steps.push({
      phase: 'retention',
      sec: null,
      maxSec: pattern.maxHoldSec,
      round: r,
      label: defaultLabel.retention,
      cue: 'Relax. Tap when you need to breathe.',
      scaleTo: SCALE_MIN,
    });
    steps.push({ phase: 'inhale', sec: 2.5, round: r, label: 'Recovery breath', cue: 'Big breath in', scaleTo: SCALE_MAX });
    steps.push({ phase: 'holdIn', sec: pattern.recoveryHoldSec, round: r, label: 'Hold', cue: 'Hold the breath in, gentle squeeze', scaleTo: SCALE_MAX });
    steps.push({ phase: 'exhale', sec: 3, round: r, label: 'Release', cue: 'Let it go', scaleTo: SCALE_MIN });
  }
  return steps;
}

/** Total length in seconds, counting each open retention hold as `assumeHoldSec`. */
export function estimateDurationSec(steps: BreathStep[], assumeHoldSec = 60): number {
  return steps.reduce((sum, s) => sum + (s.sec ?? assumeHoldSec), 0);
}

export function totalRounds(steps: BreathStep[]): number {
  return steps.reduce((m, s) => Math.max(m, s.round), 0);
}

export interface HoldRecord {
  round: number;
  seconds: number;
  /** True if the hold reached the safety cap. */
  capped: boolean;
}

export interface BreathSnapshot {
  index: number;
  step: BreathStep;
  /** Seconds elapsed in the current step. */
  elapsed: number;
  /** Seconds left in the current step, or null when open-ended. */
  remaining: number | null;
  /** 0..1 progress through a timed step (0 for open holds). */
  progress: number;
  paused: boolean;
  finished: boolean;
  /** True on the tick where the step index changed. */
  changed: boolean;
}

/**
 * Wall-clock driven runner. Every method takes `now` (ms) so tests can
 * drive time directly. Overshoot carries into the next step, so timing
 * never drifts even if ticks arrive late.
 */
export class BreathRunner {
  readonly steps: BreathStep[];
  readonly holds: HoldRecord[] = [];
  private index = 0;
  private stepStartedAt = 0;
  private pausedAt: number | null = null;
  private started = false;
  private finished = false;
  private lastReportedIndex = -1;
  private startedAt = 0;
  private pausedTotal = 0;

  constructor(steps: BreathStep[]) {
    if (steps.length === 0) throw new Error('BreathRunner needs at least one step');
    this.steps = steps;
  }

  start(now: number): BreathSnapshot {
    this.started = true;
    this.startedAt = now;
    this.stepStartedAt = now;
    return this.tick(now);
  }

  get isFinished() {
    return this.finished;
  }

  get currentIndex() {
    return this.index;
  }

  /** Active (unpaused) seconds since start. */
  activeSeconds(now: number): number {
    if (!this.started) return 0;
    const pausedNow = this.pausedAt !== null ? now - this.pausedAt : 0;
    return (now - this.startedAt - this.pausedTotal - pausedNow) / 1000;
  }

  tick(now: number): BreathSnapshot {
    if (this.started && !this.finished && this.pausedAt === null) {
      // Advance through any timed steps that have completed.
      for (;;) {
        const step = this.steps[this.index];
        const elapsedMs = now - this.stepStartedAt;
        if (step.sec === null) {
          const cap = (step.maxSec ?? Infinity) * 1000;
          if (elapsedMs >= cap) {
            this.recordHold(step, cap / 1000, true);
            this.stepStartedAt += cap;
            if (!this.advance()) break;
            continue;
          }
          break;
        }
        const durMs = step.sec * 1000;
        if (elapsedMs < durMs) break;
        this.stepStartedAt += durMs;
        if (!this.advance()) break;
      }
    }
    return this.snapshot(now);
  }

  /** Ends an open retention hold (user tapped) and records its length. */
  endHold(now: number): BreathSnapshot {
    const step = this.steps[this.index];
    if (!this.finished && this.pausedAt === null && step.sec === null) {
      const sec = Math.max(0, (now - this.stepStartedAt) / 1000);
      this.recordHold(step, sec, false);
      this.stepStartedAt = now;
      this.advance();
    }
    return this.snapshot(now);
  }

  pause(now: number) {
    if (this.pausedAt === null && !this.finished) this.pausedAt = now;
  }

  resume(now: number) {
    if (this.pausedAt !== null) {
      const d = now - this.pausedAt;
      this.stepStartedAt += d;
      this.pausedTotal += d;
      this.pausedAt = null;
    }
  }

  /** Stop early. Any open hold in progress is recorded. */
  stop(now: number) {
    if (this.finished) return;
    const step = this.steps[this.index];
    if (step.sec === null && this.pausedAt === null) {
      this.recordHold(step, Math.max(0, (now - this.stepStartedAt) / 1000), false);
    }
    this.finished = true;
  }

  private recordHold(step: BreathStep, seconds: number, capped: boolean) {
    this.holds.push({ round: step.round, seconds: Math.round(seconds * 10) / 10, capped });
  }

  private advance(): boolean {
    if (this.index >= this.steps.length - 1) {
      this.finished = true;
      return false;
    }
    this.index += 1;
    return true;
  }

  private snapshot(now: number): BreathSnapshot {
    const step = this.steps[this.index];
    const ref = this.pausedAt ?? now;
    const elapsed = this.started ? Math.max(0, (ref - this.stepStartedAt) / 1000) : 0;
    const remaining = step.sec === null ? null : Math.max(0, step.sec - elapsed);
    const progress = step.sec ? Math.min(1, elapsed / step.sec) : 0;
    const changed = this.index !== this.lastReportedIndex;
    this.lastReportedIndex = this.index;
    return {
      index: this.index,
      step,
      elapsed,
      remaining,
      progress,
      paused: this.pausedAt !== null,
      finished: this.finished,
      changed,
    };
  }
}

/** Seconds formatted as m:ss. */
export function formatClock(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}
