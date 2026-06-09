// iOS-style share action sheet + auto-hiding Toast. Uses RN Modal (its onRequestClose gives
// Android-back dismissal) with a Reanimated SlideInDown sheet over a tappable scrim.
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { T } from '../theme';
import { haptic } from '../lib/haptic';
import { fill } from '../lib/ui';
import { Icon } from './Icon';
import type { IconName } from './Icon';

interface ShareTarget {
  id: string;
  label: string;
  icon: IconName;
}
interface ReportType {
  id: string;
  label: string;
  sub: string;
  icon: IconName;
}

const SHARE_TARGETS: ShareTarget[] = [
  { id: 'msg', label: 'Messages', icon: 'message' },
  { id: 'mail', label: 'Mail', icon: 'mail' },
  { id: 'wa', label: 'WhatsApp', icon: 'message' },
  { id: 'air', label: 'AirDrop', icon: 'airdrop' },
  { id: 'teams', label: 'Teams', icon: 'team' },
  { id: 'copy', label: 'Copy link', icon: 'copy' },
];
const REPORT_TYPES: ReportType[] = [
  { id: 'client', label: 'Client Progress Summary', sub: 'One-page, visual — for the client', icon: 'reports' },
  { id: 'detailed', label: 'Detailed Site Report', sub: 'Full coverage, rooms & issues', icon: 'layers' },
  { id: 'snapshot', label: 'Coverage Snapshot', sub: 'Just the numbers & donut', icon: 'target' },
  { id: 'issues', label: 'Issues List', sub: 'For the subcontractor', icon: 'alert' },
];

// ── Toast (auto-hides after ~2.2s)
export function Toast({ msg, onDone, icon = 'check' }: { msg: string | null; onDone: () => void; icon?: IconName }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [msg, onDone]);
  if (!msg) return null;
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 40, alignItems: 'center' }} pointerEvents="none">
      <Animated.View
        entering={FadeIn.duration(260)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: 'rgba(28,34,40,0.96)',
          borderWidth: 1,
          borderColor: T.hairline,
          borderRadius: 14,
          paddingVertical: 12,
          paddingHorizontal: 16,
          maxWidth: '86%',
        }}
      >
        <View style={{ width: 22, height: 22, borderRadius: 22, backgroundColor: T.accent, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={14} color={T.onAccent} stroke={3} />
        </View>
        <Text style={{ fontSize: 14, fontWeight: '600', color: T.text }}>{msg}</Text>
      </Animated.View>
    </View>
  );
}

// ── Share sheet
export function ShareSheet({
  open,
  projectName,
  onClose,
  onShared,
}: {
  open: boolean;
  projectName: string;
  onClose: () => void;
  onShared: (msg: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [sel, setSel] = useState('client');
  useEffect(() => {
    if (open) setSel('client');
  }, [open]);

  const typeLabel = REPORT_TYPES.find((t) => t.id === sel)!.label;
  const pick = (tg: ShareTarget) => {
    haptic();
    const msg = tg.id === 'copy' ? 'Report link copied' : `${typeLabel} · sent via ${tg.label}`;
    onShared(msg);
  };

  return (
    <Modal visible={open} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={[fill, { justifyContent: 'flex-end' }]}>
        <Pressable style={[fill, { backgroundColor: 'rgba(0,0,0,0.55)' }]} onPress={onClose} />
        <Animated.View
          entering={SlideInDown.duration(340)}
          style={{
            backgroundColor: '#13181D',
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            borderWidth: 1,
            borderColor: T.hairline,
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: Math.max(30, insets.bottom + 12),
            maxHeight: '88%',
          }}
        >
          <View style={{ width: 40, height: 5, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.18)', alignSelf: 'center', marginBottom: 14 }} />
          <View style={{ alignItems: 'center', marginBottom: 14 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', letterSpacing: -0.3, color: T.text }}>Share report</Text>
            <Text style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>{projectName}</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={sheetLabel}>Report type</Text>
            <View style={{ backgroundColor: '#181E24', borderRadius: 16, borderWidth: 1, borderColor: T.hairline, overflow: 'hidden', marginBottom: 18 }}>
              {REPORT_TYPES.map((rt, i) => {
                const on = sel === rt.id;
                return (
                  <Pressable
                    key={rt.id}
                    onPress={() => {
                      haptic();
                      setSel(rt.id);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      padding: 13,
                      paddingHorizontal: 14,
                      borderBottomWidth: i < REPORT_TYPES.length - 1 ? 1 : 0,
                      borderBottomColor: T.hairline2,
                      backgroundColor: on ? 'rgba(20,184,192,0.08)' : 'transparent',
                    }}
                  >
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 9,
                        backgroundColor: on ? 'rgba(20,184,192,0.16)' : 'rgba(255,255,255,0.05)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon name={rt.icon} size={18} color={on ? T.accent : T.muted} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: T.text }}>{rt.label}</Text>
                      <Text style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>{rt.sub}</Text>
                    </View>
                    <View
                      style={{
                        width: 21,
                        height: 21,
                        borderRadius: 21,
                        borderWidth: 2,
                        borderColor: on ? T.accent : T.faint,
                        backgroundColor: on ? T.accent : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {on ? <Icon name="check" size={12} color={T.onAccent} stroke={3.4} /> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <Text style={sheetLabel}>Send to</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingHorizontal: 2, paddingBottom: 8 }} style={{ marginBottom: 14 }}>
              {SHARE_TARGETS.map((tg) => (
                <Pressable key={tg.id} onPress={() => pick(tg)} style={{ alignItems: 'center', gap: 7, width: 62 }}>
                  <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: '#1C232A', borderWidth: 1, borderColor: T.hairline, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={tg.icon} size={24} color={T.text} stroke={1.9} />
                  </View>
                  <Text style={{ fontSize: 11, color: T.muted, fontWeight: '500' }} numberOfLines={1}>
                    {tg.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Pressable
              onPress={onClose}
              style={{ height: 50, borderRadius: 14, backgroundColor: '#1C232A', alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: T.text }}>Cancel</Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const sheetLabel = {
  fontSize: 12.5,
  fontWeight: '700' as const,
  color: T.muted,
  textTransform: 'uppercase' as const,
  letterSpacing: 0.4,
  marginHorizontal: 4,
  marginBottom: 8,
};
