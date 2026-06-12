/* OptiSync — app shell: router, bottom nav, state, mutations */

const ORIGINAL = JSON.parse(JSON.stringify(window.OPTISYNC.projects));
const clone = () => JSON.parse(JSON.stringify(ORIGINAL));

/* ---------- bottom nav ---------- */
function TabBar({ active, nav }) {
  const Item = ({ id, icon, label }) => (
    <button className={"tab" + (active === id ? ' active' : '')} onClick={() => nav.tab(id)}>
      <span className="ic-pill">{icon}</span><span>{label}</span>
    </button>
  );
  return (
    <div className="tabbar">
      <Item id="projects" icon={<Ic.projects />} label="Projects" />
      <Item id="reports" icon={<Ic.reports />} label="Reports" />
      <button className="tab scan" onClick={() => nav.go('scanpicker')}>
        <span className="scan-btn"><Ic.scan /></span><span>Scan</span>
      </button>
      <Item id="account" icon={<Ic.user />} label="Account" />
    </div>
  );
}

/* ---------- scan project picker ---------- */
function ScanPicker({ nav, projects }) {
  return (
    <div className="screen">
      <StatusBar tone="dark" />
      <div className="appbar">
        <button className="appbar-back" onClick={() => nav.back()}><Ic.chevL style={{ width: 18, height: 18 }} />Back</button>
        <h1>New scan</h1><p className="sub">Which site are you scanning?</p>
      </div>
      <div className="body pad pad-b">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {projects.map(p => (
            <button key={p.id} className="card card-pad row gap12" onClick={() => nav.go('scan', { id: p.id }, true)} style={{ width: '100%', textAlign: 'left' }}>
              <MiniDonut value={p.coverage} size={44} stroke={5} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row between gap8"><span style={{ fontSize: 15, fontWeight: 700 }}>{p.short}</span><StageChip stage={p.stage} /></div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{p.zones.length} zones · last scan {fdateShort(p.scans[p.scans.length - 1].date)}</div>
              </div>
              <span className="scan-btn" style={{ width: 38, height: 38, margin: 0, borderRadius: 12 }}><Ic.scan style={{ width: 19, height: 19, color: '#fff' }} /></span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- root app ---------- */
function App() {
  const [projects, setProjects] = useState(() => clone());
  const [user, setUser] = useState(() => ({ name: 'A. Patel', role: 'Project lead', email: 'a.patel@cairnrefurb.co.uk', phone: '+44 7700 900418', since: 'March 2024' }));
  const [team, setTeam] = useState(() => ([
    { name: 'A. Patel', role: 'Project lead', email: 'a.patel@cairnrefurb.co.uk', access: 'Owner' },
    { name: 'M. Ahmed', role: 'Scan technician', email: 'm.ahmed@cairnrefurb.co.uk', access: 'Editor' },
    { name: 'S. Grant', role: 'Office & billing', email: 's.grant@cairnrefurb.co.uk', access: 'Admin' }
  ]));
  const [view, setView] = useState({ screen: 'splash', params: {} });
  const [stack, setStack] = useState([]);
  const [tab, setTab] = useState('projects');
  const [sheet, setSheet] = useState(null);
  const bodyKey = useRef(0);

  const getProject = (id) => projects.find(p => p.id === id);

  const nav = useMemo(() => ({
    go(screen, params = {}, replace) {
      bodyKey.current++;
      setStack(s => replace ? s : [...s, view]);
      setView({ screen, params });
    },
    back() {
      setStack(s => {
        if (!s.length) return s;
        const prev = s[s.length - 1];
        bodyKey.current++;
        setView(prev);
        return s.slice(0, -1);
      });
    },
    tab(name, replace) {
      bodyKey.current++;
      const root = name === 'account' ? 'account' : name;
      setTab(name === 'account' ? 'account' : name);
      setStack([]);
      setView({ screen: root, params: {} });
    },
    share(project, coverage) { setSheet({ project, coverage }); },
    closeSheet() { setSheet(null); }
  }), [view]);

  /* mutations */
  const onCreate = (f, bim) => {
    const id = 'proj-' + Date.now();
    const np = {
      id, name: f.name, short: f.name.split(' ').slice(0, 2).join(' '),
      sector: f.type, type: (f.type === 'Commercial' ? 'Commercial fit-out' : 'Residential refurbishment'),
      location: f.location, client: f.client, area: +f.area || 0,
      stage: 'Early', coverage: 0, status: 'On track', depth: 'light', noPhotos: true,
      start: '2026-06-12', target: '2026-12-01',
      bim: { software: bim ? 'Autodesk Revit → IFC export' : 'Not connected', file: bim || '—', lod: 200, disciplines: ['Architectural'], aligned: '2026-06-12' },
      team: ['A. Patel — project lead'],
      trades: [['Strip-out', 'Not started']],
      zones: [{ name: 'Whole site', area: +f.area || 50, coverage: 0, note: 'Awaiting first scan' }],
      issues: [],
      scans: [{ date: '2026-06-12', coverage: 0, note: 'Baseline vs BIM' }]
    };
    setProjects(ps => [np, ...ps]);
    nav.tab('projects', true);
    setTimeout(() => nav.go('detail', { id }), 30);
  };
  const onDelete = (id) => {
    setProjects(ps => ps.filter(p => p.id !== id));
    nav.tab('projects', true);
  };
  const onComplete = (id, newScan, zoneName, newZoneCov) => {
    setProjects(ps => ps.map(p => {
      if (p.id !== id) return p;
      const zones = p.zones.map(z => z.name === zoneName ? Object.assign({}, z, { coverage: newZoneCov }) : z);
      return Object.assign({}, p, { coverage: newScan.coverage, scans: [...p.scans, newScan], zones });
    }));
  };
  // CRUD api — functional updates; rollup recomputes overall coverage from zones
  const rollupSync = (p) => {
    const cov = window.OPTISYNC.rollup(p.zones);
    const scans = p.scans.slice();
    if (scans.length) scans[scans.length - 1] = Object.assign({}, scans[scans.length - 1], { coverage: cov });
    return Object.assign({}, p, { coverage: cov, stage: window.OPTISYNC.bandStage(cov), scans });
  };
  const api = {
    update(id, fn, rollup) { setProjects(ps => ps.map(p => p.id === id ? (rollup ? rollupSync(fn(p)) : fn(p)) : p)); },
    remove: onDelete
  };

  /* render current screen */
  const renderScreen = () => {
    const { screen, params } = view;
    const p = params.id ? getProject(params.id) : null;
    switch (screen) {
      case 'splash': return <Splash nav={nav} />;
      case 'projects': return <ProjectsHome nav={nav} projects={projects} onDelete={onDelete} />;
      case 'newproject': return <NewProject nav={nav} onCreate={onCreate} />;
      case 'detail': return p ? <ProjectDetail nav={nav} project={p} api={api} onDelete={onDelete} onShare={nav.share} /> : <Missing nav={nav} />;
      case 'scan': return p ? <ScanFlow nav={nav} project={p} onComplete={onComplete} /> : <Missing nav={nav} />;
      case 'scanpicker': return <ScanPicker nav={nav} projects={projects} />;
      case 'report': return p ? <Report nav={nav} project={p} coverage={params.coverage} onShare={nav.share} /> : <Missing nav={nav} />;
      case 'reports': return <ReportsHistory nav={nav} projects={projects} onShare={nav.share} />;
      case 'issues': return <IssuesScreen nav={nav} projects={projects} api={api} />;
      case 'issuedetail': return p ? <IssueDetail nav={nav} project={p} issueId={params.issueId} api={api} /> : <Missing nav={nav} />;
      case 'plans': return <Plans nav={nav} />;
      case 'account': return <Profile nav={nav} projects={projects} user={user} setUser={setUser} />;
      case 'team': return <TeamScreen nav={nav} team={team} setTeam={setTeam} />;
      case 'settings': return <Settings nav={nav} />;
      default: return <Missing nav={nav} />;
    }
  };

  const showTab = ['projects', 'reports', 'account'].includes(view.screen);
  const isScan = view.screen === 'scan';
  const isSplash = view.screen === 'splash';

  return (
    <div className="phone-screen">
      {!isScan && !isSplash && <StatusBar tone="dark" />}
      <div key={bodyKey.current} className="screen-anim" style={{ position: 'absolute', inset: 0 }}>
        {renderScreen()}
      </div>
      {showTab && <TabBar active={tab} nav={nav} />}
      {sheet && <ShareSheet project={sheet.project} coverage={sheet.coverage} onClose={nav.closeSheet} />}
      <div className={"home-ind" + (isScan ? ' light' : '')} />
    </div>
  );
}

function Missing({ nav }) {
  return <div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ textAlign: 'center', color: 'var(--muted)' }}><div style={{ fontSize: 14, marginBottom: 12 }}>Project not found</div><button className="btn btn-ghost" onClick={() => nav.tab('projects')}>Back to projects</button></div>
  </div>;
}

/* reports tab gets an Issues shortcut via appbar — patch ReportsHistory header */
ReactDOM.createRoot(document.getElementById('app')).render(<App />);
