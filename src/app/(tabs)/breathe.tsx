import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { breathPresets } from '@content/breathPresets';
import { AppText } from '@/components/AppText';
import { PathCard } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { buildBreathSteps, estimateDurationSec } from '@/engine/breath';
import { startBreath } from '@/lib/navigation';
import type { BreathPattern } from '@/models/types';
import { useCustomPatterns } from '@/store/customPatterns';
import { colors, space } from '@/theme';

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

  return (
    <Screen accent="teal">
      <View style={styles.header}>
        <AppText variant="overline" tone="teal">
          Breathe
        </AppText>
        <AppText variant="display" accessibilityRole="header">
          Change your breath, change your state
        </AppText>
      </View>

      <View style={styles.list}>
        {breathPresets.map((p) => (
          <PathCard
            key={p.id}
            title={p.name}
            subtitle={`${p.summary} ${minutesLabel(p)}`}
            icon={icons[p.id] ?? 'wind'}
            accent="teal"
            onPress={() => startBreath(p.id, p.requiresSafetyCheck)}
            accessibilityHint={p.requiresSafetyCheck ? 'Opens a safety check, then starts' : 'Starts now'}
            right={p.requiresSafetyCheck ? <Icon name="exclamationmark.shield" size={20} color={colors.amber} /> : undefined}
          />
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <AppText variant="heading" accessibilityRole="header">
          Your patterns
        </AppText>
      </View>
      <View style={styles.list}>
        {custom.map((p) => (
          <PathCard
            key={p.id}
            title={p.name}
            subtitle={`${p.summary} · ${minutesLabel(p)}`}
            icon="slider.horizontal.3"
            accent="teal"
            compact
            onPress={() => startBreath(p.id)}
            right={
              <Pressable
                onPress={() => router.push({ pathname: '/breath/builder', params: { id: p.id } })}
                accessibilityRole="button"
                accessibilityLabel={`Edit ${p.name}`}
                hitSlop={12}
                style={styles.edit}>
                <Icon name="pencil" size={18} color={colors.textMuted} />
              </Pressable>
            }
          />
        ))}
        <PathCard
          title="Build your own"
          subtitle="Inhale, hold, exhale, hold, rounds"
          icon="plus"
          accent="teal"
          compact
          onPress={() => router.push('/breath/builder')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.sm, paddingTop: space.xl },
  list: { gap: space.md },
  sectionHeader: { paddingTop: space.md },
  edit: { padding: space.sm },
});
