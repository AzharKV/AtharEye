// New project — name, sector, location, client, area, connect/upload BIM. Creates a project at 0%
// (Early, On track, empty zones/issues/scans) and opens its detail.
import { useRef, useState } from 'react';
import { T } from '../theme';
import type { Project, Sector } from '../types';
import { useStore } from '../lib/store';
import { useDelayedSave } from '../hooks/useDelayedSave';
import { Screen, useNav } from '../navigation/Navigator';
import { PushHeader } from '../navigation/PushHeader';
import { Button } from '../components/primitives';
import { Icon } from '../components/Icon';
import { ProjectDetail } from './ProjectDetail';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', marginBottom: 16 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: T.muted, marginBottom: 7, letterSpacing: 0.2 }}>{label}</div>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: `1px solid ${T.hairline}`,
  borderRadius: 12,
  padding: '12px 13px',
  fontFamily: T.font,
  fontSize: 15,
  color: T.ink,
  background: T.surface,
  outline: 'none',
};

export function NewProject() {
  const { addProject, demoNow, data } = useStore();
  const nav = useNav();
  const [name, setName] = useState('');
  const [sector, setSector] = useState<Sector>('Residential');
  const [location, setLocation] = useState('');
  const [client, setClient] = useState('');
  const [area, setArea] = useState('');
  const [bim, setBim] = useState('');
  const [bimUploading, setBimUploading] = useState(false);
  const bimRef = useRef<HTMLInputElement>(null);
  const { saving, run } = useDelayedSave(650);

  const valid = name.trim().length > 0 && location.trim().length > 0;

  const onPickBim = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setBimUploading(true);
    window.setTimeout(() => {
      setBim(f.name);
      setBimUploading(false);
    }, 1100);
  };

  const create = () => {
    const id = `proj-${Date.now().toString(36)}`;
    const p: Project = {
      id,
      name: name.trim(),
      sector,
      type: sector === 'Residential' ? 'Refurbishment' : 'Fit-out',
      location: location.trim(),
      client: client.trim() || 'Client TBC',
      // Report identity defaults to the current account (so it never falls back to the client-demo
      // "Cairn / J. Mackay" in the optisync phase). Editable later if a contractor editor is added.
      contractor: data.company.name,
      preparedBy: `${data.user.name} · ${data.user.role}`,
      area_m2: Math.max(0, Math.round(Number(area) || 0)),
      stage: 'Early',
      overall_coverage: 0,
      status: 'On track',
      start_date: demoNow,
      target_handover: '',
      depth: 'light',
      bim: {
        software: bim ? 'Autodesk Revit → IFC export' : 'Not connected',
        file: bim || '—',
        lod: bim ? 300 : 0,
        disciplines: bim ? ['Architectural', 'Structural'] : [],
        last_aligned: '',
      },
      team: [],
      trades: [],
      zones: [],
      issues: [],
      scans: [],
      captures: [],
    };
    addProject(p);
    nav.pop();
    // Wait out the Navigator's 380 ms pop animation-lock before pushing the new project's detail —
    // an earlier push lands inside the lock and is silently dropped (leaving you on the list).
    setTimeout(() => nav.push(<ProjectDetail projectId={id} />), 420);
  };

  return (
    <Screen padTop={0}>
      <PushHeader title="New project" />
      <div style={{ padding: '18px 20px 28px' }}>
        <Field label="Project name">
          <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Marchmont Flat Refurbishment" />
        </Field>

        <Field label="Sector">
          <div style={{ display: 'flex', gap: 8 }}>
            {(['Residential', 'Commercial'] as Sector[]).map((s) => {
              const on = sector === s;
              return (
                <button
                  key={s}
                  onClick={() => setSector(s)}
                  style={{
                    flex: 1,
                    padding: '11px 0',
                    borderRadius: 12,
                    border: `1px solid ${on ? T.navy : T.hairline}`,
                    background: on ? T.navy : T.surface,
                    color: on ? '#fff' : T.muted,
                    fontWeight: 700,
                    fontSize: 14.5,
                    fontFamily: T.font,
                    cursor: 'pointer',
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Location">
          <input style={inputStyle} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Marchmont, Edinburgh, EH9" />
        </Field>

        <Field label="Client">
          <input style={inputStyle} value={client} onChange={(e) => setClient(e.target.value)} placeholder="e.g. Private / Property Group" />
        </Field>

        <Field label="Floor area (m²)">
          <input style={inputStyle} value={area} onChange={(e) => setArea(e.target.value)} inputMode="numeric" placeholder="e.g. 72" />
        </Field>

        <Field label="BIM model">
          <input ref={bimRef} type="file" accept=".ifc,.ifcxml,.ifczip" onChange={onPickBim} style={{ display: 'none' }} />
          <button
            onClick={() => !bimUploading && bimRef.current?.click()}
            disabled={bimUploading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 13px',
              borderRadius: 12,
              border: `1px dashed ${bimUploading ? T.navy : bim ? T.teal : T.hairline}`,
              background: bim && !bimUploading ? T.tealTint : T.surface,
              color: bimUploading ? T.navy : bim ? T.teal : T.muted,
              fontFamily: T.font,
              fontSize: 14.5,
              fontWeight: 600,
              cursor: bimUploading ? 'progress' : 'pointer',
              textAlign: 'left',
            }}
          >
            {bimUploading ? (
              <>
                <span style={{ width: 17, height: 17, borderRadius: 999, border: `2px solid ${T.navyTint}`, borderTopColor: T.navy, animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                Uploading &amp; aligning to BIM…
              </>
            ) : (
              <>
                <Icon name={bim ? 'check' : 'upload'} size={18} color={bim ? T.teal : T.navy} />
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bim ? `Connected · ${bim}` : 'Upload BIM from device (.ifc)'}</span>
              </>
            )}
          </button>
        </Field>

        <Button primary full loading={saving} disabled={!valid} onClick={() => run(create)} style={{ marginTop: 8 }}>
          {saving ? 'Creating…' : 'Create project'}
        </Button>
      </div>
    </Screen>
  );
}
