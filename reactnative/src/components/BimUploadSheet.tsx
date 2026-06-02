// BIM upload sheet (faked import + alignment), shared by Project detail + New project.
// RN port of the PWA's BimUploadSheet — same phases (pick → uploading → aligning) and the same
// onConnected hand-off. Uses the canonical Modal/scrim/SlideInDown sheet pattern from ShareSheet.
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { T, MONO } from '../theme';
import { haptic } from '../lib/haptic';
import { fill } from '../lib/ui';
import { Icon } from './Icon';
import { Bar } from './primitives';

export interface BimSample {
  file: string;
  size: string;
  ver: string;
  elements: string;
}

export const BIM_SAMPLES: BimSample[] = [
  { file: 'Revit_export_v4.ifc', size: '22.1 MB', ver: 'IFC4 · v4', elements: '2,410' },
  { file: 'Architect_issue_C.ifc', size: '15.6 MB', ver: 'IFC4 · v3', elements: '1,980' },
  { file: 'Structural_only.ifc', size: '8.3 MB', ver: 'IFC2x3 · v1', elements: '720' },
];

export function BimUploadSheet({
  open,
  onClose,
  onConnected,
}: {
  open: boolean;
  onClose: () => void;
  onConnected: (f: BimSample) => void;
}) {
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<'pick' | 'uploading' | 'aligning'>('pick'); // pick | uploading | aligning
  const [prog, setProg] = useState(0);
  const [chosen, setChosen] = useState<BimSample | null>(null);

  useEffect(() => {
    if (open) {
      setPhase('pick');
      setProg(0);
      setChosen(null);
    }
  }, [open]);

  useEffect(() => {
    if (phase !== 'uploading') return;
    const start = Date.now();
    const id = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / 1400) * 100);
      setProg(p);
      if (p >= 100) {
        clearInterval(id);
        setPhase('aligning');
        setTimeout(() => chosen && onConnected(chosen), 900);
      }
    }, 40);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const choose = (f: BimSample) => {
    haptic();
    setChosen(f);
    setPhase('uploading');
  };

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={phase === 'pick' ? onClose : undefined}
    >
      <View style={[fill, { justifyContent: 'flex-end' }]}>
        <Pressable style={[fill, { backgroundColor: 'rgba(0,0,0,0.55)' }]} onPress={phase === 'pick' ? onClose : undefined} />
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
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: T.text }}>
              {phase === 'pick' ? 'Replace BIM model' : phase === 'uploading' ? 'Uploading model…' : 'Aligning to scan…'}
            </Text>
            <Text style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>
              {phase === 'pick' ? 'IFC · Revit (.rvt) · IFC2x3 / IFC4' : chosen ? chosen.file : ''}
            </Text>
          </View>

          {phase === 'pick' ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Pressable
                onPress={() => choose(BIM_SAMPLES[0])}
                style={{
                  borderWidth: 1.5,
                  borderStyle: 'dashed',
                  borderColor: T.accent + '66',
                  backgroundColor: 'rgba(20,184,192,0.06)',
                  borderRadius: 16,
                  paddingVertical: 22,
                  paddingHorizontal: 14,
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <Icon name="upload" size={28} color={T.accent} />
                <Text style={{ fontSize: 15, fontWeight: '700', color: T.text }}>Browse files</Text>
                <Text style={{ fontSize: 12.5, color: T.muted }}>Drag a .ifc / .rvt here, or tap to pick</Text>
              </Pressable>
              <Text
                style={{
                  fontSize: 12.5,
                  fontWeight: '700',
                  color: T.muted,
                  textTransform: 'uppercase',
                  letterSpacing: 0.4,
                  marginHorizontal: 4,
                  marginBottom: 8,
                }}
              >
                Recent exports
              </Text>
              <View
                style={{
                  backgroundColor: '#181E24',
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: T.hairline,
                  overflow: 'hidden',
                  marginBottom: 16,
                }}
              >
                {BIM_SAMPLES.map((f, i) => (
                  <Pressable
                    key={f.file}
                    onPress={() => choose(f)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      paddingVertical: 13,
                      paddingHorizontal: 14,
                      borderBottomWidth: i < BIM_SAMPLES.length - 1 ? 1 : 0,
                      borderBottomColor: T.hairline2,
                    }}
                  >
                    <Icon name="cube" size={20} color={T.muted} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14.5, fontWeight: '600', fontFamily: MONO, color: T.text }}>{f.file}</Text>
                      <Text style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>
                        {f.ver} · {f.size}
                      </Text>
                    </View>
                    <Icon name="chevron" size={16} color="rgba(255,255,255,0.25)" />
                  </Pressable>
                ))}
              </View>
              <Pressable
                onPress={onClose}
                style={{ height: 50, borderRadius: 14, backgroundColor: '#1C232A', alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ fontSize: 16, fontWeight: '700', color: T.text }}>Cancel</Text>
              </Pressable>
            </ScrollView>
          ) : null}

          {phase === 'uploading' ? (
            <View style={{ paddingHorizontal: 4, paddingTop: 8, paddingBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 12.5, color: T.muted }}>{chosen ? chosen.size : ''}</Text>
                <Text style={{ fontSize: 12.5, color: T.text, fontWeight: '700' }}>{Math.round(prog)}%</Text>
              </View>
              <Bar value={prog} color={T.accent} height={8} />
            </View>
          ) : null}

          {phase === 'aligning' ? (
            <View
              style={{ paddingHorizontal: 4, paddingTop: 18, paddingBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}
            >
              <Icon name="layers" size={22} color={T.accent} />
              <Text style={{ fontSize: 14.5, color: T.text, fontWeight: '600' }}>Registering point cloud to BIM…</Text>
            </View>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
}
