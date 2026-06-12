// Project detail — overview (donut + facts), scan history, zones, issues, captures, BIM, team, trades,
// and the Report / New scan footer. The timeline scrubber + full CRUD layer on in phase 5.
import { useState } from 'react';
import { T, SEV } from '../theme';
import type { Issue, Project } from '../types';
import { fmtDate, fmtDateShort, roundM } from '../lib/format';
import { useStore } from '../lib/store';
import { useAppActions } from '../navigation/AppActions';
import { Screen, useNav } from '../navigation/Navigator';
import { PushHeader, RoundBtn } from '../navigation/PushHeader';
import { ReportDetail } from './Reports';
import {
  Avatar,
  Button,
  Card,
  Donut,
  Gallery,
  KeyVal,
  SectionLabel,
  SevDot,
  StageChip,
  StatusPill,
  ZoneBars,
  mono,
} from '../components/primitives';
import { Icon } from '../components/Icon';

export function ProjectDetail({ projectId }: { projectId: string }) {
  const { data } = useStore();
  const nav = useNav();
  const { startScan } = useAppActions();
  const p = data.projects.find((x) => x.id === projectId);
  const [showClosed, setShowClosed] = useState(false);

  if (!p) {
    return (
      <Screen padTop={0}>
        <PushHeader title="Project" />
        <div style={{ padding: 40, textAlign: 'center', color: T.muted }}>This project was removed.</div>
      </Screen>
    );
  }

  const open = p.issues.filter((i) => i.status === 'Open');
  const closed = p.issues.filter((i) => i.status === 'Closed');
  const ringColor = p.status === 'Needs review' ? T.amber : p.overall_coverage >= 100 ? T.teal : T.navy;

  return (
    <Screen padTop={0} padBottom={92}>
      <PushHeader
        title={p.name}
        trailing={
          <div style={{ display: 'flex', gap: 8 }}>
            <RoundBtn icon="share" label="Share" onClick={() => nav.push(<ReportDetail projectId={p.id} />)} />
          </div>
        }
      />

      <div style={{ padding: '14px 18px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {p.reviewNote && (
          <div style={{ display: 'flex', gap: 10, padding: '12px 14px', background: T.amberTint, border: `1px solid ${T.amber}33`, borderRadius: 14 }}>
            <Icon name="alert" size={18} color={T.amber} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.5 }}>
              <strong style={{ color: T.amber }}>Needs review.</strong> {p.reviewNote}
            </div>
          </div>
        )}

        {/* Overview */}
        <Card style={{ padding: 18, display: 'flex', gap: 16, alignItems: 'center' }}>
          <Donut value={p.overall_coverage} size={120} stroke={12} color={ringColor} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              <StageChip stage={p.stage} />
              <StatusPill status={p.status} />
            </div>
            <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.6 }}>
              <div>{p.type}</div>
              <div style={{ ...mono }}>{p.location}</div>
            </div>
          </div>
        </Card>

        {/* Facts */}
        <Card style={{ padding: '6px 16px' }}>
          <KeyVal k="Client" v={p.client} />
          <KeyVal k="Floor area" v={<span style={mono}>{p.area_m2} m²</span>} />
          <KeyVal k="Verified" v={<span style={mono}>{roundM(p.area_m2, p.overall_coverage)} m² of {p.area_m2} m²</span>} />
          <KeyVal k="Started" v={<span style={mono}>{fmtDate(p.start_date)}</span>} />
          <KeyVal k="Target handover" v={<span style={mono}>{p.target_handover ? fmtDate(p.target_handover) : '—'}</span>} />
        </Card>

        {/* Scan history (static timeline — interactive scrubber in phase 5) */}
        {p.scans.length > 0 && (
          <div>
            <SectionLabel right={<span style={{ fontSize: 12.5, fontWeight: 600, color: T.faint }}>{p.scans.length} scans</span>}>
              Scan history
            </SectionLabel>
            <Card style={{ padding: 16 }}>
              <ScanTimeline project={p} />
            </Card>
          </div>
        )}

        {/* Zones */}
        {p.zones.length > 0 && (
          <div>
            <SectionLabel>Zone coverage</SectionLabel>
            <Card style={{ padding: 16 }}>
              <ZoneBars zones={p.zones} />
            </Card>
          </div>
        )}

        {/* Issues */}
        <div>
          <SectionLabel right={<span style={{ ...mono, fontSize: 12.5, fontWeight: 700, color: open.some((i) => i.severity === 'Critical') ? T.red : T.muted }}>{open.length} open</span>}>
            Issues
          </SectionLabel>
          <Card style={{ padding: open.length || closed.length ? '6px 16px' : 16 }}>
            {open.length === 0 && closed.length === 0 && <div style={{ color: T.muted, fontSize: 13.5, padding: '6px 0' }}>No issues raised.</div>}
            {open.map((i) => (
              <IssueRow key={i.id} issue={i} />
            ))}
            {closed.length > 0 && (
              <>
                <button
                  onClick={() => setShowClosed((s) => !s)}
                  style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', padding: '10px 0', display: 'flex', alignItems: 'center', gap: 6, color: T.muted, fontWeight: 600, fontSize: 13 }}
                >
                  <Icon name={showClosed ? 'chevronDown' : 'chevron'} size={15} color={T.muted} />
                  {closed.length} closed
                </button>
                {showClosed && closed.map((i) => <IssueRow key={i.id} issue={i} closed />)}
              </>
            )}
          </Card>
        </div>

        {/* Captures */}
        <div>
          <SectionLabel>Site captures</SectionLabel>
          {p.captures.length > 0 ? (
            <Gallery ids={p.captures} />
          ) : (
            <Card style={{ padding: 16, color: T.muted, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 9 }}>
              <Icon name="info" size={17} color={T.faint} /> Site captures pending sync.
            </Card>
          )}
        </div>

        {/* BIM */}
        <div>
          <SectionLabel>BIM model</SectionLabel>
          <Card style={{ padding: '6px 16px' }}>
            <KeyVal k="Model" v={<span style={mono}>{p.bim.file}</span>} />
            <KeyVal k="Software" v={p.bim.software} />
            <KeyVal k="LOD" v={<span style={mono}>{p.bim.lod || '—'}</span>} />
            <KeyVal k="Disciplines" v={p.bim.disciplines.join(', ') || '—'} />
            <KeyVal k="Last aligned" v={<span style={mono}>{p.bim.last_aligned ? fmtDate(p.bim.last_aligned) : '—'}</span>} />
          </Card>
        </div>

        {/* Team */}
        {p.team.length > 0 && (
          <div>
            <SectionLabel>Site team</SectionLabel>
            <Card style={{ padding: '6px 16px' }}>
              {p.team.map((m, i) => {
                const [nm, role] = m.split(' · ');
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 0', borderBottom: i < p.team.length - 1 ? `1px solid ${T.hairline2}` : 'none' }}>
                    <Avatar initials={nm.split(/[\s.]+/).filter(Boolean).map((s) => s[0]).slice(0, 2).join('').toUpperCase()} size={30} />
                    <div style={{ fontSize: 13.5, color: T.ink, fontWeight: 600 }}>{nm}</div>
                    <div style={{ flex: 1 }} />
                    <div style={{ fontSize: 12.5, color: T.muted }}>{role}</div>
                  </div>
                );
              })}
            </Card>
          </div>
        )}

        {/* Trades */}
        {p.trades.length > 0 && (
          <div>
            <SectionLabel>Trade progress</SectionLabel>
            <Card style={{ padding: '6px 16px' }}>
              {p.trades.map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < p.trades.length - 1 ? `1px solid ${T.hairline2}` : 'none' }}>
                  <span style={{ flex: 1, fontSize: 13.5, color: T.ink }}>{t.name}</span>
                  <TradeTag status={t.status} />
                </div>
              ))}
            </Card>
          </div>
        )}
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
          marginTop: 16,
        }}
      >
        <Button full icon="reports" onClick={() => nav.push(<ReportDetail projectId={p.id} />)}>
          Report
        </Button>
        <Button full primary icon="scan" onClick={() => startScan(p.id)}>
          New scan
        </Button>
      </div>
    </Screen>
  );
}

function ScanTimeline({ project }: { project: Project }) {
  return (
    <div className="no-scrollbar" style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
      {project.scans.map((s, i) => (
        <div key={s.id} style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <div style={{ flex: 1, height: 2, background: i === 0 ? 'transparent' : T.hairline }} />
            <div style={{ width: 11, height: 11, borderRadius: 11, background: i === project.scans.length - 1 ? T.teal : T.navy, flexShrink: 0 }} />
            <div style={{ flex: 1, height: 2, background: i === project.scans.length - 1 ? 'transparent' : T.hairline }} />
          </div>
          <div style={{ ...mono, fontSize: 13, fontWeight: 800, color: T.ink, marginTop: 7 }}>{s.coverage}%</div>
          <div style={{ ...mono, fontSize: 10, color: T.faint, marginTop: 1 }}>{fmtDateShort(s.date)}</div>
        </div>
      ))}
    </div>
  );
}

function IssueRow({ issue, closed }: { issue: Issue; closed?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 0', borderBottom: `1px solid ${T.hairline2}`, opacity: closed ? 0.6 : 1 }}>
      <div style={{ marginTop: 4 }}>
        <SevDot sev={issue.severity} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, color: T.ink, fontWeight: 600, textDecoration: closed ? 'line-through' : 'none' }}>{issue.title}</div>
        <div style={{ ...mono, fontSize: 11.5, color: T.muted, marginTop: 2 }}>
          {issue.id} · {issue.zone} · {SEV[issue.severity].label}
        </div>
      </div>
    </div>
  );
}

function TradeTag({ status }: { status: Project['trades'][number]['status'] }) {
  const map = { Done: T.teal, 'In progress': T.blue, 'Not started': T.faint } as const;
  const c = map[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: c }}>
      <span style={{ width: 7, height: 7, borderRadius: 7, background: c }} />
      {status}
    </span>
  );
}
