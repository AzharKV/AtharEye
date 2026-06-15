// editors.tsx — bottom-sheet CRUD editors for the project detail (zones, issues, trades, team, BIM,
// project) + the scan log / per-scan detail. Editing a zone's coverage rolls up the project's overall
// coverage (the single mutation path: useStore().update(id, recipe, {rollup})).
import { useState } from 'react';
import { T, SEV } from '../theme';
import type { Project, Scan, Severity, Stage, Status, TradeStatus } from '../types';
import { fmtDate } from '../lib/format';
import { DEMO_NOW } from '../data';
import { useStore } from '../lib/store';
import { Sheet, TextField, NumberField, SelectField } from '../components/Sheet';
import { Button, SevDot, mono } from '../components/primitives';
import { Icon } from '../components/Icon';

const STAGES = ['Early', 'Mid', 'Complete'] as const;
const STATUSES = ['On track', 'Needs review', 'Behind', 'Complete'] as const;
const SEVS = ['Critical', 'Major', 'Minor'] as const;
const TRADE_STATUSES = ['Done', 'In progress', 'Not started'] as const;
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}`;

// ── Edit project (header pencil)
export function EditProjectSheet({ project, onClose }: { project: Project; onClose: () => void }) {
  const { update } = useStore();
  const [name, setName] = useState(project.name);
  const [client, setClient] = useState(project.client);
  const [location, setLocation] = useState(project.location);
  const [type, setType] = useState(project.type);
  const [area, setArea] = useState(project.area_m2);
  const [stage, setStage] = useState<Stage>(project.stage);
  const [status, setStatus] = useState<Status>(project.status);
  const save = () => {
    update(project.id, (d) => {
      d.name = name.trim() || d.name;
      d.client = client.trim() || d.client;
      d.location = location.trim() || d.location;
      d.type = type.trim() || d.type;
      d.area_m2 = area;
      d.stage = stage;
      d.status = status;
    });
    onClose();
  };
  return (
    <Sheet title="Edit project" onClose={onClose} footer={<Button primary full onClick={save}>Save changes</Button>}>
      <TextField label="Project name" value={name} onChange={setName} />
      <TextField label="Client" value={client} onChange={setClient} />
      <TextField label="Location" value={location} onChange={setLocation} />
      <TextField label="Type" value={type} onChange={setType} />
      <NumberField label="Floor area" suffix="m²" value={area} onChange={setArea} />
      <SelectField label="Stage" value={stage} options={STAGES} onChange={setStage} />
      <SelectField label="Status" value={status} options={STATUSES} onChange={setStatus} />
    </Sheet>
  );
}

// ── Zone add / edit / delete (recomputes overall coverage)
export function ZoneSheet({ project, zoneId, onClose }: { project: Project; zoneId: string | null; onClose: () => void }) {
  const { update } = useStore();
  const existing = project.zones.find((z) => z.id === zoneId);
  const [name, setName] = useState(existing?.name ?? '');
  const [area, setArea] = useState(existing?.area_m2 ?? 0);
  const [coverage, setCoverage] = useState(existing?.coverage ?? 0);
  const [stage, setStage] = useState<Stage>(existing?.stage ?? project.stage);
  const [note, setNote] = useState(existing?.note ?? '');

  const save = () => {
    update(
      project.id,
      (d) => {
        if (existing) {
          const z = d.zones.find((x) => x.id === existing.id);
          if (z) Object.assign(z, { name: name.trim() || z.name, area_m2: area, coverage, stage, note });
        } else {
          d.zones.push({ id: uid('z'), name: name.trim() || 'New zone', area_m2: area, coverage, stage, note });
        }
      },
      { rollup: true },
    );
    onClose();
  };
  const remove = () => {
    update(project.id, (d) => {
      d.zones = d.zones.filter((z) => z.id !== existing!.id);
    }, { rollup: true });
    onClose();
  };

  return (
    <Sheet
      title={existing ? 'Edit zone' : 'Add zone'}
      onClose={onClose}
      footer={
        <>
          {existing && <Button danger onClick={remove} icon="trash">Delete</Button>}
          <Button primary full onClick={save}>{existing ? 'Save' : 'Add zone'}</Button>
        </>
      }
    >
      <TextField label="Zone name" value={name} onChange={setName} placeholder="e.g. Kitchen" />
      <NumberField label="Floor area" suffix="m²" value={area} onChange={setArea} />
      <NumberField label="Coverage" suffix="%, 0–100" value={coverage} onChange={setCoverage} max={100} />
      <SelectField label="Stage" value={stage} options={STAGES} onChange={setStage} />
      <TextField label="Note" value={note} onChange={setNote} multiline />
      <div style={{ fontSize: 12, color: T.muted, marginTop: -4 }}>Editing coverage updates the project's overall % (area-weighted).</div>
    </Sheet>
  );
}

// ── Issue add / edit / close-reopen / delete / re-tag zone
export function IssueSheet({ project, issueId, onClose }: { project: Project; issueId: string | null; onClose: () => void }) {
  const { update } = useStore();
  const existing = project.issues.find((i) => i.id === issueId);
  const zoneNames = project.zones.map((z) => z.name);
  const [title, setTitle] = useState(existing?.title ?? '');
  const [severity, setSeverity] = useState<Severity>(existing?.severity ?? 'Major');
  const [zone, setZone] = useState(existing?.zone ?? zoneNames[0] ?? 'General');

  const save = () => {
    update(project.id, (d) => {
      if (existing) {
        const it = d.issues.find((x) => x.id === existing.id);
        if (it) Object.assign(it, { title: title.trim() || it.title, severity, zone });
      } else {
        d.issues.push({
          id: uid('IS').toUpperCase(),
          severity,
          zone,
          title: title.trim() || 'New issue',
          status: 'Open',
          raised: DEMO_NOW,
          appear: d.overall_coverage,
        });
      }
    });
    onClose();
  };
  const toggleClose = () => {
    update(project.id, (d) => {
      const it = d.issues.find((x) => x.id === existing!.id);
      if (!it) return;
      if (it.status === 'Open') {
        it.status = 'Closed';
        it.closed = DEMO_NOW;
        it.clear = d.overall_coverage;
      } else {
        it.status = 'Open';
        delete it.closed;
        delete it.clear;
      }
    });
    onClose();
  };
  const remove = () => {
    update(project.id, (d) => {
      d.issues = d.issues.filter((i) => i.id !== existing!.id);
    });
    onClose();
  };

  return (
    <Sheet
      title={existing ? `Issue ${existing.id}` : 'Add issue'}
      onClose={onClose}
      footer={
        <>
          {existing && <Button danger onClick={remove} icon="trash">Delete</Button>}
          <Button primary full onClick={save}>{existing ? 'Save' : 'Add issue'}</Button>
        </>
      }
    >
      <TextField label="Title" value={title} onChange={setTitle} placeholder="Describe the issue" />
      <SelectField label="Severity" value={severity} options={SEVS} onChange={setSeverity} />
      {zoneNames.length > 0 && <SelectField label="Zone" value={zone} options={zoneNames} onChange={setZone} />}
      {existing && (
        <button
          onClick={toggleClose}
          style={{ width: '100%', marginTop: 4, padding: '12px', borderRadius: 12, border: `1px solid ${existing.status === 'Open' ? T.teal : T.amber}`, background: existing.status === 'Open' ? T.tealTint : T.amberTint, color: existing.status === 'Open' ? T.teal : T.amber, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <Icon name={existing.status === 'Open' ? 'check' : 'clock'} size={18} color={existing.status === 'Open' ? T.teal : T.amber} />
          {existing.status === 'Open' ? 'Mark as closed' : 'Re-open issue'}
        </button>
      )}
    </Sheet>
  );
}

// ── Trade add / edit / delete
export function TradeSheet({ project, index, onClose }: { project: Project; index: number | null; onClose: () => void }) {
  const { update } = useStore();
  const existing = index != null ? project.trades[index] : undefined;
  const [name, setName] = useState(existing?.name ?? '');
  const [status, setStatus] = useState<TradeStatus>(existing?.status ?? 'Not started');
  const save = () => {
    update(project.id, (d) => {
      if (existing && index != null) d.trades[index] = { name: name.trim() || existing.name, status };
      else d.trades.push({ name: name.trim() || 'New trade', status });
    });
    onClose();
  };
  const remove = () => {
    update(project.id, (d) => {
      d.trades = d.trades.filter((_, i) => i !== index);
    });
    onClose();
  };
  return (
    <Sheet
      title={existing ? 'Edit trade' : 'Add trade'}
      onClose={onClose}
      footer={
        <>
          {existing && <Button danger onClick={remove} icon="trash">Delete</Button>}
          <Button primary full onClick={save}>{existing ? 'Save' : 'Add trade'}</Button>
        </>
      }
    >
      <TextField label="Trade" value={name} onChange={setName} placeholder="e.g. Plastering & skim" />
      <SelectField label="Status" value={status} options={TRADE_STATUSES} onChange={setStatus} />
    </Sheet>
  );
}

// ── Project team member add / edit / delete (label "Name · Role")
export function TeamSheet({ project, index, onClose }: { project: Project; index: number | null; onClose: () => void }) {
  const { update } = useStore();
  const existing = index != null ? project.team[index] : undefined;
  const [name, setName] = useState(existing ? existing.split(' · ')[0] : '');
  const [role, setRole] = useState(existing ? existing.split(' · ')[1] ?? '' : '');
  const label = `${name.trim()}${role.trim() ? ` · ${role.trim()}` : ''}`;
  const save = () => {
    update(project.id, (d) => {
      if (index != null) d.team[index] = label;
      else d.team.push(label);
    });
    onClose();
  };
  const remove = () => {
    update(project.id, (d) => {
      d.team = d.team.filter((_, i) => i !== index);
    });
    onClose();
  };
  return (
    <Sheet
      title={existing ? 'Edit member' : 'Add member'}
      onClose={onClose}
      footer={
        <>
          {existing && <Button danger onClick={remove} icon="trash">Remove</Button>}
          <Button primary full onClick={save}>{existing ? 'Save' : 'Add'}</Button>
        </>
      }
    >
      <TextField label="Name / company" value={name} onChange={setName} placeholder="e.g. A. Patel" />
      <TextField label="Role" value={role} onChange={setRole} placeholder="e.g. Main contractor" />
    </Sheet>
  );
}

// ── BIM edit
export function BimSheet({ project, onClose }: { project: Project; onClose: () => void }) {
  const { update } = useStore();
  const [file, setFile] = useState(project.bim.file);
  const [software, setSoftware] = useState(project.bim.software);
  const [lod, setLod] = useState(project.bim.lod);
  const [disciplines, setDisciplines] = useState(project.bim.disciplines.join(', '));
  const save = () => {
    update(project.id, (d) => {
      d.bim.file = file.trim() || d.bim.file;
      d.bim.software = software.trim() || d.bim.software;
      d.bim.lod = lod;
      d.bim.disciplines = disciplines.split(',').map((s) => s.trim()).filter(Boolean);
    });
    onClose();
  };
  return (
    <Sheet title="Edit BIM model" onClose={onClose} footer={<Button primary full onClick={save}>Save</Button>}>
      <TextField label="Model file" value={file} onChange={setFile} />
      <TextField label="Software" value={software} onChange={setSoftware} />
      <NumberField label="LOD" value={lod} onChange={setLod} max={500} />
      <TextField label="Disciplines (comma-separated)" value={disciplines} onChange={setDisciplines} />
    </Sheet>
  );
}

// ── Scan log + per-scan detail
export function ScanLogSheet({ project, onOpenReport, onClose }: { project: Project; onOpenReport: (coverage: number) => void; onClose: () => void }) {
  const [detail, setDetail] = useState<Scan | null>(null);
  const scans = [...project.scans].reverse();
  if (detail) return <ScanDetailSheet project={project} scan={detail} onOpenReport={onOpenReport} onClose={() => setDetail(null)} />;
  return (
    <Sheet title="Scan log" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {scans.map((s, i) => {
          const prev = scans[i + 1];
          const delta = prev ? s.coverage - prev.coverage : s.coverage;
          return (
            <button
              key={s.id}
              onClick={() => setDetail(s)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 4px', border: 'none', borderBottom: `1px solid ${T.hairline2}`, background: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ ...mono, width: 52, fontSize: 18, fontWeight: 800, color: s.coverage >= 100 ? T.teal : T.navy }}>{s.coverage}%</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...mono, fontSize: 13, color: T.ink, fontWeight: 600 }}>{fmtDate(s.date)}</div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.note}</div>
              </div>
              <span style={{ ...mono, fontSize: 12.5, fontWeight: 700, color: delta > 0 ? T.teal : T.muted }}>{delta > 0 ? `+${delta}%` : '—'}</span>
              <Icon name="chevron" size={16} color={T.faint} />
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}

function ScanDetailSheet({ project, scan, onOpenReport, onClose }: { project: Project; scan: Scan; onOpenReport: (coverage: number) => void; onClose: () => void }) {
  const idx = project.scans.findIndex((s) => s.id === scan.id);
  const prev = idx > 0 ? project.scans[idx - 1] : undefined;
  const delta = prev ? scan.coverage - prev.coverage : scan.coverage;
  const open = project.issues.filter((i) => i.appear <= scan.coverage && (i.clear == null || scan.coverage < i.clear));
  return (
    <Sheet title="Scan detail" onClose={onClose} footer={<Button primary full icon="reports" onClick={() => onOpenReport(scan.coverage)}>View this report</Button>}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
        <span style={{ ...mono, fontSize: 40, fontWeight: 800, color: scan.coverage >= 100 ? T.teal : T.navy, letterSpacing: -1 }}>{scan.coverage}%</span>
        <span style={{ ...mono, fontSize: 15, fontWeight: 700, color: delta > 0 ? T.teal : T.muted }}>{delta > 0 ? `+${delta}%` : 'baseline'}</span>
      </div>
      <div style={{ fontSize: 13.5, color: T.ink, marginBottom: 14 }}>{scan.note}</div>
      <Row k="Date" v={fmtDate(scan.date)} />
      <Row k="Aligned to" v={project.bim.file} />
      <Row k="Captured by" v="M. Ahmed · Scan/tech" />
      <Row k="Open issues at scan" v={`${open.length}`} />
      {open.length > 0 && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {open.map((i) => (
            <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SevDot sev={i.severity} />
              <span style={{ fontSize: 12.5, color: T.muted }}>{i.id} · {i.zone} · {SEV[i.severity].label}</span>
            </div>
          ))}
        </div>
      )}
    </Sheet>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, padding: '8px 0', borderBottom: `1px solid ${T.hairline2}` }}>
      <span style={{ fontSize: 13, color: T.muted }}>{k}</span>
      <span style={{ ...mono, fontSize: 13, color: T.ink, fontWeight: 600, textAlign: 'right' }}>{v}</span>
    </div>
  );
}
