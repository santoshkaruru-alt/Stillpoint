/**
 * Session assembly: turns a SessionPlan plus editable segment content into
 * a timed Session. Pure TypeScript, unit-tested.
 *
 * Fitting rules, per segment:
 *  1. Speech time is estimated from word count and the voice rate.
 *  2. Fixed [pause Ns] markers are multiplied by the user's pause setting.
 *  3. Elastic [silence] markers share whatever time is left, so the
 *     segment lands on its target duration.
 *  4. If there is not enough time, elastic silence drops to a minimum and
 *     fixed pauses shrink proportionally (never below MIN_PAUSE_FACTOR).
 */
import type {
  Intention,
  ScriptStep,
  Segment,
  SegmentContent,
  SegmentId,
  Session,
  SessionPlan,
} from '@/models/types';

import { estimateSpeechSec, parseScript } from './script';
import { fillTemplate } from './template';

export const MIN_ELASTIC_SEC = 4;
export const MIN_PAUSE_FACTOR = 0.35;
export const MIN_PAUSE_SEC = 1;

export interface AssembleOptions {
  voiceRate?: number;
  pauseScale?: number;
  intention?: Partial<Intention> | null;
  /** Override the clock for ids/tests. */
  now?: number;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Split the total length across segments by weight. */
export function allocateDurations(plan: SessionPlan): number[] {
  const total = plan.lengthMin * 60;
  const weightSum = plan.segments.reduce((s, x) => s + x.weight, 0);
  const raw = plan.segments.map((x) => (total * x.weight) / weightSum);
  // Round to whole seconds while keeping the exact total.
  const rounded = raw.map(Math.floor);
  let rest = total - rounded.reduce((a, b) => a + b, 0);
  const order = raw.map((v, i) => ({ i, frac: v - Math.floor(v) })).sort((a, b) => b.frac - a.frac);
  for (const { i } of order) {
    if (rest <= 0) break;
    rounded[i] += 1;
    rest -= 1;
  }
  return rounded;
}

/** Build the timed steps for one segment so they fill `targetSec`. */
export function fitSegment(
  content: SegmentContent,
  variant: SessionPlan['segments'][number]['variant'],
  targetSec: number,
  opts: AssembleOptions = {},
): Segment {
  const rate = opts.voiceRate ?? 1;
  const pauseScale = opts.pauseScale ?? 1;
  const script = fillTemplate(content.scripts[variant], opts.intention);
  const tokens = parseScript(script);

  const speechSec = tokens.reduce((s, t) => s + (t.kind === 'speech' ? estimateSpeechSec(t.text, rate) : 0), 0);
  const fixedSec = tokens.reduce((s, t) => s + (t.kind === 'pause' ? t.sec * pauseScale : 0), 0);
  const elasticCount = tokens.filter((t) => t.kind === 'silence').length;

  let pauseFactor = pauseScale;
  let elasticSec = 0;

  if (elasticCount > 0) {
    const slack = targetSec - speechSec - fixedSec;
    if (slack >= elasticCount * MIN_ELASTIC_SEC) {
      elasticSec = slack / elasticCount;
    } else {
      elasticSec = MIN_ELASTIC_SEC;
      const room = targetSec - speechSec - elasticCount * MIN_ELASTIC_SEC;
      const k = fixedSec > 0 ? Math.max(MIN_PAUSE_FACTOR, room / fixedSec) : 1;
      pauseFactor = pauseScale * Math.min(1, k);
    }
  } else if (fixedSec > 0) {
    // No elastic silence: scale every fixed pause to fill the target.
    const k = (targetSec - speechSec) / fixedSec;
    pauseFactor = pauseScale * Math.max(MIN_PAUSE_FACTOR, k);
  }

  let n = 0;
  const steps: ScriptStep[] = tokens.map((t) => {
    const id = `${content.id}.${variant}.${n++}`;
    if (t.kind === 'speech') return { kind: 'speech', id, text: t.text, estSec: round1(estimateSpeechSec(t.text, rate)) };
    if (t.kind === 'pause') {
      const sec = Math.max(MIN_PAUSE_SEC, t.sec * pauseFactor);
      return { kind: 'pause', id, sec: round1(sec), elastic: false };
    }
    return { kind: 'pause', id, sec: round1(elasticSec), elastic: true };
  });

  const plannedSec = round1(steps.reduce((s, x) => s + (x.kind === 'speech' ? x.estSec : x.sec), 0));

  return {
    id: content.id,
    title: content.title,
    subtitle: content.subtitle,
    variant,
    durationSec: targetSec,
    plannedSec,
    steps,
    ambient: content.ambient,
  };
}

/** Assemble a full session from a plan and the segment content library. */
export function assembleSession(
  plan: SessionPlan,
  library: Record<SegmentId, SegmentContent>,
  opts: AssembleOptions = {},
): Session {
  const durations = allocateDurations(plan);
  const segments = plan.segments.map((s, i) => {
    const content = library[s.id];
    if (!content) throw new Error(`Missing content for segment "${s.id}"`);
    return fitSegment(content, s.variant, durations[i], opts);
  });
  const now = opts.now ?? Date.now();
  return {
    id: `med-${plan.id}-${now.toString(36)}`,
    planId: plan.id,
    lengthMin: plan.lengthMin,
    name: plan.name,
    segments,
    totalSec: round1(segments.reduce((s, x) => s + x.plannedSec, 0)),
    createdAt: now,
  };
}
