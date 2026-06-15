// Root: splash, responsive shell (phone-width card on desktop), per-tab navigators, lazy scan modal.
// State lives in the in-memory store (lib/store) — refresh re-seeds (the intended demo reset).
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { T } from './theme';
import { Mark, Wordmark } from './components/Brand';
import { InstallPrompt } from './components/InstallPrompt';
import { useBackLayer } from './hooks/useBackLayer';
import { StoreProvider, useStore } from './lib/store';
import { Navigator } from './navigation/Navigator';
import type { NavHandle } from './navigation/Navigator';
import { TabBar } from './navigation/TabBar';
import type { TabName } from './navigation/TabBar';
import { AppActionsCtx } from './navigation/AppActions';
import { ProjectsList } from './screens/Projects';
import { NewProject } from './screens/NewProject';
import { ReportsList, ReportDetail } from './screens/Reports';
import { Account } from './screens/Account';
import { PROCESSING_MS, processingStage } from './lib/processing';
import type { ProcessingJob } from './lib/processing';
import { Icon } from './components/Icon';

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
        background: T.surface,
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

// Global toast — floats above the tab bar, auto-hides after 3 s.
function GlobalToast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 'calc(env(safe-area-inset-bottom) + 72px)',
        zIndex: 900,
        background: T.ink,
        color: '#fff',
        borderRadius: 14,
        padding: '13px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: '0 8px 24px rgba(27,42,61,0.35)',
        animation: 'sheetUp .3s cubic-bezier(.32,.72,0,1)',
      }}
    >
      <Icon name="checkCircle" size={18} color={T.teal} />
      <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{message}</span>
    </div>
  );
}

function AppRoot() {
  const [tab, setTab] = useState<TabName>('Projects');
  const [scan, setScan] = useState<{ projectId: string | null } | null>(null);
  const [depths, setDepths] = useState<Record<TabName, number>>({ Projects: 1, Reports: 1, Account: 1 });
  const setDepth = (name: TabName) => (d: number) => setDepths((prev) => (prev[name] === d ? prev : { ...prev, [name]: d }));
  const projNav = useRef<NavHandle | null>(null);
  const repNav = useRef<NavHandle | null>(null);
  const accNav = useRef<NavHandle | null>(null);

  // Async processing jobs (in AppRoot, not the domain store — transient demo state).
  const [jobs, setJobs] = useState<Record<string, ProcessingJob>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const { update, data } = useStore();

  // Drop processing jobs whose project no longer exists (e.g. the user deleted it / the demo flipped to
  // OptiSync) so no stray "report ready" toast fires for a project that's gone.
  useEffect(() => {
    setJobs((prev) => {
      let changed = false;
      const next: Record<string, ProcessingJob> = {};
      for (const [id, j] of Object.entries(prev)) {
        if (data.projects.some((p) => p.id === j.projectId)) next[id] = j;
        else changed = true;
      }
      return changed ? next : prev;
    });
  }, [data.projects]);

  // Poll every 2 s; complete any job that has run for PROCESSING_MS. Only flip + toast for a scan whose
  // project + scan still exist (a deleted project's job is pruned above, but guard here too).
  useEffect(() => {
    if (Object.keys(jobs).length === 0) return;
    const iv = setInterval(() => {
      const now = Date.now();
      const done = Object.entries(jobs).filter(([, j]) => now - j.startedAt >= PROCESSING_MS);
      if (done.length === 0) return;
      let anyReady = false;
      done.forEach(([, j]) => {
        const proj = data.projects.find((p) => p.id === j.projectId);
        if (!proj || !proj.scans.some((s) => s.id === j.scanId)) return;
        anyReady = true;
        update(j.projectId, (d) => {
          const s = d.scans.find((x) => x.id === j.scanId);
          if (s) s.status = 'Ready';
        });
      });
      setJobs((prev) => {
        const next = { ...prev };
        done.forEach(([id]) => delete next[id]);
        return next;
      });
      if (anyReady) setToastMsg('Report ready · tap to view');
    }, 2000);
    return () => clearInterval(iv);
  }, [jobs, update, data.projects]);

  const startScan = useCallback((projectId?: string | null) => setScan({ projectId: projectId ?? null }), []);
  const closeScan = useCallback(() => setScan(null), []);
  useBackLayer(scan !== null, closeScan);

  const openReport = useCallback((projectId: string, coverage?: number) => {
    setScan(null);
    setTab('Reports');
    setTimeout(() => {
      repNav.current?.popToRoot();
      repNav.current?.push(<ReportDetail projectId={projectId} coverage={coverage} />);
    }, 60);
  }, []);

  const openNewProject = useCallback(() => {
    setScan(null);
    setTab('Projects');
    setTimeout(() => {
      projNav.current?.popToRoot();
      projNav.current?.push(<NewProject />);
    }, 60);
  }, []);

  const startProcessing = useCallback((projectId: string, zoneId: string, scanId: string) => {
    setJobs((prev) => ({ ...prev, [scanId]: { projectId, zoneId, scanId, startedAt: Date.now() } }));
  }, []);

  const isZoneProcessing = useCallback((projectId: string, zoneId: string) => {
    return Object.values(jobs).some((j) => j.projectId === projectId && j.zoneId === zoneId);
  }, [jobs]);

  const processingStageFor = useCallback((scanId: string): string => {
    const j = jobs[scanId];
    if (!j) return '';
    return processingStage(Date.now() - j.startedAt);
  }, [jobs]);

  const tabPane = (name: TabName, navRef: React.MutableRefObject<NavHandle | null>, root: ReactNode) => (
    <div style={{ position: 'absolute', inset: 0, display: tab === name ? 'block' : 'none' }}>
      <Navigator navRef={navRef} root={root} onDepth={setDepth(name)} />
    </div>
  );

  const atRoot = depths[tab] <= 1;

  return (
    <AppActionsCtx.Provider value={{ startScan, goToReports: () => setTab('Reports'), openNewProject, openReport, startProcessing, isZoneProcessing, processingStageFor }}>
      <div style={{ height: '100%', position: 'relative', background: T.canvas, color: T.ink, overflow: 'hidden' }}>
        {tabPane('Projects', projNav, <ProjectsList />)}
        {tabPane('Reports', repNav, <ReportsList />)}
        {tabPane('Account', accNav, <Account />)}
        {!scan && atRoot && <TabBar active={tab} onTab={setTab} onScan={() => startScan(null)} />}
        {!scan && atRoot && <InstallPrompt />}
        {scan && (
          <Suspense fallback={<ScanFallback />}>
            <ScanFlow projectId={scan.projectId} onClose={closeScan} onViewReport={openReport} />
          </Suspense>
        )}
        {toastMsg && <GlobalToast message={toastMsg} onDone={() => setToastMsg(null)} />}
      </div>
    </AppActionsCtx.Provider>
  );
}

export function App() {
  const [splash, setSplash] = useState(true);
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
        id="app-card"
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
