// Report detail — the hero report screen (RN port of pwa ReportDetail). Branded sticky
// translucent header, count-up coverage donut, iso massing, meta table, coverage-by-room,
// open issues, and Share/PDF CTAs. Reads the project by route id from the live store.
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SEV, T } from '@/theme';
import type { Severity } from '@/types';
import { DATA, planFor, bimFor } from '@/data';
import { roundM } from '@/lib/format';
import { fill } from '@/lib/ui';
import { useCountUp } from '@/hooks/useCountUp';
import { useProject } from '@/store/AppStore';
import { Icon } from '@/components/Icon';
import { Mark, Wordmark } from '@/components/Brand';
import { Donut, Bar, StatusBadge, BlueprintTile, Button, Card, SectionLabel } from '@/components/primitives';
import { Screen } from '@/components/Screen';
import { IsoMassing, isoFills } from '@/components/IsoMassing';
import { ShareSheet, Toast } from '@/components/ShareSheet';

const SEV_LABEL: Record<Severity, string> = { high: 'High', med: 'Med', low: 'Low' };

export default function ReportDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const p = useProject(id);

  const [ready, setReady] = useState(false);
  const [share, setShare] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const pct = useCountUp(p ? p.pct : 0, 1100, ready);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 440);
    return () => clearTimeout(t);
  }, []);

  if (!p) return null;
  const cov = roundM(p.area, p.pct);
  const miss = p.area - cov;

  return (
    <View style={{ flex: 1 }}>
      {/* branded sticky header */}
      <BlurView
        intensity={40}
        tint="dark"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          paddingTop: insets.top + 12,
          paddingBottom: 12,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(12,15,18,0.82)',
          borderBottomWidth: 1,
          borderBottomColor: T.hairline,
        }}
      >
        <Pressable
          accessibilityLabel="Back"
          onPress={() => router.back()}
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: T.hairline,
            backgroundColor: 'rgba(255,255,255,0.06)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="chevronL" size={20} color={T.text} />
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
          <Mark size={26} />
          <Wordmark size={16} sub="PROGRESS REPORT" />
        </View>
        <View style={{ width: 38 }} />
      </BlurView>

      <Screen padTop={92}>
        <View style={{ paddingHorizontal: 20, paddingVertical: 8, gap: 16 }}>
          {/* title row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={{ fontSize: 21, fontWeight: '800', letterSpacing: -0.4, color: T.text }}>
                {p.name}
              </Text>
              <Text style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>Scanned {p.last} · 2 Jun 2026</Text>
            </View>
            <StatusBadge status={p.status} />
          </View>

          {/* hero donut */}
          <Card style={{ paddingTop: 24, paddingHorizontal: 18, paddingBottom: 18, alignItems: 'center', gap: 18, overflow: 'hidden' }}>
            <LinearGradient colors={[T.surface2, T.surface]} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={fill} />
            <Donut value={pct} size={196} stroke={18} />
            <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
              {(
                [
                  ['Covered', `${cov} m²`, T.accent, `${T.accent}14`],
                  ['Missing', `${miss} m²`, T.danger, `${T.danger}14`],
                ] as [string, string, string, string][]
              ).map(([l, v, c, tint]) => (
                <View
                  key={l}
                  style={{
                    flex: 1,
                    backgroundColor: tint,
                    borderRadius: 13,
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    borderWidth: 1,
                    borderColor: `${c}26`,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 8, backgroundColor: c }} />
                    <Text style={{ fontSize: 12, color: T.muted, fontWeight: '600' }}>{l}</Text>
                  </View>
                  <Text style={{ fontSize: 20, fontWeight: '800', marginTop: 5, color: c }}>{v}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* model coverage — iso massing */}
          <View>
            <SectionLabel right={<Text style={{ fontSize: 11.5, color: T.faint }}>BIM vs as-built</Text>}>
              Model coverage
            </SectionLabel>
            <Card style={{ paddingTop: 16, paddingHorizontal: 12, paddingBottom: 12 }}>
              <IsoMassing rooms={planFor(p.id)} fills={isoFills} />
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 18, marginTop: 8 }}>
                {(
                  [
                    ['Built', '#16C2CA'],
                    ['Partial', '#C7D2DC'],
                    ['Missing', T.danger],
                  ] as [string, string][]
                ).map(([l, c]) => (
                  <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 9, height: 9, borderRadius: 3, backgroundColor: c }} />
                    <Text style={{ fontSize: 12, color: T.muted, fontWeight: '600' }}>{l}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </View>

          {/* meta table */}
          <Card style={{ paddingVertical: 4, paddingHorizontal: 16 }}>
            {(
              [
                ['Client', p.client],
                ['Location', p.location],
                ['Floor area', `${p.area} m²`],
                ['BIM model', bimFor(p.id).file],
                ['Scans', `${p.scans}`],
                ['Alignment', DATA.scanStats.alignment],
                ['Points captured', DATA.scanStats.points],
              ] as [string, string][]
            ).map((r, i, a) => (
              <View
                key={r[0]}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 11,
                  borderBottomWidth: i < a.length - 1 ? 1 : 0,
                  borderBottomColor: T.hairline2,
                }}
              >
                <Text style={{ fontSize: 14, color: T.muted, fontWeight: '500' }}>{r[0]}</Text>
                <Text style={{ fontSize: 14, color: T.text, fontWeight: '600', maxWidth: 200, textAlign: 'right' }}>
                  {r[1]}
                </Text>
              </View>
            ))}
          </Card>

          {/* coverage by room */}
          <View>
            <SectionLabel>Coverage by area</SectionLabel>
            <Card style={{ paddingVertical: 4, paddingHorizontal: 16 }}>
              {p.rooms.map((r, i) => {
                const behind = r.pct < 45;
                return (
                  <View
                    key={r.name}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      paddingVertical: 11,
                      borderBottomWidth: i < p.rooms.length - 1 ? 1 : 0,
                      borderBottomColor: T.hairline2,
                    }}
                  >
                    <Text numberOfLines={1} style={{ width: 104, fontSize: 14.5, fontWeight: '600', color: T.text }}>
                      {r.name}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Bar value={r.pct} color={behind ? T.danger : T.bar} />
                    </View>
                    <Text style={{ width: 40, textAlign: 'right', fontSize: 13.5, fontWeight: '700', color: behind ? T.danger : T.text }}>
                      {r.pct}%
                    </Text>
                  </View>
                );
              })}
            </Card>
          </View>

          {/* open issues */}
          <View>
            <SectionLabel
              right={
                p.issues.length ? (
                  <Text style={{ fontSize: 12, color: T.danger, fontWeight: '700' }}>{p.issues.length} open</Text>
                ) : (
                  <Text style={{ fontSize: 12, color: T.accent, fontWeight: '700' }}>None</Text>
                )
              }
            >
              Open issues
            </SectionLabel>
            {p.issues.length === 0 ? (
              <Card style={{ padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
                <Icon name="checkCircle" size={22} color={T.accent} />
                <Text style={{ fontSize: 14, color: T.muted }}>Handover complete — no open issues.</Text>
              </Card>
            ) : (
              <Card style={{ paddingVertical: 4, paddingHorizontal: 14 }}>
                {p.issues.map((it, i) => (
                  <View
                    key={it.t}
                    style={{
                      flexDirection: 'row',
                      gap: 12,
                      paddingVertical: 12,
                      alignItems: 'center',
                      borderBottomWidth: i < p.issues.length - 1 ? 1 : 0,
                      borderBottomColor: T.hairline2,
                    }}
                  >
                    <BlueprintTile type={p.type} w={42} h={42} radius={10} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ fontSize: 14.5, fontWeight: '600', color: T.text }}>{it.t}</Text>
                      <Text style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>{it.loc}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 5,
                        paddingVertical: 4,
                        paddingHorizontal: 9,
                        borderRadius: 8,
                        backgroundColor: `${SEV[it.sev]}1c`,
                      }}
                    >
                      <View style={{ width: 6, height: 6, borderRadius: 6, backgroundColor: SEV[it.sev] }} />
                      <Text style={{ color: SEV[it.sev], fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 }}>
                        {SEV_LABEL[it.sev]}
                      </Text>
                    </View>
                  </View>
                ))}
              </Card>
            )}
          </View>

          {/* CTAs */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 2 }}>
            <Button primary icon="share" full onPress={() => setShare(true)}>
              Share report
            </Button>
            <Button icon="pdf" onPress={() => setToast('Exported as PDF · saved to Files')} style={{ width: 96 }}>
              PDF
            </Button>
          </View>
        </View>
      </Screen>

      <ShareSheet
        open={share}
        projectName={p.name}
        onClose={() => setShare(false)}
        onShared={(m) => {
          setShare(false);
          setToast(m);
        }}
      />
      <Toast msg={toast} onDone={() => setToast(null)} />
    </View>
  );
}
