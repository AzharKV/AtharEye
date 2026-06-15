// Reports — history list + the full progress report document.
// §1 Lead with findings: donut → severity tally → findings above the fold; meta collapsible.
// §2 Zone vs project depth split: project = breadth (all zones, NSR rollup); zone = depth (one zone, NSR table).
// §3 Pending: slim banner when zone processing but has prior report; placeholder only if no prior data.
// §5 NSR works: zone = full table; project = rollup + per-zone counts; named in methodology.
import { useState } from 'react';
import { T, SEV } from '../theme';
import { reportFor } from '../lib/reports';
import type { ReportModel } from '../lib/reports';
import { fmtDate } from '../lib/format';
import { useStore } from '../lib/store';
import { useReady } from '../hooks/useReady';
import { Screen, useNav } from '../navigation/Navigator';
import { PushHeader, RoundBtn } from '../navigation/PushHeader';
import { ProjectDetail } from './ProjectDetail';
import { Issues } from './Issues';
import {
  Button,
  Card,
  Donut,
  EmptyState,
  Gallery,
  KeyVal,
  LoadingBody,
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
import type { Issue, Project, Zone } from '../types';
import type { NsrItem, NsrStatus } from '../types';
import { zoneMedia } from '../lib/photos';

export function ReportsList() {
  const { data } = useStore();
  const nav = useNav();
  const rows = [...data.projects].sort((a, b) => {
    const da = a.scans[a.scans.length - 1]?.date ?? a.start_date;
    const db = b.scans[b.scans.length - 1]?.date ?? b.start_date;
    return db.localeCompare(da);
  });

  return (
    <Screen padTop={0}>
      <ScreenHeader
        title="Reports"
        sub={`${rows.length} reports · latest first`}
        trailing={
          <button
            onClick={() => nav.push(<Issues />)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 13px', borderRadius: 999, border: `1px solid ${T.hairline}`, background: T.surface, color: T.ink, fontWeight: 700, fontSize: 13, fontFamily: T.font, cursor: 'pointer' }}
          >
            <Icon name="alert" size={15} color={T.amber} /> Issues
          </button>
        }
      />
      <div style={{ padding: '6px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.length === 0 && (
          <EmptyState icon="reports" title="No reports yet" sub="Create a project and run a scan to generate your first report." />
        )}
        {rows.map((p) => {
          const last = p.scans[p.scans.length - 1];
          const processing = p.scans.some((s) => s.status === 'Processing');
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
              {processing && (
                <span style={{ fontSize: 11, fontWeight: 700, color: T.amber, background: T.amberTint, borderRadius: 999, padding: '3px 9px', whiteSpace: 'nowrap' }}>Processing</span>
              )}
              <StatusPill status={p.status} />
              <Icon name="chevron" size={17} color={T.faint} />
            </Card>
          );
        })}
      </div>
    </Screen>
  );
}

// ── Severity tally strip
function SevTally({ issues }: { issues: ReportModel['openIssues'] }) {
  const sevs = ['Critical', 'Major', 'Minor', 'Cosmetic'] as const;
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
      {sevs.map((sev) => {
        const count = issues.filter((i) => i.severity === sev).length;
        return (
          <div key={sev} style={{ flex: 1, background: T.canvas, borderRadius: 10, padding: '8px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <SevDot sev={sev} size={8} />
            <div style={{ ...mono, fontSize: 15, fontWeight: 700, color: T.ink }}>{count}</div>
            <div style={{ fontSize: 9.5, color: T.muted, fontWeight: 600 }}>{sev}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Full finding card
function FindingCard({ issue, last }: { issue: ReportModel['openIssues'][0]; last: boolean }) {
  const s = SEV[issue.severity];
  return (
    <div style={{ paddingBottom: last ? 0 : 12, marginBottom: last ? 0 : 12, borderBottom: last ? 'none' : `1px solid ${T.hairline2}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
        <SevDot sev={issue.severity} />
        <span style={{ fontSize: 11, fontWeight: 700, color: s.c, background: `${s.c}18`, borderRadius: 999, padding: '2px 8px' }}>{s.label}</span>
        <span style={{ ...mono, fontSize: 11, color: T.muted, fontWeight: 600 }}>{issue.id}</span>
        <div style={{ flex: 1 }} />
        <span style={{ ...mono, fontSize: 10.5, color: T.muted }}>{fmtDate(issue.raised)}</span>
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: T.ink, marginBottom: 4 }}>
        {issue.zone}{issue.location_detail ? ` — ${issue.location_detail}` : ''}
      </div>
      {issue.thumbnail && (
        <img
          src={issue.thumbnail}
          alt={`Scan evidence — ${issue.zone}`}
          style={{ width: '100%', borderRadius: 8, marginBottom: 8, objectFit: 'cover', maxHeight: 140 }}
        />
      )}
      {issue.finding && (
        <div style={{ fontSize: 12.5, color: T.ink, lineHeight: 1.55, marginBottom: 6 }}>{issue.finding}</div>
      )}
      {(issue.measured || issue.tolerance || issue.deviation) && (
        <div style={{ background: T.canvas, borderRadius: 8, padding: '8px 10px', marginBottom: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {issue.measured && <KeyVal k="Measured" v={<span style={{ ...mono, fontWeight: 700 }}>{issue.measured}</span>} tight />}
          {issue.tolerance && <KeyVal k="Tolerance" v={issue.tolerance} tight />}
          {issue.deviation && (
            <KeyVal k="Deviation" v={
              <span style={{ ...mono, fontWeight: 700, color: issue.severity === 'Critical' ? T.red : T.amber }}>{issue.deviation}</span>
            } tight />
          )}
        </div>
      )}
      {issue.impact && (
        <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5, marginBottom: 5 }}>
          <span style={{ fontWeight: 700, color: T.ink }}>Impact: </span>{issue.impact}
        </div>
      )}
      {issue.action && (
        <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5, marginBottom: 5 }}>
          <span style={{ fontWeight: 700, color: T.ink }}>Action: </span>{issue.action}
          {issue.responsible && <span style={{ color: T.muted }}> · {issue.responsible}</span>}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
        <span style={{ width: 7, height: 7, borderRadius: 7, background: issue.status === 'Open' ? T.amber : T.teal }} />
        <span style={{ fontSize: 11.5, color: T.muted, fontWeight: 600 }}>{issue.status}</span>
      </div>
    </div>
  );
}

// ── NSR status badge colour
const NSR_STATUS_COLOR: Record<NsrStatus, string> = {
  Done: T.teal,
  'In progress': T.amber,
  Outstanding: T.muted,
};

// ── NSR full table (zone drill-down)
function NsrTable({ works }: { works: NsrItem[] }) {
  if (works.length === 0) {
    return (
      <div style={{ fontSize: 12.5, color: T.muted, padding: '8px 0' }}>No works items scheduled for this zone.</div>
    );
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr>
            {(['Code', 'Description', 'Unit', 'Qty', 'Status'] as const).map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: '5px 8px', borderBottom: `2px solid ${T.hairline}`, color: T.muted, fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {works.map((w, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : T.canvas }}>
              <td style={{ ...mono, padding: '6px 8px', color: T.muted, fontSize: 11, whiteSpace: 'nowrap' }}>{w.code}</td>
              <td style={{ padding: '6px 8px', color: T.ink, lineHeight: 1.4 }}>{w.description}</td>
              <td style={{ ...mono, padding: '6px 8px', color: T.muted, textAlign: 'center', whiteSpace: 'nowrap' }}>{w.unit}</td>
              <td style={{ ...mono, padding: '6px 8px', color: T.ink, textAlign: 'right', whiteSpace: 'nowrap' }}>{w.qty}</td>
              <td style={{ padding: '6px 8px', whiteSpace: 'nowrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: NSR_STATUS_COLOR[w.status] }}>
                  <span style={{ width: 6, height: 6, borderRadius: 6, background: NSR_STATUS_COLOR[w.status], flexShrink: 0 }} />
                  {w.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── NSR rollup for whole-project view
function NsrRollup({ project }: { project: Project }) {
  const zonesWithWorks = project.zones.filter((z) => z.works && z.works.length > 0);
  if (zonesWithWorks.length === 0) return null;

  const totalItems = zonesWithWorks.reduce((s, z) => s + (z.works?.length ?? 0), 0);
  const doneItems = zonesWithWorks.reduce((s, z) => s + (z.works?.filter((w) => w.status === 'Done').length ?? 0), 0);

  return (
    <>
      {/* Summary row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{ flex: 1, height: 6, background: T.hairline, borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ width: `${totalItems > 0 ? (doneItems / totalItems) * 100 : 0}%`, height: '100%', background: T.teal, borderRadius: 6, transition: 'width .4s' }} />
        </div>
        <span style={{ ...mono, fontSize: 13, fontWeight: 700, color: T.ink, whiteSpace: 'nowrap' }}>{doneItems} / {totalItems} complete</span>
      </div>
      {/* Per-zone counts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {zonesWithWorks.map((z) => {
          const total = z.works?.length ?? 0;
          const done = z.works?.filter((w) => w.status === 'Done').length ?? 0;
          const inProg = z.works?.filter((w) => w.status === 'In progress').length ?? 0;
          return (
            <div key={z.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12.5, color: T.ink, fontWeight: 600, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{z.name}</span>
              <span style={{ ...mono, fontSize: 11, color: T.teal, fontWeight: 700 }}>{done} done</span>
              {inProg > 0 && <span style={{ ...mono, fontSize: 11, color: T.amber, fontWeight: 700 }}>{inProg} in progress</span>}
              <span style={{ ...mono, fontSize: 11, color: T.muted }}>{total} total</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Collapsible section wrapper
function CollapsibleSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Card style={{ padding: 0, marginBottom: 0 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: T.font }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{title}</span>
        <Icon name={open ? 'chevron' : 'chevron'} size={16} color={T.muted} style={{ transform: open ? 'rotate(90deg)' : 'rotate(-90deg)', transition: 'transform .2s' }} />
      </button>
      {open && (
        <div style={{ padding: '0 16px 14px', borderTop: `1px solid ${T.hairline2}` }}>
          {children}
        </div>
      )}
    </Card>
  );
}

// ── Slim processing banner
function ProcessingBanner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: T.amberTint, borderRadius: 10, padding: '9px 14px', marginBottom: 12 }}>
      <span style={{ width: 7, height: 7, borderRadius: 7, background: T.amber, flexShrink: 0, animation: 'pulse 1.4s ease-in-out infinite' }} />
      <span style={{ fontSize: 12.5, fontWeight: 600, color: T.amber }}>New scan processing — updated report ready in ~5 min.</span>
    </div>
  );
}

// ── Zone scan evidence frame (poster still from the zone scan media)
function ZoneEvidenceFrame({ zoneId }: { zoneId: string }) {
  const media = zoneMedia(zoneId);
  if (!media.poster) return null;
  return (
    <img
      src={media.poster}
      alt="Latest scan frame"
      style={{ width: '100%', borderRadius: 10, objectFit: 'cover', maxHeight: 160, display: 'block' }}
    />
  );
}

// ── "Changes since last scan" — previous → new coverage delta + findings raised/resolved by the
//    latest scan. Reads the frozen per-scan snapshot (Scan.prevCoverage/zonePrev/zoneNew/newFindings/
//    resolvedFindings). Considers Ready + Processing scans so a just-recorded live scan shows its delta
//    immediately (coverage is written on commit, before the ~5-min processing completes). Hidden when the
//    latest scan carries no delta and no finding changes (a first-time / baseline report).
function ChangesSinceLastScan({ project, scope, activeZone }: { project: Project; scope: 'project' | 'zone'; activeZone: Zone | null }) {
  const considered = project.scans.filter((s) => s.status === 'Ready' || s.status === 'Processing');
  if (considered.length === 0) return null;

  const zone = scope === 'zone' ? activeZone : null;
  const scan = zone
    ? [...considered].reverse().find((s) => s.zoneId === zone.id)
    : considered[considered.length - 1];
  if (!scan) return null;

  const prev = zone ? scan.zonePrev : scan.prevCoverage;
  const next = zone ? scan.zoneNew ?? zone.coverage : scan.coverage;
  const hasDelta = prev != null && next != null && next !== prev;
  const delta = prev != null && next != null ? next - prev : 0;

  const byId = (ids?: string[]) =>
    (ids ?? []).map((id) => project.issues.find((i) => i.id === id)).filter((i): i is Issue => !!i);
  let raised = byId(scan.newFindings);
  let resolved = byId(scan.resolvedFindings);
  if (zone) {
    raised = raised.filter((i) => i.zone === zone.name);
    resolved = resolved.filter((i) => i.zone === zone.name);
  }

  if (!hasDelta && raised.length === 0 && resolved.length === 0) return null;

  return (
    <>
      <SectionLabel right={<span style={{ ...mono, fontSize: 11.5, color: T.muted, fontWeight: 700 }}>{fmtDate(scan.date)}</span>}>
        Changes since last scan
      </SectionLabel>
      <Card style={{ padding: 16, marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: raised.length || resolved.length ? 12 : 0, borderBottom: raised.length || resolved.length ? `1px solid ${T.hairline2}` : 'none', marginBottom: raised.length || resolved.length ? 12 : 0 }}>
          <span style={{ fontSize: 12.5, color: T.muted, fontWeight: 600, flex: 1, minWidth: 0 }}>
            {zone ? `${zone.name} coverage` : 'Overall coverage'}
          </span>
          {hasDelta ? (
            <>
              <span style={{ ...mono, fontSize: 13, color: T.muted }}>{prev}%</span>
              <span style={{ color: T.faint, fontSize: 14, fontWeight: 700 }}>→</span>
              <span style={{ ...mono, fontSize: 16, fontWeight: 700, color: T.ink }}>{next}%</span>
              <span style={{ ...mono, fontSize: 12, fontWeight: 700, color: delta > 0 ? T.teal : T.muted, background: delta > 0 ? T.tealTint : T.surface2, borderRadius: 999, padding: '2px 8px' }}>
                {delta > 0 ? `+${delta}` : delta}%
              </span>
            </>
          ) : (
            <span style={{ ...mono, fontSize: 13, fontWeight: 700, color: T.ink }}>{next}%</span>
          )}
        </div>

        {raised.length > 0 && (
          <div style={{ marginBottom: resolved.length ? 10 : 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.amber, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>New findings raised</div>
            {raised.map((i) => (
              <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0' }}>
                <SevDot sev={i.severity} />
                <span style={{ fontSize: 12.5, color: T.ink, fontWeight: 600, flex: 1, minWidth: 0 }}>{i.title}</span>
                <span style={{ ...mono, fontSize: 11, color: T.muted, flexShrink: 0 }}>{i.id}</span>
              </div>
            ))}
          </div>
        )}

        {resolved.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.teal, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>Findings resolved</div>
            {resolved.map((i) => (
              <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0' }}>
                <Icon name="checkCircle" size={14} color={T.teal} />
                <span style={{ fontSize: 12.5, color: T.muted, fontWeight: 600, textDecoration: 'line-through', flex: 1, minWidth: 0 }}>{i.title}</span>
                <span style={{ ...mono, fontSize: 11, color: T.muted, flexShrink: 0 }}>{i.id}</span>
              </div>
            ))}
          </div>
        )}

        {hasDelta && raised.length === 0 && resolved.length === 0 && (
          <div style={{ fontSize: 12, color: T.muted, marginTop: 10 }}>No new or resolved findings since the previous scan.</div>
        )}
      </Card>
    </>
  );
}

export function ReportDetail({ projectId, coverage }: { projectId: string; coverage?: number }) {
  const { data } = useStore();
  const nav = useNav();
  const [share, setShare] = useState(false);
  const [scope, setScope] = useState<'project' | 'zone'>('project');
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  const ready = useReady();

  const p = data.projects.find((x) => x.id === projectId);
  if (!p) {
    return (
      <Screen padTop={0}>
        <PushHeader title="Report" />
        <div style={{ padding: 40, textAlign: 'center', color: T.muted }}>This project was removed.</div>
      </Screen>
    );
  }

  if (!ready) {
    return (
      <Screen padTop={0}>
        <PushHeader title="Progress report" />
        <LoadingBody />
      </Screen>
    );
  }

  const r = reportFor(p, coverage);
  const deep = p.depth === 'deep';
  const contractor = p.contractor ?? 'Cairn Refurbishment Ltd';
  const preparedBy = p.preparedBy ?? 'J. Mackay · Site Supervisor';
  const ringColor = p.status === 'Needs review' && r.coverage < 100 ? T.amber : r.coverage >= 100 ? T.teal : T.navy;

  const activeZone = activeZoneId ? p.zones.find((z) => z.id === activeZoneId) : null;
  const zoneIssues = scope === 'zone' && activeZone
    ? r.openIssues.filter((i) => i.zone === activeZone.name)
    : r.openIssues;

  const zoneIsProcessing = scope === 'zone' && activeZone
    ? p.scans.some((s) => s.status === 'Processing' && s.zoneId === activeZone.id)
    : false;

  // Pending logic: show banner (not blank) if zone has prior coverage data
  const hasPriorReport = activeZone ? activeZone.coverage > 0 : false;
  const showPendingBanner = zoneIsProcessing && hasPriorReport;
  const showPendingPlaceholder = zoneIsProcessing && !hasPriorReport;

  // Zone coverage for zone scope
  const displayCoverage = scope === 'zone' && activeZone ? activeZone.coverage : r.coverage;
  const zoneRingColor = displayCoverage >= 100 ? T.teal : T.navy;

  return (
    <Screen padTop={0} padBottom={92}>
      <PushHeader title="Progress report" trailing={<RoundBtn icon="share" label="Share" onClick={() => setShare(true)} />} />

      <div style={{ padding: '14px 16px 0' }}>
        {/* ── Scope toggle */}
        <div style={{ display: 'flex', background: T.navyTint, borderRadius: 12, padding: 3, marginBottom: 14 }}>
          {(['project', 'zone'] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setScope(s); if (s === 'zone' && !activeZoneId) setActiveZoneId(p.zones[0]?.id ?? null); }}
              style={{ flex: 1, padding: '7px 4px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: T.font, background: scope === s ? T.surface : 'transparent', color: scope === s ? T.ink : T.muted, boxShadow: scope === s ? '0 1px 4px rgba(27,42,61,0.10)' : 'none', transition: 'all .15s' }}
            >
              {s === 'project' ? 'Whole project' : 'By zone'}
            </button>
          ))}
        </div>

        {/* ── Zone selector chips */}
        {scope === 'zone' && (
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 14, paddingBottom: 2 }}>
            {p.zones.map((z) => {
              const on = activeZoneId === z.id;
              const processing = p.scans.some((s) => s.status === 'Processing' && s.zoneId === z.id);
              return (
                <button
                  key={z.id}
                  onClick={() => setActiveZoneId(z.id)}
                  style={{ flexShrink: 0, padding: '6px 13px', borderRadius: 999, border: `1px solid ${on ? T.navy : T.hairline}`, background: on ? T.navy : T.surface, color: on ? '#fff' : T.ink, fontWeight: 700, fontSize: 12.5, fontFamily: T.font, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {z.name}
                  {processing && <span style={{ width: 7, height: 7, borderRadius: 7, background: T.amber }} />}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Pending banner (slim — shown above report when zone processing but has prior data) */}
        {showPendingBanner && <ProcessingBanner />}

        {/* ── Pending placeholder (blank zone — no prior report exists) */}
        {showPendingPlaceholder && (
          <Card style={{ padding: 18, marginBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 22, background: T.amberTint, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 1.4s ease-in-out infinite' }}>
              <Icon name="clock" size={22} color={T.amber} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>Report pending</div>
            <div style={{ fontSize: 12.5, color: T.muted }}>Generating — usually ready within ~5 min. The whole-project report is still viewable.</div>
          </Card>
        )}

        {/* ── Main report content (always shown unless pending placeholder) */}
        {!showPendingPlaceholder && (
          <>
            {/* ─────────────────────── PROJECT SCOPE ─────────────────────── */}
            {scope === 'project' && (
              <>
                {/* Brand + coverage donut hero */}
                <Card style={{ padding: 18, marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: `2px solid ${T.navy}`, marginBottom: 14 }}>
                    <Wordmark size={18} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Progress report</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4px 0 10px' }}>
                    <Donut value={r.coverage} size={164} stroke={14} color={ringColor} countUp sub={`${100 - r.coverage}% outstanding`} />
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.6, color: T.ink, margin: '4px 2px 0' }}>{r.summary}</p>
                </Card>

                {/* What changed in the latest scan — read first, above the static findings */}
                <ChangesSinceLastScan project={p} scope="project" activeZone={null} />

                {/* Severity tally */}
                <SectionLabel>Findings summary</SectionLabel>
                <SevTally issues={r.openIssues} />

                {/* Zone coverage bars */}
                {r.zones.length > 0 && (
                  <>
                    <SectionLabel>Zone coverage</SectionLabel>
                    <Card style={{ padding: 16, marginBottom: 0 }}>
                      <ZoneBars zones={r.zones} />
                    </Card>
                  </>
                )}

                {/* Findings register — worst-first */}
                <SectionLabel right={
                  <span style={{ ...mono, fontSize: 12.5, color: T.muted, fontWeight: 700 }}>
                    {r.openIssues.length} open · {r.closedCount} closed
                  </span>
                }>
                  Findings register
                </SectionLabel>
                <Card style={{ padding: r.openIssues.length ? 16 : 16, marginBottom: 0 }}>
                  {r.openIssues.length === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.teal, fontSize: 13.5, fontWeight: 600, padding: '4px 0' }}>
                      <Icon name="checkCircle" size={18} color={T.teal} /> Snag list cleared — 0 open.
                    </div>
                  ) : (
                    r.openIssues.map((i, idx) => (
                      <FindingCard key={i.id} issue={i} last={idx === r.openIssues.length - 1} />
                    ))
                  )}
                </Card>

                {/* NSR works rollup */}
                {p.zones.some((z) => z.works && z.works.length > 0) && (
                  <>
                    <SectionLabel>NSR works schedule</SectionLabel>
                    <Card style={{ padding: 16, marginBottom: 0 }}>
                      <NsrRollup project={p} />
                    </Card>
                  </>
                )}

                {/* Project extras */}
                <SectionLabel>Project overview</SectionLabel>
                <Card style={{ padding: '6px 16px', marginBottom: 0 }}>
                  <KeyVal k="Zones scanned" v={<span style={mono}>{p.zones.length} / {p.zones.length}</span>} />
                  <KeyVal k="Open findings" v={<span style={{ ...mono, color: r.openIssues.length > 0 ? T.amber : T.teal, fontWeight: 700 }}>{r.openIssues.length}</span>} />
                  <KeyVal k="Overall status" v={<StatusPill status={p.status} />} />
                  <KeyVal k="Last BIM alignment" v={<span style={mono}>{p.bim.last_aligned ? fmtDate(p.bim.last_aligned) : '—'}</span>} />
                  <KeyVal k="Scans recorded" v={<span style={mono}>{p.scans.filter((s) => s.status === 'Ready').length}</span>} />
                </Card>

                {/* Coverage over time */}
                {r.spark.length > 1 && (
                  <>
                    <SectionLabel>Coverage over time</SectionLabel>
                    <Card style={{ padding: 16, marginBottom: 0 }}>
                      <Sparkline points={r.spark} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                        {r.spark.map((s, i) => (
                          <span key={i} style={{ ...mono, fontSize: 9.5, color: T.faint, fontWeight: 600 }}>{fmtDate(s.date).slice(0, 6)}</span>
                        ))}
                      </div>
                    </Card>
                  </>
                )}

                {/* Collapsible report details */}
                <SectionLabel>Report details</SectionLabel>
                <CollapsibleSection title="Project &amp; report metadata">
                  <div style={{ paddingTop: 10 }}>
                    <KeyVal k="Project" v={p.name} />
                    <KeyVal k="Address" v={<span style={mono}>{p.location}</span>} />
                    <KeyVal k="Client" v={p.client} />
                    <KeyVal k="Contractor" v={contractor} />
                    <KeyVal k="Type" v={p.type} />
                    <KeyVal k="Scope" v="Whole project" />
                    <KeyVal k="Stage" v={r.rung} />
                    <KeyVal k="Report date" v={<span style={mono}>{r.date}</span>} />
                    <KeyVal k="Prepared by" v={preparedBy} />
                    <KeyVal k="BIM model" v={<span style={mono}>{p.bim.file} (LOD {p.bim.lod})</span>} />
                    <KeyVal k="Coverage" v={<span style={{ ...mono, fontWeight: 700, color: T.teal }}>{r.coverage}%</span>} />
                    <KeyVal k="Accuracy" v={<span style={mono}>±17 mm</span>} />
                  </div>
                </CollapsibleSection>

                {/* Captures */}
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
                    <Card style={{ padding: '12px 16px', marginBottom: 0 }}>
                      <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {r.nextActions.map((a, i) => (
                          <li key={i} style={{ fontSize: 13.5, color: T.ink, lineHeight: 1.5 }}>{a}</li>
                        ))}
                      </ol>
                    </Card>
                  </>
                )}
              </>
            )}

            {/* ─────────────────────── ZONE SCOPE ─────────────────────── */}
            {scope === 'zone' && activeZone && (
              <>
                {/* Zone coverage donut + delta */}
                <Card style={{ padding: 18, marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: `2px solid ${T.navy}`, marginBottom: 14 }}>
                    <Wordmark size={18} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Zone report</span>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.ink, marginBottom: 14 }}>{activeZone.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 10 }}>
                    <Donut value={displayCoverage} size={130} stroke={12} color={zoneRingColor} countUp sub={`${100 - displayCoverage}% outstanding`} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: T.muted, marginBottom: 4 }}>Coverage</div>
                      <div style={{ ...mono, fontSize: 26, fontWeight: 700, color: T.navy }}>{displayCoverage}%</div>
                      <div style={{ fontSize: 12, color: T.muted, marginTop: 6 }}>{activeZone.stage} stage</div>
                      {activeZone.note && (
                        <div style={{ fontSize: 12, color: T.muted, marginTop: 4, lineHeight: 1.4 }}>{activeZone.note}</div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* What changed in this zone's latest scan */}
                <ChangesSinceLastScan project={p} scope="zone" activeZone={activeZone} />

                {/* Zone scan evidence frame */}
                <SectionLabel>Scan evidence</SectionLabel>
                <Card style={{ padding: 10, marginBottom: 0 }}>
                  <ZoneEvidenceFrame zoneId={activeZone.id} />
                </Card>

                {/* Zone severity tally */}
                <SectionLabel>Findings summary</SectionLabel>
                <SevTally issues={zoneIssues} />

                {/* Zone findings */}
                <SectionLabel right={
                  <span style={{ ...mono, fontSize: 12.5, color: T.muted, fontWeight: 700 }}>
                    {zoneIssues.length} open
                  </span>
                }>
                  Findings register
                </SectionLabel>
                <Card style={{ padding: zoneIssues.length ? 16 : 16, marginBottom: 0 }}>
                  {zoneIssues.length === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.teal, fontSize: 13.5, fontWeight: 600, padding: '4px 0' }}>
                      <Icon name="checkCircle" size={18} color={T.teal} /> No open findings for this zone.
                    </div>
                  ) : (
                    zoneIssues.map((i, idx) => (
                      <FindingCard key={i.id} issue={i} last={idx === zoneIssues.length - 1} />
                    ))
                  )}
                </Card>

                {/* NSR works breakdown — full table for zone */}
                {activeZone.works && activeZone.works.length > 0 && (
                  <>
                    <SectionLabel>NSR works breakdown</SectionLabel>
                    <Card style={{ padding: 14, marginBottom: 0 }}>
                      <NsrTable works={activeZone.works} />
                    </Card>
                  </>
                )}

                {/* Zone report details collapsible */}
                <SectionLabel>Report details</SectionLabel>
                <CollapsibleSection title="Zone &amp; report metadata">
                  <div style={{ paddingTop: 10 }}>
                    <KeyVal k="Project" v={p.name} />
                    <KeyVal k="Zone" v={activeZone.name} />
                    <KeyVal k="Address" v={<span style={mono}>{p.location}</span>} />
                    <KeyVal k="Client" v={p.client} />
                    <KeyVal k="Contractor" v={contractor} />
                    <KeyVal k="Stage" v={activeZone.stage} />
                    <KeyVal k="Report date" v={<span style={mono}>{r.date}</span>} />
                    <KeyVal k="Prepared by" v={preparedBy} />
                    <KeyVal k="BIM model" v={<span style={mono}>{p.bim.file} (LOD {p.bim.lod})</span>} />
                    <KeyVal k="Coverage" v={<span style={{ ...mono, fontWeight: 700, color: T.teal }}>{displayCoverage}%</span>} />
                    <KeyVal k="Accuracy" v={<span style={mono}>±17 mm</span>} />
                  </div>
                </CollapsibleSection>
              </>
            )}

            {/* ── Shared: Methodology & limitations (mentions NSR) */}
            <SectionLabel>Methodology &amp; limitations</SectionLabel>
            <Card style={{ padding: '12px 16px', marginBottom: 0 }}>
              <div style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.6 }}>
                <p style={{ margin: '0 0 7px' }}>Geometry captured using iPhone LiDAR (ARKit Scene Reconstruction). Coverage computed by comparing the captured point cloud against the BIM reference model.</p>
                <p style={{ margin: '0 0 7px' }}>BIM reference: <span style={{ ...mono, color: T.ink }}>{p.bim.file}</span> (LOD {p.bim.lod}, {p.bim.disciplines.join(', ')}). Last aligned {p.bim.last_aligned ? fmtDate(p.bim.last_aligned) : '—'}.</p>
                <p style={{ margin: '0 0 7px' }}>Positional accuracy <strong style={{ color: T.ink }}>±17 mm</strong>. Works schedule follows the <strong style={{ color: T.ink }}>NSR (National Schedule of Rates)</strong> standard. Surface defects (cracks, dampness, finish quality) are outside scope. Tolerances per NHBC Standards 2024 / Scottish Building Standards where applicable.</p>
                <p style={{ margin: 0 }}>This report reflects site conditions at time of scanning only. Subsequent works are not represented.</p>
              </div>
            </Card>

            {/* ── Sign-off */}
            <SectionLabel>Sign-off</SectionLabel>
            <Card style={{ padding: '6px 16px', marginBottom: 0 }}>
              <KeyVal k="Prepared by" v={preparedBy} />
              <KeyVal k="Reviewed by" v="—" />
              <KeyVal k="Date" v={<span style={mono}>{r.date}</span>} />
            </Card>

            {/* Footer */}
            <div style={{ ...mono, fontSize: 11.5, color: T.muted, textAlign: 'center', padding: '20px 10px 6px', lineHeight: 1.5 }}>{r.footer}</div>
          </>
        )}
      </div>

      {/* Footer actions */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 30,
          display: 'flex',
          gap: 10,
          padding: '14px 18px',
          paddingBottom: 'max(14px, env(safe-area-inset-bottom))',
          background: `linear-gradient(transparent, ${T.canvas} 26%)`,
        }}
      >
        <Button full icon="projects" onClick={() => nav.push(<ProjectDetail projectId={p.id} />)}>
          Project
        </Button>
        <Button full primary icon="pdf" onClick={() => setShare(true)}>
          Export PDF
        </Button>
      </div>

      {share && (
        <ShareSheet
          report={r}
          scope={scope}
          activeZoneId={scope === 'zone' ? (activeZoneId ?? undefined) : undefined}
          onClose={() => setShare(false)}
        />
      )}
    </Screen>
  );
}
