import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { breathPresets } from '@content/breathPresets';
import { AppText } from '@/components/AppText';
import { CardGroup, PathCard } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { buildBreathSteps, estimateDurationSec } from '@/engine/breath';
import { startBreath } from '@/lib/navigation';
import type { BreathPattern } from '@/models/types';
import { useCustomPatterns } from '@/store/customPatterns';
import { space, useTheme } from '@/theme';

const icons: Record<string, Parameters<typeof Icon>[0]['name']> = {
  box: 'square',
  '478': 'moon.stars',
  coherent: 'heart',
  sigh: 'leaf',
  rising: 'arrow.up.circle',
  power: 'bolt',
};

function minutesLabel(p: BreathPattern): string {
  const sec = estimateDurationSec(buildBreathSteps(p), 75);
  const min = Math.max(1, Math.round(sec / 60));
  return `~${min} min`;
}

export default function BreatheTab() {
  const custom = useCustomPatterns((s) => s.patterns);
  const { c } = useTheme();

  return (
    <Screen accent="breath" glowY={0.08}>
      <View style={styles.header}>
        <AppText variant="overline" tone="breath">
          Breathe
        </AppText>
        <AppText variant="display" accessibilityRole="header">
          Change your breath, change your state
        </AppText>
      </View>

      <CardGroup>
        {breathPresets.map((p) => (
          <PathCard
            key={p.id}
            bare
            title={p.name}
            subtitle={`${p.summary} ${minutesLabel(p)}`}
            icon={icons[p.id] ?? 'wind'}
            accent="breath"
            onPress={() => startBreath(p.id, p.requiresSafetyCheck)}
            accessibilityHint={p.requiresSafetyCheck ? 'Opens a safety check, then starts' : 'Starts now'}
            right={p.requiresSafetyCheck ? <Icon name="exclamationmark.shield" size={20} color={c.warm} /> : undefined}
          />
        ))}
      </CardGroup>

      <View style={styles.sectionHeader}>
        <AppText variant="overline" tone="faint" accessibilityRole="header">
          Your patterns
        </AppText>
      </View>
      <CardGroup>
        {custom.map((p) => (
          <PathCard
            key={p.id}
            bare
            title={p.name}
            subtitle={`${p.summary} · ${minutesLabel(p)}`}
            icon="slider.horizontal.3"
            accent="breath"
            compact
            onPress={() => startBreath(p.id)}
            right={
              <Pressable
                onPress={() => router.push({ pathname: '/breath/builder', params: { id: p.id } })}
                accessibilityRole="button"
                accessibilityLabel={`Edit ${p.name}`}
                hitSlop={12}
                style={styles.edit}>
                <Icon name="pencil" size={18} color={c.textSoft} />
              </Pressable>
            }
          />
        ))}
        <PathCard
          key="build"
          bare
          title="Build your own"
          subtitle="Inhale, hold, exhale, hold, rounds"
          icon="plus"
          accent="breath"
          compact
          onPress={() => router.push('/breath/builder')}
        />
      </CardGroup>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.xs, paddingTop: space.lg },
  sectionHeader: { paddingTop: space.sm },
  edit: { padding: space.sm },
});
