import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, AppState, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { AmbientMixer } from '@/audio/ambient';
import { ensureAudioSession } from '@/audio/audioSession';
import { playCue, preloadCues } from '@/audio/cues';
import { AppText } from '@/components/AppText';
import { SafeAreaView } from '@/components/SafeArea';
import { Button } from '@/components/Button';
import { Enso } from '@/components/Enso';
import { SceneBackdrop } from '@/components/SceneBackdrop';
import { Icon } from '@/components/Icon';
import { newId, savePractice } from '@/db';
import { formatClock } from '@/engine/breath';
import { SilentTimer } from '@/engine/timer';
import { useScreenAwake } from '@/hooks/useScreenAwake';
import { isWeb } from '@/lib/platformSetup';
import { useSettings } from '@/store/settings';
import { makeStyles, space, useTheme } from '@/theme';

const TICK_MS = 250;
const DIM_AFTER_MS = 20_000;
const END_FADE_MS = 8000;
const MIN_LOG_SEC = 60;

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    safe: { flex: 1, paddingHorizontal: space.lg, paddingBottom: space.md },
    top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: space.sm },
    close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg },
    dial: { alignItems: 'center', justifyContent: 'center' },
    dialText: { position: 'absolute', alignItems: 'center', gap: space.sm },
    controls: { gap: space.sm },
    dim: { ...StyleSheet.absoluteFill, backgroundColor: c.scrim, justifyContent: 'flex-end', paddingBottom: space.xxl * 2 },
  }),
);

/** Unguided sit: bells, optional interval bells, ambient sound, nothing else. */
export default function TimerScreen() {
  useScreenAwake('timer');
  const styles = useStyles();
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const { minutes: raw } = useLocalSearchParams<{ minutes: string }>();
  const minutes = Math.min(180, Math.max(1, Number(raw) || 10));
  const intervalMin = useSettings((s) => s.timerIntervalMin);
  const dimEnabled = useSettings((s) => s.dimDuringSession);

  const timer = useMemo(() => new SilentTimer(minutes, useSettings.getState().timerIntervalMin), [minutes]);
  const practiceId = useRef(newId()).current;
  const startedAt = useRef(Date.now()).current;
  const mixerRef = useRef<AmbientMixer | null>(null);
  const endingRef = useRef(false);
  const savedRef = useRef(false);
  const lastTouch = useRef(Date.now());

  const [now, setNow] = useState(Date.now());
  const [paused, setPaused] = useState(false);
  const [ending, setEnding] = useState(false);
  const [dimmed, setDimmed] = useState(false);

  const save = (completed: boolean) => {
    if (savedRef.current) return;
    savedRef.current = true;
    const active = timer.elapsed(Date.now());
    if (active >= MIN_LOG_SEC) {
      savePractice({
        id: practiceId,
        kind: 'meditation',
        refId: 'timer',
        title: `Silent sitting · ${minutes} min`,
        startedAt,
        durationSec: active,
        completed,
      });
    }
  };

  const finish = async (completed: boolean) => {
    if (endingRef.current) return;
    endingRef.current = true;
    setEnding(true);
    timer.stop();
    save(completed);
    playCue('bell', 0.75);
    AccessibilityInfo.announceForAccessibility('Sitting complete');
    await mixerRef.current?.fadeOut(END_FADE_MS);
    router.replace({ pathname: '/session/complete', params: { practiceId, kind: 'meditation', title: 'Silent sitting' } });
  };

  useEffect(() => {
    const s = useSettings.getState();
    void ensureAudioSession();
    preloadCues(['bell', 'hold']);
    const mixer = new AmbientMixer();
    mixerRef.current = mixer;
    mixer.setScene(
      { bed: s.timerBed, level: 0.85, binaural: 'off' },
      { ambientVolume: s.ambientVolume, bedOverride: null, binauralEnabled: false, binauralVolume: 0 },
      5000,
    );
    // Let the sound settle, then the opening bell starts the sit.
    const startTimer = setTimeout(() => {
      playCue('bell', 0.7);
      timer.start(Date.now());
    }, 3000);

    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      const { bells, finished } = timer.tick(t);
      if (bells.length) playCue('hold', 0.55);
      if (finished) void finish(true);
      if (useSettings.getState().dimDuringSession && t - lastTouch.current > DIM_AFTER_MS) setDimmed(true);
    }, TICK_MS);

    return () => {
      clearTimeout(startTimer);
      clearInterval(id);
      if (!endingRef.current) save(false);
      mixer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Browsers stop timers when the phone locks: pause instead of drifting.
  useEffect(() => {
    if (!isWeb) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active' && timer.started && !timer.paused && !timer.finished) {
        timer.pause(Date.now());
        mixerRef.current?.pause();
        setPaused(true);
      }
    });
    return () => sub.remove();
  }, [timer]);

  const touch = () => {
    lastTouch.current = Date.now();
    if (dimmed) setDimmed(false);
  };

  const togglePause = () => {
    touch();
    const t = Date.now();
    if (paused) {
      timer.resume(t);
      mixerRef.current?.resume();
      setPaused(false);
    } else {
      timer.pause(t);
      mixerRef.current?.pause();
      setPaused(true);
    }
  };

  const dialSize = Math.min(width - space.lg * 2, 320);
  const remaining = timer.started ? timer.remaining(now) : timer.totalSec;

  return (
    <Pressable style={styles.root} onPress={touch} accessible={false}>
      <SceneBackdrop veil={0.38} animate={!paused} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.top}>
          <Pressable onPress={() => void finish(false)} accessibilityRole="button" accessibilityLabel="End sitting" hitSlop={12} style={styles.close}>
            <Icon name="xmark" size={18} color={c.textSoft} />
          </Pressable>
          <AppText variant="overline" tone="calm">
            Silent sitting · {minutes} min
          </AppText>
          <View style={styles.close} />
        </View>

        <View style={styles.center}>
          <View style={[styles.dial, { width: dialSize, height: dialSize }]}>
            <Enso size={dialSize} color={c.text} opacity={c.scheme === 'dark' ? 0.22 : 0.18} drift={!paused && !ending} />
            <View style={styles.dialText} accessible accessibilityRole="timer" accessibilityLabel={`${Math.ceil(remaining / 60)} minutes remaining`}>
              <AppText variant="timer" center>
                {formatClock(remaining)}
              </AppText>
              <AppText tone="muted" center style={{ marginTop: 6 }}>
                {ending ? 'Let the sound fade' : !timer.started ? 'Settle in' : paused ? 'Paused' : 'Rest in stillness'}
              </AppText>
            </View>
          </View>
          <AppText variant="caption" tone="faint" center>
            {intervalMin ? `A soft bell every ${intervalMin} minutes` : 'A bell to begin and a bell to end'}
          </AppText>
        </View>

        <View style={styles.controls}>
          <Button
            label={paused ? 'Resume' : 'Pause'}
            icon={paused ? 'play.fill' : 'pause.fill'}
            kind="secondary"
            onPress={togglePause}
            disabled={ending || !timer.started}
          />
          <Button label="End" kind="ghost" onPress={() => void finish(false)} disabled={ending} />
        </View>
      </SafeAreaView>

      {dimmed && dimEnabled && !ending ? (
        <Pressable style={styles.dim} onPress={touch} accessibilityRole="button" accessibilityLabel="Screen dimmed. Tap to show controls.">
          <AppText variant="caption" tone="faint" center>
            Tap to show controls
          </AppText>
        </Pressable>
      ) : null}
    </Pressable>
  );
}
