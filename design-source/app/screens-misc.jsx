/* OptiSync — Issues, Plans, Profile, Team, Settings, Share sheet (production + CRUD) */

function allIssues(projects) {
  const out = [];
  projects.forEach(p => p.issues.forEach(it => out.push(Object.assign({}, it, { project: p }))));
  return out;
}
function Fact({ label, value }) {
  return <div><div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginBottom: 2 }}>{label}</div><div style={{ fontSize: 13.5, fontWeight: 650, color: 'var(--ink)' }}>{value}</div></div>;
}

/* ---------- Issues / snags (+ add) ---------- */
function IssuesScreen({ nav, projects, api }) {
  const [filter, setFilter] = useState('Open');
  const [add, setAdd] = useState(false);
  const issues = allIssues(projects);
  const openCount = issues.filter(i => i.status === 'Open').length;
  const closedCount = issues.filter(i => i.status === 'Closed').length;
  const critOpen = issues.filter(i => i.status === 'Open' && i.sev === 'Critical').length;
  const filters = ['Open', 'Critical', 'Major', 'Minor', 'Closed'];
  const list = issues.filter(i => {
    if (filter === 'Open') return i.status === 'Open';
    if (filter === 'Closed') return i.status === 'Closed';
    return i.status === 'Open' && i.sev === filter;
  }).sort((a, b) => ({ Critical: 0, Major: 1, Minor: 2 }[a.sev] - { Critical: 0, Major: 1, Minor: 2 }[b.sev]));

  const addIssue = (vals) => {
    const proj = projects.find(p => p.short === vals.project) || projects[0];
    api.update(proj.id, p => {
      const pref = (p.issues.find(i2 => /^[A-Za-z]{2}-/.test(i2.id)) || {}).id;
      const prefix = pref ? pref.split('-')[0] : p.short.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase();
      const nums = p.issues.map(i2 => parseInt((i2.id.split('-')[1] || '0'), 10)).filter(x => !isNaN(x));
      const nid = prefix + '-' + (Math.max(0, ...nums) + 1).toString().padStart(2, '0');
      return { ...p, issues: [...p.issues, { id: nid, title: vals.title, sev: vals.sev, zone: vals.zone || 'General', status: 'Open', raised: '2026-06-12', appearAt: Math.max(0, p.coverage - 5), clearAt: null }] };
    });
    setAdd(false);
  };

  return (
    <div className="screen">
      <div className="appbar">
        <div className="appbar-row">
          <div><button className="appbar-back" onClick={() => nav.back()}><Ic.chevL style={{ width: 18, height: 18 }} />Back</button><h1>Issues</h1><p className="sub">Snags & deviations across the portfolio</p></div>
          <button className="btn btn-primary btn-sm" onClick={() => setAdd(true)}><Ic.plus style={{ width: 16, height: 16 }} />New</button>
        </div>
        <div className="row gap8" style={{ marginTop: 12 }}>
          <div className="card" style={{ flex: 1, padding: '10px 12px' }}><div className="mono" style={{ fontSize: 22, fontWeight: 700 }}>{openCount}</div><div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>Open</div></div>
          <div className="card" style={{ flex: 1, padding: '10px 12px' }}><div className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--red)' }}>{critOpen}</div><div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>Critical</div></div>
          <div className="card" style={{ flex: 1, padding: '10px 12px' }}><div className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--teal)' }}>{closedCount}</div><div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>Closed</div></div>
        </div>
        <div className="row gap6" style={{ marginTop: 11, overflowX: 'auto', paddingBottom: 2 }}>
          {filters.map(f => <button key={f} onClick={() => setFilter(f)} className="mono" style={{ flex: 'none', fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 999, whiteSpace: 'nowrap', background: filter === f ? 'var(--navy)' : 'var(--canvas)', color: filter === f ? '#fff' : 'var(--muted)', border: '1px solid ' + (filter === f ? 'var(--navy)' : 'var(--hairline)') }}>{f}</button>)}
        </div>
      </div>
      <div className="body pad pad-b">
        <div className="card" style={{ padding: '0 16px' }}>
          {list.map((it, i) => (
            <button key={it.project.id + it.id} onClick={() => nav.go('issuedetail', { id: it.project.id, issueId: it.id })} style={{ width: '100%', textAlign: 'left', display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 0', borderBottom: i < list.length - 1 ? '1px solid var(--hairline)' : 'none' }}>
              <span className={"sev " + it.sev} style={{ marginTop: 5 }} />
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600, lineHeight: 1.3, color: it.status === 'Closed' ? 'var(--muted)' : 'var(--ink)', textDecoration: it.status === 'Closed' ? 'line-through' : 'none' }}>{it.title}</span>
                <span style={{ fontSize: 11.5, color: 'var(--muted)' }}><span className="mono">{it.id}</span> · {it.project.short} · {it.zone}</span>
                {it.deviation && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 6, fontSize: 10.5, fontWeight: 700, color: 'var(--amber)' }}><Ic.alert style={{ width: 11, height: 11 }} />Deviation</span>}
              </span>
              <Ic.chevR style={{ width: 16, height: 16, color: 'var(--muted)', flex: 'none', marginTop: 3 }} />
            </button>
          ))}
          {!list.length && <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, padding: '30px 0' }}>Nothing here.</div>}
        </div>
      </div>
      {add && <FormSheet title="New issue" subtitle="Log a snag or BIM deviation" project={projects[0]}
        fields={[{ key: 'project', label: 'Project', type: 'select', options: projects.map(p => p.short), required: true }, { key: 'title', label: 'Description', type: 'textarea', required: true, placeholder: 'What is the snag or deviation?' }, { key: 'sev', label: 'Severity', type: 'sev', required: true }, { key: 'zone', label: 'Zone', placeholder: 'e.g. Kitchen' }]}
        initial={{ project: projects[0].short, title: '', sev: 'Major', zone: '' }} onSave={addIssue} onClose={() => setAdd(false)} saveLabel="Log issue" />}
    </div>
  );
}

/* ---------- Issue detail (full CRUD) ---------- */
function IssueDetail({ nav, project, issueId, api }) {
  const issue = project.issues.find(i => i.id === issueId);
  const [edit, setEdit] = useState(false);
  const [pick, setPick] = useState(false);
  if (!issue) return <div className="screen"><div className="appbar"><button className="appbar-back" onClick={() => nav.back()}><Ic.chevL style={{ width: 18, height: 18 }} />Back</button><h1>Issue</h1></div><div className="body pad"><div style={{ color: 'var(--muted)', textAlign: 'center', padding: 40 }}>This issue was removed.</div></div></div>;
  const sevColor = { Critical: 'var(--red)', Major: 'var(--amber)', Minor: '#9aa7b6' }[issue.sev];
  const setStatus = (s) => api.update(project.id, p => ({ ...p, issues: p.issues.map(it => it.id === issueId ? { ...it, status: s, closed: s === 'Closed' ? (it.closed || '2026-06-12') : undefined } : it) }));
  const setZone = (z) => api.update(project.id, p => ({ ...p, issues: p.issues.map(it => it.id === issueId ? { ...it, zone: z } : it) }));
  const saveEdit = (v) => { api.update(project.id, p => ({ ...p, issues: p.issues.map(it => it.id === issueId ? { ...it, title: v.title, sev: v.sev, zone: v.zone, status: v.status, closed: v.status === 'Closed' ? (it.closed || '2026-06-12') : undefined } : it) })); setEdit(false); };
  const delIssue = () => { api.update(project.id, p => ({ ...p, issues: p.issues.filter(it => it.id !== issueId) })); setEdit(false); nav.back(); };

  return (
    <div className="screen">
      <div className="appbar">
        <div className="appbar-row">
          <div><button className="appbar-back" onClick={() => nav.back()}><Ic.chevL style={{ width: 18, height: 18 }} />Back</button><h1 style={{ fontSize: 20 }}>Issue <span className="mono" style={{ color: 'var(--muted)' }}>{issue.id}</span></h1></div>
          <button onClick={() => setEdit(true)} style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--canvas)', border: '1px solid var(--hairline)', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><PencilIcon style={{ width: 18, height: 18 }} /></button>
        </div>
      </div>
      <div className="body pad pad-b">
        <div className="card card-pad">
          <div className="row gap8" style={{ marginBottom: 10 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: sevColor, background: issue.sev === 'Critical' ? 'var(--red-10)' : (issue.sev === 'Major' ? 'var(--amber-10)' : 'var(--navy-08)'), padding: '4px 10px', borderRadius: 999 }}><span className="sev" style={{ background: sevColor }} />{issue.sev}</span>
            <span className="status" style={{ color: issue.status === 'Open' ? 'var(--blue)' : 'var(--teal)' }}><span className="dot" style={{ background: issue.status === 'Open' ? 'var(--blue)' : 'var(--teal)' }} />{issue.status}</span>
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.3, marginBottom: 4 }}>{issue.title}</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{project.short} · raised <span className="mono">{fdate(issue.raised)}</span>{issue.closed ? ' · closed ' + fdate(issue.closed) : ''}</div>
          {issue.deviation && <div style={{ marginTop: 12, padding: '11px 12px', background: 'var(--amber-10)', borderRadius: 10, fontSize: 12.5, color: 'var(--amber)', fontWeight: 600, display: 'flex', gap: 8, lineHeight: 1.4 }}><Ic.alert style={{ width: 16, height: 16, flex: 'none', marginTop: 1 }} />Detected as a deviation from the BIM model — flagged for review before it is built around.</div>}
        </div>

        <div className="section-label" style={{ margin: '18px 0 10px' }}>Tagged zone</div>
        <button className="card card-pad row between" onClick={() => setPick(!pick)} style={{ width: '100%', textAlign: 'left' }}>
          <div className="row gap10"><div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--navy-08)', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Ic.cube style={{ width: 18, height: 18 }} /></div><div><div style={{ fontSize: 14, fontWeight: 650 }}>{issue.zone}</div><div style={{ fontSize: 11.5, color: 'var(--muted)' }}>Tap to re-tag to another zone</div></div></div>
          <Ic.chevR style={{ width: 16, height: 16, color: 'var(--muted)', transform: pick ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }} />
        </button>
        {pick && <div className="card" style={{ marginTop: 8, padding: '4px 14px' }}>
          {project.zones.map((z, i) => <button key={z.name} onClick={() => { setZone(z.name); setPick(false); }} className="row between" style={{ width: '100%', textAlign: 'left', padding: '11px 0', borderBottom: i < project.zones.length - 1 ? '1px solid var(--hairline)' : 'none', fontSize: 13.5, fontWeight: issue.zone === z.name ? 700 : 500, color: issue.zone === z.name ? 'var(--navy)' : 'var(--ink)' }}>{z.name}{issue.zone === z.name && <Ic.check style={{ width: 16, height: 16, color: 'var(--navy)' }} />}</button>)}
        </div>}

        <div className="row gap10" style={{ marginTop: 22 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => nav.go('detail', { id: project.id })}>View project</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStatus(issue.status === 'Open' ? 'Closed' : 'Open')}>{issue.status === 'Open' ? 'Mark closed' : 'Re-open'}</button>
        </div>
      </div>
      {edit && <FormSheet title="Edit issue" project={project}
        fields={[{ key: 'title', label: 'Description', type: 'textarea', required: true }, { key: 'sev', label: 'Severity', type: 'sev', required: true }, { key: 'zone', label: 'Zone', type: 'zone', required: true }, { key: 'status', label: 'Status', type: 'segment', options: ['Open', 'Closed'] }]}
        initial={{ title: issue.title, sev: issue.sev, zone: issue.zone, status: issue.status }} onSave={saveEdit} onClose={() => setEdit(false)} onDelete={delIssue} />}
    </div>
  );
}

/* ---------- Plans / subscription ---------- */
function Plans({ nav }) {
  const plan = window.OPTISYNC.plan;
  const pct = Math.round(plan.usage / plan.limit * 100);
  return (
    <div className="screen">
      <div className="appbar"><button className="appbar-back" onClick={() => nav.back()}><Ic.chevL style={{ width: 18, height: 18 }} />Account</button><h1>Plan & billing</h1><p className="sub">Subscription, usage & add-ons</p></div>
      <div className="body pad pad-b">
        <div className="card card-pad" style={{ background: 'var(--navy)', border: 'none', color: '#fff' }}>
          <div className="row between"><div><div style={{ fontSize: 12, opacity: .7, fontWeight: 600 }}>Current plan</div><div style={{ fontSize: 22, fontWeight: 750 }}>{plan.current}</div></div><div className="mono" style={{ fontSize: 26, fontWeight: 700 }}>£{plan.price}<span style={{ fontSize: 13, opacity: .7 }}>/mo</span></div></div>
          <div style={{ marginTop: 16 }}>
            <div className="row between" style={{ marginBottom: 6 }}><span style={{ fontSize: 12.5, opacity: .85 }}>Projects used</span><span className="mono" style={{ fontSize: 12.5, fontWeight: 700 }}>{plan.usage} / {plan.limit}</span></div>
            <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,.18)', overflow: 'hidden' }}><div style={{ width: pct + '%', height: '100%', background: '#2fb6ad', borderRadius: 4 }} /></div>
          </div>
          <div className="row between" style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,.14)', fontSize: 12.5 }}><span style={{ opacity: .8 }}>Next invoice</span><span className="mono" style={{ fontWeight: 700 }}>1 Jul 2026 · £49.00</span></div>
        </div>

        <div className="section-label" style={{ margin: '20px 0 10px' }}>All tiers</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {plan.tiers.map(t => {
            const cur = t.name === plan.current;
            return (
              <div key={t.name} className="card card-pad row between" style={{ borderColor: cur ? 'var(--navy)' : 'var(--hairline)', boxShadow: cur ? '0 0 0 3px var(--navy-08)' : 'var(--sh-card)' }}>
                <div style={{ flex: 1 }}>
                  <div className="row gap8"><span style={{ fontSize: 14.5, fontWeight: 700 }}>{t.name}</span>{cur && <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: 'var(--navy)', background: 'var(--navy-08)', padding: '2px 7px', borderRadius: 999 }}>CURRENT</span>}{t.name === 'Business' && !cur && <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: 'var(--teal)', background: 'var(--teal-10)', padding: '2px 7px', borderRadius: 999 }}>POPULAR</span>}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{t.projects} · {t.blurb}</div>
                </div>
                <div className="mono" style={{ fontSize: 16, fontWeight: 700, marginLeft: 10 }}>£{t.price}</div>
              </div>
            );
          })}
        </div>
        <button className="btn btn-primary btn-block" style={{ marginTop: 14 }}><Ic.arrowUp style={{ width: 17, height: 17 }} />Upgrade to Team</button>

        <div className="section-label" style={{ margin: '22px 0 10px' }}>Add-ons</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {plan.addons.map(a => <div key={a.name} className="card card-pad row between"><div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 650 }}>{a.name}</div><div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>{a.blurb}</div></div><div className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', marginLeft: 10, whiteSpace: 'nowrap' }}>{a.price}</div></div>)}
        </div>
      </div>
    </div>
  );
}

/* ---------- Profile (industrial) ---------- */
function Profile({ nav, projects, user, setUser }) {
  const [edit, setEdit] = useState(false);
  const issues = allIssues(projects);
  const open = issues.filter(i => i.status === 'Open').length;
  const scans = projects.reduce((n, p) => n + p.scans.length, 0);
  const avg = Math.round(projects.reduce((n, p) => n + p.coverage, 0) / (projects.length || 1));
  const res = projects.filter(p => p.sector === 'Residential').length;
  const com = projects.length - res;
  const stat = [['Projects', projects.length], ['Residential', res], ['Commercial', com], ['Scans', scans], ['Open issues', open], ['Avg coverage', avg + '%']];
  const integrations = [
    ['Autodesk Revit / IFC', 'Connected', 'var(--teal)', <Ic.bim style={{ width: 18, height: 18 }} />],
    ['iPhone LiDAR capture', 'Active', 'var(--teal)', <Ic.scan style={{ width: 18, height: 18 }} />],
    ['Cloud storage', '4.2 GB of 50 GB', 'var(--muted)', <Ic.layers style={{ width: 18, height: 18 }} />]
  ];
  return (
    <div className="screen">
      <div className="appbar"><div className="appbar-row"><h1>Account</h1><button onClick={() => setEdit(true)} style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--canvas)', border: '1px solid var(--hairline)', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PencilIcon style={{ width: 18, height: 18 }} /></button></div></div>
      <div className="body pad pad-b">
        <div className="card card-pad row gap12">
          <div style={{ width: 56, height: 56, borderRadius: 28, background: 'var(--navy)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, flex: 'none' }}>{user.name.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase()}</div>
          <div style={{ minWidth: 0 }}><div style={{ fontSize: 17, fontWeight: 700 }}>{user.name}</div><div style={{ fontSize: 13, color: 'var(--muted)' }}>{user.role}</div><div className="mono" style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div></div>
        </div>

        <div className="card" style={{ marginTop: 12, padding: '4px 16px' }}>
          <Line k="Phone" v={user.phone} />
          <Line k="Member since" v={user.since} />
          <Line k="Access" v="Owner" last />
        </div>

        <div className="section-label" style={{ margin: '20px 0 10px' }}>Company</div>
        <div className="card card-pad">
          <div className="row gap10" style={{ marginBottom: 12 }}><div style={{ width: 40, height: 40, borderRadius: 9, background: 'linear-gradient(160deg,#3a4250,#222932)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, letterSpacing: '.02em', flex: 'none' }}>{window.OPTISYNC.company.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}</div><div><div style={{ fontSize: 15, fontWeight: 700 }}>{window.OPTISYNC.company}</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>Refurbishment & fit-out contractor</div></div></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Fact label="Company no." value={<span className="mono">SC712334</span>} />
            <Fact label="VAT" value={<span className="mono">GB 412 5567 02</span>} />
            <Fact label="Registered" value="Edinburgh, EH3" />
            <Fact label="Established" value={<span className="mono">2024</span>} />
          </div>
        </div>

        <div className="section-label" style={{ margin: '20px 0 10px' }}>Portfolio</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {stat.map(([k, v]) => <div key={k} className="card card-pad" style={{ padding: '14px 12px' }}><div className="mono" style={{ fontSize: 23, fontWeight: 700, color: 'var(--navy)' }}>{v}</div><div style={{ fontSize: 10.5, color: 'var(--muted)', fontWeight: 600, marginTop: 2 }}>{k}</div></div>)}
        </div>

        <div className="section-label" style={{ margin: '20px 0 10px' }}>Integrations</div>
        <div className="card">
          {integrations.map(([name, status, color, icon], i) => <div key={name} className="row between" style={{ padding: '13px 16px', borderBottom: i < integrations.length - 1 ? '1px solid var(--hairline)' : 'none' }}>
            <span className="row gap10" style={{ color: 'var(--navy)' }}>{icon}<span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{name}</span></span>
            <span className="row gap6" style={{ fontSize: 11.5, fontWeight: 700, color }}><span style={{ width: 7, height: 7, borderRadius: 4, background: color }} />{status}</span>
          </div>)}
        </div>

        <div className="section-label" style={{ margin: '20px 0 10px' }}>Account</div>
        <div className="card">
          {[['Team & access', 'team', <Ic.team style={{ width: 18, height: 18 }} />, ''], ['Plan & billing', 'plans', <Ic.layers style={{ width: 18, height: 18 }} />, 'Business · £49/mo'], ['Settings', 'settings', <Ic.settings style={{ width: 18, height: 18 }} />, '']].map(([label, route, icon, meta], i, arr) =>
            <button key={label} onClick={() => nav.go(route)} className="row between" style={{ width: '100%', padding: '14px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--hairline)' : 'none' }}>
              <span className="row gap10" style={{ color: 'var(--navy)' }}>{icon}<span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{label}</span></span>
              <span className="row gap8"><span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{meta}</span><Ic.chevR style={{ width: 16, height: 16, color: 'var(--muted)' }} /></span>
            </button>)}
        </div>
        <button className="btn btn-ghost btn-block" style={{ marginTop: 16, color: 'var(--red)' }}>Sign out</button>
      </div>
      {edit && <FormSheet title="Edit profile" project={projects[0]}
        fields={[{ key: 'name', label: 'Name', required: true }, { key: 'role', label: 'Role', required: true }, { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' }]}
        initial={{ name: user.name, role: user.role, email: user.email, phone: user.phone }} onSave={(v) => { setUser(u => ({ ...u, ...v })); setEdit(false); }} onClose={() => setEdit(false)} />}
    </div>
  );
}

/* ---------- Team & access (CRUD) ---------- */
function TeamScreen({ nav, team, setTeam }) {
  const [edit, setEdit] = useState(null); // {index|null}
  const accessColor = { Owner: 'var(--navy)', Admin: 'var(--blue)', Editor: 'var(--teal)', Viewer: 'var(--muted)' };
  const save = (v) => { setTeam(t => edit.index == null ? [...t, v] : t.map((m, i) => i === edit.index ? v : m)); setEdit(null); };
  const del = () => { setTeam(t => t.filter((_, i) => i !== edit.index)); setEdit(null); };
  return (
    <div className="screen">
      <div className="appbar"><div className="appbar-row"><div><button className="appbar-back" onClick={() => nav.back()}><Ic.chevL style={{ width: 18, height: 18 }} />Account</button><h1>Team & access</h1><p className="sub">{team.length} people · {window.OPTISYNC.company}</p></div><button className="btn btn-primary btn-sm" onClick={() => setEdit({ index: null })}><Ic.plus style={{ width: 16, height: 16 }} />Invite</button></div></div>
      <div className="body pad pad-b">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {team.map((m, i) => <button key={i} onClick={() => setEdit({ index: i })} className="card card-pad row between" style={{ width: '100%', textAlign: 'left' }}>
            <div className="row gap12"><div style={{ width: 44, height: 44, borderRadius: 22, background: 'var(--navy-08)', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flex: 'none' }}>{m.name.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase()}</div>
            <div><div style={{ fontSize: 14.5, fontWeight: 700 }}>{m.name}</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>{m.role}</div><div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{m.email}</div></div></div>
            <span className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: accessColor[m.access] || 'var(--muted)', background: 'var(--canvas)', padding: '3px 8px', borderRadius: 999, flex: 'none' }}>{m.access}</span>
          </button>)}
        </div>
      </div>
      {edit && <FormSheet title={edit.index == null ? 'Invite member' : 'Team member'} project={{ zones: [] }}
        fields={[{ key: 'name', label: 'Name', required: true }, { key: 'role', label: 'Role / company', required: true }, { key: 'email', label: 'Email' }, { key: 'access', label: 'Access level', type: 'segment', options: ['Admin', 'Editor', 'Viewer'] }]}
        initial={edit.index == null ? { name: '', role: '', email: '', access: 'Editor' } : team[edit.index]} onSave={save} onClose={() => setEdit(null)} onDelete={edit.index != null && team[edit.index].access !== 'Owner' ? del : null} saveLabel={edit.index == null ? 'Send invite' : 'Save'} />}
    </div>
  );
}

/* ---------- Settings (production) ---------- */
function Settings({ nav }) {
  const [units, setUnits] = useState('Metric');
  const [n1, setN1] = useState(true), [n2, setN2] = useState(true), [n3, setN3] = useState(false), [align, setAlign] = useState(true);
  const [quality, setQuality] = useState('High');
  return (
    <div className="screen">
      <div className="appbar"><button className="appbar-back" onClick={() => nav.back()}><Ic.chevL style={{ width: 18, height: 18 }} />Account</button><h1>Settings</h1></div>
      <div className="body pad pad-b">
        <div className="section-label">Preferences</div>
        <div className="card">
          <div className="row between" style={{ padding: '13px 16px', borderBottom: '1px solid var(--hairline)' }}>
            <span style={{ fontSize: 14.5, fontWeight: 600 }}>Units</span>
            <div className="row" style={{ background: 'var(--canvas)', borderRadius: 9, padding: 3 }}>
              {['Metric', 'Imperial'].map(u => <button key={u} onClick={() => setUnits(u)} className="mono" style={{ fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 7, background: units === u ? 'var(--surface)' : 'transparent', color: units === u ? 'var(--navy)' : 'var(--muted)', boxShadow: units === u ? 'var(--sh-card)' : 'none' }}>{u}</button>)}
            </div>
          </div>
          <Line k="Date format" v="DD MMM YYYY" />
          <Line k="Coverage display" v="Percent" last />
        </div>

        <div className="section-label" style={{ margin: '20px 0 10px' }}>Scanning</div>
        <div className="card">
          <div className="row between" style={{ padding: '13px 16px', borderBottom: '1px solid var(--hairline)' }}>
            <span style={{ fontSize: 14.5, fontWeight: 600 }}>LiDAR quality</span>
            <div className="row" style={{ background: 'var(--canvas)', borderRadius: 9, padding: 3 }}>
              {['Standard', 'High'].map(u => <button key={u} onClick={() => setQuality(u)} className="mono" style={{ fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 7, background: quality === u ? 'var(--surface)' : 'transparent', color: quality === u ? 'var(--navy)' : 'var(--muted)', boxShadow: quality === u ? 'var(--sh-card)' : 'none' }}>{u}</button>)}
            </div>
          </div>
          <Toggle label="Auto-align to BIM" desc="Align each scan to the model on capture" on={align} onTap={() => setAlign(!align)} />
        </div>

        <div className="section-label" style={{ margin: '20px 0 10px' }}>Notifications</div>
        <div className="card">
          <Toggle label="Scan complete" on={n1} onTap={() => setN1(!n1)} />
          <Toggle label="Issue raised" on={n2} onTap={() => setN2(!n2)} />
          <Toggle label="Report ready to share" on={n3} onTap={() => setN3(!n3)} />
        </div>

        <div className="section-label" style={{ margin: '20px 0 10px' }}>About</div>
        <div className="card">
          <Line k="App" v="OptiSync" />
          <Line k="Company" v={window.OPTISYNC.company} />
          <Line k="Version" v="1.0.0" />
          <Line k="Terms of service" v="View" />
          <Line k="Privacy policy" v="View" last />
        </div>
        <div style={{ textAlign: 'center', marginTop: 26, opacity: .5 }}><Mark size={40} radius={10} /><div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 8, letterSpacing: '.06em' }}>SCAN · COMPARE · PROVE</div></div>
      </div>
    </div>
  );
}
function Toggle({ label, desc, on, onTap }) {
  return <button onClick={onTap} className="row between" style={{ width: '100%', padding: '13px 16px' }}>
    <span style={{ textAlign: 'left' }}><span style={{ display: 'block', fontSize: 14.5, fontWeight: 600 }}>{label}</span>{desc && <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{desc}</span>}</span>
    <span style={{ width: 44, height: 26, borderRadius: 999, background: on ? 'var(--teal)' : 'var(--hairline)', position: 'relative', transition: 'background .2s', flex: 'none' }}><span style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 20, height: 20, borderRadius: 10, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)', transition: 'left .2s' }} /></span>
  </button>;
}
function Line({ k, v, last }) {
  return <div className="row between" style={{ padding: '13px 16px', borderBottom: last ? 'none' : '1px solid var(--hairline)' }}><span style={{ fontSize: 14, color: 'var(--muted)' }}>{k}</span><span style={{ fontSize: 14, fontWeight: 600 }}>{v}</span></div>;
}

/* ---------- Share sheet ---------- */
function ShareSheet({ project, coverage, onClose }) {
  const [stage, setStage] = useState('menu');
  const doExport = () => { setStage('exporting'); setTimeout(() => setStage('done'), 1400); };
  return (
    <div className="sheet-scrim" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-grab" />
        {stage === 'done' ? (
          <div style={{ textAlign: 'center', padding: '14px 0 18px' }}>
            <div style={{ width: 56, height: 56, borderRadius: 28, background: 'var(--teal-10)', color: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><Ic.check style={{ width: 30, height: 30 }} /></div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>Report exported</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>{project.short} · <span className="mono">{coverage != null ? coverage : project.coverage}%</span> · PDF ready to send</div>
            <button className="btn btn-primary btn-block" style={{ marginTop: 18 }} onClick={onClose}>Done</button>
          </div>
        ) : stage === 'exporting' ? (
          <div style={{ textAlign: 'center', padding: '26px 0 30px' }}>
            <div className="spin" style={{ width: 40, height: 40, margin: '0 auto 16px', border: '3px solid var(--navy-08)', borderTopColor: 'var(--navy)', borderRadius: '50%' }} />
            <div style={{ fontSize: 15, fontWeight: 650 }}>Generating PDF…</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>Rendering A4 · donut, zones, issues, captures</div>
            <style>{`@keyframes sp{to{transform:rotate(360deg)}}.spin{animation:sp .8s linear infinite}`}</style>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>Share report</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 16 }}>{project.name} · <span className="mono">{coverage != null ? coverage : project.coverage}% coverage</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <ShareOpt icon={<Ic.pdf style={{ width: 22, height: 22 }} />} title="Save as PDF" desc="Client-ready A4 document" onTap={doExport} primary />
              <ShareOpt icon={<Ic.link style={{ width: 22, height: 22 }} />} title="Copy share link" desc="optisync.co.uk/r/…" onTap={doExport} />
              <ShareOpt icon={<Ic.user style={{ width: 22, height: 22 }} />} title="Email to client" desc={project.client.replace(' (private)', '')} onTap={doExport} />
            </div>
            <button className="btn btn-ghost btn-block" style={{ marginTop: 14 }} onClick={onClose}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}
function ShareOpt({ icon, title, desc, onTap, primary }) {
  return <button onClick={onTap} className="card card-pad row gap12" style={{ width: '100%', textAlign: 'left', background: 'var(--surface)' }}>
    <div style={{ width: 42, height: 42, borderRadius: 11, background: primary ? 'var(--navy)' : 'var(--navy-08)', color: primary ? '#fff' : 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{icon}</div>
    <div style={{ flex: 1 }}><div style={{ fontSize: 14.5, fontWeight: 700 }}>{title}</div><div className="mono" style={{ fontSize: 11.5, color: 'var(--muted)' }}>{desc}</div></div>
    <Ic.chevR style={{ width: 17, height: 17, color: 'var(--muted)' }} />
  </button>;
}

Object.assign(window, { IssuesScreen, IssueDetail, Plans, Profile, TeamScreen, Settings, ShareSheet, allIssues, Fact });
