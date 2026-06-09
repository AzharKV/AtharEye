// Screen — scroll wrapper for list/detail screens (RN port of the PWA's <Screen>). Hidden
// scroll bars, navy bg, safe-area top padding by default, bottom padding clears the tab bar.
import { forwardRef } from 'react';
import { ScrollView } from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';
import { T } from '../theme';

export const Screen = forwardRef<ScrollView, {
  children: ReactNode;
  /** Top padding. Default = safe-area-top + 14 (list screens). Detail screens pass a number. */
  padTop?: number;
  padBottom?: number;
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}>(function Screen({ children, padTop, padBottom = 100, onScroll, style, contentStyle }, ref) {
  const insets = useSafeAreaInsets();
  const pt = padTop === undefined ? insets.top + 14 : padTop;
  return (
    <ScrollView
      ref={ref}
      onScroll={onScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      style={[{ flex: 1, backgroundColor: T.bg }, style]}
      contentContainerStyle={[{ paddingTop: pt, paddingBottom: padBottom }, contentStyle]}
    >
      {children}
    </ScrollView>
  );
});
