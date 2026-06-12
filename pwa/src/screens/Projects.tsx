// Projects (home) — portfolio list of 6 projects: mini coverage donut, stage chip (top-right),
// pin location + status; search + stage filter pills inside the app bar; + New; swipe-to-delete.
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { T } from '../theme';
import type { Project } from '../types';
import { haptic } from '../lib/haptic';
import { useStore } from '../lib/store';
import { Screen, useNav } from '../navigation/Navigator';
import { Ring, ScreenHeader, StageChip, StatusPill } from '../components/primitives';
import { Icon } from '../components/Icon';
import { ProjectDetail } from './ProjectDetail';
import { NewProject } from './NewProject';

const FILTERS = ['All', 'Needs review', 'Early stage', 'Mid-build', 'Complete'] as const;
type Filter = (typeof FILTERS)[number];

function matchesFilter(p: Project, f: Filter): boolean {
  switch (f) {
    case 'All':
      return true;
    case 'Needs review':
      return p.status === 'Needs review';
    case 'Early stage':
      return p.stage === 'Early';
    case 'Mid-build':
      return p.stage === 'Mid';
    case 'Complete':
      return p.stage === 'Complete';
  }
}

const ringColor = (p: Project): string => (p.overall_coverage >= 100 ? T.teal : T.navy);

export function ProjectsList() {
  const { data, deleteProject } = useStore();
  const nav = useNav();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');

  const q = query.trim().toLowerCase();
  const list = data.projects.filter(
    (p) => matchesFilter(p, filter) && (q === '' || `${p.name} ${p.location} ${p.client}`.toLowerCase().includes(q)),
  );

  return (
    <Screen padTop={0}>
      <ScreenHeader
        title="Projects"
        sub={`${data.projects.length} active projects`}
        trailing={
          <button
            onClick={() => {
              haptic();
              nav.push(<NewProject />);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 13px', borderRadius: 10, border: 'none', background: T.navy, color: '#fff', fontWeight: 650, fontSize: 13.5, fontFamily: T.font, cursor: 'pointer', flexShrink: 0 }}
          >
            <Icon name="plus" size={16} color="#fff" /> New
          </button>
        }
      >
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 12, background: T.canvas, border: `1px solid ${T.hairline}`, borderRadius: 10, padding: '9px 11px' }}>
          <Icon name="search" size={17} color={T.muted} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, clients, locations"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'none', fontFamily: T.font, fontSize: 14, color: T.ink }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex' }}>
              <Icon name="close" size={15} color={T.muted} />
            </button>
          )}
        </div>
        {/* Stage filters */}
        <div className="no-scrollbar" style={{ display: 'flex', gap: 6, marginTop: 11, overflowX: 'auto', paddingBottom: 2 }}>
          {FILTERS.map((f) => {
            const on = filter === f;
            const attn = f === 'Needs review';
            const bg = on ? (attn ? T.amber : T.navy) : attn ? T.amberTint : T.canvas;
            const col = on ? '#fff' : attn ? T.amber : T.muted;
            const bd = on ? (attn ? T.amber : T.navy) : attn ? 'rgba(181,120,26,.32)' : T.hairline;
            return (
              <button
                key={f}
                onClick={() => {
                  haptic();
                  setFilter(f);
                }}
                style={{ flexShrink: 0, fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 999, whiteSpace: 'nowrap', background: bg, color: col, border: `1px solid ${bd}`, cursor: 'pointer', fontFamily: T.font }}
              >
                {f}
              </button>
            );
          })}
        </div>
      </ScreenHeader>

      <div style={{ padding: '14px 16px 4px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.length === 0 ? (
          <div style={{ textAlign: 'center', color: T.muted, fontSize: 13, padding: '40px 0' }}>No projects match.</div>
        ) : (
          list.map((p) => (
            <SwipeRow key={p.id} onDelete={() => deleteProject(p.id)}>
              <ProjectRow project={p} onOpen={() => nav.push(<ProjectDetail projectId={p.id} />)} />
            </SwipeRow>
          ))
        )}
        {list.length > 0 && (
          <div style={{ textAlign: 'center', fontSize: 11, color: T.faint, marginTop: 8, letterSpacing: 0.3 }}>Swipe a project left to delete</div>
        )}
      </div>
    </Screen>
  );
}

function ProjectRow({ project: p, onOpen }: { project: Project; onOpen: () => void }) {
  const loc = p.location.split(',').slice(-2).join(',').trim();
  return (
    <div
      onClick={() => {
        haptic();
        onOpen();
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        background: T.surface,
        border: `1px solid ${T.hairline}`,
        borderRadius: 14,
        boxShadow: '0 1px 2px rgba(27,42,61,0.04), 0 1px 1px rgba(27,42,61,0.03)',
        cursor: 'pointer',
      }}
    >
      <Ring value={p.overall_coverage} size={46} stroke={5} color={ringColor(p)} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: '1 1 auto', minWidth: 0 }}>{p.name}</span>
          <span style={{ flexShrink: 0 }}>
            <StageChip stage={p.stage} />
          </span>
        </div>
        <div style={{ fontSize: 12, color: T.muted, margin: '3px 0 7px', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="pin" size={12} color={T.muted} /> {loc}
          <span style={{ opacity: 0.4 }}>·</span>
          {p.sector}
        </div>
        <StatusPill status={p.status} />
      </div>
      <Icon name="chevron" size={17} color={T.faint} />
    </div>
  );
}

// ── Swipe-to-delete row (iOS-style reveal). touch-action pan-y keeps vertical scroll working.
function SwipeRow({ children, onDelete }: { children: ReactNode; onDelete: () => void }) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const axis = useRef<'x' | 'y' | null>(null);
  const REVEAL = 84;

  return (
    <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden' }}>
      <button
        onClick={() => {
          haptic();
          onDelete();
        }}
        style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: REVEAL, border: 'none', background: T.red, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}
      >
        <Icon name="trash" size={20} color="#fff" />
        Delete
      </button>
      <div
        onPointerDown={(e) => {
          startX.current = e.clientX;
          startY.current = e.clientY;
          axis.current = null;
          setDragging(true);
        }}
        onPointerMove={(e) => {
          if (!dragging) return;
          const ddx = e.clientX - startX.current;
          const ddy = e.clientY - startY.current;
          if (axis.current === null && Math.abs(ddx) + Math.abs(ddy) > 6) axis.current = Math.abs(ddx) > Math.abs(ddy) ? 'x' : 'y';
          if (axis.current === 'x') {
            const base = dx <= -REVEAL ? -REVEAL : 0;
            setDx(Math.max(-REVEAL, Math.min(0, base + ddx)));
          }
        }}
        onPointerUp={() => {
          setDragging(false);
          if (axis.current === 'x') setDx(dx < -REVEAL / 2 ? -REVEAL : 0);
        }}
        onPointerCancel={() => {
          setDragging(false);
          setDx(dx < -REVEAL / 2 ? -REVEAL : 0);
        }}
        style={{ transform: `translateX(${dx}px)`, transition: dragging ? 'none' : 'transform .22s cubic-bezier(.2,.8,.2,1)', touchAction: 'pan-y' }}
      >
        {children}
      </div>
    </div>
  );
}
