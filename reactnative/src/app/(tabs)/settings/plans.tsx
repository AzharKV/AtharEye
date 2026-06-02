// Plans — selectable tier cards (teal border + gradient + features when selected),
// add-ons, and a simulated switch CTA. RN port of pwa/src/screens/Settings.tsx (Plans).
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { T } from '@/theme';
import { SUB_PLANS, SUB_ADDONS } from '@/data';
import { haptic } from '@/lib/haptic';
import { fill } from '@/lib/ui';
import { Icon } from '@/components/Icon';
import { Button, Card, SectionLabel } from '@/components/primitives';
import { Screen } from '@/components/Screen';
import { PushHeader } from '@/components/PushHeader';
import { Toast } from '@/components/ShareSheet';

export default function Plans() {
  const [sel, setSel] = useState(() => (SUB_PLANS.find((p) => p.current) || SUB_PLANS[2]).id);
  const [toast, setToast] = useState<string | null>(null);
  const chosen = SUB_PLANS.find((p) => p.id === sel);
  const isCurrent = chosen && chosen.current;
  return (
    <View style={{ flex: 1 }}>
      <PushHeader title="Plans" />
      <Screen padTop={0}>
        <View style={{ paddingTop: 12, paddingHorizontal: 20, paddingBottom: 8 }}>
          <Text style={{ fontSize: 26, fontWeight: '800', letterSpacing: -0.5, color: T.text }}>
            Choose your plan
          </Text>
          <Text style={{ fontSize: 14, color: T.muted, marginTop: 6, lineHeight: 20 }}>
            Affordable subscriptions tuned to small & medium UK contractors. Cancel anytime.
          </Text>

          <View style={{ gap: 12, marginTop: 18 }}>
            {SUB_PLANS.map((pl) => {
              const on = pl.id === sel;
              return (
                <Pressable
                  key={pl.id}
                  onPress={() => {
                    haptic();
                    setSel(pl.id);
                  }}
                  style={{
                    borderRadius: 18,
                    padding: 16,
                    overflow: 'hidden',
                    backgroundColor: on ? 'transparent' : T.surface,
                    borderWidth: 1.5,
                    borderColor: on ? T.accent : T.hairline,
                  }}
                >
                  {on ? (
                    <LinearGradient
                      colors={['rgba(20,184,192,0.12)', 'rgba(20,184,192,0.04)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={fill}
                    />
                  ) : null}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontSize: 17, fontWeight: '800', color: T.text }}>{pl.name}</Text>
                        {pl.current ? (
                          <View
                            style={{
                              backgroundColor: 'rgba(20,184,192,0.15)',
                              paddingVertical: 2,
                              paddingHorizontal: 7,
                              borderRadius: 6,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 10.5,
                                fontWeight: '800',
                                color: T.accent,
                                letterSpacing: 0.3,
                                textTransform: 'uppercase',
                              }}
                            >
                              Current
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={{ fontSize: 13, color: T.muted, marginTop: 3 }}>{pl.tagline}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', flexShrink: 0 }}>
                      <Text style={{ fontSize: 22, fontWeight: '800', color: on ? T.accent : T.text }}>
                        {pl.price}
                      </Text>
                      <Text style={{ fontSize: 12, color: T.muted }}>/{pl.period}</Text>
                    </View>
                  </View>
                  {on ? (
                    <View
                      style={{
                        marginTop: 14,
                        paddingTop: 14,
                        borderTopWidth: 1,
                        borderTopColor: T.hairline,
                        gap: 9,
                      }}
                    >
                      {pl.features.map((f) => (
                        <View key={f} style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
                          <View
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: 18,
                              backgroundColor: 'rgba(20,184,192,0.16)',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Icon name="check" size={11} color={T.accent} stroke={3.4} />
                          </View>
                          <Text style={{ fontSize: 13.5, color: T.text }}>{f}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          {/* add-ons */}
          <SectionLabel>Services & add-ons</SectionLabel>
          <Card style={{ paddingVertical: 4, paddingHorizontal: 16 }}>
            {SUB_ADDONS.map((a, i) => (
              <View
                key={a.label}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 13,
                  borderBottomWidth: i < SUB_ADDONS.length - 1 ? 1 : 0,
                  borderBottomColor: T.hairline2,
                }}
              >
                <Text style={{ fontSize: 14.5, color: T.text }}>{a.label}</Text>
                <Text style={{ fontSize: 14.5, color: T.accent, fontWeight: '700' }}>{a.price}</Text>
              </View>
            ))}
          </Card>

          <View style={{ height: 16 }} />
          <Button
            primary
            onPress={() =>
              setToast(
                isCurrent
                  ? 'This is your current plan'
                  : `Switched to ${chosen!.name} · ${chosen!.price}/${chosen!.period}`,
              )
            }
            style={{ width: '100%' }}
          >
            {isCurrent ? 'Your current plan' : `Switch to ${chosen!.name}`}
          </Button>
          <Text
            style={{
              fontSize: 12,
              color: T.faint,
              textAlign: 'center',
              marginTop: 10,
              lineHeight: 17,
            }}
          >
            Billing is simulated in this prototype.
          </Text>
        </View>
      </Screen>
      <Toast msg={toast} onDone={() => setToast(null)} />
    </View>
  );
}
