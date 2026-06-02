// Reports.tsx — Reports list (tab root) + Report detail (the hero screen). Ported from design-source/app/app-reports.jsx.
import { useState, useEffect } from 'react';
import { T } from '../theme';
import type { Project, Severity } from '../types';
import { DATA, planFor, bimFor } from '../data';
import { roundM } from '../lib/format';
import { useCountUp } from '../hooks/useCountUp';
import { useReady } from '../hooks/useReady';
import { Icon } from '../components/Icon';
import { Mark, Wordmark } from '../components/Brand';
import {
  Donut,
  Bar,
  StatusBadge,
  BlueprintTile,
  Chips,
  Button,
  Card,
  SectionLabel,
  ScreenHeader,
} from '../components/primitives';
import { IsoMassing, isoFills } from '../components/IsoMassing';
import { ShareSheet, Toast } from '../components/ShareSheet';
import { SkeletonList } from '../components/Skeleton';
import { Screen, useNav } from '../navigation/Navigator';
import { RoundBtn } from '../navigation/PushHeader';

const SEV2: Record<Severity, string> = { high: T.danger, med: T.warning, low: T.faint };
const SEV_LABEL: Record<Severity, string> = { high: 'High', med: 'Med', low: 'Low' };

// ════════════════ REPORTS LIST ════════════════
export function ReportsList() {
  const nav = useNav();
  const ready = useReady('reports');
  const [filter, setFilter] = useState('All');
  const list = DATA.projects.filter((p) =>
    filter === 'All'
      ? true
      : filter === 'Needs review'
        ? p.status === 'Needs Review'
        : filter === 'On track'
          ? p.status === 'On Track'
          : p.status === 'Complete',
  );
  return (
    <Screen>
      <ScreenHeader
        title="Reports"
        sub="Latest scan reports"
        trailing={<RoundBtn icon="search" label="Search" />}
      />
      <Chips items={['All', 'Needs review', 'On track', 'Complete']} active={filter} onPick={setFilter} />
      {!ready ? (
        <SkeletonList count={6} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 20px 8px' }}>
          {list.map((p) => (
            <Card
              key={p.id}
              pressable
              onClick={() => nav.push(<ReportDetail project={p} />)}
              style={{ padding: 14, display: 'flex', gap: 13, alignItems: 'center' }}
            >
              <BlueprintTile type={p.type} w={48} h={48} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 15.5,
                    fontWeight: 700,
                    letterSpacing: -0.3,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: T.muted,
                    marginTop: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <Icon name="clock" size={13} color={T.muted} />
                  Scanned {p.last} · {p.area} m²
                </div>
                <div style={{ marginTop: 8 }}>
                  <StatusBadge status={p.status} small />
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: T.accent, letterSpacing: -0.5 }}>
                  {p.pct}
                  <span style={{ fontSize: 12, color: T.muted }}>%</span>
                </div>
                <Icon name="chevron" size={16} color="rgba(255,255,255,0.22)" style={{ marginTop: 4 }} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </Screen>
  );
}

// ════════════════ REPORT DETAIL (hero) ════════════════
export function ReportDetail({ project: p }: { project: Project }) {
  const nav = useNav();
  const [ready, setReady] = useState(false);
  const [share, setShare] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const pct = useCountUp(p.pct, 1100, ready);
  const cov = roundM(p.area, p.pct),
    miss = p.area - cov;
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 440);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      {/* branded sticky header */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          paddingTop: 50,
          padding: 'calc(env(safe-area-inset-top) + 12px) 16px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(12,15,18,0.82)',
          backdropFilter: 'blur(18px) saturate(160%)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom: `1px solid ${T.hairline}`,
        }}
      >
        <button
          onClick={() => nav.pop()}
          aria-label="Back"
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            border: `1px solid ${T.hairline}`,
            background: 'rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Icon name="chevronL" size={20} color={T.text} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Mark size={26} />
          <Wordmark size={16} sub="PROGRESS REPORT" />
        </div>
        <div style={{ width: 38 }} />
      </div>

      <Screen padTop={92}>
        <div style={{ padding: '8px 20px 8px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* title row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 21,
                  fontWeight: 800,
                  letterSpacing: -0.4,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {p.name}
              </div>
              <div style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>Scanned {p.last} · 2 Jun 2026</div>
            </div>
            <StatusBadge status={p.status} />
          </div>

          {/* hero donut */}
          <Card
            style={{
              padding: '24px 18px 18px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 18,
              background: `radial-gradient(120% 92% at 50% 0%, ${T.surface2}, ${T.surface})`,
            }}
          >
            <Donut value={pct} size={196} stroke={18} />
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              {(
                [
                  ['Covered', `${cov} m²`, T.accent, `${T.accent}14`],
                  ['Missing', `${miss} m²`, T.danger, `${T.danger}14`],
                ] as [string, string, string, string][]
              ).map(([l, v, c, tint]) => (
                <div
                  key={l}
                  style={{
                    flex: 1,
                    background: tint,
                    borderRadius: 13,
                    padding: '12px 14px',
                    border: `1px solid ${c}26`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 8, background: c }} />
                    <span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>{l}</span>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, marginTop: 5, color: c }}>{v}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* model coverage — iso massing */}
          <div>
            <SectionLabel right={<span style={{ fontSize: 11.5, color: T.faint }}>BIM vs as-built</span>}>
              Model coverage
            </SectionLabel>
            <Card style={{ padding: '16px 12px 12px' }}>
              <IsoMassing rooms={planFor(p.id)} fills={isoFills} />
              <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 8 }}>
                {(
                  [
                    ['Built', '#16C2CA'],
                    ['Partial', '#C7D2DC'],
                    ['Missing', T.danger],
                  ] as [string, string][]
                ).map(([l, c]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 3, background: c }} />
                    <span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>{l}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* meta table */}
          <Card style={{ padding: '4px 16px' }}>
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
              <div
                key={r[0]}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '11px 0',
                  borderBottom: i < a.length - 1 ? `1px solid ${T.hairline2}` : 'none',
                }}
              >
                <span style={{ fontSize: 14, color: T.muted, fontWeight: 500 }}>{r[0]}</span>
                <span style={{ fontSize: 14, color: T.text, fontWeight: 600, maxWidth: 200, textAlign: 'right' }}>
                  {r[1]}
                </span>
              </div>
            ))}
          </Card>

          {/* coverage by room */}
          <div>
            <SectionLabel>Coverage by area</SectionLabel>
            <Card style={{ padding: '4px 16px' }}>
              {p.rooms.map((r, i) => {
                const behind = r.pct < 45;
                return (
                  <div
                    key={r.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '11px 0',
                      borderBottom: i < p.rooms.length - 1 ? `1px solid ${T.hairline2}` : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: 104,
                        fontSize: 14.5,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {r.name}
                    </div>
                    <div style={{ flex: 1 }}>
                      <Bar value={r.pct} color={behind ? T.danger : T.bar} />
                    </div>
                    <div
                      style={{
                        width: 40,
                        textAlign: 'right',
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: behind ? T.danger : T.text,
                      }}
                    >
                      {r.pct}%
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>

          {/* open issues */}
          <div>
            <SectionLabel
              right={
                p.issues.length ? (
                  <span style={{ fontSize: 12, color: T.danger, fontWeight: 700 }}>{p.issues.length} open</span>
                ) : (
                  <span style={{ fontSize: 12, color: T.accent, fontWeight: 700 }}>None</span>
                )
              }
            >
              Open issues
            </SectionLabel>
            {p.issues.length === 0 ? (
              <Card style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
                <Icon name="checkCircle" size={22} color={T.accent} />
                <span style={{ fontSize: 14, color: T.muted }}>Handover complete — no open issues.</span>
              </Card>
            ) : (
              <Card style={{ padding: '4px 14px' }}>
                {p.issues.map((it, i) => (
                  <div
                    key={it.t}
                    style={{
                      display: 'flex',
                      gap: 12,
                      padding: '12px 0',
                      alignItems: 'center',
                      borderBottom: i < p.issues.length - 1 ? `1px solid ${T.hairline2}` : 'none',
                    }}
                  >
                    <BlueprintTile type={p.type} w={42} h={42} radius={10} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 600 }}>{it.t}</div>
                      <div style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>{it.loc}</div>
                    </div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '4px 9px',
                        borderRadius: 8,
                        background: `${SEV2[it.sev]}1c`,
                        color: SEV2[it.sev],
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 0.3,
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: 6, background: SEV2[it.sev] }} />
                      {SEV_LABEL[it.sev]}
                    </span>
                  </div>
                ))}
              </Card>
            )}
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
            <Button primary icon="share" full onClick={() => setShare(true)}>
              Share report
            </Button>
            <Button
              icon="pdf"
              onClick={() => setToast('Exported as PDF · saved to Files')}
              style={{ flex: '0 0 auto', width: 96 }}
            >
              PDF
            </Button>
          </div>
        </div>
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
    </div>
  );
}
