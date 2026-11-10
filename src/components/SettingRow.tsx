import type { ReactNode } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { makeStyles, radius, space, useTheme } from '@/theme';

import { AppText } from './AppText';

export function Section({ title, children }: { title: string; children: ReactNode }) {
  const styles = useStyles();
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
  const styles = useStyles();
  const { c } = useTheme();
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
        trackColor={{ true: c.calm, false: c.lineStrong }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  const styles = useStyles();
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

const useStyles = makeStyles((c) =>
  StyleSheet.create({
  section: { gap: space.sm },
  card: {
    backgroundColor: c.surface,
    borderColor: c.line,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    gap: space.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 52 },
  text: { flex: 1, gap: 2 },
  field: { gap: space.xs },
  fieldBody: { paddingTop: space.sm },
  }),
);
