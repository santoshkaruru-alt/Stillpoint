import { Text, type TextProps } from 'react-native';

import { colors, maxScale, type, type TypeVariant } from '@/theme';

type Tone = 'default' | 'muted' | 'faint' | 'violet' | 'teal' | 'amber' | 'danger' | 'onAccent';

const toneColor: Record<Tone, string> = {
  default: colors.text,
  muted: colors.textMuted,
  faint: colors.textFaint,
  violet: colors.violet,
  teal: colors.teal,
  amber: colors.amber,
  danger: colors.danger,
  onAccent: colors.onAccent,
};

export interface AppTextProps extends TextProps {
  variant?: TypeVariant;
  tone?: Tone;
  center?: boolean;
}

export function AppText({ variant = 'body', tone = 'default', center, style, ...rest }: AppTextProps) {
  return (
    <Text
      maxFontSizeMultiplier={maxScale[variant]}
      style={[type[variant], { color: toneColor[tone] }, center && { textAlign: 'center' }, style]}
      {...rest}
    />
  );
}
