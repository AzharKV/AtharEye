// Skeleton.tsx — app-shell skeleton loaders so lists never show a blank flash. The sheen is a
// Reanimated translateX gradient overlay (GPU thread). Shapes mirror the real project/report cards.
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import type { DimensionValue, StyleProp, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { T } from '../theme';

export function SkeletonBlock({
  w = '100%',
  h = 14,
  radius = 7,
  style,
}: {
  w?: DimensionValue;
  h?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const [bw, setBw] = useState(0);
  const tx = useSharedValue(0);
  useEffect(() => {
    tx.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }), -1, false);
  }, [tx]);
  const sheen = useAnimatedStyle(() => ({ transform: [{ translateX: -bw + tx.value * 2 * bw }] }));
  return (
    <View
      onLayout={(e) => setBw(e.nativeEvent.layout.width)}
      style={[{ width: w, height: h, borderRadius: radius, backgroundColor: T.surface2, overflow: 'hidden' }, style]}
    >
      {bw > 0 ? (
        <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, width: bw }, sheen]}>
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.06)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}

// One project/report list-card skeleton (ring/tile + two text lines + badge).
export function SkeletonCard() {
  return (
    <View
      style={{
        backgroundColor: T.surface,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: T.hairline,
        padding: 14,
        flexDirection: 'row',
        gap: 14,
        alignItems: 'center',
      }}
    >
      <SkeletonBlock w={52} h={52} radius={26} />
      <View style={{ flex: 1, gap: 9 }}>
        <SkeletonBlock w="62%" h={15} />
        <SkeletonBlock w="44%" h={12} />
        <SkeletonBlock w={86} h={18} radius={8} />
      </View>
    </View>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <View style={{ gap: 10, paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 }}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}
