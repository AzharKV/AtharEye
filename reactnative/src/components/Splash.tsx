// JS splash — matches the OS native splash (icon centred on navy), then fades out after ~1.7s
// with the wordmark + tagline below (absolutely positioned so the icon never shifts). Ported 1:1.
import { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { T } from '../theme';
import { fill } from '../lib/ui';
import { Mark, Wordmark } from './Brand';

export function Splash({ onDone }: { onDone: () => void }) {
  const op = useSharedValue(1);
  useEffect(() => {
    const t1 = setTimeout(() => {
      op.value = withTiming(0, { duration: 300 });
    }, 1400);
    const t2 = setTimeout(onDone, 1720);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone, op]);
  const style = useAnimatedStyle(() => ({ opacity: op.value }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[fill, { backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center', zIndex: 999 }, style]}
    >
      <Mark size={112} />
      <Animated.View
        entering={FadeIn.delay(160).duration(450)}
        style={{ position: 'absolute', top: '50%', left: 0, right: 0, marginTop: 76, alignItems: 'center' }}
      >
        <Wordmark size={28} />
        <Text style={{ fontSize: 13, color: T.muted, fontWeight: '600', letterSpacing: 0.6, marginTop: 6 }}>
          See progress · Prove progress
        </Text>
      </Animated.View>
    </Animated.View>
  );
}
