// Project detail — overview + the timeline scrubber (signature interaction #1) + full CRUD.
// Tapping/dragging a scan point re-renders the donut, zone bars, open issues and captures at that
// coverage (<200ms crossfade, via stateAt). At the latest point everything is CRUD-editable through
// the bottom-sheet editors; scrubbed views are read-only time-travel. View log opens the scan log →
// per-scan detail → that scan's report.
import { useRef, useState } from 'react';
import { T, SEV } from '../theme';
import type { Issue, Project, Zone } from '../types';
import { fmtDate, fmtDateShort, roundM } from '../lib/format';
import { stateAt, rungFor } from '../lib/reports';
import { photoSrc } from '../lib/photos';
import { useStore } from '../lib/store';
import { useBackLayer } from '../hooks/useBackLayer';
import { useReady } from '../hooks/useReady';
import { useAppActions } from '../navigation/AppActions';
import { Screen, useNav } from '../navigation/Navigator';
import { PushHeader, RoundBtn } from '../navigation/PushHeader';
import { ReportDetail } from './Reports';
import { EditProjectSheet, ZoneSheet, IssueSheet, TradeSheet, TeamSheet, BimSheet, ScanLogSheet } from './editors';
import { Avatar, Bar, Button, Card, Donut, Gallery, KeyVal, Lightbox, LoadingBody, SectionLabel, SevDot, StageChip, StatusPill, mono } from '../components/primitives';
import { Icon } from '../components/Icon';

type SheetState =
  | { t: 'project' }
  | { t: 'zone'; id: string | null }
  | { t: 'issue'; id: string | null }
  | { t: 'trade'; index: number | null }
  | { t: 'team'; index: number | null }
  | { t: 'bim' }
  | { t: 'log' }
  | null;

const initials = (name: string) =>
  name.split(/[\s.]+/).filter(Boolean).map((s) => s[0]).slice(0, 2).join('').toUpperCase();

export function ProjectDetail({ projectId }: { projectId: string }) {
  const { data, update } = useStore();
  const nav = useNav();
  const { startScan } = useAppActions();
  const p = data.projects.find((x) => x.id === projectId);

  const [scrub, setScrub] = useState<number | null>(null);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [showClosed, setShowClosed] = useState(false);
  const [editCaps, setEditCaps] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const ready = useReady();

  if (!p) {
    return (
      <Screen padTop={0}>
        <PushHeader title="Project" />
        <div style={{ padding: 40, textAlign: 'center', color: T.muted }}>This project was removed.</div>
      </Screen>
    );
  }

  if (!ready) {
    return (
      <Screen padTop={0}>
        <PushHeader title={p.name} />
        <LoadingBody />
      </Screen>
    );
  }

  const isLatest = scrub == null || scrub === p.overall_coverage;
  const cov = isLatest ? p.overall_coverage : scrub!;
  const view = stateAt(p, cov);
  const ringColor = p.status === 'Needs review' && cov < 100 ? T.amber : cov >= 100 ? T.teal : T.navy;
  const scrubScan = !isLatest ? p.scans.find((s) => s.coverage === cov) : undefined;
  const openReportAt = (c: number) => {
    setSheet(null);
    nav.push(<ReportDetail projectId={p.id} coverage={isLatestCoverage(p, c) ? undefined : c} />);
  };

  const addCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    update(p.id, (d) => d.captures.unshift(url));
    e.target.value = '';
  };
  const removeCapture = (id: string) => update(p.id, (d) => { d.captures = d.captures.filter((c) => c !== id); });

  return (
    <Screen padTop={0} padBottom={92}>
      <PushHeader
        title={p.name}
        trailing={
          <div style={{ display: 'flex', gap: 8 }}>
            {isLatest && <RoundBtn icon="edit" label="Edit" onClick={() => setSheet({ t: 'project' })} />}
            <RoundBtn icon="share" label="Report" onClick={() => nav.push(<ReportDetail projectId={p.id} />)} />
          </div>
        }
      />

      <div style={{ padding: '14px 18px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {isLatest && p.reviewNote && (
          <div style={{ display: 'flex', gap: 10, padding: '12px 14px', background: T.amberTint, border: `1px solid ${T.amber}33`, borderRadius: 14 }}>
            <Icon name="alert" size={18} color={T.amber} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.5 }}>
              <strong style={{ color: T.amber }}>Needs review.</strong> {p.reviewNote}
            </div>
          </div>
        )}
        {!isLatest && scrubScan && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: T.navyTint, borderRadius: 12 }}>
            <Icon name="clock" size={17} color={T.navy} />
            <div style={{ flex: 1, fontSize: 13, color: T.navy, fontWeight: 600 }}>
              Preview · scan <span style={mono}>{fmtDate(scrubScan.date)}</span>
            </div>
            <button onClick={() => setScrub(null)} style={{ border: 'none', background: T.navy, color: '#fff', borderRadius: 999, padding: '5px 12px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
              Latest
            </button>
          </div>
        )}

        {/* Overview — crossfades with the scrubber */}
        <Card style={{ padding: 18, display: 'flex', gap: 16, alignItems: 'center' }}>
          <Donut value={view.coverage} size={118} stroke={12} color={ringColor} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              <StageChip stage={view.stage} />
              {isLatest ? <StatusPill status={p.status} /> : <span style={{ fontSize: 12, fontWeight: 700, color: T.muted }}>{rungFor(cov)}</span>}
            </div>
            <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.6 }}>
              <div>{p.type}</div>
              <div style={mono}>{p.location}</div>
            </div>
          </div>
        </Card>

        {/* Facts */}
        <Card style={{ padding: '6px 16px' }}>
          <KeyVal k="Client" v={p.client} />
          <KeyVal k="Floor area" v={<span style={mono}>{p.area_m2} m²</span>} />
          <KeyVal k="Verified" v={<span style={mono}>{roundM(p.area_m2, view.coverage)} m² of {p.area_m2} m²</span>} />
          <KeyVal k="Started" v={<span style={mono}>{fmtDate(p.start_date)}</span>} />
          <KeyVal k="Target handover" v={<span style={mono}>{p.target_handover ? fmtDate(p.target_handover) : '—'}</span>} />
        </Card>

        {/* Scan history scrubber */}
        {p.scans.length > 0 && (
          <div>
            <SectionLabel right={<button onClick={() => setSheet({ t: 'log' })} style={{ border: 'none', background: 'none', color: T.navy, fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>View log →</button>}>
              Coverage timeline · preview
            </SectionLabel>
            <Card style={{ padding: 16 }}>
              <Scrubber project={p} selected={cov} onSelect={(c) => setScrub(c === p.overall_coverage ? null : c)} />
              <div style={{ fontSize: 11.5, color: T.muted, lineHeight: 1.5, marginTop: 6, paddingTop: 10, borderTop: `1px solid ${T.hairline2}` }}>
                <strong style={{ color: T.ink }}>Simulation.</strong> Tap a point to preview the whole site at that overall coverage — zone bars scale to the selected point, they are not independent per-zone scan history. Tap <strong style={{ color: T.navy }}>View log</strong> for the real per-scan record.
              </div>
            </Card>
          </div>
        )}

        {/* Zones (crossfade) */}
        {p.zones.length > 0 && (
          <div key={`z-${cov}`} style={{ animation: 'fadeIn .18s ease' }}>
            <SectionLabel right={isLatest ? <AddBtn onClick={() => setSheet({ t: 'zone', id: null })} /> : undefined}>Zone coverage</SectionLabel>
            <Card style={{ padding: 16 }}>
              {[...view.zones].sort((a, b) => b.coverage - a.coverage).map((z) => {
                const processing = isLatest && p.scans.some((s) => s.status === 'Processing' && s.zoneId === z.id);
                return <ZoneRow key={z.id} zone={z} editable={isLatest} processing={processing} onEdit={() => setSheet({ t: 'zone', id: z.id })} />;
              })}
            </Card>
          </div>
        )}

        {/* Issues (crossfade) */}
        <div key={`i-${cov}`} style={{ animation: 'fadeIn .18s ease' }}>
          <SectionLabel
            right={
              isLatest ? (
                <AddBtn onClick={() => setSheet({ t: 'issue', id: null })} />
              ) : (
                <span style={{ ...mono, fontSize: 12.5, fontWeight: 700, color: T.muted }}>{view.openIssues.length} open</span>
              )
            }
          >
            Issues
          </SectionLabel>
          <Card style={{ padding: view.openIssues.length || view.closedCount ? '6px 16px' : 16 }}>
            {view.openIssues.length === 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: cov >= 100 ? T.teal : T.muted, fontSize: 13.5, padding: '6px 0' }}>
                {cov >= 100 && <Icon name="checkCircle" size={17} color={T.teal} />}
                {cov >= 100 ? 'Snag list cleared — 0 open at handover.' : 'No open issues at this stage.'}
              </div>
            )}
            {[...view.openIssues]
              .sort((a, b) => sevRank(a.severity) - sevRank(b.severity))
              .map((i) => (
                <IssueRow key={i.id} issue={i} editable={isLatest} onEdit={() => setSheet({ t: 'issue', id: i.id })} />
              ))}
            {isLatest && p.issues.some((i) => i.status === 'Closed') && (
              <>
                <button onClick={() => setShowClosed((s) => !s)} style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', padding: '10px 0', display: 'flex', alignItems: 'center', gap: 6, color: T.muted, fontWeight: 600, fontSize: 13 }}>
                  <Icon name={showClosed ? 'chevronDown' : 'chevron'} size={15} color={T.muted} />
                  {p.issues.filter((i) => i.status === 'Closed').length} closed
                </button>
                {showClosed && p.issues.filter((i) => i.status === 'Closed').map((i) => <IssueRow key={i.id} issue={i} closed editable onEdit={() => setSheet({ t: 'issue', id: i.id })} />)}
              </>
            )}
          </Card>
        </div>

        {/* Captures */}
        <div key={`c-${cov}`}>
          <SectionLabel
            right={
              isLatest && p.captures.length > 0 ? (
                <button onClick={() => setEditCaps((s) => !s)} style={{ border: 'none', background: 'none', color: T.navy, fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>{editCaps ? 'Done' : 'Edit'}</button>
              ) : undefined
            }
          >
            Site captures
          </SectionLabel>
          {isLatest ? (
            p.captures.length > 0 || p.sector === 'Residential' ? (
              <CaptureGrid ids={p.captures} editing={editCaps} onAdd={() => fileRef.current?.click()} onRemove={removeCapture} />
            ) : (
              <Card style={{ padding: 16, color: T.muted, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 9 }}>
                <Icon name="info" size={17} color={T.faint} /> Site captures pending sync.
              </Card>
            )
          ) : view.captures.length > 0 ? (
            <Gallery ids={view.captures} />
          ) : (
            <Card style={{ padding: 16, color: T.muted, fontSize: 13.5 }}>No captures at this stage.</Card>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={addCapture} style={{ display: 'none' }} />
        </div>

        {/* BIM */}
        <div>
          <SectionLabel right={isLatest ? <EditBtn onClick={() => setSheet({ t: 'bim' })} /> : undefined}>BIM model</SectionLabel>
          <Card style={{ padding: '6px 16px' }}>
            <KeyVal k="Model" v={<span style={mono}>{p.bim.file}</span>} />
            <KeyVal k="Software" v={p.bim.software} />
            <KeyVal k="LOD" v={<span style={mono}>{p.bim.lod || '—'}</span>} />
            <KeyVal k="Disciplines" v={p.bim.disciplines.join(', ') || '—'} />
            <KeyVal k="Last aligned" v={<span style={mono}>{p.bim.last_aligned ? fmtDate(p.bim.last_aligned) : '—'}</span>} />
          </Card>
        </div>

        {/* Team */}
        <div>
          <SectionLabel right={isLatest ? <AddBtn onClick={() => setSheet({ t: 'team', index: null })} /> : undefined}>Site team</SectionLabel>
          <Card style={{ padding: '6px 16px' }}>
            {p.team.length === 0 && <div style={{ color: T.muted, fontSize: 13.5, padding: '6px 0' }}>No team members yet.</div>}
            {p.team.map((m, i) => {
              const [nm, role] = m.split(' · ');
              return (
                <button key={i} onClick={isLatest ? () => setSheet({ t: 'team', index: i }) : undefined} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '9px 0', borderBottom: i < p.team.length - 1 ? `1px solid ${T.hairline2}` : 'none', border: 'none', background: 'none', cursor: isLatest ? 'pointer' : 'default', textAlign: 'left' }}>
                  <Avatar initials={initials(nm)} size={30} />
                  <div style={{ fontSize: 13.5, color: T.ink, fontWeight: 600 }}>{nm}</div>
                  <div style={{ flex: 1 }} />
                  <div style={{ fontSize: 12.5, color: T.muted }}>{role}</div>
                  {isLatest && <Icon name="chevron" size={15} color={T.faint} />}
                </button>
              );
            })}
          </Card>
        </div>

        {/* Trades */}
        {(p.trades.length > 0 || isLatest) && (
          <div>
            <SectionLabel right={isLatest ? <AddBtn onClick={() => setSheet({ t: 'trade', index: null })} /> : undefined}>Trade progress</SectionLabel>
            <Card style={{ padding: '6px 16px' }}>
              {p.trades.length === 0 && <div style={{ color: T.muted, fontSize: 13.5, padding: '6px 0' }}>No trades tracked yet.</div>}
              {p.trades.map((t, i) => (
                <button key={i} onClick={isLatest ? () => setSheet({ t: 'trade', index: i }) : undefined} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < p.trades.length - 1 ? `1px solid ${T.hairline2}` : 'none', border: 'none', background: 'none', cursor: isLatest ? 'pointer' : 'default', textAlign: 'left' }}>
                  <span style={{ flex: 1, fontSize: 13.5, color: T.ink }}>{t.name}</span>
                  <TradeTag status={t.status} />
                  {isLatest && <Icon name="chevron" size={15} color={T.faint} />}
                </button>
              ))}
            </Card>
          </div>
        )}
      </div>

      {/* Footer actions — pinned to the screen frame (design uses position:absolute, not sticky, so it
          stays fixed at the bottom in both the fullscreen-phone and the centered desktop-card layouts).
          The buttons sit on a transparent→canvas gradient so body content fades cleanly under them. */}
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
        <Button full icon="reports" onClick={() => openReportAt(cov)}>Report</Button>
        <Button full primary icon="scan" onClick={() => startScan(p.id)}>New scan</Button>
      </div>

      {/* CRUD sheets */}
      {sheet?.t === 'project' && <EditProjectSheet project={p} onClose={() => setSheet(null)} />}
      {sheet?.t === 'zone' && <ZoneSheet project={p} zoneId={sheet.id} onClose={() => setSheet(null)} />}
      {sheet?.t === 'issue' && <IssueSheet project={p} issueId={sheet.id} onClose={() => setSheet(null)} />}
      {sheet?.t === 'trade' && <TradeSheet project={p} index={sheet.index} onClose={() => setSheet(null)} />}
      {sheet?.t === 'team' && <TeamSheet project={p} index={sheet.index} onClose={() => setSheet(null)} />}
      {sheet?.t === 'bim' && <BimSheet project={p} onClose={() => setSheet(null)} />}
      {sheet?.t === 'log' && <ScanLogSheet project={p} onOpenReport={openReportAt} onClose={() => setSheet(null)} />}
    </Screen>
  );
}

function isLatestCoverage(p: Project, c: number): boolean {
  return c === p.overall_coverage;
}
const sevRank = (s: Issue['severity']) => (s === 'Critical' ? 0 : s === 'Major' ? 1 : s === 'Minor' ? 2 : 3);

// ── Interactive scan-history scrubber (continuous track + absolutely-placed nodes, per design
//    Timeline). One straight rail with a navy progress fill; nodes sit on the rail so the line never
//    kinks at the selected (larger) node.
function Scrubber({ project, selected, onSelect }: { project: Project; selected: number; onSelect: (coverage: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const scans = project.scans;
  const n = scans.length;
  const sel = Math.max(0, scans.findIndex((s) => s.coverage === selected));
  const pct = (i: number) => (n <= 1 ? 0 : (i / (n - 1)) * 100);

  const pick = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const t = Math.max(0, Math.min(1, (clientX - r.left - 14) / (r.width - 28)));
    const idx = Math.round(t * (n - 1));
    const s = scans[idx];
    if (s && s.coverage !== selected) onSelect(s.coverage);
  };

  return (
    <div
      ref={ref}
      onPointerDown={(e) => {
        setDragging(true);
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        pick(e.clientX);
      }}
      onPointerMove={(e) => dragging && pick(e.clientX)}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
      style={{ position: 'relative', height: 76, padding: '0 14px', touchAction: 'pan-y', cursor: 'pointer', userSelect: 'none' }}
    >
      {/* rail + progress fill */}
      <div style={{ position: 'absolute', left: 14, right: 14, top: 46, height: 4, borderRadius: 3, background: T.navyTint }} />
      <div style={{ position: 'absolute', left: 14, top: 46, height: 4, borderRadius: 3, background: T.navy, width: `calc((100% - 28px) * ${pct(sel) / 100})`, transition: 'width .3s cubic-bezier(.4,0,.2,1)' }} />
      {scans.map((s, i) => {
        const active = i === sel;
        const isProcessing = s.status === 'Processing';
        const nodeColor = isProcessing ? T.amber : active ? T.teal : i < sel ? T.navy : T.surface;
        const nodeBorder = isProcessing ? `2px solid ${T.amber}` : active ? '4px solid #fff' : `2px solid ${i <= sel ? T.navy : T.hairline}`;
        const nodeShadow = isProcessing ? `0 2px 8px rgba(181,120,26,.4), 0 0 0 1px ${T.amber}` : active ? `0 2px 8px rgba(24,131,126,.5), 0 0 0 1px ${T.teal}` : 'none';
        return (
          <div key={s.id} style={{ position: 'absolute', left: `calc(14px + (100% - 28px) * ${pct(i) / 100})`, top: 0, transform: 'translateX(-50%)', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {active ? (
              <div style={{ ...mono, fontSize: 13, fontWeight: 700, color: isProcessing ? T.amber : T.teal, marginTop: 4 }}>{s.coverage}%</div>
            ) : (
              <div style={{ height: 21 }} />
            )}
            <div
              style={{
                position: 'absolute',
                top: 40,
                width: active ? 18 : 11,
                height: active ? 18 : 11,
                borderRadius: '50%',
                background: nodeColor,
                border: nodeBorder,
                boxShadow: nodeShadow,
                transition: 'all .2s',
                animation: isProcessing ? 'pulse 1.4s ease-in-out infinite' : undefined,
              }}
            />
            <div style={{ ...mono, position: 'absolute', top: 62, fontSize: 9.5, color: active ? T.ink : T.muted, fontWeight: active ? 700 : 500, whiteSpace: 'nowrap' }}>{fmtDateShort(s.date)}</div>
          </div>
        );
      })}
    </div>
  );
}

function ZoneRow({ zone, editable, processing, onEdit }: { zone: Zone; editable: boolean; processing?: boolean; onEdit: () => void }) {
  return (
    <button
      onClick={editable ? onEdit : undefined}
      style={{ width: '100%', display: 'block', border: 'none', background: 'none', padding: '6px 0', cursor: editable ? 'pointer' : 'default', textAlign: 'left' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 600, color: T.ink }}>
          {zone.name}
          {editable && !processing && <Icon name="edit" size={12} color={T.faint} />}
          {processing && (
            <span style={{ fontSize: 10, fontWeight: 700, color: T.amber, background: T.amberTint, borderRadius: 999, padding: '2px 7px' }}>Processing</span>
          )}
        </span>
        <span style={{ ...mono, fontSize: 13, fontWeight: 700, color: processing ? T.amber : zone.coverage >= 100 ? T.teal : T.muted }}>{zone.coverage}%</span>
      </div>
      <Bar value={zone.coverage} color={processing ? T.amber : zone.coverage >= 100 ? T.teal : zone.coverage < 40 ? T.blue : T.navy} />
    </button>
  );
}

function IssueRow({ issue, closed, editable, onEdit }: { issue: Issue; closed?: boolean; editable: boolean; onEdit: () => void }) {
  return (
    <button
      onClick={editable ? onEdit : undefined}
      style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 0', border: 'none', borderBottom: `1px solid ${T.hairline2}`, opacity: closed ? 0.6 : 1, background: 'none', cursor: editable ? 'pointer' : 'default', textAlign: 'left' }}
    >
      <div style={{ marginTop: 4 }}>
        <SevDot sev={issue.severity} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, color: T.ink, fontWeight: 600, textDecoration: closed ? 'line-through' : 'none' }}>{issue.title}</div>
        <div style={{ ...mono, fontSize: 11.5, color: T.muted, marginTop: 2 }}>{issue.id} · {issue.zone} · {SEV[issue.severity].label}</div>
      </div>
      {editable && <Icon name="chevron" size={15} color={T.faint} style={{ marginTop: 3 }} />}
    </button>
  );
}

function CaptureGrid({ ids, editing, onAdd, onRemove }: { ids: string[]; editing: boolean; onAdd: () => void; onRemove: (id: string) => void }) {
  const [open, setOpen] = useState<number | null>(null);
  // Resolve to real srcs (skip any unknown id) and keep the matching id for removal/lightbox.
  const shots = ids.map((id) => ({ id, src: photoSrc(id) })).filter((s): s is { id: string; src: string } => !!s.src);
  const srcs = shots.map((s) => s.src);
  useBackLayer(open !== null, () => setOpen(null));
  return (
    <>
      <div className="no-scrollbar" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
        <button onClick={onAdd} style={{ flexShrink: 0, width: 118, height: 88, borderRadius: 12, border: `1px dashed ${T.hairline}`, background: T.surface, color: T.muted, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
          <Icon name="upload" size={20} color={T.navy} />
          Add photo
        </button>
        {shots.map((s, i) => (
          <div key={s.id} style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => (editing ? undefined : setOpen(i))}
              style={{ padding: 0, border: 'none', background: 'none', cursor: editing ? 'default' : 'zoom-in', display: 'block' }}
            >
              <img src={s.src} alt="" loading="lazy" style={{ width: 118, height: 88, objectFit: 'cover', borderRadius: 12, border: `1px solid ${T.hairline}`, display: 'block' }} />
            </button>
            {editing && (
              <button onClick={() => onRemove(s.id)} aria-label="Remove" style={{ position: 'absolute', top: -6, right: -6, width: 24, height: 24, borderRadius: 999, border: '2px solid #fff', background: T.red, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Icon name="close" size={13} color="#fff" />
              </button>
            )}
          </div>
        ))}
      </div>
      {open !== null && <Lightbox srcs={srcs} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </>
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

function AddBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ border: 'none', background: 'none', color: T.navy, fontWeight: 700, fontSize: 12.5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
      <Icon name="plus" size={15} color={T.navy} /> Add
    </button>
  );
}
function EditBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ border: 'none', background: 'none', color: T.navy, fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>Edit</button>
  );
}
