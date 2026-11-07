import { NativeTabs } from 'expo-router/native-tabs';

import { colors } from '@/theme';

/** Native iOS tab bar. The web build uses AppTabs.web.tsx. */
export function AppTabs() {
  return (
    <NativeTabs
      tintColor={colors.violet}
      iconColor={{ default: colors.textFaint, selected: colors.violet }}
      labelStyle={{ default: { color: colors.textFaint }, selected: { color: colors.text } }}>
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
