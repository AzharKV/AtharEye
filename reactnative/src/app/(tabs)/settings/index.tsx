// Settings — profile row, subscription card, scanning & app rows, brand footer.
// RN port of pwa/src/screens/Settings.tsx (Settings).
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { T } from '@/theme';
import { DATA } from '@/data';
import { haptic } from '@/lib/haptic';
import { shadow } from '@/lib/ui';
import { Icon } from '@/components/Icon';
import type { IconName } from '@/components/Icon';
import { Mark, Wordmark } from '@/components/Brand';
import { Avatar, Bar, Card, SectionLabel, ScreenHeader } from '@/components/primitives';
import { Screen } from '@/components/Screen';

// ── Toggle (50x30 pill, knob slides, accent when on)
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <Pressable
      onPress={() => {
        haptic();
        onChange(!on);
      }}
      style={{
        width: 50,
        height: 30,
        borderRadius: 30,
        padding: 2,
        flexShrink: 0,
        backgroundColor: on ? T.accent : 'rgba(255,255,255,0.14)',
        flexDirection: 'row',
        justifyContent: on ? 'flex-end' : 'flex-start',
      }}
    >
      <View
        style={[
          { width: 26, height: 26, borderRadius: 26, backgroundColor: '#fff' },
          shadow('#000', 3, 0.3, 1, 2),
        ]}
      />
    </Pressable>
  );
}

// ── Settings row (icon tile + title + optional value + optional Toggle + optional chevron)
interface RowProps {
  icon?: IconName;
  iconBg?: string;
  title: string;
  value?: string;
  toggle?: boolean;
  onToggle?: (v: boolean) => void;
  chevron?: boolean;
  onPress?: () => void;
  last?: boolean;
}

function Row({ icon, iconBg, title, value, toggle, onToggle, chevron, onPress, last }: RowProps) {
  const body = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
        paddingVertical: 13,
        paddingHorizontal: 15,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: T.hairline2,
      }}
    >
      {icon ? (
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            backgroundColor: iconBg || 'rgba(255,255,255,0.06)',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon name={icon} size={17} color={T.text} stroke={1.9} />
        </View>
      ) : null}
      <Text style={{ flex: 1, fontSize: 15.5, fontWeight: '500', color: T.text }}>{title}</Text>
      {value !== undefined ? (
        <Text style={{ fontSize: 14.5, color: T.muted, marginRight: 2 }}>{value}</Text>
      ) : null}
      {toggle !== undefined && onToggle ? <Toggle on={toggle} onChange={onToggle} /> : null}
      {chevron ? <Icon name="chevron" size={17} color="rgba(255,255,255,0.22)" /> : null}
    </View>
  );
  if (onPress) {
    return (
      <Pressable
        onPress={() => {
          haptic();
          onPress();
        }}
      >
        {body}
      </Pressable>
    );
  }
  return body;
}

export default function Settings() {
  const router = useRouter();
  const u = DATA.user,
    s = DATA.subscription;
  const [toggles, setToggles] = useState({ auto: true, notif: true });
  const set = (k: 'auto' | 'notif', v: boolean) => setToggles((t) => ({ ...t, [k]: v }));
  return (
    <Screen>
      <ScreenHeader title="Settings" />
      <View style={{ paddingTop: 4, paddingHorizontal: 20, paddingBottom: 8, gap: 18 }}>
        {/* profile row */}
        <Card
          pressable
          onPress={() => router.push('/settings/profile')}
          style={{ padding: 15, flexDirection: 'row', alignItems: 'center', gap: 14 }}
        >
          <Avatar initials="JM" size={52} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', letterSpacing: -0.3, color: T.text }}>
              {u.name}
            </Text>
            <Text style={{ fontSize: 13.5, color: T.muted, marginTop: 2 }}>
              {u.role} · {u.company}
            </Text>
          </View>
          <Icon name="chevron" size={18} color="rgba(255,255,255,0.22)" />
        </Card>

        {/* subscription */}
        <View>
          <SectionLabel>Subscription</SectionLabel>
          <Card style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontSize: 17, fontWeight: '800', color: T.text }}>{s.plan}</Text>
                <Text style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>Renews {s.renews}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: T.accent }}>
                  {s.price}
                  <Text style={{ fontSize: 13, color: T.muted, fontWeight: '600' }}>/{s.period}</Text>
                </Text>
              </View>
            </View>
            <View style={{ marginTop: 16 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 7,
                }}
              >
                <Text style={{ fontSize: 12.5, color: T.muted }}>Projects used</Text>
                <Text style={{ fontSize: 12.5, color: T.text, fontWeight: '600' }}>
                  {s.used} of {s.limit}
                </Text>
              </View>
              <Bar value={(s.used / s.limit) * 100} color={T.accent} height={7} />
            </View>
            <Pressable
              onPress={() => {
                haptic();
                router.push('/settings/plans');
              }}
              style={{
                width: '100%',
                height: 44,
                marginTop: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: T.accent + '55',
                backgroundColor: 'rgba(20,184,192,0.1)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: T.accent, fontSize: 14.5, fontWeight: '700' }}>See all plans</Text>
            </Pressable>
          </Card>
        </View>

        {/* scanning */}
        <View>
          <SectionLabel>Scanning</SectionLabel>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <Row icon="bolt" title="Scan quality" value="High" chevron onPress={() => {}} />
            <Row icon="ruler" title="Units" value="Metric (m)" chevron onPress={() => {}} />
            <Row icon="cube" title="BIM format" value="IFC" chevron onPress={() => {}} />
            <Row
              icon="upload"
              title="Auto-upload scans"
              toggle={toggles.auto}
              onToggle={(v) => set('auto', v)}
              last
            />
          </Card>
        </View>

        {/* app */}
        <View>
          <SectionLabel>App</SectionLabel>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <Row
              icon="bell"
              title="Notifications"
              toggle={toggles.notif}
              onToggle={(v) => set('notif', v)}
            />
            <Row icon="lock" title="Privacy & data" chevron onPress={() => {}} />
            <Row icon="info" title="About" value="v1.0 (1)" chevron onPress={() => {}} last />
          </Card>
        </View>

        <View style={{ paddingTop: 4, paddingBottom: 8, alignItems: 'center', gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, opacity: 0.5 }}>
            <Mark size={22} />
            <Wordmark size={14} />
          </View>
          <Text style={{ fontSize: 11.5, color: T.faint }}>
            Athar Robotics · See progress · Prove progress
          </Text>
        </View>
      </View>
    </Screen>
  );
}
