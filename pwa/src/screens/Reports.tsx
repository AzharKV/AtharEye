// Reports — history list + the full progress report document.
// Task B: two-scope IA (Whole project / By zone toggle), 4-level severity tally,
// full finding cards (id · sev · zone · finding · measured/tolerance/deviation ·
// impact · action · responsible · status), methodology + sign-off footer sections.
// Task C: real PDF via ShareSheet → generatePdf (jsPDF, Web Share API).
// Task A: "Pending" badge when the active zone has a Processing scan.
import { useState } from 'react';
import { T, SEV } from '../theme';
import { reportFor } from '../lib/reports';
import type { ReportModel } from '../lib/reports';
import { fmtDate } from '../lib/format';
import { useStore } from '../lib/store';
import { Screen, useNav } from '../navigation/Navigator';
import { PushHeader, RoundBtn } from '../navigation/PushHeader';
import { ProjectDetail } from './ProjectDetail';
import { Issues } from './Issues';
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
import type { Severity } from '../types';

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
  const sevs: Severity[] = ['Critical', 'Major', 'Minor', 'Cosmetic'];
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

// ── Full finding card (Task B)
function FindingCard({ issue, last }: { issue: ReportModel['openIssues'][0]; last: boolean }) {
  const s = SEV[issue.severity];
  return (
    <div style={{ paddingBottom: last ? 0 : 12, marginBottom: last ? 0 : 12, borderBottom: last ? 'none' : `1px solid ${T.hairline2}` }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
        <SevDot sev={issue.severity} />
        <span style={{ fontSize: 11, fontWeight: 700, color: s.c, background: `${s.c}18`, borderRadius: 999, padding: '2px 8px' }}>{s.label}</span>
        <span style={{ ...mono, fontSize: 11, color: T.muted, fontWeight: 600 }}>{issue.id}</span>
        <div style={{ flex: 1 }} />
        <span style={{ ...mono, fontSize: 10.5, color: T.muted }}>{fmtDate(issue.raised)}</span>
      </div>
      {/* Zone + location */}
      <div style={{ fontSize: 12.5, fontWeight: 700, color: T.ink, marginBottom: 4 }}>
        {issue.zone}{issue.location_detail ? ` — ${issue.location_detail}` : ''}
      </div>
      {/* Finding description */}
      {issue.finding && (
        <div style={{ fontSize: 12.5, color: T.ink, lineHeight: 1.55, marginBottom: 6 }}>{issue.finding}</div>
      )}
      {/* Measured / Tolerance / Deviation */}
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
      {/* Impact */}
      {issue.impact && (
        <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5, marginBottom: 5 }}>
          <span style={{ fontWeight: 700, color: T.ink }}>Impact: </span>{issue.impact}
        </div>
      )}
      {/* Action + responsible */}
      {issue.action && (
        <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5, marginBottom: 5 }}>
          <span style={{ fontWeight: 700, color: T.ink }}>Action: </span>{issue.action}
          {issue.responsible && <span style={{ color: T.muted }}> · {issue.responsible}</span>}
        </div>
      )}
      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
        <span style={{ width: 7, height: 7, borderRadius: 7, background: issue.status === 'Open' ? T.amber : T.teal }} />
        <span style={{ fontSize: 11.5, color: T.muted, fontWeight: 600 }}>{issue.status}</span>
      </div>
    </div>
  );
}

export function ReportDetail({ projectId, coverage }: { projectId: string; coverage?: number }) {
  const { data } = useStore();
  const nav = useNav();
  const [share, setShare] = useState(false);
  const [scope, setScope] = useState<'project' | 'zone'>('project');
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);

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

  // Per-zone data for the selected zone
  const activeZone = activeZoneId ? p.zones.find((z) => z.id === activeZoneId) : null;
  const zoneIssues = scope === 'zone' && activeZone
    ? r.openIssues.filter((i) => i.zone === activeZone.name)
    : r.openIssues;
  const zoneIsProcessing = scope === 'zone' && activeZone
    ? p.scans.some((s) => s.status === 'Processing' && s.zoneId === activeZone.id)
    : false;

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

        {/* ── Zone selector (shown when scope = zone) */}
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

        {/* ── Pending state for processing zone */}
        {zoneIsProcessing && (
          <Card style={{ padding: 18, marginBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 22, background: T.amberTint, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 1.4s ease-in-out infinite' }}>
              <Icon name="clock" size={22} color={T.amber} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>Report pending</div>
            <div style={{ fontSize: 12.5, color: T.muted }}>Generating — usually ready within 60 s. The whole-project report is still viewable.</div>
          </Card>
        )}

        {!zoneIsProcessing && (
          <>
            <Card style={{ padding: 18 }}>
              {/* Brand row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: `2px solid ${T.navy}`, marginBottom: 14 }}>
                <Wordmark size={18} />
                <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Progress report</span>
              </div>

              {/* Header meta */}
              <div style={{ marginBottom: 6 }}>
                <KeyVal k="Project" v={p.name} />
                <KeyVal k="Address" v={<span style={mono}>{p.location}</span>} />
                <KeyVal k="Client" v={p.client} />
                <KeyVal k="Contractor" v="Cairn Refurbishment Ltd" />
                <KeyVal k="Type" v={p.type} />
                <KeyVal k="Scope" v={scope === 'zone' && activeZone ? activeZone.name : 'Whole project'} />
                <KeyVal k="Stage" v={r.rung} />
                <KeyVal k="Report date" v={<span style={mono}>{r.date}</span>} />
                <KeyVal k="Prepared by" v="J. Mackay · Site Supervisor" />
                <KeyVal k="BIM model" v={<span style={mono}>{p.bim.file} (LOD {p.bim.lod})</span>} />
                <KeyVal k="Coverage" v={<span style={{ ...mono, fontWeight: 700, color: T.teal }}>{r.coverage}%</span>} />
                <KeyVal k="Accuracy" v={<span style={mono}>±17 mm</span>} />
                <KeyVal k="Status" v={<StatusPill status={p.status} />} />
              </div>

              {/* Donut + summary */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '18px 0 8px' }}>
                <Donut value={r.coverage} size={172} stroke={15} color={ringColor} countUp sub={`${100 - r.coverage}% outstanding`} />
              </div>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: T.ink, margin: '6px 2px 0' }}>{r.summary}</p>
            </Card>

            {/* Zone coverage */}
            {r.zones.length > 0 && scope === 'project' && (
              <>
                <SectionLabel>Zone coverage</SectionLabel>
                <Card style={{ padding: 16 }}>
                  <ZoneBars zones={r.zones} />
                </Card>
              </>
            )}
            {scope === 'zone' && activeZone && (
              <>
                <SectionLabel>Zone progress</SectionLabel>
                <Card style={{ padding: 16 }}>
                  <ZoneBars zones={[r.zones.find((z) => z.id === activeZone.id) ?? activeZone]} />
                </Card>
              </>
            )}

            {/* Findings register (Task B) */}
            <SectionLabel right={
              <span style={{ ...mono, fontSize: 12.5, color: T.muted, fontWeight: 700 }}>
                {zoneIssues.length} open · {r.closedCount} closed
              </span>
            }>
              Findings register
            </SectionLabel>

            {/* Severity tally */}
            {zoneIssues.length > 0 && <SevTally issues={zoneIssues} />}

            <Card style={{ padding: zoneIssues.length ? 16 : 16 }}>
              {zoneIssues.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.teal, fontSize: 13.5, fontWeight: 600, padding: '4px 0' }}>
                  <Icon name="checkCircle" size={18} color={T.teal} /> Snag list cleared — 0 open.
                </div>
              ) : (
                zoneIssues.map((i, idx) => (
                  <FindingCard key={i.id} issue={i} last={idx === zoneIssues.length - 1} />
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
            <SectionLabel>BIM model</SectionLabel>
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

            {/* Methodology & limitations */}
            <SectionLabel>Methodology & limitations</SectionLabel>
            <Card style={{ padding: '12px 16px' }}>
              <div style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.6 }}>
                <p style={{ margin: '0 0 7px' }}>Geometry captured using iPhone LiDAR (ARKit Scene Reconstruction). Coverage computed by comparing the captured point cloud against the BIM reference model.</p>
                <p style={{ margin: '0 0 7px' }}>BIM reference: <span style={{ ...mono, color: T.ink }}>{p.bim.file}</span> (LOD {p.bim.lod}, {p.bim.disciplines.join(', ')}). Last aligned {p.bim.last_aligned ? fmtDate(p.bim.last_aligned) : '—'}.</p>
                <p style={{ margin: '0 0 7px' }}>Positional accuracy <strong style={{ color: T.ink }}>±17 mm</strong>. Surface defects (cracks, dampness, finish quality) are outside scope. Tolerances per NHBC Standards 2024 / Scottish Building Standards where applicable.</p>
                <p style={{ margin: 0 }}>This report reflects site conditions at time of scanning only. Subsequent works are not represented.</p>
              </div>
            </Card>

            {/* Sign-off */}
            <SectionLabel>Sign-off</SectionLabel>
            <Card style={{ padding: '6px 16px', marginBottom: 0 }}>
              <KeyVal k="Prepared by" v="J. Mackay · Site Supervisor" />
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
