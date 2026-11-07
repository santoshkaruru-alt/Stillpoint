/**
 * Core data models for Stillpoint.
 *
 * Content (scripts, presets) lives in /content and is typed by the
 * "content" types below. Runtime objects (an assembled Session, a logged
 * JournalEntry) are produced by the engine and the database layer.
 */

// ---------------------------------------------------------------------------
// Meditation content
// ---------------------------------------------------------------------------

export type SessionLength = 10 | 20 | 45 | 60;
export const SESSION_LENGTHS: SessionLength[] = [10, 20, 45, 60];

export type SegmentId =
  | 'settle'
  | 'breath'
  | 'body'
  | 'present'
  | 'heart'
  | 'future'
  | 'closing';

/** Each segment script exists in three lengths. */
export type ScriptVariant = 'short' | 'medium' | 'long';

export type AmbientBedId = 'none' | 'drift' | 'tide' | 'rain' | 'deep';
export type BinauralPresetId = 'off' | 'alpha' | 'theta' | 'delta';

export interface AmbientSettings {
  /** Which looping ambient bed plays under this segment. */
  bed: AmbientBedId;
  /** Relative level 0..1, multiplied by the user's ambient volume. */
  level: number;
  /** Optional binaural tone (only plays if the user enabled binaural). */
  binaural: BinauralPresetId;
}

/** Editable content for one segment, as stored in /content/segments. */
export interface SegmentContent {
  id: SegmentId;
  title: string;
  /** One line shown in the player under the title. */
  subtitle: string;
  ambient: AmbientSettings;
  /**
   * Script text per variant. Plain sentences separated by blank lines or
   * markers. Supported markers:
   *   [pause 10s]   fixed silence (scaled by the user's pause setting)
   *   [silence]     elastic silence that absorbs leftover time
   *   {{identity}} {{emotion}} {{scene}}   intention placeholders
   */
  scripts: Record<ScriptVariant, string>;
}

/** Which variant and how much of the total each segment gets per length. */
export interface SessionPlan {
  lengthMin: SessionLength;
  name: string;
  description: string;
  segments: { id: SegmentId; variant: ScriptVariant; weight: number }[];
}

// ---------------------------------------------------------------------------
// Assembled (runtime) meditation
// ---------------------------------------------------------------------------

export type ScriptStep =
  | {
      kind: 'speech';
      /** Stable id, e.g. "future.long.4". Used later to map recorded audio. */
      id: string;
      text: string;
      /** Estimated spoken duration in seconds at the current voice rate. */
      estSec: number;
    }
  | {
      kind: 'pause';
      id: string;
      /** Planned silence in seconds after fitting to the segment duration. */
      sec: number;
      elastic: boolean;
    };

export interface Segment {
  id: SegmentId;
  title: string;
  subtitle: string;
  variant: ScriptVariant;
  /** Target duration of the segment in seconds. */
  durationSec: number;
  /** Sum of the planned steps (can differ slightly from durationSec). */
  plannedSec: number;
  steps: ScriptStep[];
  ambient: AmbientSettings;
}

export interface Session {
  id: string;
  lengthMin: SessionLength;
  name: string;
  segments: Segment[];
  totalSec: number;
  createdAt: number;
}

export interface Intention {
  /** Who the user wants to become, e.g. "a calm, generous parent". */
  identity: string;
  /** The emotion they want to feel, e.g. "grateful and free". */
  emotion: string;
  /** One future scene, felt as already happening. */
  scene: string;
}

// ---------------------------------------------------------------------------
// Breathwork
// ---------------------------------------------------------------------------

export type BreathPhaseType = 'inhale' | 'holdIn' | 'exhale' | 'holdOut';

export interface BreathPhase {
  type: BreathPhaseType;
  sec: number;
  /** Optional instruction shown during this phase. */
  cue?: string;
  /** Override the circle size at the end of this phase (0..1). */
  scaleTo?: number;
}

interface BreathPatternBase {
  id: string;
  name: string;
  summary: string;
  /** Requires the safety acknowledgement each time before starting. */
  requiresSafetyCheck?: boolean;
  /** Shows the retention logger (hold times are saved). */
  logsHolds?: boolean;
  intro?: string;
}

/** A repeating cycle of phases, e.g. box breathing. */
export interface PacedPattern extends BreathPatternBase {
  kind: 'paced';
  phases: BreathPhase[];
  rounds: number;
}

/**
 * Power rounds: N fast deep breaths, an open-ended exhale hold (timed by
 * the user), then a recovery breath held in. Repeated for `rounds`.
 */
export interface PowerPattern extends BreathPatternBase {
  kind: 'power';
  breathsPerRound: number;
  inhaleSec: number;
  exhaleSec: number;
  recoveryHoldSec: number;
  rounds: number;
  /** Safety cap for the exhale hold; the hold ends automatically. */
  maxHoldSec: number;
}

export type BreathPattern = PacedPattern | PowerPattern;

// ---------------------------------------------------------------------------
// Journal and history
// ---------------------------------------------------------------------------

export type PracticeKind = 'meditation' | 'breath';

export interface PracticeLog {
  id: string;
  kind: PracticeKind;
  /** e.g. "20" for a meditation length or a breath pattern id */
  refId: string;
  title: string;
  startedAt: number;
  durationSec: number;
  completed: boolean;
}

export interface JournalEntry {
  id: string;
  createdAt: number;
  /** Linked practice, if this entry was written around a session. */
  practiceId: string | null;
  moodBefore: number | null;
  moodAfter: number | null;
  note: string;
}

export interface BreathHold {
  id: string;
  practiceId: string;
  patternId: string;
  round: number;
  seconds: number;
  createdAt: number;
}
