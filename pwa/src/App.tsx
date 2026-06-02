// App.tsx — root: splash, adaptive device frame (desktop preview only), tab host
// with per-tab navigators, and the lazy-loaded scan modal. Ported from
// design-source/app/app.jsx; standalone-detection added so an installed app is
// always fullscreen (SPEC §6.1 — no fake status bar on device). See SPEC §15.
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { T } from './theme';
import { DATA } from './data';
import type { Project } from './types';
import { Mark, Wordmark } from './components/Brand';
import { IOSDevice } from './components/IOSDevice';
import { Navigator } from './navigation/Navigator';
import type { NavHandle } from './navigation/Navigator';
import { TabBar } from './navigation/TabBar';
import type { TabName } from './navigation/TabBar';
import { AppActionsCtx } from './navigation/AppActions';
import { ProjectsList } from './screens/Projects';
import { ReportsList, ReportDetail } from './screens/Reports';
import { Settings } from './screens/Settings';

// Scan flow is heavy + rare → code-split (§4.1 / §4.10).
const ScanFlow = lazy(() =>
  import('./screens/scan/ScanFlow').then((m) => ({ default: m.ScanFlow })),
);

function Splash({ onDone }: { onDone: () => void }) {
  const [exiting, setExiting] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setExiting(true), 1400);
    const t2 = setTimeout(onDone, 1700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 999,
        background: 'radial-gradient(130% 100% at 50% 35%, #14222B, #0A0E12)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        animation: exiting ? 'splashOut .3s ease forwards' : undefined,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          animation: 'splashRise .6s cubic-bezier(.32,.72,0,1) both',
        }}
      >
        <Mark size={76} r={20} />
        <Wordmark size={30} />
        <div style={{ fontSize: 13, color: T.muted, fontWeight: 600, letterSpacing: 0.6, marginTop: 2 }}>
          See progress · Prove progress
        </div>
      </div>
    </div>
  );
}

// Suspense fallback while the scan chunk loads — branded, never blank (§4.3).
function ScanFallback() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 500,
        background: T.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ animation: 'pulse 1.4s ease-in-out infinite' }}>
        <Mark size={56} r={16} />
      </div>
    </div>
  );
}

function AppRoot() {
  const [tab, setTab] = useState<TabName>('Projects');
  const [scan, setScan] = useState<{ project: Project | null } | null>(null);
  const [projects, setProjects] = useState<Project[]>(DATA.projects);
  const projNav = useRef<NavHandle | null>(null);
  const repNav = useRef<NavHandle | null>(null);
  const setNav = useRef<NavHandle | null>(null);

  const startScan = (project?: Project | null) => setScan({ project: project || null });
  const closeScan = () => setScan(null);
  const addProject = (p: Project) => setProjects((list) => [p, ...list]);
  const viewReport = (p: Project) => {
    setScan(null);
    setTab('Reports');
    setTimeout(() => {
      repNav.current?.popToRoot();
      repNav.current?.push(<ReportDetail project={p} />);
    }, 60);
  };

  const tabPane = (
    name: TabName,
    navRef: React.MutableRefObject<NavHandle | null>,
    root: ReactNode,
  ) => (
    <div style={{ position: 'absolute', inset: 0, display: tab === name ? 'block' : 'none' }}>
      <Navigator navRef={navRef} root={root} />
    </div>
  );

  return (
    <AppActionsCtx.Provider
      value={{ startScan, addProject, projects, goToReports: () => setTab('Reports') }}
    >
      <div
        style={{
          height: '100%',
          position: 'relative',
          background: T.bg,
          color: T.text,
          overflow: 'hidden',
        }}
      >
        {tabPane('Projects', projNav, <ProjectsList />)}
        {tabPane('Reports', repNav, <ReportsList />)}
        {tabPane('Settings', setNav, <Settings />)}
        {!scan && <TabBar active={tab} onTab={setTab} onScan={() => startScan(null)} />}
        {scan && (
          <Suspense fallback={<ScanFallback />}>
            <ScanFlow
              project={scan.project}
              projects={projects}
              onClose={closeScan}
              onViewReport={viewReport}
            />
          </Suspense>
        )}
      </div>
    </AppActionsCtx.Provider>
  );
}

const isStandalone = (): boolean =>
  window.matchMedia?.('(display-mode: standalone)').matches ||
  (navigator as unknown as { standalone?: boolean }).standalone === true;

export function App() {
  const [splash, setSplash] = useState(true);
  const [framed, setFramed] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Show the device-frame chrome only on a roomy desktop window AND only
      // when NOT running as an installed standalone app — so a real iPhone (in
      // Safari or installed) always renders fullscreen with the OS status bar.
      const fits = w >= 430 && h >= 470 && !isStandalone();
      setFramed(fits);
      if (fits) setScale(Math.min((w - 40) / 402, (h - 28) / 874, 1.1));
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (framed) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(120% 120% at 50% 0%, #1a2027, #0a0d10)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
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
  // fullscreen PWA mode (real phone / installed)
  return (
    <div style={{ position: 'fixed', inset: 0, background: T.bg }}>
      <AppRoot />
      {splash && <Splash onDone={() => setSplash(false)} />}
    </div>
  );
}
