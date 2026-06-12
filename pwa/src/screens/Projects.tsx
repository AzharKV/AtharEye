// Projects (home) — portfolio list of 6 projects: mini coverage donut, stage chip, status pill;
// search; stage filter pills (All · Needs review · Early · Mid · Complete); + New; swipe-to-delete.
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { T, STATUS } from '../theme';
import type { Project } from '../types';
import { haptic } from '../lib/haptic';
import { useStore } from '../lib/store';
import { Screen, useNav } from '../navigation/Navigator';
import { Chips, ScreenHeader, Ring, StageChip, StatusPill, EmptyState, mono } from '../components/primitives';
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

const ringColor = (p: Project): string =>
  p.status === 'Needs review' ? T.amber : p.overall_coverage >= 100 ? T.teal : T.navy;

export function ProjectsList() {
  const { data, deleteProject } = useStore();
  const nav = useNav();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');

  const q = query.trim().toLowerCase();
  const list = data.projects.filter(
    (p) =>
      matchesFilter(p, filter) &&
      (q === '' || `${p.name} ${p.location} ${p.client}`.toLowerCase().includes(q)),
  );

  return (
    <Screen>
      <ScreenHeader
        title="Projects"
        sub={`${data.projects.length} active · ${data.company.name}`}
        trailing={
          <button
            onClick={() => {
              haptic();
              nav.push(<NewProject />);
            }}
            aria-label="New project"
            style={{
              width: 40,
              height: 40,
              borderRadius: 13,
              border: 'none',
              background: T.navy,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Icon name="plus" size={22} color="#fff" />
          </button>
        }
      />

      {/* Search */}
      <div style={{ padding: '4px 20px 10px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            background: T.surface,
            border: `1px solid ${T.hairline}`,
            borderRadius: 12,
            padding: '10px 13px',
          }}
        >
          <Icon name="search" size={18} color={T.faint} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, locations, clients"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'none',
              fontFamily: T.font,
              fontSize: 15,
              color: T.ink,
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex' }}>
              <Icon name="close" size={16} color={T.faint} />
            </button>
          )}
        </div>
      </div>

      <Chips items={[...FILTERS]} active={filter} onPick={(f) => setFilter(f as Filter)} tones={{ 'Needs review': T.amber }} />

      <div style={{ padding: '2px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.length === 0 ? (
          <EmptyState icon="projects" title="No projects" sub="No projects match this search or filter." />
        ) : (
          list.map((p) => (
            <SwipeRow key={p.id} onDelete={() => deleteProject(p.id)}>
              <ProjectRow project={p} onOpen={() => nav.push(<ProjectDetail projectId={p.id} />)} />
            </SwipeRow>
          ))
        )}
      </div>
    </Screen>
  );
}

function ProjectRow({ project: p, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <div
      onClick={() => {
        haptic();
        onOpen();
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 15px',
        background: T.surface,
        border: `1px solid ${T.hairline}`,
        borderRadius: 16,
        boxShadow: '0 1px 2px rgba(27,42,61,0.04), 0 6px 16px rgba(27,42,61,0.05)',
        cursor: 'pointer',
      }}
    >
      <Ring value={p.overall_coverage} size={50} stroke={5} color={ringColor(p)} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15.5, fontWeight: 700, color: T.ink, letterSpacing: -0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {p.name}
        </div>
        <div style={{ ...mono, fontSize: 12.5, color: T.muted, margin: '2px 0 7px' }}>
          {p.location.split(',')[0]} · {p.sector} · {p.scans.length} scans
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <StageChip stage={p.stage} />
          <StatusPill status={p.status} />
        </div>
      </div>
      <Icon name="chevron" size={18} color={STATUS[p.status].c === T.amber ? T.amber : T.faint} />
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
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden' }}>
      <button
        onClick={() => {
          haptic();
          onDelete();
        }}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          width: REVEAL,
          border: 'none',
          background: T.red,
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 700,
        }}
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
          if (axis.current === null && Math.abs(ddx) + Math.abs(ddy) > 6) {
            axis.current = Math.abs(ddx) > Math.abs(ddy) ? 'x' : 'y';
          }
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
        style={{
          transform: `translateX(${dx}px)`,
          transition: dragging ? 'none' : 'transform .2s cubic-bezier(.32,.72,0,1)',
          touchAction: 'pan-y',
        }}
      >
        {children}
      </div>
    </div>
  );
}
