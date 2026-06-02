// New project — create + attach a BIM model (required to compute coverage).
// RN port of the PWA's NewProject. Builds the Project object 1:1 and adds it to the live store.
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { T, MONO } from '@/theme';
import type { BimModel, Project } from '@/types';
import { haptic } from '@/lib/haptic';
import { useAppStore } from '@/store/AppStore';
import { Icon } from '@/components/Icon';
import { Button, Card } from '@/components/primitives';
import { Screen } from '@/components/Screen';
import { PushHeader } from '@/components/PushHeader';
import { BimUploadSheet } from '@/components/BimUploadSheet';

const PTYPES = ['Shop refit', 'Residential', 'Commercial', 'Industrial', 'Hospitality', 'Other'];

function Field({
  label,
  value,
  onChange,
  placeholder,
  suffix,
  numeric,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suffix?: string;
  numeric?: boolean;
}) {
  return (
    <View>
      <Text style={{ fontSize: 12.5, fontWeight: '700', color: T.muted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 7 }}>
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: T.surface,
          borderWidth: 1,
          borderColor: T.hairline,
          borderRadius: 13,
          paddingHorizontal: 14,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={T.faint}
          keyboardType={numeric ? 'decimal-pad' : 'default'}
          style={{ flex: 1, color: T.text, fontSize: 16, fontWeight: '500', paddingHorizontal: 0, paddingVertical: 14 }}
        />
        {suffix ? <Text style={{ fontSize: 14, color: T.muted, marginLeft: 6 }}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

export default function NewProject() {
  const router = useRouter();
  const { addProject } = useAppStore();
  const [name, setName] = useState('');
  const [type, setType] = useState('Shop refit');
  const [loc, setLoc] = useState('');
  const [client, setClient] = useState('');
  const [area, setArea] = useState('');
  const [bim, setBim] = useState<BimModel | null>(null);
  const [bimSheet, setBimSheet] = useState(false);
  const ready = !!name.trim() && !!bim;

  const create = () => {
    haptic();
    if (!bim) return;
    const p: Project = {
      id: 'p' + Date.now(),
      name: name.trim(),
      type,
      location: loc.trim() || 'Scotland',
      pct: 0,
      status: 'On Track',
      area: Number(area) || 0,
      client: client.trim() || '—',
      scans: 0,
      team: ['JM'],
      last: 'Just created',
      rooms: [],
      issues: [],
      bim,
    };
    addProject(p);
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <PushHeader title="New project" />
      <Screen padTop={0}>
        <View style={{ paddingTop: 12, paddingHorizontal: 20, paddingBottom: 8, gap: 18 }}>
          <Field label="Project name" value={name} onChange={setName} placeholder="e.g. Govan Workshop Fit-Out" />
          <View>
            <Text style={{ fontSize: 12.5, fontWeight: '700', color: T.muted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 }}>
              Type
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {PTYPES.map((t) => {
                const on = t === type;
                return (
                  <Pressable
                    key={t}
                    onPress={() => {
                      haptic();
                      setType(t);
                    }}
                    style={{ paddingVertical: 9, paddingHorizontal: 14, borderRadius: 11, backgroundColor: on ? T.accent : T.surface2 }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '600', color: on ? T.onAccent : T.muted }}>{t}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1.4 }}>
              <Field label="Location" value={loc} onChange={setLoc} placeholder="Glasgow" />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Area" value={area} onChange={setArea} placeholder="0" suffix="m²" numeric />
            </View>
          </View>
          <Field label="Client" value={client} onChange={setClient} placeholder="Client / owner" />

          {/* BIM attach */}
          <View>
            <Text style={{ fontSize: 12.5, fontWeight: '700', color: T.muted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 }}>
              BIM model
            </Text>
            {bim ? (
              <Card style={{ padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 11,
                    backgroundColor: 'rgba(20,184,192,0.12)',
                    borderWidth: 1,
                    borderColor: T.accent + '33',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="cube" size={20} color={T.accent} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text numberOfLines={1} style={{ fontSize: 14.5, fontWeight: '700', fontFamily: MONO, color: T.text }}>
                    {bim.file}
                  </Text>
                  <Text style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>
                    {bim.ver} · {bim.size}
                  </Text>
                </View>
                <Pressable
                  onPress={() => {
                    haptic();
                    setBimSheet(true);
                  }}
                  style={{ paddingVertical: 7, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: T.hairline, backgroundColor: 'rgba(255,255,255,0.05)' }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: T.text }}>Change</Text>
                </Pressable>
              </Card>
            ) : (
              <Pressable
                onPress={() => {
                  haptic();
                  setBimSheet(true);
                }}
                style={{
                  borderWidth: 1.5,
                  borderStyle: 'dashed',
                  borderColor: T.accent + '66',
                  backgroundColor: 'rgba(20,184,192,0.06)',
                  borderRadius: 14,
                  paddingVertical: 20,
                  paddingHorizontal: 14,
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                <Icon name="upload" size={26} color={T.accent} />
                <Text style={{ fontSize: 14.5, fontWeight: '700', color: T.text }}>Upload BIM model</Text>
                <Text style={{ fontSize: 12.5, color: T.muted }}>IFC · Revit (.rvt) — required to compute coverage</Text>
              </Pressable>
            )}
          </View>

          <Button primary icon="check" onPress={create} disabled={!ready} style={{ marginTop: 4 }}>
            Create project
          </Button>
          <Text style={{ fontSize: 12, color: T.faint, textAlign: 'center', lineHeight: 17, marginTop: -4 }}>
            Then run your first scan to measure coverage against the BIM.
          </Text>
        </View>
      </Screen>
      <BimUploadSheet
        open={bimSheet}
        onClose={() => setBimSheet(false)}
        onConnected={(f) => {
          setBim({ file: f.file, size: f.size, ver: f.ver, uploaded: 'Just now', elements: f.elements });
          setBimSheet(false);
        }}
      />
    </View>
  );
}
