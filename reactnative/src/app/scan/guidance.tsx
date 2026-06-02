// Scan step 2 — guidance / pre-scan checklist. Start replaces into the active scan. Close dismisses.
import { Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { T, MONO } from '@/theme';
import { bimFor } from '@/data';
import { useProject } from '@/store/AppStore';
import { Icon } from '@/components/Icon';
import type { IconName } from '@/components/Icon';
import { Mark, Wordmark } from '@/components/Brand';
import { Button } from '@/components/primitives';
import { CameraBG } from '@/components/CameraBG';

const CHECKLIST: [IconName, string, string][] = [
  ['sun', 'Good lighting', 'Bright, even light reads best'],
  ['bolt', 'Move slowly', 'Steady pace, no fast turns'],
  ['grid', 'Capture all areas', 'Corners, ceilings, floors'],
  ['target', 'Keep stable', 'Hold ~1.5 m from surfaces'],
];

export default function ScanGuidance() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const p = useProject(projectId);
  if (!p) return null;

  const close = () => router.back();
  const start = () => router.replace('/scan/active?projectId=' + p.id);

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <View style={{ paddingTop: insets.top + 14, paddingHorizontal: 18, paddingBottom: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Pressable onPress={close} accessibilityLabel="Close" style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: T.hairline, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="close" size={20} color={T.text} />
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Mark size={26} />
          <Wordmark size={16} />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: T.accent, letterSpacing: 0.4, textTransform: 'uppercase' }}>New scan</Text>
        <Text style={{ fontSize: 28, fontWeight: '800', letterSpacing: -0.6, marginTop: 6, lineHeight: 31, color: T.text }}>{p.name}</Text>
        <Text style={{ fontSize: 14.5, color: T.muted, marginTop: 8, lineHeight: 22 }}>
          Walk the space with your iPhone to capture a LiDAR point cloud. We’ll align it to the BIM model and compute coverage.
        </Text>

        {/* BIM reference */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: 16, backgroundColor: T.surface, borderWidth: 1, borderColor: T.hairline, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14 }}>
          <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(20,184,192,0.12)', borderWidth: 1, borderColor: T.accent + '33', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="cube" size={20} color={T.accent} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: 11.5, color: T.muted, fontWeight: '600', letterSpacing: 0.3 }}>COMPARING AGAINST</Text>
            <Text numberOfLines={1} style={{ fontSize: 14.5, fontWeight: '700', fontFamily: MONO, marginTop: 2, color: T.text }}>{bimFor(p.id).file}</Text>
          </View>
          <Icon name="check" size={18} color={T.accent} stroke={3} />
        </View>

        {/* viewport illustration */}
        <View style={{ height: 180, borderRadius: 18, overflow: 'hidden', marginVertical: 22, borderWidth: 1, borderColor: T.hairline }}>
          <CameraBG />
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <Icon name="scan" size={40} color={T.accent2} stroke={1.8} />
            <Text style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)', fontFamily: MONO }}>LiDAR · {p.area} m² to cover</Text>
          </View>
        </View>

        <Text style={{ fontSize: 13, fontWeight: '700', color: T.muted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 10 }}>Before you start</Text>
        <View style={{ gap: 10 }}>
          {CHECKLIST.map(([ic, t, s]) => (
            <View key={t} style={{ flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: T.surface, borderWidth: 1, borderColor: T.hairline, borderRadius: 14, padding: 13 }}>
              <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: 'rgba(20,184,192,0.12)', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={ic} size={20} color={T.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: T.text }}>{t}</Text>
                <Text style={{ fontSize: 12.5, color: T.muted, marginTop: 1 }}>{s}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <LinearGradient colors={['transparent', T.bg]} style={{ paddingHorizontal: 24, paddingTop: 14, paddingBottom: Math.max(24, insets.bottom) }}>
        <Button primary icon="scan" onPress={start} style={{ width: '100%' }}>
          Start scan
        </Button>
      </LinearGradient>
    </View>
  );
}
