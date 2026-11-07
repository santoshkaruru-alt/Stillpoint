import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';

export default function JournalTab() {
  return (
    <Screen accent="amber">
      <AppText variant="display" accessibilityRole="header" style={{ paddingTop: 32 }}>
        Journal
      </AppText>
      <AppText tone="muted">Coming in the next milestone.</AppText>
    </Screen>
  );
}
