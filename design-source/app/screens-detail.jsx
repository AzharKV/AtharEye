/* OptiSync — Project detail with full CRUD + tappable scrubber + scan log */

/* ---------- timeline scrubber ---------- */
function Timeline({ scans, sel, onSelect }) {
  const wrapRef = useRef(null);
  const n = scans.length;
  const pct = i => (n === 1 ? 0 : (i / (n - 1)) * 100);
  const pick = (clientX) => {
    const el = wrapRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - r.left - 14) / (r.width - 28)));
    onSelect(Math.round(x * (n - 1)));
  };
  const drag = useRef(false);
  return (
    <div ref={wrapRef} style={{ position: 'relative', height: 76, padding: '0 14px', touchAction: 'none' }}
      onPointerDown={e => { drag.current = true; pick(e.clientX); }}
      onPointerMove={e => { if (drag.current) pick(e.clientX); }}
      onPointerUp={() => drag.current = false} onPointerCancel={() => drag.current = false}>
      <div style={{ position: 'absolute', left: 14, right: 14, top: 46, height: 4, borderRadius: 3, background: 'var(--navy-08)' }} />
      <div style={{ position: 'absolute', left: 14, top: 46, height: 4, borderRadius: 3, background: 'var(--navy)', width: `calc((100% - 28px) * ${pct(sel) / 100})`, transition: 'width .3s cubic-bezier(.4,0,.2,1)' }} />
      {scans.map((s, i) => {
        const active = i === sel;
        return (
          <div key={i} style={{ position: 'absolute', left: `calc(14px + (100% - 28px) * ${pct(i) / 100})`, top: 0, transform: 'translateX(-50%)', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {active ? <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal)', marginTop: 4 }}>{s.coverage}%</div> : <div style={{ height: 21 }} />}
            <div style={{ position: 'absolute', top: 40, width: active ? 18 : 11, height: active ? 18 : 11, borderRadius: '50%', background: active ? 'var(--teal)' : (i < sel ? 'var(--navy)' : 'var(--surface)'), border: active ? '4px solid #fff' : '2px solid ' + (i <= sel ? 'var(--navy)' : 'var(--hairline)'), boxShadow: active ? '0 2px 8px rgba(24,131,126,.5), 0 0 0 1px var(--teal)' : 'none', transition: 'all .2s' }} />
            <div className="mono" style={{ position: 'absolute', top: 62, fontSize: 9.5, color: active ? 'var(--ink)' : 'var(--muted)', fontWeight: active ? 700 : 500, whiteSpace: 'nowrap' }}>{fdateShort(s.date)}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- gallery lightbox (with delete) ---------- */
function Lightbox({ shots, idx, onClose, onDelete }) {
  const [i, setI] = useState(idx);
  const s = shots[Math.min(i, shots.length - 1)];
  if (!s) { onClose(); return null; }
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,17,25,.94)', zIndex: 80, display: 'flex', flexDirection: 'column', animation: 'scrim .2s' }} onClick={onClose}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => e.stopPropagation()}>
        <img src={s.src} alt={s.cap} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 12, objectFit: 'contain' }} />
      </div>
      <div style={{ padding: '0 20px 40px', color: '#fff' }} onClick={e => e.stopPropagation()}>
        <div className="row between">
          <div><div style={{ fontSize: 14, fontWeight: 700 }}>{s.cap}</div><div className="mono" style={{ fontSize: 11, opacity: .6 }}>{s.p}</div></div>
          <div className="row gap8">
            {onDelete && <button onClick={() => { onDelete(s); if (shots.length <= 1) onClose(); else setI(Math.max(0, i - 1)); }} style={{ width: 38, height: 38, borderRadius: 19, background: 'rgba(192,73,47,.85)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ic.trash style={{ width: 18, height: 18 }} /></button>}
            <button onClick={() => setI((i - 1 + shots.length) % shots.length)} style={{ width: 38, height: 38, borderRadius: 19, background: 'rgba(255,255,255,.14)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ic.chevL style={{ width: 20, height: 20 }} /></button>
            <button onClick={() => setI((i + 1) % shots.length)} style={{ width: 38, height: 38, borderRadius: 19, background: 'rgba(255,255,255,.14)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ic.chevR style={{ width: 20, height: 20 }} /></button>
          </div>
        </div>
      </div>
      <button onClick={onClose} style={{ position: 'absolute', top: 54, right: 18, width: 38, height: 38, borderRadius: 19, background: 'rgba(255,255,255,.16)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ic.x style={{ width: 20, height: 20 }} /></button>
    </div>
  );
}

function Fact({ label, value }) {
  return <div><div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginBottom: 2 }}>{label}</div><div style={{ fontSize: 13.5, fontWeight: 650, color: 'var(--ink)' }}>{value}</div></div>;
}
const TRADE_COLOR = { 'Done': 'var(--teal)', 'In progress': 'var(--blue)', 'Not started': '#9aa7b6' };

/* ---------- editor config builder ---------- */
function editorConfig(kind, project) {
  if (kind === 'project') return { title: 'Edit project', fields: [
    { key: 'name', label: 'Project name', required: true },
    { key: 'sector', label: 'Sector', type: 'segment', options: ['Residential', 'Commercial'] },
    { key: 'location', label: 'Location', required: true },
    { key: 'client', label: 'Client', required: true },
    { key: 'area', label: 'Floor area (m²)', type: 'number' },
    { key: 'status', label: 'Status', type: 'segment', options: ['On track', 'Needs review', 'Behind', 'Complete'] }
  ] };
  if (kind === 'zone') return { title: 'Zone', fields: [
    { key: 'name', label: 'Zone name', required: true },
    { key: 'area', label: 'Area (m²)', type: 'number', required: true },
    { key: 'coverage', label: 'Coverage (%)', type: 'number', hint: 'Scanned & aligned vs the BIM plan, 0–100' },
    { key: 'note', label: 'Note', type: 'textarea' }
  ] };
  if (kind === 'issue') return { title: 'Issue', fields: [
    { key: 'title', label: 'Description', required: true, type: 'textarea', placeholder: 'What is the snag or deviation?' },
    { key: 'sev', label: 'Severity', type: 'sev', required: true },
    { key: 'zone', label: 'Zone', type: 'zone', required: true },
    { key: 'status', label: 'Status', type: 'segment', options: ['Open', 'Closed'] }
  ] };
  if (kind === 'team') return { title: 'Team member', fields: [
    { key: 'name', label: 'Name', required: true, placeholder: 'e.g. J. Boyle' },
    { key: 'role', label: 'Role / company', required: true, placeholder: 'e.g. Main contractor' }
  ] };
  if (kind === 'trade') return { title: 'Trade', fields: [
    { key: 'name', label: 'Trade', required: true, placeholder: 'e.g. Plastering & skim' },
    { key: 'status', label: 'Status', type: 'segment', options: ['Not started', 'In progress', 'Done'] }
  ] };
  if (kind === 'bim') return { title: 'BIM model', fields: [
    { key: 'file', label: 'Model file', required: true, placeholder: 'Project_R1.ifc' },
    { key: 'software', label: 'Source software' },
    { key: 'lod', label: 'LOD', type: 'number' },
    { key: 'disciplines', label: 'Disciplines', placeholder: 'Architectural, MEP' }
  ] };
  return { title: '', fields: [] };
}

/* ---------- Project detail ---------- */
function ProjectDetail({ nav, project, api, onDelete, onShare }) {
  const last = project.scans.length - 1;
  const [sel, setSelRaw] = useState(last);
  const [dim, setDim] = useState(false);
  const [lb, setLb] = useState(null);
  const [edit, setEdit] = useState(null);          // {kind, index, initial}
  const [scanIx, setScanIx] = useState(null);      // scan detail sheet
  const [showLog, setShowLog] = useState(false);
  const [showClosed, setShowClosed] = useState(false);
  const fileRef = useRef(null);
  const scan = project.scans[Math.min(sel, last)];
  const isCurrent = sel === project.scans.length - 1;
  const st = useMemo(() => window.OPTISYNC.stateAt(project, scan.coverage), [project, scan.coverage]);
  const closedList = project.issues.filter(it => it.clearAt != null && scan.coverage >= it.clearAt);
  const id = project.id;

  const select = (i) => { if (i === sel) return; setDim(true); setTimeout(() => { setSelRaw(i); setDim(false); }, 120); };

  /* captures (current view only) */
  const hidden = project.hiddenCaptures || [];
  const userCaps = project.userCaptures || [];
  const captures = isCurrent ? [...st.captures.filter(c => !hidden.includes(c.p)), ...userCaps] : st.captures;
  const onPhoto = (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => api.update(id, p => ({ ...p, noPhotos: false, userCaptures: [...(p.userCaptures || []), { p: 'u' + Date.now(), cap: f.name.replace(/\.[^.]+$/, '').slice(0, 24) || 'Site photo', src: reader.result }] }));
    reader.readAsDataURL(f); e.target.value = '';
  };
  const delCapture = (c) => {
    if (String(c.p).startsWith('u')) api.update(id, p => ({ ...p, userCaptures: (p.userCaptures || []).filter(x => x.p !== c.p) }));
    else api.update(id, p => ({ ...p, hiddenCaptures: [...(p.hiddenCaptures || []), c.p] }));
  };

  /* editor save */
  const saveEdit = (vals) => {
    const k = edit.kind, ix = edit.index;
    if (k === 'project') api.update(id, p => ({ ...p, name: vals.name, short: vals.name.split(' ').slice(0, 2).join(' '), sector: vals.sector, location: vals.location, client: vals.client, area: +vals.area || p.area, status: vals.status }));
    else if (k === 'zone') {
      const z = { name: vals.name, area: +vals.area || 1, coverage: Math.min(100, +vals.coverage || 0), note: vals.note || '' };
      api.update(id, p => ({ ...p, zones: ix == null ? [...p.zones, z] : p.zones.map((x, i) => i === ix ? z : x) }), true);
    } else if (k === 'issue') {
      api.update(id, p => {
        if (ix != null) return { ...p, issues: p.issues.map(it => it.id === ix ? { ...it, title: vals.title, sev: vals.sev, zone: vals.zone, status: vals.status, closed: vals.status === 'Closed' ? (it.closed || '2026-06-12') : undefined } : it) };
        const pref = (p.issues.find(i2 => /^[A-Za-z]{2}-/.test(i2.id)) || {}).id;
        const prefix = pref ? pref.split('-')[0] : p.short.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase();
        const nums = p.issues.map(i2 => parseInt((i2.id.split('-')[1] || '0'), 10)).filter(x => !isNaN(x));
        const nid = prefix + '-' + (Math.max(0, ...nums) + 1).toString().padStart(2, '0');
        return { ...p, issues: [...p.issues, { id: nid, title: vals.title, sev: vals.sev, zone: vals.zone, status: vals.status || 'Open', raised: '2026-06-12', appearAt: Math.max(0, p.coverage - 5), clearAt: vals.status === 'Closed' ? p.coverage : null }] };
      });
    } else if (k === 'team') {
      const s = `${vals.name} — ${vals.role}`;
      api.update(id, p => ({ ...p, team: ix == null ? [...p.team, s] : p.team.map((x, i) => i === ix ? s : x) }));
    } else if (k === 'trade') {
      api.update(id, p => ({ ...p, trades: ix == null ? [...p.trades, [vals.name, vals.status || 'Not started']] : p.trades.map((x, i) => i === ix ? [vals.name, vals.status] : x) }));
    } else if (k === 'bim') {
      api.update(id, p => ({ ...p, bim: { ...p.bim, file: vals.file, software: vals.software || p.bim.software, lod: +vals.lod || p.bim.lod, disciplines: (vals.disciplines || '').split(',').map(s => s.trim()).filter(Boolean) } }));
    }
    setEdit(null);
  };
  const deleteEdit = () => {
    const k = edit.kind, ix = edit.index;
    if (k === 'zone') api.update(id, p => ({ ...p, zones: p.zones.filter((_, i) => i !== ix) }), true);
    else if (k === 'issue') api.update(id, p => ({ ...p, issues: p.issues.filter(it => it.id !== ix) }));
    else if (k === 'team') api.update(id, p => ({ ...p, team: p.team.filter((_, i) => i !== ix) }));
    else if (k === 'trade') api.update(id, p => ({ ...p, trades: p.trades.filter((_, i) => i !== ix) }));
    else if (k === 'project') { setEdit(null); onDelete(id); return; }
    setEdit(null);
  };
  const editInitial = () => {
    const k = edit.kind, ix = edit.index;
    if (k === 'project') return { name: project.name, sector: project.sector, location: project.location, client: project.client, area: String(project.area), status: project.status };
    if (k === 'zone') return ix == null ? { name: '', area: '', coverage: '0', note: '' } : { ...project.zones[ix], area: String(project.zones[ix].area), coverage: String(project.zones[ix].coverage) };
    if (k === 'issue') { const it = ix != null ? project.issues.find(i => i.id === ix) : null; return it ? { title: it.title, sev: it.sev, zone: it.zone, status: it.status } : { title: '', sev: 'Major', zone: project.zones[0] ? project.zones[0].name : '', status: 'Open' }; }
    if (k === 'team') return ix == null ? { name: '', role: '' } : { name: project.team[ix].split(' — ')[0], role: project.team[ix].split(' — ')[1] || '' };
    if (k === 'trade') return ix == null ? { name: '', status: 'Not started' } : { name: project.trades[ix][0], status: project.trades[ix][1] };
    if (k === 'bim') return { file: project.bim.file, software: project.bim.software, lod: String(project.bim.lod), disciplines: project.bim.disciplines.join(', ') };
    return {};
  };

  return (
    <div className="screen">
      <div className="appbar">
        <button className="appbar-back" onClick={() => nav.back()}><Ic.chevL style={{ width: 18, height: 18 }} />Projects</button>
        <div className="appbar-row">
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: 20, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.short}</h1>
            <p className="sub" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Ic.pin style={{ width: 12, height: 12 }} />{project.location}</p>
          </div>
          <div className="row gap8">
            <button onClick={() => setEdit({ kind: 'project' })} style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--canvas)', border: '1px solid var(--hairline)', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><PencilIcon style={{ width: 18, height: 18 }} /></button>
            <button onClick={() => onShare(project)} style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--canvas)', border: '1px solid var(--hairline)', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Ic.share style={{ width: 18, height: 18 }} /></button>
          </div>
        </div>
      </div>

      <div className="body pad" style={{ paddingBottom: 96 }}>
        {/* overview */}
        <div className="card card-pad">
          <div className="row between" style={{ marginBottom: 14 }}><StageChip stage={isCurrent ? project.stage : window.OPTISYNC.bandStage(scan.coverage)} label={isCurrent ? null : window.OPTISYNC.stageFor(scan.coverage)} /><StatusPill status={isCurrent ? project.status : (scan.coverage >= 100 ? 'Complete' : 'On track')} /></div>
          <div className="row gap12" style={{ alignItems: 'center' }}>
            <div className={"fade" + (dim ? ' fade-out' : '')}><Donut value={scan.coverage} size={118} stroke={12} sub={`${scan.coverage}% verified · ${100 - scan.coverage}% left`} label="coverage" /></div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Fact label="Client" value={project.client.replace(' (private)', '')} />
              <Fact label="Area" value={<span className="mono">{project.area} m²</span>} />
              <Fact label="Sector" value={project.sector} />
              <Fact label="Handover" value={<span className="mono">{fdateShort(project.target)} {project.target.slice(0, 4)}</span>} />
            </div>
          </div>
          {project.reviewNote && <div style={{ marginTop: 14, padding: '10px 12px', background: 'var(--amber-10)', borderRadius: 10, fontSize: 12.5, color: 'var(--amber)', display: 'flex', gap: 8, lineHeight: 1.4 }}><Ic.alert style={{ width: 16, height: 16, flex: 'none', marginTop: 1 }} /><span style={{ fontWeight: 600 }}>{project.reviewNote}</span></div>}
        </div>

        {/* scan history scrubber + log */}
        <div className="card card-pad" style={{ marginTop: 12 }}>
          <div className="row between">
            <div className="section-label" style={{ margin: 0 }}>Scan history</div>
            <div className="row gap10">
              <button onClick={() => setShowLog(!showLog)} className="mono" style={{ fontSize: 11, color: 'var(--navy)', fontWeight: 700 }}>{showLog ? 'Hide log' : 'View log'}</button>
              <div className="mono" style={{ fontSize: 11, color: 'var(--teal)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}><Ic.bolt style={{ width: 12, height: 12 }} />Tap to replay</div>
            </div>
          </div>
          <Timeline scans={project.scans} sel={sel} onSelect={select} />
          <button onClick={() => setScanIx(sel)} className="row between" style={{ width: '100%', textAlign: 'left', marginTop: 4, paddingTop: 10, borderTop: '1px solid var(--hairline)' }}>
            <div><div className="mono" style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)' }}>{fdate(scan.date)}</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>{scan.note}</div></div>
            <div className="row gap6">{isCurrent && <span className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--teal)', background: 'var(--teal-10)', padding: '3px 8px', borderRadius: 999 }}>LATEST</span>}<Ic.chevR style={{ width: 16, height: 16, color: 'var(--muted)' }} /></div>
          </button>
          {showLog && <div style={{ marginTop: 10, borderTop: '1px solid var(--hairline)', paddingTop: 6 }}>
            {project.scans.slice().reverse().map((s, ri) => { const i = project.scans.length - 1 - ri; const prev = i > 0 ? project.scans[i - 1] : null; const d = prev ? s.coverage - prev.coverage : s.coverage; return (
              <button key={i} onClick={() => setScanIx(i)} className="row between" style={{ width: '100%', textAlign: 'left', padding: '9px 0', borderBottom: ri < project.scans.length - 1 ? '1px solid var(--hairline)' : 'none' }}>
                <div className="row gap10"><span className="mono" style={{ fontSize: 12.5, fontWeight: 700, width: 42, color: s.coverage >= 100 ? 'var(--teal)' : 'var(--ink)' }}>{s.coverage}%</span><div><div className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{fdate(s.date)}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.note}</div></div></div>
                <span className="mono" style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--teal)' }}>{d > 0 ? '+' + d : d}%</span>
              </button>
            ); })}
          </div>}
        </div>

        {/* zones — CRUD */}
        <div className="card card-pad" style={{ marginTop: 12 }}>
          <SectionHead label="Zone coverage" count={project.zones.length} onAdd={isCurrent ? () => setEdit({ kind: 'zone', index: null }) : null} />
          <div className={"fade" + (dim ? ' fade-out' : '')} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            {st.zones.map((z, i) => (
              <button key={i} onClick={isCurrent ? () => setEdit({ kind: 'zone', index: i }) : undefined} style={{ width: '100%', textAlign: 'left', cursor: isCurrent ? 'pointer' : 'default' }}>
                <div className="row between" style={{ marginBottom: 5 }}>
                  <span className="row gap6" style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap' }}>{z.name}{isCurrent && <PencilIcon style={{ width: 12, height: 12, color: 'var(--muted)' }} />}</span>
                  <span className="mono" style={{ fontSize: 12.5, fontWeight: 700, color: z.coverage >= 100 ? 'var(--teal)' : 'var(--ink)' }}>{z.coverage}%</span>
                </div>
                <div className="zbar-track"><div className={"zbar-fill" + (z.coverage >= 100 ? ' complete' : '')} style={{ width: z.coverage + '%' }} /></div>
              </button>
            ))}
          </div>
        </div>

        {/* issues — CRUD */}
        <div className="card card-pad" style={{ marginTop: 12 }}>
          <SectionHead label="Open issues" count={st.open.length} onAdd={() => setEdit({ kind: 'issue', index: null })} />
          <div className={"fade" + (dim ? ' fade-out' : '')}>
            {st.open.length ? st.open.map(it => <IssueRow key={it.id} issue={it} onTap={() => nav.go('issuedetail', { id, issueId: it.id })} />)
              : <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0', color: 'var(--teal)', fontSize: 13.5, fontWeight: 600 }}><Ic.check style={{ width: 18, height: 18 }} />{scan.coverage >= 100 ? 'Snag list cleared — 0 open at handover' : 'No open issues at this scan'}</div>}
            {st.closedCount > 0 && <div style={{ marginTop: 8 }}>
              <button onClick={() => setShowClosed(s => !s)} className="row gap6" style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}><Ic.chevR style={{ width: 14, height: 14, transform: showClosed ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }} /><span className="mono">{st.closedCount}</span> closed {st.closedCount > 1 ? 'issues' : 'issue'}</button>
              {showClosed && <div style={{ marginTop: 4 }}>{closedList.map(it => <IssueRow key={it.id} issue={Object.assign({}, it, { status: 'Closed' })} onTap={() => nav.go('issuedetail', { id, issueId: it.id })} />)}</div>}
            </div>}
          </div>
        </div>

        {/* captures — CRUD */}
        <div className="card card-pad" style={{ marginTop: 12 }}>
          <SectionHead label="Site captures" count={isCurrent ? captures.length : null} onAdd={isCurrent ? () => fileRef.current && fileRef.current.click() : null} right={!isCurrent ? <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{window.OPTISYNC.stageFor(scan.coverage)}</span> : null} />
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onPhoto} />
          <div className={"fade" + (dim ? ' fade-out' : '')}>
            {captures.length ? (
              <div className="gallery">
                {captures.map((s, i) => (
                  <div key={s.p} className="shot" onClick={() => setLb({ shots: captures, i })}>
                    <img src={s.src} alt={s.cap} loading="lazy" />
                    <span className="cap">{s.cap}</span>
                    {isCurrent && <button onClick={(e) => { e.stopPropagation(); delCapture(s); }} style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 12, background: 'rgba(11,17,25,.6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}><Ic.x style={{ width: 14, height: 14 }} /></button>}
                  </div>
                ))}
              </div>
            ) : <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--muted)' }}><Ic.camera style={{ width: 26, height: 26, margin: '0 auto 8px', opacity: .5 }} /><div style={{ fontSize: 13, fontWeight: 600 }}>{isCurrent ? 'No captures yet' : 'Site captures pending sync'}</div>{isCurrent && <button onClick={() => fileRef.current && fileRef.current.click()} className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}><Ic.plus style={{ width: 15, height: 15 }} />Add photo</button>}</div>}
          </div>
        </div>

        {/* BIM */}
        <div className="card card-pad" style={{ marginTop: 12 }}>
          <SectionHead label="BIM model" onAdd={null} right={<button onClick={() => setEdit({ kind: 'bim' })} className="row gap4" style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 4 }}><PencilIcon style={{ width: 14, height: 14 }} />Edit</button>} />
          <div className="row gap10" style={{ marginBottom: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--navy-08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--navy)', flex: 'none' }}><Ic.bim style={{ width: 20, height: 20 }} /></div>
            <div style={{ minWidth: 0 }}><div className="mono" style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.bim.file}</div><div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{project.bim.software}</div></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Fact label="LOD" value={<span className="mono">{project.bim.lod}</span>} />
            <Fact label="Disciplines" value={project.bim.disciplines.join(', ') || '—'} />
            <Fact label="Last aligned" value={<span className="mono">{fdate(project.bim.aligned)}</span>} />
            <Fact label="Floor area" value={<span className="mono">{project.area} m²</span>} />
          </div>
          {project.planImage && <img src={project.planImage} alt="Floor-plan reference" style={{ marginTop: 12, width: '100%', borderRadius: 10, border: '1px solid var(--hairline)' }} />}
        </div>

        {/* team — CRUD */}
        <div className="card card-pad" style={{ marginTop: 12 }}>
          <SectionHead label="Team" count={project.team.length} onAdd={() => setEdit({ kind: 'team', index: null })} />
          {project.team.map((t, i) => {
            const [name, role] = t.split(' — ');
            return <button key={i} onClick={() => setEdit({ kind: 'team', index: i })} className="row between" style={{ width: '100%', textAlign: 'left', padding: '8px 0', borderBottom: i < project.team.length - 1 ? '1px solid var(--hairline)' : 'none' }}>
              <div className="row gap10"><div style={{ width: 32, height: 32, borderRadius: 16, background: 'var(--navy-08)', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flex: 'none' }}>{name.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase()}</div>
              <div><div style={{ fontSize: 13.5, fontWeight: 650 }}>{name}</div><div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{role}</div></div></div>
              <PencilIcon style={{ width: 14, height: 14, color: 'var(--muted)' }} />
            </button>;
          })}
        </div>

        {/* trades — CRUD */}
        <div className="card card-pad" style={{ marginTop: 12 }}>
          <SectionHead label="Trade progress" count={project.trades.length} onAdd={() => setEdit({ kind: 'trade', index: null })} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {project.trades.map((t, i) => <button key={i} onClick={() => setEdit({ kind: 'trade', index: i })} className="row between" style={{ width: '100%', textAlign: 'left', padding: '7px 0' }}>
              <span style={{ fontSize: 13, color: 'var(--ink)' }}>{t[0]}</span>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: TRADE_COLOR[t[1]], display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: 4, background: TRADE_COLOR[t[1]] }} />{t[1]}</span>
            </button>)}
            {!project.trades.length && <div style={{ fontSize: 12.5, color: 'var(--muted)', padding: '6px 0' }}>No trades tracked yet.</div>}
          </div>
        </div>

        <button onClick={() => setEdit({ kind: 'project' })} style={{ width: '100%', marginTop: 16, padding: '12px', color: 'var(--muted)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}><PencilIcon style={{ width: 16, height: 16 }} />Edit project details & status</button>
      </div>

      {/* action footer */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 16px calc(20px + 12px)', background: 'linear-gradient(transparent, var(--canvas) 24%)', display: 'flex', gap: 10, zIndex: 30 }}>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => nav.go('report', { id, coverage: scan.coverage })}><Ic.reports style={{ width: 18, height: 18 }} />Report</button>
        <button className="btn btn-primary" style={{ flex: 1.3 }} onClick={() => nav.go('scan', { id })}><Ic.scan style={{ width: 18, height: 18 }} />New scan</button>
      </div>

      {lb && <Lightbox shots={lb.shots} idx={lb.i} onClose={() => setLb(null)} onDelete={isCurrent ? delCapture : null} />}
      {scanIx != null && <ScanDetailSheet project={project} index={scanIx} onClose={() => setScanIx(null)} onReport={() => { const cov = project.scans[scanIx].coverage; setScanIx(null); nav.go('report', { id, coverage: cov }); }} />}
      {edit && <FormSheet {...editorConfig(edit.kind, project)} project={project} initial={editInitial()} onSave={saveEdit} onClose={() => setEdit(null)} onDelete={edit.index != null || edit.kind === 'project' ? deleteEdit : null} subtitle={edit.kind === 'project' ? 'Delete here removes the whole project' : null} />}
    </div>
  );
}

Object.assign(window, { ProjectDetail, Timeline, Lightbox });
