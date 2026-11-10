import { CormorantGaramond_300Light } from '@expo-google-fonts/cormorant-garamond/300Light';
import { CormorantGaramond_400Regular } from '@expo-google-fonts/cormorant-garamond/400Regular';
import { CormorantGaramond_400Regular_Italic } from '@expo-google-fonts/cormorant-garamond/400Regular_Italic';
import { CormorantGaramond_500Medium } from '@expo-google-fonts/cormorant-garamond/500Medium';
import { Manrope_400Regular } from '@expo-google-fonts/manrope/400Regular';
import { Manrope_500Medium } from '@expo-google-fonts/manrope/500Medium';
import { Manrope_600SemiBold } from '@expo-google-fonts/manrope/600SemiBold';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { View } from 'react-native';

import { setupPlatform } from '@/lib/platformSetup';
import { configureNotifications } from '@/services/notifications';
import { useSettings } from '@/store/settings';
import { ThemeProvider, useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync();
configureNotifications();
setupPlatform();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    CormorantGaramond_300Light,
    CormorantGaramond_400Regular,
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_500Medium,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
  });
  const ready = fontsLoaded || !!fontError;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  return (
    <ThemeProvider>
      <AppStack ready={ready} />
    </ThemeProvider>
  );
}

function AppStack({ ready }: { ready: boolean }) {
  const { c, isDark } = useTheme();
  const acknowledged = useSettings((s) => s.safetyAcknowledgedAt !== null);

  const navTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: { ...base.colors, background: c.bg, card: c.bg, primary: c.calm, text: c.text, border: c.line },
    };
  }, [c, isDark]);

  // Hold a plain page in the theme colour until the fonts are in, so text
  // never flashes in a fallback face.
  if (!ready) return <View style={{ flex: 1, backgroundColor: c.bg }} />;

  return (
    <NavThemeProvider value={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
        <Stack.Protected guard={acknowledged}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="session/[length]" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
          <Stack.Screen name="session/complete" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
          <Stack.Screen name="breath/[pattern]" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
          <Stack.Screen name="timer/[minutes]" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
          <Stack.Screen name="breath/builder" options={{ presentation: 'modal' }} />
          <Stack.Screen name="breath/safety" options={{ presentation: 'modal' }} />
          <Stack.Screen name="intention" options={{ presentation: 'modal' }} />
          <Stack.Screen name="journal/new" options={{ presentation: 'modal' }} />
          <Stack.Screen name="safety" options={{ presentation: 'modal' }} />
        </Stack.Protected>
        <Stack.Protected guard={!acknowledged}>
          <Stack.Screen name="welcome" options={{ gestureEnabled: false }} />
        </Stack.Protected>
      </Stack>
    </NavThemeProvider>
  );
}
