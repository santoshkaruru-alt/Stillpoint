import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, AppState, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { playCue, preloadCues } from '@/audio/cues';
import { AppText } from '@/components/AppText';
import { SafeAreaView } from '@/components/SafeArea';
import { BreathCircle } from '@/components/BreathCircle';
import { Button } from '@/components/Button';
import { GlowBackground } from '@/components/GlowBackground';
import { SceneBackdrop } from '@/components/SceneBackdrop';
import { newId, savePractice, saveHolds } from '@/db';
import {
  BreathRunner,
  buildBreathSteps,
  estimateDurationSec,
  formatClock,
  totalRounds,
  type BreathSnapshot,
} from '@/engine/breath';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { useScreenAwake } from '@/hooks/useScreenAwake';
import { isWeb } from '@/lib/platformSetup';
import type { BreathPattern } from '@/models/types';
import { doneHaptic, phaseHaptic, tickHaptic } from '@/services/haptics';
import { findPattern } from '@/store/customPatterns';
import { useSettings } from '@/store/settings';
import { makeStyles, radius, space } from '@/theme';

const TICK_MS = 100;
/** Practices shorter than this are not logged. */
const MIN_LOG_SEC = 20;

function resolvePattern(id: string, breaths?: string): BreathPattern | undefined {
  const p = findPattern(id);
  if (p?.kind === 'power' && breaths) {
    const n = Number(breaths);
    if (n >= 10 && n <= 60) return { ...p, breathsPerRound: n };
  }
  return p;
}

export default function BreathPlayer() {
  const styles = useStyles();
  useScreenAwake('breath');
  const { pattern: patternId, breaths } = useLocalSearchParams<{ pattern: string; breaths?: string }>();
  const pattern = useMemo(() => resolvePattern(patternId, breaths), [patternId, breaths]);

  if (!pattern) {
    return (
      <View style={styles.root}>
        <GlowBackground accent="breath" />
        <SafeAreaView style={styles.missing}>
          <AppText variant="title">That pattern was not found.</AppText>
          <Button label="Back" onPress={() => router.back()} />
        </SafeAreaView>
      </View>
    );
  }
  return <Player pattern={pattern} />;
}

function Player({ pattern }: { pattern: BreathPattern }) {
  const styles = useStyles();
  const { width } = useWindowDimensions();
  const reduceMotion = useReduceMotion();
  const hapticsOn = useSettings((s) => s.hapticsEnabled);
  const soundsOn = useSettings((s) => s.breathSounds);
  const setSettings = useSettings((s) => s.set);

  const steps = useMemo(() => buildBreathSteps(pattern), [pattern]);
  const rounds = useMemo(() => totalRounds(steps), [steps]);
  const [runner, setRunner] = useState<BreathRunner | null>(null);
  const practiceId = useRef(newId()).current;
  const startedAt = useRef(Date.now()).current;
  const lastSecond = useRef(-1);
  const savedRef = useRef(false);

  const [snap, setSnap] = useState<BreathSnapshot | null>(null);
  const [anim, setAnim] = useState({ key: 0, sec: 1 });
  const [screenReader, setScreenReader] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setScreenReader);
    preloadCues();
    setSettings({
      lastSession: {
        kind: 'breath',
        patternId: pattern.id,
        intense: !!pattern.requiresSafetyCheck,
        title: `${pattern.name} breathing`,
        at: Date.now(),
      },
    });
  }, [pattern, setSettings]);

  // Feedback for every new step: animation, haptic, sound, announcement.
  const onStepChange = (s: BreathSnapshot) => {
    setAnim((a) => ({ key: a.key + 1, sec: s.remaining ?? 1 }));
    lastSecond.current = -1;
    const { step } = s;
    if (hapticsOn) void phaseHaptic(step.phase);
    if (soundsOn) {
      const quietCount = step.breath !== undefined && step.breath > 1; // fast power breaths
      if (!quietCount) {
        if (step.phase === 'inhale') playCue('in', 0.6);
        else if (step.phase === 'exhale') playCue('out', 0.6);
        else if (step.phase === 'holdIn' || step.phase === 'holdOut' || step.phase === 'retention') playCue('hold', 0.7);
      }
    }
    if (screenReader && (step.breath === undefined || step.breath === 1)) {
      AccessibilityInfo.announceForAccessibility(step.cue ? `${step.label}. ${step.cue}` : step.label);
    }
  };

  const finish = (runner: BreathRunner, completed: boolean) => {
    if (savedRef.current) return;
    savedRef.current = true;
    const now = Date.now();
    const active = runner.activeSeconds(now);
    if (active >= MIN_LOG_SEC) {
      savePractice({
        id: practiceId,
        kind: 'breath',
        refId: pattern.id,
        title: pattern.name,
        startedAt,
        durationSec: active,
        completed,
      });
      saveHolds(
        runner.holds.map((h) => ({
          id: newId(),
          practiceId,
          patternId: pattern.id,
          round: h.round,
          seconds: h.seconds,
          createdAt: now,
        })),
      );
    }
    if (completed) {
      if (hapticsOn) void doneHaptic();
      if (soundsOn) playCue('done', 0.8);
    }
  };

  // The timing loop.
  useEffect(() => {
    const runner = new BreathRunner(steps);
    savedRef.current = false;
    setRunner(runner);
    const first = runner.start(Date.now());
    setSnap(first);
    onStepChange(first);

    const id = setInterval(() => {
      const s = runner.tick(Date.now());
      if (s.changed) onStepChange(s);
      // Gentle per-second haptic through longer inhales / exhales.
      if (hapticsOn && !s.paused && (s.step.phase === 'inhale' || s.step.phase === 'exhale') && (s.step.sec ?? 0) >= 3) {
        const sec = Math.floor(s.elapsed);
        if (sec > 0 && sec !== lastSecond.current) {
          lastSecond.current = sec;
          void tickHaptic();
        }
      }
      setSnap(s);
      if (s.finished) {
        clearInterval(id);
        finish(runner, true);
      }
    }, TICK_MS);

    return () => {
      clearInterval(id);
      if (!runner.isFinished) {
        runner.stop(Date.now());
        finish(runner, false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps]);

  // In a browser, timers stop when the phone locks: pause instead of drifting.
  useEffect(() => {
    if (!isWeb || !runner) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active' && !runner.isFinished) {
        const now = Date.now();
        runner.pause(now);
        setSnap(runner.tick(now));
      }
    });
    return () => sub.remove();
  }, [runner]);

  if (!snap || !runner) return <View style={styles.root} />;

  const { step } = snap;
  const isHold = step.phase === 'retention';
  const circleSize = Math.min(width - space.lg * 2, 340);
  const elapsedTotal = runner.activeSeconds(Date.now());
  const total = estimateDurationSec(steps);

  const togglePause = () => {
    const now = Date.now();
    if (snap.paused) {
      runner.resume(now);
      const s = runner.tick(now);
      setAnim((a) => ({ key: a.key + 1, sec: s.remaining ?? 1 }));
      setSnap(s);
    } else {
      runner.pause(now);
      setSnap(runner.tick(now));
    }
  };

  const stop = () => {
    runner.stop(Date.now());
    finish(runner, false);
    goToSummary();
  };

  const endHold = () => {
    const s = runner.endHold(Date.now());
    onStepChange(s);
    setSnap(s);
  };

  const goToSummary = () => {
    router.replace({
      pathname: '/session/complete',
      params: { practiceId, kind: 'breath', title: pattern.name },
    });
  };

  if (snap.finished) {
    return (
      <View style={styles.root}>
        <SceneBackdrop kind="sea" veil={0.5} />
        <SafeAreaView style={styles.safe}>
          <View style={styles.finished}>
            <AppText variant="overline" tone="breath">
              Complete
            </AppText>
            <AppText variant="display" center accessibilityRole="header">
              Well breathed.
            </AppText>
            <AppText tone="muted" center>
              {pattern.name} · {formatClock(elapsedTotal)}
            </AppText>
            {runner.holds.length > 0 ? <HoldTable holds={runner.holds} /> : null}
          </View>
          <Button label="Continue" accent="breath" size="xl" onPress={goToSummary} />
        </SafeAreaView>
      </View>
    );
  }

  const bigNumber = isHold
    ? formatClock(snap.elapsed)
    : step.phase === 'prepare'
      ? String(Math.ceil(snap.remaining ?? 0))
      : step.breath !== undefined && step.label === String(step.breath)
        ? step.label
        : String(Math.max(1, Math.ceil(snap.remaining ?? 0)));
  const showLabel = !(step.breath !== undefined && step.label === String(step.breath));

  return (
    <View style={styles.root}>
      <SceneBackdrop kind="sea" veil={0.42} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.top}>
          <AppText variant="overline" tone="breath">
            {pattern.name}
          </AppText>
          <AppText variant="caption" tone="muted" accessibilityLabel={`Round ${Math.max(1, step.round)} of ${rounds}`}>
            {step.round > 0 ? `Round ${step.round} of ${rounds}` : 'Settle in'}
            {'  ·  '}
            {formatClock(elapsedTotal)} / ~{formatClock(total)}
          </AppText>
        </View>

        <Pressable
          onPress={isHold ? endHold : undefined}
          disabled={!isHold}
          accessibilityRole={isHold ? 'button' : 'timer'}
          accessibilityLabel={
            isHold ? `Holding for ${Math.round(snap.elapsed)} seconds. Double tap to breathe in.` : `${step.label}, ${bigNumber}`
          }
          style={styles.circleWrap}>
          <BreathCircle
            size={circleSize}
            scaleTo={step.scaleTo}
            durationSec={anim.sec}
            stepKey={anim.key}
            paused={snap.paused}
            reduceMotion={reduceMotion}
            progress={snap.progress}>
            {showLabel ? (
              <AppText variant="heading" center style={styles.onOrb}>
                {snap.paused ? 'Paused' : step.label}
              </AppText>
            ) : null}
            <AppText variant="timer" center style={styles.onOrb}>
              {bigNumber}
            </AppText>
          </BreathCircle>
        </Pressable>

        <View style={styles.cueBox}>
          {step.cue ? (
            <AppText tone="muted" center>
              {step.cue}
            </AppText>
          ) : null}
          {step.phase === 'prepare' && pattern.intro ? (
            <AppText variant="caption" tone="faint" center>
              {pattern.intro}
            </AppText>
          ) : null}
        </View>

        <View style={styles.controls}>
          {isHold ? (
            <Button label="Breathe in now" icon="lungs.fill" accent="breath" size="xl" onPress={endHold} />
          ) : (
            <Button
              label={snap.paused ? 'Resume' : 'Pause'}
              icon={snap.paused ? 'play.fill' : 'pause.fill'}
              kind="secondary"
              onPress={togglePause}
            />
          )}
          <Button
            label="Stop"
            icon="stop.fill"
            kind="danger"
            size="xl"
            onPress={stop}
            accessibilityHint="Ends the exercise now. Breathe normally."
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function HoldTable({ holds }: { holds: { round: number; seconds: number; capped: boolean }[] }) {
  const styles = useStyles();
  const best = Math.max(...holds.map((h) => h.seconds));
  return (
    <View style={styles.table} accessibilityLabel={`Breath holds: ${holds.map((h) => `round ${h.round}, ${Math.round(h.seconds)} seconds`).join('; ')}`}>
      {holds.map((h) => (
        <View key={h.round} style={styles.tableRow}>
          <AppText tone="muted">Round {h.round}</AppText>
          <AppText variant="heading" tone={h.seconds === best ? 'breath' : 'default'}>
            {formatClock(h.seconds)}
            {h.capped ? ' (max)' : ''}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
  root: { flex: 1, backgroundColor: c.bg },
  safe: { flex: 1, paddingHorizontal: space.lg, paddingBottom: space.md },
  missing: { flex: 1, padding: space.lg, gap: space.lg, justifyContent: 'center' },
  top: { alignItems: 'center', gap: space.xs, paddingTop: space.md },
  circleWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  onOrb: { color: c.text },
  cueBox: { minHeight: 72, gap: space.sm, justifyContent: 'center', paddingBottom: space.md },
  controls: { gap: space.md },
  finished: { flex: 1, justifyContent: 'center', gap: space.md },
  table: {
    marginTop: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.line,
    padding: space.lg,
    gap: space.sm,
    backgroundColor: c.surface,
  },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  }),
);
