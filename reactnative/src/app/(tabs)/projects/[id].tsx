// Project detail — banner hero, coverage summary, BIM model, coverage-by-area, team + CTAs.
// RN port of the PWA's ProjectDetail. Floating back header gains a translucent blurred bg on scroll.
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { T, MONO } from '@/theme';
import type { BimModel } from '@/types';
import { bimFor } from '@/data';
import { haptic } from '@/lib/haptic';
import { teamName } from '@/lib/format';
import { fill } from '@/lib/ui';
import { useCountUp } from '@/hooks/useCountUp';
import { useAppStore, useProject } from '@/store/AppStore';
import { Icon } from '@/components/Icon';
import type { IconName } from '@/components/Icon';
import {
  Ring,
  Bar,
  StatusBadge,
  BannerBlueprint,
  Avatar,
  Button,
  Card,
  SectionLabel,
} from '@/components/primitives';
import { Screen } from '@/components/Screen';
import { Toast } from '@/components/ShareSheet';
import { BimUploadSheet } from '@/components/BimUploadSheet';

export default function ProjectDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const p = useProject(id);
  const { deleteProject } = useAppStore();

  const [scrolled, setScrolled] = useState(false);
  const [bim, setBim] = useState<BimModel>(() => (p?.bim || bimFor(id || '')));
  const [bimSheet, setBimSheet] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const pct = useCountUp(p?.pct ?? 0, 900);

  if (!p) return null;
  const open = p.issues.length;
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => setScrolled(e.nativeEvent.contentOffset.y > 96);

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      {/* floating back header that gains a bg on scroll */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          paddingTop: insets.top + 12,
          paddingHorizontal: 14,
          paddingBottom: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: scrolled ? 'rgba(12,15,18,0.8)' : 'transparent',
          borderBottomWidth: scrolled ? 1 : 0,
          borderBottomColor: T.hairline,
        }}
      >
        {scrolled ? <BlurView intensity={18} tint="dark" style={fill} /> : null}
        <Pressable
          accessibilityLabel="Back"
          onPress={() => {
            haptic();
            router.back();
          }}
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: T.hairline,
            backgroundColor: 'rgba(8,12,16,0.55)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="chevronL" size={20} color={T.text} />
        </Pressable>
        <Text numberOfLines={1} style={{ flex: 1, fontSize: 16, fontWeight: '700', textAlign: 'center', color: T.text, opacity: scrolled ? 1 : 0 }}>
          {p.name}
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <Screen padTop={0} onScroll={onScroll}>
        {/* banner */}
        <View style={{ height: 184 }}>
          <BannerBlueprint type={p.type} />
          <LinearGradient
            colors={['#0C0F12', 'rgba(12,15,18,0.1)', 'rgba(12,15,18,0.1)']}
            locations={[0.06, 0.7, 1]}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={fill}
          />
          <View style={{ position: 'absolute', left: 20, right: 20, bottom: 14 }}>
            <View style={{ marginBottom: 9 }}>
              <StatusBadge status={p.status} small />
            </View>
            <Text style={{ fontSize: 25, fontWeight: '800', letterSpacing: -0.6, lineHeight: 28, color: T.text }}>{p.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 }}>
              <Icon name="pin" size={14} color={T.muted} />
              <Text style={{ fontSize: 13.5, color: T.muted }}>
                {p.location} · {p.type}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ paddingTop: 8, paddingHorizontal: 20, paddingBottom: 8, gap: 16 }}>
          {/* progress summary */}
          <Card style={{ padding: 18, flexDirection: 'row', alignItems: 'center', gap: 18 }}>
            <Ring value={pct} size={92} stroke={9} accent label="COVERED" />
            <View style={{ flex: 1, gap: 12 }}>
              {(
                [
                  ['scans', p.scans, 'scans'],
                  ['area', `${p.area}`, 'm² floor area'],
                  ['alert', open, open === 1 ? 'open issue' : 'open issues'],
                ] as [IconName, string | number, string][]
              ).map(([ic, n, l]) => (
                <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Icon name={ic} size={18} color={ic === 'alert' && open ? T.danger : T.muted} />
                  <Text style={{ fontSize: 16, fontWeight: '800', color: ic === 'alert' && open ? T.danger : T.text }}>{n}</Text>
                  <Text style={{ fontSize: 13.5, color: T.muted }}>{l}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* BIM model — the reference the scan is compared against */}
          <View>
            <SectionLabel
              right={
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Icon name="check" size={13} color={T.accent} stroke={3} />
                  <Text style={{ fontSize: 12, color: T.accent, fontWeight: '700' }}>Aligned</Text>
                </View>
              }
            >
              BIM model
            </SectionLabel>
            <Card style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 13 }}>
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  backgroundColor: 'rgba(20,184,192,0.12)',
                  borderWidth: 1,
                  borderColor: T.accent + '33',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="cube" size={24} color={T.accent} stroke={1.9} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: '700', fontFamily: MONO, color: T.text }}>
                  {bim.file}
                </Text>
                <Text style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>
                  {bim.ver} · {bim.size} · {bim.elements} elements
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  haptic();
                  setBimSheet(true);
                }}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 13,
                  borderRadius: 11,
                  borderWidth: 1,
                  borderColor: T.hairline,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                }}
              >
                <Text style={{ fontSize: 13.5, fontWeight: '700', color: T.text }}>Replace</Text>
              </Pressable>
            </Card>
            <Text style={{ fontSize: 12, color: T.faint, marginTop: 8, marginHorizontal: 4, lineHeight: 17 }}>
              Scans are aligned to this model to compute coverage. Uploaded {bim.uploaded}.
            </Text>
          </View>

          {/* coverage by area */}
          <View>
            <SectionLabel>Coverage by area</SectionLabel>
            {p.rooms.length === 0 ? (
              <Card style={{ paddingVertical: 26, paddingHorizontal: 18, alignItems: 'center', gap: 10 }}>
                <Icon name="scan" size={28} color={T.accent} stroke={1.8} />
                <Text style={{ fontSize: 15, fontWeight: '700', color: T.text }}>No scans yet</Text>
                <Text style={{ fontSize: 13, color: T.muted, maxWidth: 240, lineHeight: 19, textAlign: 'center' }}>
                  Run your first scan to measure coverage against the BIM model.
                </Text>
              </Card>
            ) : (
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
            )}
          </View>

          {/* team */}
          <View>
            <SectionLabel>Site team</SectionLabel>
            <Card style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ flexDirection: 'row' }}>
                {p.team.map((t, i) => (
                  <View key={t} style={{ marginLeft: i ? -10 : 0 }}>
                    <Avatar initials={t} size={36} ring />
                  </View>
                ))}
              </View>
              <Text style={{ flex: 1, fontSize: 13.5, color: T.muted }}>
                {p.team.map(teamName).slice(0, 2).join(', ')}
                {p.team.length > 2 ? ` +${p.team.length - 2}` : ''}
              </Text>
              <Text style={{ fontSize: 12.5, color: T.faint }}>{p.last}</Text>
            </Card>
          </View>

          {/* CTAs */}
          <View style={{ gap: 10, marginTop: 2 }}>
            <Button primary icon="scan" onPress={() => router.push('/scan/guidance?projectId=' + p.id)}>
              New scan
            </Button>
            <Button icon="reports" onPress={() => router.push('/reports/' + p.id)}>
              View latest report
            </Button>
            <Pressable
              onPress={() => {
                haptic();
                setConfirmDel(true);
              }}
              style={{
                height: 48,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: T.danger + '33',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 4,
              }}
            >
              <Icon name="trash" size={18} color={T.danger} />
              <Text style={{ fontSize: 15.5, fontWeight: '700', color: T.danger }}>Delete project</Text>
            </Pressable>
          </View>
        </View>
      </Screen>

      <BimUploadSheet
        open={bimSheet}
        onClose={() => setBimSheet(false)}
        onConnected={(f) => {
          setBim((b) => ({ ...b, file: f.file, size: f.size, ver: f.ver, uploaded: 'Just now', elements: f.elements }));
          setBimSheet(false);
          setToast('BIM model connected · re-aligned');
        }}
      />
      <Toast msg={toast} onDone={() => setToast(null)} />
      <DeleteConfirm
        open={confirmDel}
        name={p.name}
        onCancel={() => setConfirmDel(false)}
        onDelete={() => {
          deleteProject(p.id);
          router.back();
        }}
      />
    </View>
  );
}

// ── Destructive confirm (iOS action sheet) for deleting a project
function DeleteConfirm({
  open,
  name,
  onCancel,
  onDelete,
}: {
  open: boolean;
  name: string;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={open} transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      <View style={[fill, { justifyContent: 'flex-end' }]}>
        <Pressable style={[fill, { backgroundColor: 'rgba(0,0,0,0.55)' }]} onPress={onCancel} />
        <Animated.View
          entering={SlideInDown.duration(340)}
          style={{ paddingHorizontal: 10, paddingBottom: Math.max(10, insets.bottom) }}
        >
          <View style={{ backgroundColor: '#1C232A', borderRadius: 16, overflow: 'hidden', marginBottom: 8, borderWidth: 1, borderColor: T.hairline }}>
            <View style={{ paddingTop: 18, paddingHorizontal: 16, paddingBottom: 14, alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: T.text }}>Delete project?</Text>
              <Text style={{ fontSize: 13, color: T.muted, marginTop: 5, lineHeight: 19, textAlign: 'center' }}>
                “{name}” and its reports will be removed. This can’t be undone.
              </Text>
            </View>
            <Pressable
              onPress={() => {
                haptic();
                onDelete();
              }}
              style={{ height: 54, borderTopWidth: 1, borderTopColor: T.hairline, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: T.danger, fontSize: 17, fontWeight: '700' }}>Delete project</Text>
            </Pressable>
          </View>
          <Pressable
            onPress={() => {
              haptic();
              onCancel();
            }}
            style={{ height: 54, borderRadius: 16, borderWidth: 1, borderColor: T.hairline, backgroundColor: '#1C232A', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: T.accent, fontSize: 17, fontWeight: '700' }}>Cancel</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}
