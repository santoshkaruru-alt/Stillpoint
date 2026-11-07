import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, AppState, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { segments as library } from '@content/segments';
import { planFor } from '@content/sessionPlans';
import { AmbientMixer, type MixLevels } from '@/audio/ambient';
import { ensureAudioSession } from '@/audio/audioSession';
import { playCue } from '@/audio/cues';
import { DeviceTTSProvider } from '@/audio/voice/DeviceTTSProvider';
import type { VoiceProvider } from '@/audio/voice/VoiceProvider';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { GlowBackground } from '@/components/GlowBackground';
import { Icon } from '@/components/Icon';
import { newId, savePractice } from '@/db';
import { assembleSession } from '@/engine/assemble';
import { formatClock } from '@/engine/breath';
import { MeditationRunner, type RunnerEvent } from '@/engine/meditation';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { useScreenAwake } from '@/hooks/useScreenAwake';
import { isWeb } from '@/lib/platformSetup';
import type { Session, SessionLength } from '@/models/types';
import { useSettings } from '@/store/settings';
import { colors, radius, space } from '@/theme';

const TICK_MS = 250;
const DIM_AFTER_MS = 20_000;
const END_FADE_MS = 8000;
const MIN_LOG_SEC = 60;

export default function MeditationPlayer() {
  const params = useLocalSearchParams<{ length: string; from?: string; mood?: string }>();
  const lengthMin = Number(params.length) as SessionLength;
  const plan = planFor(lengthMin);

  // Settings are read once at start; changes apply to the next session.
  const [session] = useState<Session | null>(() => {
    if (!plan) return null;
    const s = useSettings.getState();
    return assembleSession(plan, library, { voiceRate: s.voiceRate, pauseScale: s.pauseScale, intention: s.intention });
  });

  if (!session) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safe}>
          <AppText variant="title">That session length is not available.</AppText>
          <Button label="Back" onPress={() => router.back()} />
        </SafeAreaView>
      </View>
    );
  }
  return <Player session={session} fromSegment={Number(params.from ?? 0)} moodBefore={params.mood} />;
}

function Player({ session, fromSegment, moodBefore }: { session: Session; fromSegment: number; moodBefore?: string }) {
  useScreenAwake('meditation');
  const reduceMotion = useReduceMotion();
  const showCaptions = useSettings((s) => s.showCaptions);
  const dimEnabled = useSettings((s) => s.dimDuringSession);
  const binauralOn = useSettings((s) => s.binauralEnabled);

  const runner = useMemo(() => new MeditationRunner(session), [session]);
  const practiceId = useRef(newId()).current;
  const startedAt = useRef(Date.now()).current;
  const voiceRef = useRef<VoiceProvider | null>(null);
  const mixerRef = useRef<AmbientMixer | null>(null);
  const endingRef = useRef(false);
  const savedRef = useRef(false);

  const [segIndex, setSegIndex] = useState(Math.min(fromSegment, session.segments.length - 1));
  const [caption, setCaption] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [ending, setEnding] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [dimmed, setDimmed] = useState(false);
  const lastTouch = useRef(Date.now());

  const levels = (): MixLevels => {
    const s = useSettings.getState();
    return {
      ambientVolume: s.ambientVolume,
      bedOverride: s.ambientOverride,
      binauralEnabled: s.binauralEnabled,
      binauralVolume: s.binauralVolume,
    };
  };

  const save = (completed: boolean) => {
    if (savedRef.current) return;
    savedRef.current = true;
    const active = runner.active(Date.now());
    if (active >= MIN_LOG_SEC) {
      savePractice({
        id: practiceId,
        kind: 'meditation',
        refId: String(session.lengthMin),
        title: `${session.name} · ${session.lengthMin} min`,
        startedAt,
        durationSec: active,
        completed,
      });
    }
  };

  const finishSession = async (completed: boolean) => {
    if (endingRef.current) return;
    endingRef.current = true;
    setEnding(true);
    setCaption(null);
    voiceRef.current?.stop();
    runner.stop();
    save(completed);
    playCue('bell', 0.7);
    AccessibilityInfo.announceForAccessibility('Session complete');
    await mixerRef.current?.fadeOut(END_FADE_MS);
    router.replace({
      pathname: '/session/complete',
      params: { practiceId, kind: 'meditation', title: session.name, ...(moodBefore ? { moodBefore } : {}) },
    });
  };

  const handle = (events: RunnerEvent[]) => {
    for (const e of events) {
      if (e.type === 'segment') {
        const seg = session.segments[e.segmentIndex];
        setSegIndex(e.segmentIndex);
        setCaption(null);
        mixerRef.current?.setScene(seg.ambient, levels(), e.segmentIndex === 0 ? 6000 : 4000);
        useSettings.getState().set({
          lastSession: {
            kind: 'meditation',
            lengthMin: session.lengthMin,
            segmentIndex: e.segmentIndex,
            title: `${session.name} · ${session.lengthMin} min, ${seg.title}`,
            at: Date.now(),
          },
        });
      } else if (e.type === 'speak') {
        setCaption(e.step.text);
        voiceRef.current?.speak(e.step, () => {
          setCaption(null);
          handle(runner.speechDone(Date.now()));
        });
      } else if (e.type === 'finished') {
        void finishSession(true);
      }
    }
  };

  useEffect(() => {
    const s = useSettings.getState();
    void ensureAudioSession();
    const voice = new DeviceTTSProvider({ rate: s.voiceRate, pitch: s.voicePitch, voiceId: s.voiceId });
    const mixer = new AmbientMixer();
    voiceRef.current = voice;
    mixerRef.current = mixer;

    // Let the ambience swell in before the first words.
    mixer.setScene(session.segments[Math.min(fromSegment, session.segments.length - 1)].ambient, levels(), 4000);
    const startTimer = setTimeout(() => handle(runner.start(Date.now(), fromSegment)), 3500);

    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (runner.currentStatus !== 'idle' && runner.currentStatus !== 'finished') handle(runner.tick(t));
      if (useSettings.getState().dimDuringSession && t - lastTouch.current > DIM_AFTER_MS) setDimmed(true);
    }, TICK_MS);

    return () => {
      clearTimeout(startTimer);
      clearInterval(id);
      if (!endingRef.current) save(runner.segmentIndex >= session.segments.length - 1);
      voice.dispose();
      mixer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Browsers stop audio and timers when the phone locks or the tab is
  // hidden, so pause cleanly and let the user resume.
  useEffect(() => {
    if (!isWeb) return;
    const sub = AppState.addEventListener('change', (state) => {
      const st = runner.currentStatus;
      if (state !== 'active' && !runner.isPaused && st !== 'idle' && st !== 'finished') {
        runner.pause(Date.now());
        voiceRef.current?.pause();
        mixerRef.current?.pause();
        setPaused(true);
      }
    });
    return () => sub.remove();
  }, [runner]);

  const touch = () => {
    lastTouch.current = Date.now();
    if (dimmed) setDimmed(false);
  };

  const togglePause = () => {
    touch();
    const t = Date.now();
    if (paused) {
      runner.resume(t);
      voiceRef.current?.resume();
      mixerRef.current?.resume();
      setPaused(false);
    } else {
      runner.pause(t);
      voiceRef.current?.pause();
      mixerRef.current?.pause();
      setPaused(true);
    }
  };

  const skip = () => {
    touch();
    voiceRef.current?.stop();
    if (paused) {
      mixerRef.current?.resume();
      setPaused(false);
    }
    handle(runner.skipSegment(Date.now()));
  };

  const seg = session.segments[segIndex];
  const position = runner.currentStatus === 'idle' ? session.segments.slice(0, segIndex).reduce((a, s) => a + s.plannedSec, 0) : runner.position(now);
  const remaining = Math.max(0, runner.totalPlannedSec - position);

  return (
    <Pressable style={styles.root} onPress={touch} accessible={false}>
      <GlowBackground accent="violet" glowY={0.38} pulse={!paused} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.top}>
          <Pressable
            onPress={() => void finishSession(false)}
            accessibilityRole="button"
            accessibilityLabel="End session"
            hitSlop={12}
            style={styles.close}>
            <Icon name="xmark" size={18} color={colors.textMuted} />
          </Pressable>
          <AppText variant="overline" tone="violet">
            {session.name} · {session.lengthMin} min
          </AppText>
          <View style={styles.close} />
        </View>

        <SegmentBar session={session} index={segIndex} />

        <View style={styles.center}>
          <AppText variant="caption" tone="faint" center>
            {segIndex + 1} of {session.segments.length}
          </AppText>
          <AppText variant="display" center accessibilityRole="header">
            {ending ? 'Welcome back' : seg.title}
          </AppText>
          <AppText tone="muted" center>
            {ending ? 'Let the sound fade' : paused ? 'Paused' : seg.subtitle}
          </AppText>
          {showCaptions && caption && !ending ? (
            <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(600)} exiting={reduceMotion ? undefined : FadeOut.duration(600)} key={caption} style={styles.caption}>
              <AppText variant="heading" center style={styles.captionText}>
                {caption}
              </AppText>
            </Animated.View>
          ) : null}
        </View>

        <View style={styles.bottom}>
          {binauralOn ? (
            <View style={styles.notice} accessible accessibilityLabel="Binaural tones are on. Use headphones.">
              <Icon name="headphones" size={16} color={colors.textMuted} />
              <AppText variant="caption" tone="muted">
                Binaural tones on. Use headphones.
              </AppText>
            </View>
          ) : null}
          <AppText variant="caption" tone="faint" center accessibilityLabel={`${Math.round(remaining / 60)} minutes remaining`}>
            {formatClock(remaining)} remaining
          </AppText>
          <View style={styles.controls}>
            <Button label="Skip" icon="forward.end.fill" kind="secondary" onPress={skip} disabled={ending} style={styles.flex} accessibilityHint="Moves to the next part of the session" />
            <Button
              label={paused ? 'Resume' : 'Pause'}
              icon={paused ? 'play.fill' : 'pause.fill'}
              onPress={togglePause}
              disabled={ending}
              style={styles.flex}
            />
          </View>
          <Button label="End session" kind="ghost" onPress={() => void finishSession(false)} disabled={ending} />
        </View>
      </SafeAreaView>

      {dimmed && !ending ? (
        <Pressable style={styles.dim} onPress={touch} accessibilityRole="button" accessibilityLabel="Screen dimmed. Tap to show controls.">
          <AppText variant="caption" tone="faint" center>
            Tap to show controls
          </AppText>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

function SegmentBar({ session, index }: { session: Session; index: number }) {
  return (
    <View style={styles.bar} accessible accessibilityLabel={`Part ${index + 1} of ${session.segments.length}: ${session.segments[index].title}`}>
      {session.segments.map((s, i) => (
        <View
          key={s.id}
          style={[
            styles.barPart,
            { flex: s.plannedSec },
            i < index && { backgroundColor: colors.violetDeep },
            i === index && { backgroundColor: colors.violet },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1, paddingHorizontal: space.lg, paddingBottom: space.md, gap: space.md },
  flex: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: space.sm },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  bar: { flexDirection: 'row', gap: 4, height: 4 },
  barPart: { height: 4, borderRadius: 2, backgroundColor: colors.border },
  center: { flex: 1, justifyContent: 'center', gap: space.sm },
  caption: { marginTop: space.xl, minHeight: 120, justifyContent: 'flex-start' },
  captionText: { color: colors.textMuted, fontWeight: '300' },
  bottom: { gap: space.md },
  controls: { flexDirection: 'row', gap: space.md },
  notice: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(2, 2, 10, 0.88)',
    justifyContent: 'flex-end',
    paddingBottom: space.xxl * 2,
  },
});
