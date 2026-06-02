// app.jsx — root: splash, adaptive device frame, tab host + per-tab navigators, scan modal.
const { T, Mark, Wordmark, TabBar, Navigator, AppActionsCtx, DATA,
  ProjectsList, ReportsList, Settings, ScanFlow, ReportDetail } = window;
const IOSDevice = window.IOSDevice;

function Splash({ onDone }) {
  React.useEffect(() => { const t = setTimeout(onDone, 1700); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 999, background: 'radial-gradient(130% 100% at 50% 35%, #14222B, #0A0E12)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <Mark size={76} r={20} />
        <Wordmark size={30} />
        <div style={{ fontSize: 13, color: T.muted, fontWeight: 600, letterSpacing: 0.6, marginTop: 2 }}>See progress · Prove progress</div>
      </div>
    </div>
  );
}

function AppRoot() {
  const [tab, setTab] = React.useState('Projects');
  const [scan, setScan] = React.useState(null); // null | {project}
  const [projects, setProjects] = React.useState(DATA.projects);
  const projNav = React.useRef(null), repNav = React.useRef(null), setNav = React.useRef(null);

  const startScan = (project) => setScan({ project: project || null });
  const closeScan = () => setScan(null);
  const addProject = (p) => setProjects(list => [p, ...list]);
  const viewReport = (p) => {
    setScan(null); setTab('Reports');
    setTimeout(() => { repNav.current && repNav.current.popToRoot(); repNav.current && repNav.current.push(<ReportDetail project={p} />); }, 60);
  };

  const tabPane = (name, navRef, root) => (
    <div style={{ position: 'absolute', inset: 0, display: tab === name ? 'block' : 'none' }}>
      <Navigator navRef={navRef} root={root} />
    </div>
  );

  return (
    <AppActionsCtx.Provider value={{ startScan, addProject, projects, goToReports: () => setTab('Reports') }}>
      <div style={{ height: '100%', position: 'relative', background: T.bg, color: T.text, overflow: 'hidden' }}>
        {tabPane('Projects', projNav, <ProjectsList />)}
        {tabPane('Reports', repNav, <ReportsList />)}
        {tabPane('Settings', setNav, <Settings />)}
        {!scan && <TabBar active={tab} onTab={setTab} onScan={() => startScan(null)} />}
        {scan && <ScanFlow project={scan.project} projects={projects} onClose={closeScan} onViewReport={viewReport} />}
      </div>
    </AppActionsCtx.Provider>
  );
}

function App() {
  const [splash, setSplash] = React.useState(true);
  const [framed, setFramed] = React.useState(true);
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    const check = () => {
      const w = window.innerWidth, h = window.innerHeight;
      const fits = w >= 430 && h >= 470;
      setFramed(fits);
      if (fits) setScale(Math.min((w - 40) / 402, (h - 28) / 874, 1.1));
    };
    check(); window.addEventListener('resize', check); return () => window.removeEventListener('resize', check);
  }, []);

  if (framed) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(120% 120% at 50% 0%, #1a2027, #0a0d10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
          <IOSDevice dark>
            <div style={{ height: '100%', position: 'relative' }}>
              <AppRoot />
              {splash && <Splash onDone={() => setSplash(false)} />}
            </div>
          </IOSDevice>
        </div>
      </div>
    );
  }
  // fullscreen PWA mode (real phone)
  return (
    <div style={{ position: 'fixed', inset: 0, background: T.bg }}>
      <AppRoot />
      {splash && <Splash onDone={() => setSplash(false)} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
