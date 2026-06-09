// Scan step 5 — result. Count-up donut + stats; CTAs view-report / share / done. View report closes
// the scan modal and opens the report; done dismisses back to where the scan was launched.
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { T } from '@/theme';
import { DATA } from '@/data';
import { roundM } from '@/lib/format';
import { useCountUp } from '@/hooks/useCountUp';
import { useProject } from '@/store/AppStore';
import { Icon } from '@/components/Icon';
import { Button, Card, Donut } from '@/components/primitives';
import { ShareSheet, Toast } from '@/components/ShareSheet';

export default function ScanResult() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const p = useProject(projectId);
  const [ready, setReady] = useState(false);
  const [share, setShare] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const pct = useCountUp(p?.pct ?? 0, 1200, ready);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 260);
    return () => clearTimeout(t);
  }, []);
  if (!p) return null;

  const cov = roundM(p.area, p.pct);
  const miss = p.area - cov;
  const close = () => router.back();
  const viewReport = () => {
    router.back();
    router.push('/reports/' + p.id);
  };
  const rows: [string, string, string][] = [
    ['Covered area', `${cov} m²`, T.accent],
    ['Missing / unscanned', `${miss} m²`, T.danger],
    ['Points captured', DATA.scanStats.points, T.text],
    ['Alignment accuracy', DATA.scanStats.alignment, T.text],
  ];

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 40, paddingHorizontal: 24, paddingBottom: insets.bottom + 28 }}>
        <View style={{ alignItems: 'center' }}>
          <View style={{ width: 52, height: 52, borderRadius: 52, backgroundColor: 'rgba(20,184,192,0.15)', borderWidth: 1, borderColor: T.accent + '55', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Icon name="check" size={26} color={T.accent} stroke={3} />
          </View>
          <Text style={{ fontSize: 24, fontWeight: '800', letterSpacing: -0.5, color: T.text }}>Scan complete</Text>
          <Text style={{ fontSize: 14, color: T.muted, marginTop: 4 }}>{p.name}</Text>
        </View>

        <View style={{ alignItems: 'center', marginTop: 30, marginBottom: 24 }}>
          <Donut value={pct} size={208} stroke={19} />
        </View>

        <Card style={{ padding: 16 }}>
          {rows.map((r, i) => (
            <View key={r[0]} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, borderBottomWidth: i < rows.length - 1 ? 1 : 0, borderBottomColor: T.hairline2 }}>
              <Text style={{ fontSize: 14.5, color: T.muted }}>{r[0]}</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: r[2] }}>{r[1]}</Text>
            </View>
          ))}
        </Card>

        <View style={{ flex: 1, minHeight: 24 }} />

        <View style={{ gap: 10, marginTop: 28 }}>
          <Button primary icon="reports" onPress={viewReport}>
            View full report
          </Button>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button icon="share" full onPress={() => setShare(true)}>
              Share now
            </Button>
            <Button full onPress={close}>
              Done
            </Button>
          </View>
        </View>
      </ScrollView>

      <ShareSheet open={share} projectName={p.name} onClose={() => setShare(false)} onShared={(m) => { setShare(false); setToast(m); }} />
      <Toast msg={toast} onDone={() => setToast(null)} />
    </View>
  );
}
