import type { ReactNode } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { colors, space } from '@/theme';

import { AppText } from './AppText';

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="overline" tone="faint" accessibilityRole="header">
        {title}
      </AppText>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

export function ToggleRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <AppText variant="label">{label}</AppText>
        {hint ? (
          <AppText variant="caption" tone="faint">
            {hint}
          </AppText>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        accessibilityLabel={label}
        accessibilityHint={hint}
        trackColor={{ true: colors.violet, false: colors.surfaceRaised }}
        thumbColor={colors.text}
      />
    </View>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <AppText variant="label">{label}</AppText>
      {hint ? (
        <AppText variant="caption" tone="faint">
          {hint}
        </AppText>
      ) : null}
      <View style={styles.fieldBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.sm },
  card: {
    backgroundColor: 'rgba(26, 27, 68, 0.72)',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    gap: space.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 52 },
  text: { flex: 1, gap: 2 },
  field: { gap: space.xs },
  fieldBody: { paddingTop: space.sm },
});
