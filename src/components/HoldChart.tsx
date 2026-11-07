import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import type { HoldPoint } from '@/engine/stats';
import { formatClock } from '@/engine/breath';
import { colors, space } from '@/theme';

import { AppText } from './AppText';

/** Validated against the dark surface (L 0.48 to 0.67 band, contrast >= 3:1). */
const SERIES = '#2FA898';
const GRID = 'rgba(196, 190, 255, 0.10)';
const SURFACE = '#151638';

const H = 180;
const PAD = { top: 22, right: 16, bottom: 22, left: 40 };

function niceMax(v: number): number {
  const steps = [30, 60, 90, 120, 150, 180, 240, 300];
  return steps.find((s) => s >= v) ?? Math.ceil(v / 60) * 60;
}

const shortDate = (ts: number) => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

/**
 * Best breath hold per session. Single series, so no legend: the title
 * names it. Tap a point to read it; "Show as list" gives a table view.
 */
export function HoldChart({ points, width }: { points: HoldPoint[]; width: number }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [asList, setAsList] = useState(false);

  if (points.length === 0) {
    return (
      <AppText tone="faint" variant="caption">
        Your best breath hold from each Power rounds session will appear here.
      </AppText>
    );
  }

  const max = niceMax(Math.max(...points.map((p) => p.best)));
  const innerW = width - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;
  const ticks = [0, max / 2, max];

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.best).toFixed(1)}`).join(' ');
  const area = `${line} L${x(points.length - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`;

  const bestIdx = points.reduce((b, p, i) => (p.best > points[b].best ? i : b), 0);
  const lastIdx = points.length - 1;
  const labelled = new Set([bestIdx, lastIdx]);
  const active = selected ?? null;

  const summary = `Best breath hold per session, ${points.length} sessions. Latest ${formatClock(points[lastIdx].best)}. Personal best ${formatClock(points[bestIdx].best)}.`;

  return (
    <View style={styles.wrap}>
      {asList ? (
        <View style={styles.list} accessibilityRole="list">
          {[...points].reverse().map((p) => (
            <View key={p.practiceId} style={styles.listRow} accessible accessibilityLabel={`${shortDate(p.at)}: best ${Math.round(p.best)} seconds over ${p.rounds} rounds`}>
              <AppText tone="muted">{shortDate(p.at)}</AppText>
              <AppText variant="label">
                {formatClock(p.best)}
                <AppText variant="caption" tone="faint">
                  {'  '}avg {formatClock(p.average)}
                </AppText>
              </AppText>
            </View>
          ))}
        </View>
      ) : (
        <View accessible accessibilityLabel={summary} accessibilityHint="Use Show as list to hear every session">
          <Svg width={width} height={H}>
            {ticks.map((t) => (
              <Line key={t} x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth={1} />
            ))}
            {ticks.map((t) => (
              <SvgText key={`l${t}`} x={PAD.left - 8} y={y(t) + 4} fontSize={11} fill={colors.textFaint} textAnchor="end">
                {formatClock(t)}
              </SvgText>
            ))}
            <Path d={area} fill={SERIES} fillOpacity={0.1} />
            <Path d={line} stroke={SERIES} strokeWidth={2} fill="none" strokeLinejoin="round" strokeLinecap="round" />
            {active !== null ? (
              <Line x1={x(active)} x2={x(active)} y1={PAD.top} y2={y(0)} stroke={colors.borderStrong} strokeWidth={1} />
            ) : null}
            {points.map((p, i) => (
              <Circle key={p.practiceId} cx={x(i)} cy={y(p.best)} r={i === active ? 6 : 4} fill={SERIES} stroke={SURFACE} strokeWidth={2} />
            ))}
            {points.map((p, i) =>
              labelled.has(i) && i !== active ? (
                <SvgText
                  key={`v${p.practiceId}`}
                  x={x(i)}
                  y={y(p.best) - 10}
                  fontSize={12}
                  fontWeight="600"
                  fill={colors.textMuted}
                  textAnchor={i === lastIdx && points.length > 1 ? 'end' : 'middle'}>
                  {i === bestIdx && i !== lastIdx ? `Best ${formatClock(p.best)}` : formatClock(p.best)}
                </SvgText>
              ) : null,
            )}
          </Svg>
          {/* Tap anywhere on the plot: the nearest session is selected. */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={(e) => {
              const tx = e.nativeEvent.locationX;
              let nearest = 0;
              points.forEach((_, i) => {
                if (Math.abs(x(i) - tx) < Math.abs(x(nearest) - tx)) nearest = i;
              });
              setSelected((s) => (s === nearest ? null : nearest));
            }}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
        </View>
      )}

      <View style={styles.footer}>
        <AppText variant="caption" tone="muted" style={styles.flex}>
          {active !== null
            ? `${shortDate(points[active].at)} · best ${formatClock(points[active].best)} · avg ${formatClock(points[active].average)} · ${points[active].rounds} rounds`
            : `Last ${points.length} sessions. Tap a point for details.`}
        </AppText>
        <Pressable onPress={() => setAsList((v) => !v)} accessibilityRole="button" hitSlop={10}>
          <AppText variant="caption" tone="violet">
            {asList ? 'Show chart' : 'Show as list'}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  flex: { flex: 1 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  list: { gap: space.xs },
  listRow: { flexDirection: 'row', justifyContent: 'space-between', minHeight: 36, alignItems: 'center' },
});
