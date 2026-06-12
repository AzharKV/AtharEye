// Root: splash, responsive shell (phone-width card on desktop), per-tab navigators, lazy scan modal.
// State lives in the in-memory store (lib/store) — refresh re-seeds (the intended demo reset).
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { T } from './theme';
import { Mark, Wordmark } from './components/Brand';
import { InstallPrompt } from './components/InstallPrompt';
import { useBackLayer } from './hooks/useBackLayer';
import { StoreProvider } from './lib/store';
import { Navigator } from './navigation/Navigator';
import type { NavHandle } from './navigation/Navigator';
import { TabBar } from './navigation/TabBar';
import type { TabName } from './navigation/TabBar';
import { AppActionsCtx } from './navigation/AppActions';
import { ProjectsList } from './screens/Projects';
import { ReportsList, ReportDetail } from './screens/Reports';
import { Account } from './screens/Account';

// Scan flow is heavy + rare → code-split.
const ScanFlow = lazy(() => import('./screens/scan/ScanFlow').then((m) => ({ default: m.ScanFlow })));

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
        background: T.canvas,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: exiting ? 'splashOut .3s ease forwards' : undefined,
      }}
    >
      <div style={{ position: 'relative' }}>
        <Mark size={112} />
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: 20,
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          <Wordmark size={28} />
          <div style={{ fontSize: 13, color: T.muted, fontWeight: 600, letterSpacing: 0.4, marginTop: 6 }}>
            Scan. Compare. Prove.
          </div>
        </div>
      </div>
    </div>
  );
}

function ScanFallback() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 500,
        background: T.canvas,
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
  const [scan, setScan] = useState<{ projectId: string | null } | null>(null);
  const projNav = useRef<NavHandle | null>(null);
  const repNav = useRef<NavHandle | null>(null);
  const accNav = useRef<NavHandle | null>(null);

  const startScan = (projectId?: string | null) => setScan({ projectId: projectId ?? null });
  const closeScan = () => setScan(null);
  useBackLayer(scan !== null, closeScan);

  const openReport = (projectId: string, coverage?: number) => {
    setScan(null);
    setTab('Reports');
    setTimeout(() => {
      repNav.current?.popToRoot();
      repNav.current?.push(<ReportDetail projectId={projectId} coverage={coverage} />);
    }, 60);
  };

  const tabPane = (name: TabName, navRef: React.MutableRefObject<NavHandle | null>, root: ReactNode) => (
    <div style={{ position: 'absolute', inset: 0, display: tab === name ? 'block' : 'none' }}>
      <Navigator navRef={navRef} root={root} />
    </div>
  );

  return (
    <AppActionsCtx.Provider value={{ startScan, goToReports: () => setTab('Reports'), openReport }}>
      <div style={{ height: '100%', position: 'relative', background: T.canvas, color: T.ink, overflow: 'hidden' }}>
        {tabPane('Projects', projNav, <ProjectsList />)}
        {tabPane('Reports', repNav, <ReportsList />)}
        {tabPane('Account', accNav, <Account />)}
        {!scan && <TabBar active={tab} onTab={setTab} onScan={() => startScan(null)} />}
        {!scan && <InstallPrompt />}
        {scan && (
          <Suspense fallback={<ScanFallback />}>
            <ScanFlow projectId={scan.projectId} onClose={closeScan} onViewReport={openReport} />
          </Suspense>
        )}
      </div>
    </AppActionsCtx.Provider>
  );
}

export function App() {
  const [splash, setSplash] = useState(true);
  // Responsive: fills the screen on a phone; floats as a centered phone-width card on desktop /
  // large tablets. No fake device bezel, no hardcoded status bar (SPEC §6.1).
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
        background: floating ? 'radial-gradient(120% 120% at 50% 0%, #DCE4EE, #C3CFDD)' : T.canvas,
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
          background: T.canvas,
          color: T.ink,
          width: floating ? 'min(100%, 440px)' : '100%',
          height: floating ? 'min(100%, 924px)' : '100%',
          borderRadius: floating ? 30 : 0,
          border: floating ? '1px solid rgba(27,42,61,0.10)' : 'none',
          boxShadow: floating ? '0 40px 90px rgba(27,42,61,0.30)' : 'none',
        }}
      >
        <StoreProvider>
          <AppRoot />
        </StoreProvider>
        {splash && <Splash onDone={() => setSplash(false)} />}
      </div>
    </div>
  );
}
