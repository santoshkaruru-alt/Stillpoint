import { Text, type TextProps } from 'react-native';

import { maxScale, type, useTheme, type Palette, type TypeVariant } from '@/theme';

export type Tone = 'default' | 'muted' | 'faint' | 'calm' | 'breath' | 'warm' | 'danger' | 'onAccent';

const toneColor = (c: Palette, tone: Tone): string =>
  ({
    default: c.text,
    muted: c.textSoft,
    faint: c.textFaint,
    calm: c.calm,
    breath: c.breath,
    warm: c.warm,
    danger: c.danger,
    onAccent: c.onAccent,
  })[tone];

export interface AppTextProps extends TextProps {
  variant?: TypeVariant;
  tone?: Tone;
  center?: boolean;
}

export function AppText({ variant = 'body', tone = 'default', center, style, ...rest }: AppTextProps) {
  const { c } = useTheme();
  return (
    <Text
      maxFontSizeMultiplier={maxScale[variant]}
      style={[type[variant], { color: toneColor(c, tone) }, center && { textAlign: 'center' }, style]}
      {...rest}
    />
  );
}
