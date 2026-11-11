import { Tabs } from 'expo-router';
import type { SFSymbol } from 'expo-symbols';

import { fonts, useTheme } from '@/theme';

import { Icon } from './Icon';
import { useAppInsets } from './SafeArea';

const tabs: { name: string; title: string; icon: SFSymbol }[] = [
  { name: 'index', title: 'Home', icon: 'house' },
  { name: 'meditate', title: 'Meditate', icon: 'sparkles' },
  { name: 'breathe', title: 'Breathe', icon: 'wind' },
  { name: 'journal', title: 'Journal', icon: 'book' },
  { name: 'settings', title: 'Settings', icon: 'gearshape' },
];

/** Bottom tab bar for the web app (the native app uses system tabs). */
export function AppTabs() {
  const insets = useAppInsets();
  const { c } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.calm,
        tabBarInactiveTintColor: c.textFaint,
        tabBarStyle: {
          backgroundColor: c.tabBar,
          borderTopColor: c.line,
          elevation: 0,
          shadowOpacity: 0,
          height: 70 + insets.bottom,
          paddingTop: 4,
          paddingBottom: 6 + insets.bottom,
        },
        tabBarLabelStyle: { fontSize: 11, lineHeight: 16, fontFamily: fonts.sansMedium, letterSpacing: 0.4 },
        sceneStyle: { backgroundColor: c.bg },
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
