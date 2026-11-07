import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SFSymbol } from 'expo-symbols';

import { colors } from '@/theme';

import { Icon } from './Icon';

const tabs: { name: string; title: string; icon: SFSymbol }[] = [
  { name: 'index', title: 'Home', icon: 'house' },
  { name: 'meditate', title: 'Meditate', icon: 'sparkles' },
  { name: 'breathe', title: 'Breathe', icon: 'wind' },
  { name: 'journal', title: 'Journal', icon: 'book' },
  { name: 'settings', title: 'Settings', icon: 'gearshape' },
];

/** Bottom tab bar for the web app (the native app uses system tabs). */
export function AppTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.violet,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          backgroundColor: 'rgba(10, 10, 32, 0.96)',
          borderTopColor: colors.border,
          height: 70 + insets.bottom,
          paddingTop: 4,
          paddingBottom: 6 + insets.bottom,
        },
        tabBarLabelStyle: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
        sceneStyle: { backgroundColor: colors.bg },
      }}>
      {tabs.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{ title: t.title, tabBarIcon: ({ color }) => <Icon name={t.icon} size={22} color={String(color)} /> }}
        />
      ))}
    </Tabs>
  );
}
