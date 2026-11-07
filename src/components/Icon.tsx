import { SymbolView, type SFSymbol } from 'expo-symbols';

import { colors } from '@/theme';

interface Props {
  name: SFSymbol;
  size?: number;
  color?: string;
}

/** SF Symbol icon. Decorative by default: label the parent control instead. */
export function Icon({ name, size = 22, color = colors.text }: Props) {
  return (
    <SymbolView
      name={name}
      size={size}
      tintColor={color}
      weight="regular"
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}
