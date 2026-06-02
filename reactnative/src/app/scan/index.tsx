// Scan step 1 — project picker (when scan launched from the tab bar). Picks a non-Complete project,
// then replaces into the guidance step. Close dismisses the whole scan modal.
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { T } from '@/theme';
import { haptic } from '@/lib/haptic';
import { useAppStore } from '@/store/AppStore';
import { Icon } from '@/components/Icon';
import { Mark, Wordmark } from '@/components/Brand';
import { BlueprintTile } from '@/components/primitives';
import type { Project } from '@/types';

export default function ScanSelect() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { projects } = useAppStore();
  const list = projects.filter((p) => p.status !== 'Complete');

  const close = () => router.back();
  const pick = (p: Project) => {
    haptic();
    router.replace('/scan/guidance?projectId=' + p.id);
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <View style={{ paddingTop: insets.top + 14, paddingHorizontal: 18, paddingBottom: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Pressable
          onPress={close}
          accessibilityLabel="Close"
          style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: T.hairline, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon name="close" size={20} color={T.text} />
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Mark size={26} />
          <Wordmark size={16} />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 4 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: T.accent, letterSpacing: 0.4, textTransform: 'uppercase' }}>New scan</Text>
        <Text style={{ fontSize: 26, fontWeight: '800', letterSpacing: -0.5, marginTop: 5, color: T.text }}>Select a project</Text>
        <Text style={{ fontSize: 14, color: T.muted, marginTop: 6 }}>Which site are you scanning today?</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: insets.bottom + 24, gap: 10 }}
      >
        {list.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => pick(p)}
            style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.hairline, borderRadius: 16, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 13 }}
          >
            <BlueprintTile type={p.type} w={46} h={46} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={{ fontSize: 15.5, fontWeight: '700', color: T.text }}>{p.name}</Text>
              <Text style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>{p.location} · {p.type}</Text>
            </View>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '800', color: T.accent }}>
                {p.pct}
                <Text style={{ fontSize: 11, color: T.muted }}>%</Text>
              </Text>
            </View>
            <Icon name="chevron" size={16} color="rgba(255,255,255,0.25)" />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
