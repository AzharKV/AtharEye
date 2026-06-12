// Reports — history (one per project, by date) + the A-to-Z progress report document.
// The report renders `reportFor(project, coverage)`: meta · donut + summary · zone bars · open
// issues · coverage-over-time · BIM · captures · next actions · prepared-by footer. Per-scan
// reports pass a `coverage`. (Share/export sheet is wired in phase 8.)
import { useState } from 'react';
import { T, SEV } from '../theme';
import { reportFor } from '../lib/reports';
import { fmtDate } from '../lib/format';
import { useStore } from '../lib/store';
import { Screen, useNav } from '../navigation/Navigator';
import { PushHeader, RoundBtn } from '../navigation/PushHeader';
import { ProjectDetail } from './ProjectDetail';
import {
  Button,
  Card,
  Donut,
  Gallery,
  KeyVal,
  Ring,
  ScreenHeader,
  SectionLabel,
  SevDot,
  Sparkline,
  StatusPill,
  ZoneBars,
  mono,
} from '../components/primitives';
import { Wordmark } from '../components/Brand';
import { ShareSheet } from '../components/ShareSheet';
import { Icon } from '../components/Icon';

export function ReportsList() {
  const { data } = useStore();
  const nav = useNav();
  const rows = [...data.projects].sort((a, b) => {
    const da = a.scans[a.scans.length - 1]?.date ?? a.start_date;
    const db = b.scans[b.scans.length - 1]?.date ?? b.start_date;
    return db.localeCompare(da);
  });

  return (
    <Screen>
      <ScreenHeader title="Reports" sub={`${rows.length} reports · latest first`} />
      <div style={{ padding: '6px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map((p) => {
          const last = p.scans[p.scans.length - 1];
          const ringColor = p.status === 'Needs review' ? T.amber : p.overall_coverage >= 100 ? T.teal : T.navy;
          return (
            <Card key={p.id} pressable onClick={() => nav.push(<ReportDetail projectId={p.id} />)} style={{ padding: '14px 15px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <Ring value={p.overall_coverage} size={46} stroke={5} color={ringColor} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                <div style={{ ...mono, fontSize: 12, color: T.muted, marginTop: 3 }}>
                  {last ? fmtDate(last.date) : '—'} · {p.location.split(',')[0]}
                </div>
              </div>
              <StatusPill status={p.status} />
              <Icon name="chevron" size={17} color={T.faint} />
            </Card>
          );
        })}
      </div>
    </Screen>
  );
}

export function ReportDetail({ projectId, coverage }: { projectId: string; coverage?: number }) {
  const { data } = useStore();
  const nav = useNav();
  const [share, setShare] = useState(false);
  const p = data.projects.find((x) => x.id === projectId);
  if (!p) {
    return (
      <Screen padTop={0}>
        <PushHeader title="Report" />
        <div style={{ padding: 40, textAlign: 'center', color: T.muted }}>This project was removed.</div>
      </Screen>
    );
  }
  const r = reportFor(p, coverage);
  const deep = p.depth === 'deep';
  const ringColor = p.status === 'Needs review' && r.coverage < 100 ? T.amber : r.coverage >= 100 ? T.teal : T.navy;

  return (
    <Screen padTop={0} padBottom={92}>
      <PushHeader title="Progress report" trailing={<RoundBtn icon="share" label="Share" onClick={() => setShare(true)} />} />

      <div style={{ padding: '14px 16px 0' }}>
        <Card style={{ padding: 18 }}>
          {/* Brand row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: `2px solid ${T.navy}`, marginBottom: 14 }}>
            <Wordmark size={18} />
            <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Progress report</span>
          </div>

          {/* Header meta */}
          <div style={{ marginBottom: 6 }}>
            <KeyVal k="Project" v={p.name} />
            <KeyVal k="Location" v={<span style={mono}>{p.location}</span>} />
            <KeyVal k="Type" v={p.type} />
            <KeyVal k="Client" v={p.client} />
            <KeyVal k="Stage" v={r.rung} />
            <KeyVal k="Report date" v={<span style={mono}>{r.date}</span>} />
            <KeyVal k="Status" v={<StatusPill status={p.status} />} />
          </div>

          {/* Donut + summary */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '18px 0 8px' }}>
            <Donut value={r.coverage} size={172} stroke={15} color={ringColor} countUp sub={`${100 - r.coverage}% outstanding`} />
          </div>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, color: T.ink, margin: '6px 2px 0' }}>{r.summary}</p>
        </Card>

        {/* Zone coverage */}
        {r.zones.length > 0 && (
          <>
            <SectionLabel>Zone coverage</SectionLabel>
            <Card style={{ padding: 16 }}>
              <ZoneBars zones={r.zones} />
            </Card>
          </>
        )}

        {/* Open issues */}
        <SectionLabel right={<span style={{ ...mono, fontSize: 12.5, color: T.muted, fontWeight: 700 }}>{r.openIssues.length} open · {r.closedCount} closed</span>}>
          Open issues
        </SectionLabel>
        <Card style={{ padding: r.openIssues.length ? '6px 16px' : 16 }}>
          {r.openIssues.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.teal, fontSize: 13.5, fontWeight: 600, padding: '4px 0' }}>
              <Icon name="checkCircle" size={18} color={T.teal} /> Snag list cleared — 0 open.
            </div>
          ) : (
            r.openIssues.map((i, idx) => (
              <div key={i.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 0', borderBottom: idx < r.openIssues.length - 1 ? `1px solid ${T.hairline2}` : 'none' }}>
                <div style={{ marginTop: 4 }}>
                  <SevDot sev={i.severity} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, color: T.ink, fontWeight: 600 }}>{i.title}</div>
                  <div style={{ ...mono, fontSize: 11.5, color: T.muted, marginTop: 2 }}>{i.zone} · {SEV[i.severity].label}</div>
                </div>
              </div>
            ))
          )}
        </Card>

        {/* Coverage over time */}
        {r.spark.length > 1 && (
          <>
            <SectionLabel>Coverage over time</SectionLabel>
            <Card style={{ padding: 16 }}>
              <Sparkline points={r.spark} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                {r.spark.map((s, i) => (
                  <span key={i} style={{ ...mono, fontSize: 9.5, color: T.faint, fontWeight: 600 }}>{fmtDate(s.date).slice(0, 6)}</span>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* BIM */}
        <SectionLabel>BIM details</SectionLabel>
        <Card style={{ padding: '6px 16px' }}>
          <KeyVal k="Model" v={<span style={mono}>{p.bim.file}</span>} />
          <KeyVal k="Software" v={p.bim.software} />
          <KeyVal k="LOD" v={<span style={mono}>{p.bim.lod || '—'}</span>} />
          <KeyVal k="Disciplines" v={p.bim.disciplines.join(', ') || '—'} />
          <KeyVal k="Last aligned" v={<span style={mono}>{p.bim.last_aligned ? fmtDate(p.bim.last_aligned) : '—'}</span>} />
        </Card>

        {/* Captures (deep only) */}
        {deep && r.captures.length > 0 && (
          <>
            <SectionLabel>Latest captures</SectionLabel>
            <Gallery ids={r.captures} />
          </>
        )}

        {/* Next actions */}
        {r.nextActions.length > 0 && (
          <>
            <SectionLabel>Next actions</SectionLabel>
            <Card style={{ padding: '12px 16px' }}>
              <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {r.nextActions.map((a, i) => (
                  <li key={i} style={{ fontSize: 13.5, color: T.ink, lineHeight: 1.5 }}>{a}</li>
                ))}
              </ol>
            </Card>
          </>
        )}

        {/* Footer */}
        <div style={{ ...mono, fontSize: 11.5, color: T.muted, textAlign: 'center', padding: '20px 10px 6px', lineHeight: 1.5 }}>{r.footer}</div>
      </div>

      {/* Footer actions */}
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          display: 'flex',
          gap: 10,
          padding: '12px 18px',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: `1px solid ${T.hairline}`,
          marginTop: 8,
        }}
      >
        <Button full icon="projects" onClick={() => nav.push(<ProjectDetail projectId={p.id} />)}>
          Project
        </Button>
        <Button full primary icon="share" onClick={() => setShare(true)}>
          Export PDF
        </Button>
      </div>

      {share && <ShareSheet projectName={p.name} onClose={() => setShare(false)} />}
    </Screen>
  );
}
