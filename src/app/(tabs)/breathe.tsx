import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';

export default function BreatheTab() {
  return (
    <Screen accent="teal">
      <AppText variant="display" accessibilityRole="header" style={{ paddingTop: 32 }}>
        Breathe
      </AppText>
      <AppText tone="muted">Coming in the next milestone.</AppText>
    </Screen>
  );
}
