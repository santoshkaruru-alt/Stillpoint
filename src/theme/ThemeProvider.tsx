import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { Platform, useColorScheme } from 'react-native';

import { useSettings } from '@/store/settings';

import { DEFAULT_THEME, palettes, type Palette, type ThemeName } from './palettes';

interface ThemeValue {
  c: Palette;
  name: ThemeName;
  isDark: boolean;
}

const fallback: ThemeValue = { c: palettes[DEFAULT_THEME].dark, name: DEFAULT_THEME, isDark: true };
const ThemeContext = createContext<ThemeValue>(fallback);

/** Picks the palette from Settings (theme + light/dark/system). */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const appearance = useSettings((s) => s.appearance);
  const name = useSettings((s) => s.themeName);
  const scheme = appearance === 'system' ? (system === 'light' ? 'light' : 'dark') : appearance;

  const value = useMemo<ThemeValue>(() => {
    const key = name in palettes ? name : DEFAULT_THEME;
    return { c: palettes[key][scheme], name: key, isDark: scheme === 'dark' };
  }, [name, scheme]);

  // Keep the browser page and status bar area in step with the theme.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    document.documentElement.style.backgroundColor = value.c.bg;
    document.body.style.backgroundColor = value.c.bg;
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', value.c.bg));
  }, [value]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  return useContext(ThemeContext);
}

/**
 * Themed StyleSheet factory. Styles are built once per palette and cached,
 * so switching light/dark re-renders with no layout cost.
 *
 *   const useStyles = makeStyles((c) => StyleSheet.create({ box: { backgroundColor: c.surface } }));
 *   const styles = useStyles();
 */
export function makeStyles<T>(factory: (c: Palette) => T) {
  const cache = new Map<Palette, T>();
  return function useStyles(): T {
    const { c } = useTheme();
    let s = cache.get(c);
    if (!s) {
      s = factory(c);
      cache.set(c, s);
    }
    return s;
  };
}
