/* OptiSync — brand mark + portfolio screens (Splash, Projects, New project) */

/* ---------- OptiSync logo (the real product logo) ---------- */
function Mark({ size = 96, radius }) {
  const rx = radius != null ? radius : size * 0.225;
  return (
    <img src="assets/optisync-logo.jpeg" alt="OptiSync" width={size} height={size}
      style={{ display: 'block', width: size, height: size, borderRadius: rx, objectFit: 'cover', flex: 'none' }} />
  );
}

function Wordmark({ size = 30, color = 'var(--ink)' }) {
  return <span style={{ fontSize: size, fontWeight: 750, letterSpacing: '-.03em', color }}>
    Opti<span style={{ color: 'var(--teal)' }}>Sync</span></span>;
}

/* ---------- Splash ---------- */
function Splash({ nav }) {
  useEffect(() => { const t = setTimeout(() => nav.tab('projects', true), 2100); return () => clearTimeout(t); }, []);
  return (
    <div className="screen" style={{ background: 'var(--canvas)', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => nav.tab('projects', true)}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'splashIn .7s cubic-bezier(.2,.8,.2,1)' }}>
        <div style={{ boxShadow: '0 18px 44px rgba(30,58,102,.28)', borderRadius: 30, marginBottom: 26 }}><Mark size={128} radius={30} /></div>
        <Wordmark size={40} />
        <div style={{ marginTop: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
          {['Scan.', 'Compare.', 'Prove.'].map((w, i) =>
            <span key={w} className="mono" style={{ fontSize: 14.5, fontWeight: 600, color: i === 2 ? 'var(--teal)' : 'var(--navy)', letterSpacing: '.01em' }}>{w}</span>)}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 54, fontSize: 12, color: 'var(--muted)', letterSpacing: '.04em' }}>OPTISYNC LTD</div>
      <style>{`@keyframes splashIn{from{transform:translateY(12px) scale(.96)}}`}</style>
    </div>
  );
}

/* ---------- swipe-to-delete row ---------- */
function SwipeRow({ children, onDelete }) {
  const [x, setX] = useState(0);
  const start = useRef(null), curX = useRef(0);
  const down = e => { start.current = (e.touches ? e.touches[0].clientX : e.clientX); };
  const move = e => {
    if (start.current == null) return;
    const cx = (e.touches ? e.touches[0].clientX : e.clientX);
    let dx = cx - start.current + curX.current;
    dx = Math.max(-84, Math.min(0, dx));
    setX(dx);
  };
  const up = () => { if (start.current == null) return; const snap = x < -42 ? -84 : 0; setX(snap); curX.current = snap; start.current = null; };
  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--r)' }}>
      <button onClick={onDelete} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 84, background: 'var(--red)', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, fontSize: 11, fontWeight: 700 }}>
        <Ic.trash style={{ width: 20, height: 20 }} />Delete</button>
      <div style={{ transform: `translateX(${x}px)`, transition: start.current == null ? 'transform .22s cubic-bezier(.2,.8,.2,1)' : 'none', touchAction: 'pan-y' }}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        {children}
      </div>
    </div>
  );
}

/* ---------- project list row ---------- */
function ProjectRow({ p, onTap }) {
  return (
    <button className="card card-pad row gap12" onClick={onTap} style={{ width: '100%', textAlign: 'left' }}>
      <MiniDonut value={p.coverage} size={46} stroke={5} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row between gap8">
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: '1 1 auto', minWidth: 0 }}>{p.short}</span>
          <span style={{ flex: 'none' }}><StageChip stage={p.stage} /></span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', margin: '2px 0 7px', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Ic.pin style={{ width: 12, height: 12 }} />{p.location.split(',').slice(-2).join(',').trim()}
          <span style={{ opacity: .4 }}>·</span>{p.sector}
        </div>
        <StatusPill status={p.status} />
      </div>
      <Ic.chevR style={{ width: 17, height: 17, color: 'var(--muted)', flex: 'none' }} />
    </button>
  );
}

/* ---------- Projects home ---------- */
function ProjectsHome({ nav, projects, onDelete }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Needs review', 'Early', 'Mid', 'Complete'];
  const list = projects.filter(p => {
    const mq = !q || (p.name + ' ' + p.location + ' ' + p.client).toLowerCase().includes(q.toLowerCase());
    const mf = filter === 'All' || (filter === 'Needs review' ? p.status === 'Needs review' : p.stage === filter);
    return mq && mf;
  });
  return (
    <div className="screen">
      <div className="appbar">
        <div className="appbar-row">
          <div><h1>Projects</h1><p className="sub">{projects.length} active projects</p></div>
          <button className="btn btn-primary btn-sm" onClick={() => nav.go('newproject')}><Ic.plus style={{ width: 16, height: 16 }} />New</button>
        </div>
        <div className="row gap8" style={{ marginTop: 12, background: 'var(--canvas)', border: '1px solid var(--hairline)', borderRadius: 10, padding: '9px 11px' }}>
          <Ic.search style={{ width: 17, height: 17, color: 'var(--muted)' }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search projects, clients, locations" style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: 14, color: 'var(--ink)' }} />
        </div>
        <div className="row gap6" style={{ marginTop: 11, overflowX: 'auto', paddingBottom: 2 }}>
          {filters.map(f => {
            const on = filter === f;
            const attn = f === 'Needs review';
            const bg = on ? (attn ? 'var(--amber)' : 'var(--navy)') : (attn ? 'var(--amber-10)' : 'var(--canvas)');
            const col = on ? '#fff' : (attn ? 'var(--amber)' : 'var(--muted)');
            const bd = on ? (attn ? 'var(--amber)' : 'var(--navy)') : (attn ? 'rgba(181,120,26,.32)' : 'var(--hairline)');
            return <button key={f} onClick={() => setFilter(f)} style={{ flex: 'none', fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 999, whiteSpace: 'nowrap', background: bg, color: col, border: '1px solid ' + bd }}>{f === 'Early' ? 'Early stage' : f === 'Mid' ? 'Mid-build' : f}</button>;
          })}
        </div>
      </div>
      <div className="body pad pad-b">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.map(p =>
            <SwipeRow key={p.id} onDelete={() => onDelete(p.id)}>
              <ProjectRow p={p} onTap={() => nav.go('detail', { id: p.id })} />
            </SwipeRow>)}
          {!list.length && <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, padding: '40px 0' }}>No projects match.</div>}
        </div>
        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', marginTop: 18, letterSpacing: '.03em' }}>Swipe a project left to delete</div>
      </div>
    </div>
  );
}

/* ---------- New project ---------- */
function NewProject({ nav, onCreate }) {
  const [f, setF] = useState({ name: '', type: 'Residential', location: '', client: '', area: '' });
  const [bim, setBim] = useState(null);
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const valid = f.name && f.location && f.client;
  return (
    <div className="screen">
      <div className="appbar">
        <button className="appbar-back" onClick={() => nav.back()}><Ic.chevL style={{ width: 18, height: 18 }} />Projects</button>
        <h1>New project</h1>
        <p className="sub">Set up a site, then connect its BIM model</p>
      </div>
      <div className="body pad pad-b">
        <div className="card card-pad">
          <div className="field"><label>Project name</label><input value={f.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Bruntsfield Flat Refurb" /></div>
          <div className="field"><label>Sector</label>
            <div className="row gap8">
              {['Residential', 'Commercial'].map(t =>
                <button key={t} onClick={() => set('type', t)} style={{ flex: 1, padding: '11px', borderRadius: 10, fontSize: 14, fontWeight: 600, border: '1px solid ' + (f.type === t ? 'var(--navy)' : 'var(--hairline)'), background: f.type === t ? 'var(--navy-08)' : 'var(--surface)', color: f.type === t ? 'var(--navy)' : 'var(--muted)' }}>{t}</button>)}
            </div>
          </div>
          <div className="field"><label>Location</label><input value={f.location} onChange={e => set('location', e.target.value)} placeholder="Area, City, Postcode" /></div>
          <div className="field"><label>Client</label><input value={f.client} onChange={e => set('client', e.target.value)} placeholder="Client / owner name" /></div>
          <div className="field" style={{ marginBottom: 0 }}><label>Floor area (m²)</label><input value={f.area} onChange={e => set('area', e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" placeholder="e.g. 74" /></div>
        </div>

        <div className="section-label" style={{ margin: '20px 0 10px' }}>BIM model</div>
        <button className="card card-pad row gap12" onClick={() => setBim('Project_R1.ifc')} style={{ width: '100%', textAlign: 'left', borderStyle: bim ? 'solid' : 'dashed', borderColor: bim ? 'var(--teal)' : 'var(--hairline)' }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: bim ? 'var(--teal-10)' : 'var(--navy-08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: bim ? 'var(--teal)' : 'var(--navy)', flex: 'none' }}>{bim ? <Ic.check style={{ width: 22, height: 22 }} /> : <Ic.bim style={{ width: 22, height: 22 }} />}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{bim ? bim : 'Connect or upload BIM'}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{bim ? 'IFC · ready to align' : 'Revit / IFC · or request BIM setup'}</div>
          </div>
          {!bim && <Ic.plus style={{ width: 18, height: 18, color: 'var(--navy)' }} />}
        </button>

        <button className={"btn btn-primary btn-block"} disabled={!valid} style={{ marginTop: 22, opacity: valid ? 1 : .45 }}
          onClick={() => valid && onCreate(f, bim)}>Create project</button>
      </div>
    </div>
  );
}

Object.assign(window, { Mark, Wordmark, Splash, ProjectsHome, NewProject, SwipeRow, ProjectRow });
