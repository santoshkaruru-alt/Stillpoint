import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { setupPlatform } from '@/lib/platformSetup';
import { configureNotifications } from '@/services/notifications';
import { useSettings } from '@/store/settings';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();
configureNotifications();
setupPlatform();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bg,
    primary: colors.violet,
    text: colors.text,
    border: colors.border,
  },
};

export default function RootLayout() {
  const acknowledged = useSettings((s) => s.safetyAcknowledgedAt !== null);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Protected guard={acknowledged}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="session/[length]" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
          <Stack.Screen name="session/complete" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
          <Stack.Screen name="breath/[pattern]" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
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
    </ThemeProvider>
  );
}
