// App.tsx — root: splash, adaptive device frame (desktop preview only), tab host
// with per-tab navigators, and the lazy-loaded scan modal. Ported from
// design-source/app/app.jsx; standalone-detection added so an installed app is
// always fullscreen (SPEC §6.1 — no fake status bar on device). See SPEC §15.
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { T } from './theme';
import type { Project } from './types';
import { loadProjects, saveProjects } from './lib/store';
import { Mark, Wordmark } from './components/Brand';
import { InstallPrompt } from './components/InstallPrompt';
import { useBackLayer } from './hooks/useBackLayer';
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
        <Mark size={76} />
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
        <Mark size={56} />
      </div>
    </div>
  );
}

function AppRoot() {
  const [tab, setTab] = useState<TabName>('Projects');
  const [scan, setScan] = useState<{ project: Project | null } | null>(null);
  // seeded from data.ts on first run, then persisted to localStorage so created
  // projects and recorded scans survive a reload / relaunch (see lib/store.ts)
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());
  const projNav = useRef<NavHandle | null>(null);
  const repNav = useRef<NavHandle | null>(null);
  const setNav = useRef<NavHandle | null>(null);

  const startScan = (project?: Project | null) => setScan({ project: project || null });
  const closeScan = () => setScan(null);
  // system/browser Back closes the full-screen scan modal
  useBackLayer(scan !== null, closeScan);
  const addProject = (p: Project) => setProjects((list) => [p, ...list]);
  // record a completed scan: bump scan count + "last scan"; a fresh (0%) project
  // gets a plausible starter coverage so the scan produces a real-looking report.
  const onScanComplete = (project: Project) => {
    setProjects((list) =>
      list.map((p) => {
        if (p.id !== project.id) return p;
        const scans = p.scans + 1;
        if (p.pct === 0 && p.rooms.length === 0) {
          const rooms = [
            { name: 'Main Area', pct: 58 },
            { name: 'Entrance', pct: 47 },
            { name: 'Rear', pct: 39 },
          ];
          const pct = Math.round(rooms.reduce((s, r) => s + r.pct, 0) / rooms.length);
          return { ...p, scans, last: 'Just now', pct, rooms };
        }
        return { ...p, scans, last: 'Just now' };
      }),
    );
  };
  // persist the working set whenever it changes
  useEffect(() => {
    saveProjects(projects);
  }, [projects]);
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
      value={{ startScan, addProject, onScanComplete, projects, goToReports: () => setTab('Reports') }}
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
        {!scan && <InstallPrompt />}
        {scan && (
          <Suspense fallback={<ScanFallback />}>
            <ScanFlow
              project={scan.project}
              projects={projects}
              onClose={closeScan}
              onViewReport={viewReport}
              onScanComplete={onScanComplete}
            />
          </Suspense>
        )}
      </div>
    </AppActionsCtx.Provider>
  );
}

export function App() {
  const [splash, setSplash] = useState(true);
  // Pure web, responsive: on a phone the app fills the screen; on desktop /
  // large tablets it floats as a centered phone-width card. No fake device
  // bezel, no hardcoded status bar (SPEC §6.1) — the OS / browser draws its own.
  const [floating, setFloating] = useState(false);

  useEffect(() => {
    const check = () => setFloating(window.innerWidth > 480 || window.innerHeight > 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: floating ? 'radial-gradient(120% 120% at 50% 0%, #12161B, #06080A)' : T.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: T.bg,
          color: T.text,
          width: floating ? 'min(100%, 440px)' : '100%',
          height: floating ? 'min(100%, 924px)' : '100%',
          borderRadius: floating ? 30 : 0,
          border: floating ? '1px solid rgba(255,255,255,0.08)' : 'none',
          boxShadow: floating ? '0 40px 90px rgba(0,0,0,0.55)' : 'none',
        }}
      >
        <AppRoot />
        {splash && <Splash onDone={() => setSplash(false)} />}
      </div>
    </div>
  );
}
