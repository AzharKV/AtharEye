// Plans / billing — current plan + usage, the tier ladder (£0/£19/£49/£99/£149) with upgrade, and
// paid add-ons. Account-level (not per project). Reached from the Account workspace links.
import { T } from '../theme';
import { useStore } from '../lib/store';
import { Screen } from '../navigation/Navigator';
import { PushHeader } from '../navigation/PushHeader';
import { Bar, Card, SectionLabel, mono } from '../components/primitives';
import { haptic } from '../lib/haptic';
import { Icon } from '../components/Icon';

const LIMIT: Record<string, number> = { free: 1, starter: 3, business: 10, pro: 30, enterprise: 999 };

export function Plans() {
  const { data, patch } = useStore();
  const sub = data.subscription;

  const upgrade = (id: string) => {
    haptic();
    const t = sub.tiers.find((x) => x.id === id);
    if (!t) return;
    patch({
      subscription: {
        ...sub,
        plan: t.name,
        price: t.price,
        period: t.period,
        limit: LIMIT[id] ?? sub.limit,
        tiers: sub.tiers.map((x) => ({ ...x, current: x.id === id })),
      },
    });
  };

  const usedPct = Math.min(100, Math.round((sub.used / sub.limit) * 100));

  return (
    <Screen padTop={0}>
      <PushHeader title="Plan & billing" />
      <div style={{ padding: '14px 16px 28px' }}>
        {/* Current plan */}
        <Card style={{ padding: 18, marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.teal, textTransform: 'uppercase', letterSpacing: 0.5 }}>Current plan</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: T.ink, marginTop: 2 }}>{sub.plan}</div>
            </div>
            <div style={{ ...mono, fontSize: 20, fontWeight: 800, color: T.ink }}>{sub.price}<span style={{ fontSize: 13, color: T.muted, fontWeight: 600 }}>{sub.period}</span></div>
          </div>
          <div style={{ margin: '14px 0 6px' }}>
            <Bar value={usedPct} color={usedPct > 80 ? T.amber : T.navy} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ ...mono, fontSize: 12.5, color: T.muted }}>{sub.used} / {sub.limit === 999 ? '∞' : sub.limit} projects</span>
            <span style={{ ...mono, fontSize: 12.5, color: T.muted }}>Renews {sub.renews}</span>
          </div>
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.hairline2}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, color: T.muted }}>Billed to</span>
            <span style={{ fontSize: 12.5, color: T.ink, fontWeight: 700 }}>{data.company.name}</span>
          </div>
        </Card>

        <SectionLabel>Plans</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sub.tiers.map((t) => {
            const current = t.current;
            return (
              <Card key={t.id} style={{ padding: 16, border: `1.5px solid ${current ? T.teal : T.hairline}` }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: T.ink }}>{t.name}</div>
                  <div style={{ ...mono, fontSize: 16, fontWeight: 800, color: T.ink }}>{t.price}<span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>{t.period}</span></div>
                </div>
                <div style={{ fontSize: 12.5, color: T.muted, marginBottom: 10 }}>{t.tagline}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  {t.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.ink }}>
                      <Icon name="check" size={15} color={T.teal} stroke={2.6} /> {f}
                    </div>
                  ))}
                </div>
                {current ? (
                  <div style={{ textAlign: 'center', padding: '10px 0', borderRadius: 11, background: T.tealTint, color: T.teal, fontWeight: 700, fontSize: 13.5 }}>Current plan</div>
                ) : (
                  <button onClick={() => upgrade(t.id)} style={{ width: '100%', padding: '11px 0', borderRadius: 11, border: `1px solid ${T.navy}`, background: T.surface, color: T.navy, fontWeight: 700, fontSize: 13.5, fontFamily: T.font, cursor: 'pointer' }}>
                    Switch to {t.name}
                  </button>
                )}
              </Card>
            );
          })}
        </div>

        <SectionLabel>Add-ons</SectionLabel>
        <Card style={{ padding: '6px 16px' }}>
          {sub.addons.map((a, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: i < sub.addons.length - 1 ? `1px solid ${T.hairline2}` : 'none' }}>
              <span style={{ fontSize: 13.5, color: T.ink }}>{a.label}</span>
              <span style={{ ...mono, fontSize: 13, fontWeight: 700, color: T.muted }}>{a.price}</span>
            </div>
          ))}
        </Card>
      </div>
    </Screen>
  );
}
