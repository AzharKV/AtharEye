// Issues / snags — portfolio-wide list aggregated across projects, with open/critical/closed counts,
// severity + status filters, and add. Tapping an issue opens its project-scoped editor (close /
// re-open / re-tag zone / delete). Reached from the Account workspace links.
import { useState } from 'react';
import { T, SEV } from '../theme';
import type { Issue, Project } from '../types';
import { useStore } from '../lib/store';
import { Screen } from '../navigation/Navigator';
import { PushHeader, RoundBtn } from '../navigation/PushHeader';
import { Card, Chips, SevDot, EmptyState, mono } from '../components/primitives';
import { Sheet } from '../components/Sheet';
import { IssueSheet } from './editors';

const SEV_FILTERS = ['All', 'Critical', 'Major', 'Minor'] as const;
const sevRank = (s: Issue['severity']) => (s === 'Critical' ? 0 : s === 'Major' ? 1 : 2);

export function Issues() {
  const { data } = useStore();
  const [status, setStatus] = useState<'Open' | 'Closed'>('Open');
  const [sev, setSev] = useState<(typeof SEV_FILTERS)[number]>('All');
  const [edit, setEdit] = useState<{ project: Project; issueId: string | null } | null>(null);
  const [picking, setPicking] = useState(false);

  const all = data.projects.flatMap((p) => p.issues.map((i) => ({ i, p })));
  const openCount = all.filter((x) => x.i.status === 'Open').length;
  const critCount = all.filter((x) => x.i.status === 'Open' && x.i.severity === 'Critical').length;
  const closedCount = all.filter((x) => x.i.status === 'Closed').length;

  const list = all
    .filter((x) => x.i.status === status && (sev === 'All' || x.i.severity === sev))
    .sort((a, b) => sevRank(a.i.severity) - sevRank(b.i.severity));

  return (
    <Screen padTop={0}>
      <PushHeader title="Issues & snags" trailing={<RoundBtn icon="plus" label="Add issue" onClick={() => setPicking(true)} />} />

      <div style={{ padding: '14px 16px 0' }}>
        {/* Counts */}
        <Card style={{ padding: 16, display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginBottom: 6 }}>
          <Count n={openCount} label="Open" />
          <Count n={critCount} label="Critical" c={critCount ? T.red : T.muted} />
          <Count n={closedCount} label="Closed" c={T.teal} />
        </Card>

        {/* Status segmented */}
        <div style={{ display: 'flex', gap: 6, background: T.surface2, borderRadius: 10, padding: 3, margin: '12px 4px' }}>
          {(['Open', 'Closed'] as const).map((s) => {
            const on = s === status;
            return (
              <button key={s} onClick={() => setStatus(s)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer', background: on ? T.surface : 'transparent', color: on ? T.navy : T.muted, fontWeight: on ? 700 : 600, fontSize: 13.5, fontFamily: T.font, boxShadow: on ? '0 1px 3px rgba(27,42,61,0.12)' : 'none' }}>
                {s}
              </button>
            );
          })}
        </div>

        <Chips items={[...SEV_FILTERS]} active={sev} onPick={(s) => setSev(s as (typeof SEV_FILTERS)[number])} tones={{ Critical: T.red, Major: T.amber }} />
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.length === 0 ? (
          <EmptyState icon="checkCircle" title={status === 'Open' ? 'No open issues' : 'No closed issues'} sub="Nothing matches this filter." />
        ) : (
          list.map(({ i, p }) => (
            <Card key={`${p.id}-${i.id}`} pressable onClick={() => setEdit({ project: p, issueId: i.id })} style={{ padding: '13px 15px', display: 'flex', alignItems: 'flex-start', gap: 11 }}>
              <div style={{ marginTop: 3 }}>
                <SevDot sev={i.severity} size={9} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, textDecoration: i.status === 'Closed' ? 'line-through' : 'none' }}>{i.title}</div>
                <div style={{ ...mono, fontSize: 11.5, color: T.muted, marginTop: 3 }}>{i.id} · {p.name.split(' ')[0]} · {i.zone} · {SEV[i.severity].label}</div>
              </div>
            </Card>
          ))
        )}
      </div>

      {edit && <IssueSheet project={data.projects.find((p) => p.id === edit.project.id)!} issueId={edit.issueId} onClose={() => setEdit(null)} />}

      {picking && (
        <Sheet title="Add issue to…" onClose={() => setPicking(false)}>
          {data.projects.map((p) => (
            <button key={p.id} onClick={() => { setPicking(false); setEdit({ project: p, issueId: null }); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '13px 4px', border: 'none', borderBottom: `1px solid ${T.hairline2}`, background: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: T.ink }}>{p.name}</span>
              <span style={{ ...mono, fontSize: 12.5, color: T.muted }}>{p.issues.filter((i) => i.status === 'Open').length} open</span>
            </button>
          ))}
        </Sheet>
      )}
    </Screen>
  );
}

function Count({ n, label, c }: { n: number; label: string; c?: string }) {
  return (
    <div>
      <div style={{ ...mono, fontSize: 24, fontWeight: 800, color: c ?? T.ink, letterSpacing: -0.5 }}>{n}</div>
      <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2, fontWeight: 600 }}>{label}</div>
    </div>
  );
}
