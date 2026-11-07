import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';

export default function SettingsTab() {
  return (
    <Screen accent="violet">
      <AppText variant="display" accessibilityRole="header" style={{ paddingTop: 32 }}>
        Settings
      </AppText>
      <AppText tone="muted">Coming in the next milestone.</AppText>
    </Screen>
  );
}
