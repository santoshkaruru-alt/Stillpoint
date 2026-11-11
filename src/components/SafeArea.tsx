import { useEffect, useState, type ReactNode } from 'react';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets, type Edge, type EdgeInsets } from 'react-native-safe-area-context';

type LayoutCheck = { top?: number };

/** In a home-screen web app on iPhone, the status bar always covers the top. */
function standaloneTopMin(): number {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return 0;
  const check = (window as Window & { __layoutCheck?: LayoutCheck }).__layoutCheck;
  return check?.top ?? 0;
}

/**
 * Safe-area insets that can be trusted. Some iPhones report a top inset of
 * 0 for home-screen web apps while drawing the page under an opaque status
 * bar, which hid the first line of every screen. On the web we take the
 * larger of the reported inset and the status-bar height measured at
 * launch (see scripts/build-web.mjs).
 */
export function useAppInsets(): EdgeInsets {
  const insets = useSafeAreaInsets();
  const [minTop, setMinTop] = useState(standaloneTopMin);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const update = () => setMinTop(standaloneTopMin());
    const timers = [400, 1200, 2800].map((t) => setTimeout(update, t));
    window.addEventListener('resize', update);
    window.addEventListener('pageshow', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', update);
      window.removeEventListener('pageshow', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  return { ...insets, top: Math.max(insets.top, minTop) };
}

/** Drop-in for SafeAreaView that uses useAppInsets(). */
export function SafeAreaView({
  edges = ['top', 'right', 'bottom', 'left'],
  style,
  children,
}: {
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  const i = useAppInsets();
  return (
    <View
      style={[
        style,
        {
          paddingTop: edges.includes('top') ? i.top : undefined,
          paddingBottom: edges.includes('bottom') ? i.bottom : undefined,
          paddingLeft: edges.includes('left') ? i.left : undefined,
          paddingRight: edges.includes('right') ? i.right : undefined,
        },
      ]}>
      {children}
    </View>
  );
}
