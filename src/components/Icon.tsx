import { SymbolView, type SFSymbol } from 'expo-symbols';

import { useTheme } from '@/theme';

interface Props {
  name: SFSymbol;
  size?: number;
  color?: string;
}

/** SF Symbol icon. Decorative by default: label the parent control instead. */
export function Icon({ name, size = 22, color }: Props) {
  const { c } = useTheme();
  return (
    <SymbolView
      name={name}
      size={size}
      tintColor={color ?? c.text}
      weight="light"
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}
