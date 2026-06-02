// Scan step 4 — processing. Stepped checklist (~3s); on completion records the scan (onScanComplete)
// and replaces into the result. Spinner is a Reanimated rotation (no per-frame React).
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { T } from '@/theme';
import { haptic } from '@/lib/haptic';
import { fill } from '@/lib/ui';
import { useProject, useAppStore } from '@/store/AppStore';
import { Icon } from '@/components/Icon';
import { Mark } from '@/components/Brand';

const STEPS = ['Reconstructing geometry', 'Aligning with BIM model', 'Computing coverage', 'Detecting missing areas'];

export default function ScanProcessing() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const p = useProject(projectId);
  const { onScanComplete } = useAppStore();
  const [done, setDone] = useState(0);

  const rot = useSharedValue(0);
  useEffect(() => {
    rot.value = withRepeat(withTiming(360, { duration: 1000, easing: Easing.linear }), -1, false);
  }, [rot]);
  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value}deg` }] }));

  useEffect(() => {
    if (done >= STEPS.length) {
      const t = setTimeout(() => {
        if (p) onScanComplete(p);
        router.replace('/scan/result?projectId=' + (p?.id ?? ''));
      }, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(
      () => {
        haptic();
        setDone((d) => d + 1);
      },
      done === 0 ? 600 : 750,
    );
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  return (
    <View style={{ flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
      <View style={{ width: 84, height: 84, marginBottom: 36 }}>
        <Animated.View style={[{ width: 84, height: 84 }, spin]}>
          <Svg width={84} height={84}>
            <Circle cx={42} cy={42} r={36} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={5} />
            <Circle cx={42} cy={42} r={36} fill="none" stroke={T.accent} strokeWidth={5} strokeLinecap="round" strokeDasharray="60 200" />
          </Svg>
        </Animated.View>
        <View style={[fill, { alignItems: 'center', justifyContent: 'center' }]}>
          <Mark size={40} />
        </View>
      </View>

      <Text style={{ fontSize: 20, fontWeight: '800', marginBottom: 4, color: T.text }}>Processing scan</Text>
      <Text style={{ fontSize: 13.5, color: T.muted, marginBottom: 28 }}>Computing coverage against the BIM model</Text>

      <View style={{ width: '100%', maxWidth: 320, gap: 4 }}>
        {STEPS.map((s, i) => {
          const isDone = i < done;
          const active = i === done;
          return (
            <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 4, opacity: isDone || active ? 1 : 0.35 }}>
              <View style={{ width: 24, height: 24, borderRadius: 24, backgroundColor: isDone ? T.accent : 'transparent', borderWidth: isDone ? 0 : 2, borderColor: active ? T.accent : T.faint, alignItems: 'center', justifyContent: 'center' }}>
                {isDone ? <Icon name="check" size={13} color={T.onAccent} stroke={3.4} /> : active ? <View style={{ width: 8, height: 8, borderRadius: 8, backgroundColor: T.accent }} /> : null}
              </View>
              <Text style={{ fontSize: 15, fontWeight: '600', color: isDone || active ? T.text : T.muted }}>{s}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
