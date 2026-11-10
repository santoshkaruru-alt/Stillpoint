import { NativeTabs } from 'expo-router/native-tabs';

import { useTheme } from '@/theme';

/** Native iOS tab bar. The web build uses AppTabs.web.tsx. */
export function AppTabs() {
  const { c } = useTheme();
  return (
    <NativeTabs
      tintColor={c.calm}
      iconColor={{ default: c.textFaint, selected: c.calm }}
      labelStyle={{ default: { color: c.textFaint }, selected: { color: c.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="meditate">
        <NativeTabs.Trigger.Label>Meditate</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'sparkles', selected: 'sparkles' }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="breathe">
        <NativeTabs.Trigger.Label>Breathe</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'wind', selected: 'wind' }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="journal">
        <NativeTabs.Trigger.Label>Journal</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'book', selected: 'book.fill' }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'gearshape', selected: 'gearshape.fill' }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
