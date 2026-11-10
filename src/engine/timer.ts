/**
 * Silent (unguided) meditation timer. Pure and clock-injected, like the
 * other runners, so it is unit-tested directly.
 */

export const TIMER_LENGTHS = [5, 10, 15, 20, 30, 45, 60] as const;
export const TIMER_INTERVALS = [0, 5, 10, 15] as const; // minutes; 0 = no interval bells

/**
 * Interval bell times (seconds) crossed when moving from `prevSec` to
 * `nowSec`. Bells fall on every multiple of the interval, never at the
 * very start or at the end (the closing bell handles that).
 */
export function bellsBetween(prevSec: number, nowSec: number, totalSec: number, intervalSec: number): number[] {
  if (intervalSec <= 0 || nowSec <= prevSec) return [];
  const out: number[] = [];
  const first = Math.floor(prevSec / intervalSec) + 1;
  for (let k = first; k * intervalSec <= nowSec; k++) {
    const t = k * intervalSec;
    if (t > 0 && t < totalSec) out.push(t);
  }
  return out;
}

export class SilentTimer {
  readonly totalSec: number;
  readonly intervalSec: number;
  private startedAt: number | null = null;
  private pausedAt: number | null = null;
  private pausedTotal = 0;
  private lastSec = 0;
  private done = false;

  constructor(minutes: number, intervalMinutes = 0) {
    this.totalSec = Math.max(1, Math.round(minutes * 60));
    this.intervalSec = Math.max(0, intervalMinutes * 60);
  }

  start(now: number) {
    this.startedAt = now;
  }

  get started() {
    return this.startedAt !== null;
  }

  get paused() {
    return this.pausedAt !== null;
  }

  get finished() {
    return this.done;
  }

  elapsed(now: number): number {
    if (this.startedAt === null) return 0;
    const ref = this.pausedAt ?? now;
    return Math.min(this.totalSec, Math.max(0, (ref - this.startedAt - this.pausedTotal) / 1000));
  }

  remaining(now: number): number {
    return Math.max(0, this.totalSec - this.elapsed(now));
  }

  pause(now: number) {
    if (this.started && this.pausedAt === null && !this.done) this.pausedAt = now;
  }

  resume(now: number) {
    if (this.pausedAt !== null) {
      this.pausedTotal += now - this.pausedAt;
      this.pausedAt = null;
    }
  }

  /** Advance; returns interval bells to ring and whether the sit just ended. */
  tick(now: number): { bells: number[]; finished: boolean } {
    if (!this.started || this.done || this.pausedAt !== null) return { bells: [], finished: false };
    const sec = this.elapsed(now);
    const bells = bellsBetween(this.lastSec, sec, this.totalSec, this.intervalSec);
    this.lastSec = sec;
    if (sec >= this.totalSec) {
      this.done = true;
      return { bells, finished: true };
    }
    return { bells, finished: false };
  }

  stop() {
    this.done = true;
  }
}
