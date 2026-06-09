// Profile — avatar lockup, stat columns, details rows.
// RN port of pwa/src/screens/Settings.tsx (Profile).
import { Text, View } from 'react-native';
import { T } from '@/theme';
import { DATA } from '@/data';
import { Avatar, Card, SectionLabel } from '@/components/primitives';
import { Screen } from '@/components/Screen';
import { PushHeader } from '@/components/PushHeader';

export default function Profile() {
  const u = DATA.user;
  const stats: [string, number][] = [
    ['Projects', u.stats.projects],
    ['Scans', u.stats.scans],
    ['Reports', u.stats.reports],
  ];
  const details: [string, string][] = [
    ['Company', u.company],
    ['Role', u.role],
    ['Region', u.region],
    ['Member since', u.since],
  ];
  return (
    <View style={{ flex: 1 }}>
      <PushHeader title="Profile" />
      <Screen padTop={0} style={{ marginTop: -2 }}>
        <View style={{ paddingTop: 12, paddingHorizontal: 20, paddingBottom: 8, gap: 18 }}>
          <View style={{ alignItems: 'center', gap: 12, paddingTop: 12, paddingBottom: 4 }}>
            <Avatar initials="JM" size={88} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 23, fontWeight: '800', letterSpacing: -0.4, color: T.text }}>
                {u.name}
              </Text>
              <Text style={{ fontSize: 14, color: T.muted, marginTop: 3 }}>
                {u.role} · {u.company}
              </Text>
            </View>
          </View>

          <Card style={{ paddingVertical: 18, paddingHorizontal: 8, flexDirection: 'row' }}>
            {stats.map(([l, n], i) => (
              <View
                key={l}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  borderLeftWidth: i ? 1 : 0,
                  borderLeftColor: T.hairline,
                }}
              >
                <Text style={{ fontSize: 24, fontWeight: '800', color: T.accent }}>{n}</Text>
                <Text style={{ fontSize: 12.5, color: T.muted, marginTop: 3, fontWeight: '600' }}>
                  {l}
                </Text>
              </View>
            ))}
          </Card>

          <View>
            <SectionLabel>Details</SectionLabel>
            <Card style={{ paddingVertical: 4, paddingHorizontal: 16 }}>
              {details.map((r, i, a) => (
                <View
                  key={r[0]}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: 13,
                    borderBottomWidth: i < a.length - 1 ? 1 : 0,
                    borderBottomColor: T.hairline2,
                  }}
                >
                  <Text style={{ fontSize: 14.5, color: T.muted }}>{r[0]}</Text>
                  <Text style={{ fontSize: 14.5, color: T.text, fontWeight: '600' }}>{r[1]}</Text>
                </View>
              ))}
            </Card>
          </View>
        </View>
      </Screen>
    </View>
  );
}
