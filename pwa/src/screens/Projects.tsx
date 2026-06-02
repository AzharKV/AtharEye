// Projects.tsx — Projects list (tab root) + Project detail + New project. Ported from design-source/app/app-projects.jsx.
import { useState, useEffect, useRef } from 'react';
import { T } from '../theme';
import type { Project, BimModel } from '../types';
import { DATA, bimFor } from '../data';
import { haptic } from '../lib/haptic';
import { teamName } from '../lib/format';
import { useCountUp } from '../hooks/useCountUp';
import { useReady } from '../hooks/useReady';
import { useBackLayer } from '../hooks/useBackLayer';
import { Icon } from '../components/Icon';
import type { IconName } from '../components/Icon';
import {
  Ring,
  Bar,
  StatusBadge,
  BannerBlueprint,
  Avatar,
  Chips,
  Button,
  Card,
  SectionLabel,
  ScreenHeader,
} from '../components/primitives';
import { Toast } from '../components/ShareSheet';
import { SkeletonList } from '../components/Skeleton';
import { Screen, useNav } from '../navigation/Navigator';
import { PushHeader, RoundBtn } from '../navigation/PushHeader';
import { useAppActions } from '../navigation/AppActions';
import { ReportDetail } from './Reports';

// ════════════════ PROJECTS LIST ════════════════
export function ProjectsList() {
  const nav = useNav();
  const actions = useAppActions();
  const projects = actions.projects || DATA.projects;
  const ready = useReady('projects');
  const [filter, setFilter] = useState('All');
  const portfolio = Math.round(projects.reduce((s, p) => s + p.pct, 0) / projects.length);
  const counts = {
    on: projects.filter((p) => p.status === 'On Track').length,
    rev: projects.filter((p) => p.status === 'Needs Review').length,
    done: projects.filter((p) => p.status === 'Complete').length,
  };
  const list = projects.filter((p) =>
    filter === 'All'
      ? true
      : filter === 'On site'
        ? p.status !== 'Complete'
        : filter === 'Needs review'
          ? p.status === 'Needs Review'
          : p.status === 'Complete',
  );

  return (
    <Screen>
      <ScreenHeader
        title="Projects"
        sub={`${projects.length} projects · Scotland`}
        trailing={
          <div style={{ display: 'flex', gap: 8 }}>
            <RoundBtn icon="search" label="Search" />
            <RoundBtn
              icon="plus"
              label="New project"
              onClick={() => nav.push(<NewProject onCreate={actions.addProject} />)}
            />
          </div>
        }
      />
      {/* summary strip — teal hero */}
      <div style={{ padding: '2px 20px 8px' }}>
        <Card style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <Ring value={portfolio} size={66} stroke={6} accent label="AVG" />
          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
            {(
              [
                ['On track', counts.on, T.accent],
                ['Review', counts.rev, T.warning],
                ['Complete', counts.done, T.muted],
              ] as [string, number, string][]
            ).map(([l, n, c]) => (
              <div key={l}>
                <div style={{ fontSize: 22, fontWeight: 800, color: c }}>{n}</div>
                <div style={{ fontSize: 11.5, color: T.muted, fontWeight: 600 }}>{l}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Chips items={['All', 'On site', 'Needs review', 'Complete']} active={filter} onPick={setFilter} />
      {!ready ? (
        <SkeletonList count={5} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 20px 8px' }}>
          {list.map((p) => (
            <Card
              key={p.id}
              pressable
              onClick={() => nav.push(<ProjectDetail project={p} />)}
              style={{ padding: 13, display: 'flex', gap: 14, alignItems: 'center' }}
            >
              <Ring value={p.pct} size={54} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: -0.3,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {p.name}
                </div>
                <div style={{ fontSize: 12.5, color: T.muted, marginTop: 3 }}>
                  {p.location} · {p.area} m² · {p.scans} scans
                </div>
                <div style={{ marginTop: 8 }}>
                  <StatusBadge status={p.status} small />
                </div>
              </div>
              <Icon name="chevron" size={18} color="rgba(255,255,255,0.22)" />
            </Card>
          ))}
          {list.length === 0 && (
            <div style={{ textAlign: 'center', color: T.faint, fontSize: 14, padding: '40px 0' }}>
              No projects in this filter.
            </div>
          )}
        </div>
      )}
    </Screen>
  );
}

// ════════════════ PROJECT DETAIL ════════════════
export function ProjectDetail({ project: p }: { project: Project }) {
  const nav = useNav();
  const actions = useAppActions();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pct = useCountUp(p.pct, 900);
  const open = p.issues.length;
  const [bim, setBim] = useState<BimModel>(() => p.bim || bimFor(p.id));
  const [bimSheet, setBimSheet] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const on = () => setScrolled(el.scrollTop > 96);
    el.addEventListener('scroll', on);
    return () => el.removeEventListener('scroll', on);
  }, []);

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      {/* floating back header that gains a bg on scroll */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          paddingTop: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: 'calc(env(safe-area-inset-top) + 12px) 14px 10px',
          background: scrolled ? 'rgba(12,15,18,0.8)' : 'transparent',
          backdropFilter: scrolled ? 'blur(18px) saturate(160%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(18px)' : 'none',
          borderBottom: scrolled ? `1px solid ${T.hairline}` : 'none',
          transition: 'background .25s, border-color .25s',
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
            background: 'rgba(8,12,16,0.55)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <Icon name="chevronL" size={20} color={T.text} />
        </button>
        <div
          style={{
            flex: 1,
            fontSize: 16,
            fontWeight: 700,
            textAlign: 'center',
            opacity: scrolled ? 1 : 0,
            transition: 'opacity .2s',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {p.name}
        </div>
        <div style={{ width: 38 }} />
      </div>

      <Screen scrollRef={scrollRef} padTop={0}>
        {/* banner */}
        <div style={{ position: 'relative', height: 184 }}>
          <BannerBlueprint type={p.type} />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, #0C0F12 6%, rgba(12,15,18,0.1) 70%)',
            }}
          />
          <div style={{ position: 'absolute', left: 20, right: 20, bottom: 14 }}>
            <div style={{ marginBottom: 9 }}>
              <StatusBadge status={p.status} small />
            </div>
            <div style={{ fontSize: 25, fontWeight: 800, letterSpacing: -0.6, lineHeight: 1.1 }}>{p.name}</div>
            <div
              style={{
                fontSize: 13.5,
                color: T.muted,
                marginTop: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Icon name="pin" size={14} color={T.muted} />
              {p.location} · {p.type}
            </div>
          </div>
        </div>

        <div style={{ padding: '8px 20px 8px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* progress summary */}
          <Card style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 18 }}>
            <Ring value={pct} size={92} stroke={9} accent label="COVERED" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(
                [
                  ['scans', p.scans, 'scans'],
                  ['area', `${p.area}`, 'm² floor area'],
                  ['alert', open, open === 1 ? 'open issue' : 'open issues'],
                ] as [IconName, string | number, string][]
              ).map(([ic, n, l]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon name={ic} size={18} color={ic === 'alert' && open ? T.danger : T.muted} />
                  <span style={{ fontSize: 16, fontWeight: 800, color: ic === 'alert' && open ? T.danger : T.text }}>
                    {n}
                  </span>
                  <span style={{ fontSize: 13.5, color: T.muted }}>{l}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* BIM model — the reference the scan is compared against */}
          <div>
            <SectionLabel
              right={
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 12,
                    color: T.accent,
                    fontWeight: 700,
                  }}
                >
                  <Icon name="check" size={13} color={T.accent} stroke={3} />
                  Aligned
                </span>
              }
            >
              BIM model
            </SectionLabel>
            <Card style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 13 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  background: 'rgba(20,184,192,0.12)',
                  border: `1px solid ${T.accent}33`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon name="cube" size={24} color={T.accent} stroke={1.9} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    fontFamily: T.mono,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {bim.file}
                </div>
                <div style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>
                  {bim.ver} · {bim.size} · {bim.elements} elements
                </div>
              </div>
              <button
                onClick={() => {
                  haptic();
                  setBimSheet(true);
                }}
                style={{
                  flexShrink: 0,
                  padding: '8px 13px',
                  borderRadius: 11,
                  border: `1px solid ${T.hairline}`,
                  background: 'rgba(255,255,255,0.05)',
                  color: T.text,
                  fontSize: 13.5,
                  fontWeight: 700,
                  fontFamily: T.font,
                  cursor: 'pointer',
                }}
              >
                Replace
              </button>
            </Card>
            <div style={{ fontSize: 12, color: T.faint, margin: '8px 4px 0', lineHeight: 1.45 }}>
              Scans are aligned to this model to compute coverage. Uploaded {bim.uploaded}.
            </div>
          </div>

          {/* coverage by area */}
          <div>
            <SectionLabel>Coverage by area</SectionLabel>
            {p.rooms.length === 0 ? (
              <Card
                style={{
                  padding: '26px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                  textAlign: 'center',
                }}
              >
                <Icon name="scan" size={28} color={T.accent} stroke={1.8} />
                <div style={{ fontSize: 15, fontWeight: 700 }}>No scans yet</div>
                <div style={{ fontSize: 13, color: T.muted, maxWidth: 240, lineHeight: 1.45 }}>
                  Run your first scan to measure coverage against the BIM model.
                </div>
              </Card>
            ) : (
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
            )}
          </div>

          {/* team */}
          <div>
            <SectionLabel>Site team</SectionLabel>
            <Card style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex' }}>
                {p.team.map((t, i) => (
                  <div key={t} style={{ marginLeft: i ? -10 : 0 }}>
                    <Avatar initials={t} size={36} ring />
                  </div>
                ))}
              </div>
              <div style={{ flex: 1, fontSize: 13.5, color: T.muted }}>
                {p.team.map(teamName).slice(0, 2).join(', ')}
                {p.team.length > 2 ? ` +${p.team.length - 2}` : ''}
              </div>
              <span style={{ fontSize: 12.5, color: T.faint }}>{p.last}</span>
            </Card>
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 2 }}>
            <Button primary icon="scan" onClick={() => actions.startScan(p)}>
              New scan
            </Button>
            <Button icon="reports" onClick={() => nav.push(<ReportDetail project={p} />)}>
              View latest report
            </Button>
          </div>
        </div>
      </Screen>
      <BimUploadSheet
        open={bimSheet}
        current={bim}
        onClose={() => setBimSheet(false)}
        onConnected={(f) => {
          setBim((b) => ({ ...b, file: f.file, size: f.size, ver: f.ver, uploaded: 'Just now', elements: f.elements }));
          setBimSheet(false);
          setToast('BIM model connected · re-aligned');
        }}
      />
      <Toast msg={toast} onDone={() => setToast(null)} />
    </div>
  );
}

// ── BIM upload sheet (faked import + alignment)
interface BimSample {
  file: string;
  size: string;
  ver: string;
  elements: string;
}
const BIM_SAMPLES: BimSample[] = [
  { file: 'Revit_export_v4.ifc', size: '22.1 MB', ver: 'IFC4 · v4', elements: '2,410' },
  { file: 'Architect_issue_C.ifc', size: '15.6 MB', ver: 'IFC4 · v3', elements: '1,980' },
  { file: 'Structural_only.ifc', size: '8.3 MB', ver: 'IFC2x3 · v1', elements: '720' },
];
function BimUploadSheet({
  open,
  current: _current,
  onClose,
  onConnected,
}: {
  open: boolean;
  current: BimModel | Record<string, never>;
  onClose: () => void;
  onConnected: (f: BimSample) => void;
}) {
  const [phase, setPhase] = useState<'pick' | 'uploading' | 'aligning'>('pick'); // pick | uploading | aligning
  const [prog, setProg] = useState(0);
  const [chosen, setChosen] = useState<BimSample | null>(null);
  useEffect(() => {
    if (open) {
      setPhase('pick');
      setProg(0);
      setChosen(null);
    }
  }, [open]);
  useEffect(() => {
    if (phase !== 'uploading') return;
    const start = Date.now();
    const id = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / 1400) * 100);
      setProg(p);
      if (p >= 100) {
        clearInterval(id);
        setPhase('aligning');
        setTimeout(() => chosen && onConnected(chosen), 900);
      }
    }, 40);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);
  useBackLayer(open, onClose); // system Back closes the sheet
  if (!open) return null;
  const choose = (f: BimSample) => {
    haptic();
    setChosen(f);
    setPhase('uploading');
  };
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 350,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <div
        onClick={phase === 'pick' ? onClose : undefined}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }}
      />
      <div
        style={{
          position: 'relative',
          background: '#13181D',
          borderRadius: '22px 22px 0 0',
          border: `1px solid ${T.hairline}`,
          padding: '10px 16px 30px',
          maxHeight: '88%',
          overflowY: 'auto',
        }}
        className="no-scrollbar"
      >
        <div
          style={{
            width: 40,
            height: 5,
            borderRadius: 5,
            background: 'rgba(255,255,255,0.18)',
            margin: '0 auto 14px',
          }}
        />
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>
            {phase === 'pick' ? 'Replace BIM model' : phase === 'uploading' ? 'Uploading model…' : 'Aligning to scan…'}
          </div>
          <div style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>
            {phase === 'pick' ? 'IFC · Revit (.rvt) · IFC2x3 / IFC4' : chosen && chosen.file}
          </div>
        </div>

        {phase === 'pick' && (
          <>
            <button
              onClick={() => choose(BIM_SAMPLES[0])}
              style={{
                width: '100%',
                border: `1.5px dashed ${T.accent}66`,
                background: 'rgba(20,184,192,0.06)',
                borderRadius: 16,
                padding: '22px 14px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                marginBottom: 16,
              }}
            >
              <Icon name="upload" size={28} color={T.accent} />
              <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Browse files</span>
              <span style={{ fontSize: 12.5, color: T.muted }}>Drag a .ifc / .rvt here, or tap to pick</span>
            </button>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: T.muted,
                textTransform: 'uppercase',
                letterSpacing: 0.4,
                margin: '4px 4px 8px',
              }}
            >
              Recent exports
            </div>
            <div
              style={{
                background: '#181E24',
                borderRadius: 16,
                border: `1px solid ${T.hairline}`,
                overflow: 'hidden',
                marginBottom: 16,
              }}
            >
              {BIM_SAMPLES.map((f, i) => (
                <div
                  key={f.file}
                  onClick={() => choose(f)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '13px 14px',
                    cursor: 'pointer',
                    borderBottom: i < BIM_SAMPLES.length - 1 ? `1px solid ${T.hairline2}` : 'none',
                  }}
                >
                  <Icon name="cube" size={20} color={T.muted} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, fontFamily: T.mono }}>{f.file}</div>
                    <div style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>
                      {f.ver} · {f.size}
                    </div>
                  </div>
                  <Icon name="chevron" size={16} color="rgba(255,255,255,0.25)" />
                </div>
              ))}
            </div>
            <button
              onClick={onClose}
              style={{
                width: '100%',
                height: 50,
                borderRadius: 14,
                border: 'none',
                background: '#1C232A',
                color: T.text,
                fontSize: 16,
                fontWeight: 700,
                fontFamily: T.font,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </>
        )}

        {phase === 'uploading' && (
          <div style={{ padding: '8px 4px 16px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 12.5,
                color: T.muted,
                marginBottom: 8,
              }}
            >
              <span>{chosen && chosen.size}</span>
              <span style={{ color: T.text, fontWeight: 700 }}>{Math.round(prog)}%</span>
            </div>
            <Bar value={prog} color={T.accent} height={8} />
          </div>
        )}
        {phase === 'aligning' && (
          <div
            style={{ padding: '18px 4px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}
          >
            <Icon name="layers" size={22} color={T.accent} />
            <span style={{ fontSize: 14.5, color: T.text, fontWeight: 600 }}>Registering point cloud to BIM…</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── New project flow (create + attach BIM)
const PTYPES = ['Shop refit', 'Residential', 'Commercial', 'Industrial', 'Hospitality', 'Other'];
function Field({
  label,
  value,
  onChange,
  placeholder,
  suffix,
  numeric,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suffix?: string;
  numeric?: boolean;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 12.5,
          fontWeight: 700,
          color: T.muted,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
          marginBottom: 7,
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: T.surface,
          border: `1px solid ${T.hairline}`,
          borderRadius: 13,
          padding: '0 14px',
        }}
      >
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={numeric ? 'decimal' : 'text'}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: T.text,
            fontSize: 16,
            fontWeight: 500,
            fontFamily: T.font,
            padding: '14px 0',
          }}
        />
        {suffix && <span style={{ fontSize: 14, color: T.muted, marginLeft: 6 }}>{suffix}</span>}
      </div>
    </div>
  );
}
export function NewProject({ onCreate }: { onCreate: (p: Project) => void }) {
  const nav = useNav();
  const [name, setName] = useState('');
  const [type, setType] = useState('Shop refit');
  const [loc, setLoc] = useState('');
  const [client, setClient] = useState('');
  const [area, setArea] = useState('');
  const [bim, setBim] = useState<BimModel | null>(null);
  const [bimSheet, setBimSheet] = useState(false);
  const ready = name.trim() && bim;

  const create = () => {
    haptic();
    if (!bim) return;
    const p: Project = {
      id: 'p' + Date.now(),
      name: name.trim(),
      type,
      location: loc.trim() || 'Scotland',
      pct: 0,
      status: 'On Track',
      area: Number(area) || 0,
      client: client.trim() || '—',
      scans: 0,
      team: ['JM'],
      last: 'Just created',
      rooms: [],
      issues: [],
      bim,
    };
    onCreate(p);
    nav.pop();
  };

  return (
    <div style={{ height: '100%' }}>
      <PushHeader title="New project" />
      <Screen padTop={0}>
        <div style={{ padding: '12px 20px 8px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Field label="Project name" value={name} onChange={setName} placeholder="e.g. Govan Workshop Fit-Out" />
          <div>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: T.muted,
                textTransform: 'uppercase',
                letterSpacing: 0.4,
                marginBottom: 8,
              }}
            >
              Type
            </div>
            <div className="no-scrollbar" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PTYPES.map((t) => {
                const on = t === type;
                return (
                  <button
                    key={t}
                    onClick={() => {
                      haptic();
                      setType(t);
                    }}
                    style={{
                      border: 'none',
                      cursor: 'pointer',
                      padding: '9px 14px',
                      borderRadius: 11,
                      fontFamily: T.font,
                      fontSize: 14,
                      fontWeight: 600,
                      background: on ? T.accent : T.surface2,
                      color: on ? T.onAccent : T.muted,
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1.4 }}>
              <Field label="Location" value={loc} onChange={setLoc} placeholder="Glasgow" />
            </div>
            <div style={{ flex: 1 }}>
              <Field label="Area" value={area} onChange={setArea} placeholder="0" suffix="m²" numeric />
            </div>
          </div>
          <Field label="Client" value={client} onChange={setClient} placeholder="Client / owner" />

          {/* BIM attach */}
          <div>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: T.muted,
                textTransform: 'uppercase',
                letterSpacing: 0.4,
                marginBottom: 8,
              }}
            >
              BIM model
            </div>
            {bim ? (
              <Card style={{ padding: 13, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 11,
                    background: 'rgba(20,184,192,0.12)',
                    border: `1px solid ${T.accent}33`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon name="cube" size={20} color={T.accent} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14.5,
                      fontWeight: 700,
                      fontFamily: T.mono,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {bim.file}
                  </div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>
                    {bim.ver} · {bim.size}
                  </div>
                </div>
                <button
                  onClick={() => {
                    haptic();
                    setBimSheet(true);
                  }}
                  style={{
                    padding: '7px 12px',
                    borderRadius: 10,
                    border: `1px solid ${T.hairline}`,
                    background: 'rgba(255,255,255,0.05)',
                    color: T.text,
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: T.font,
                    cursor: 'pointer',
                  }}
                >
                  Change
                </button>
              </Card>
            ) : (
              <button
                onClick={() => {
                  haptic();
                  setBimSheet(true);
                }}
                style={{
                  width: '100%',
                  border: `1.5px dashed ${T.accent}66`,
                  background: 'rgba(20,184,192,0.06)',
                  borderRadius: 14,
                  padding: '20px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                <Icon name="upload" size={26} color={T.accent} />
                <span style={{ fontSize: 14.5, fontWeight: 700, color: T.text }}>Upload BIM model</span>
                <span style={{ fontSize: 12.5, color: T.muted }}>
                  IFC · Revit (.rvt) — required to compute coverage
                </span>
              </button>
            )}
          </div>

          <Button
            primary
            icon="check"
            onClick={create}
            style={{ width: '100%', marginTop: 4, opacity: ready ? 1 : 0.4, pointerEvents: ready ? 'auto' : 'none' }}
          >
            Create project
          </Button>
          <div style={{ fontSize: 12, color: T.faint, textAlign: 'center', lineHeight: 1.45, marginTop: -4 }}>
            Then run your first scan to measure coverage against the BIM.
          </div>
        </div>
      </Screen>
      <BimUploadSheet
        open={bimSheet}
        current={bim || {}}
        onClose={() => setBimSheet(false)}
        onConnected={(f) => {
          setBim({ file: f.file, size: f.size, ver: f.ver, uploaded: 'Just now', elements: f.elements });
          setBimSheet(false);
        }}
      />
    </div>
  );
}
