// AppStore — the live, persisted projects working set + mutations (RN port of the PWA's
// AppActions context + lib/store). Seeds synchronously from data.ts so screens render instantly,
// then hydrates from AsyncStorage; saves on every change once hydrated. Every screen reads the
// live set via useAppStore() (never data.ts directly).
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { DATA } from '../data';
import { loadProjects, saveProjects } from '../lib/store';
import type { Project } from '../types';

interface AppStore {
  projects: Project[];
  hydrated: boolean;
  addProject: (p: Project) => void;
  deleteProject: (id: string) => void;
  onScanComplete: (project: Project) => void;
}

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

const Ctx = createContext<AppStore>({
  projects: [],
  hydrated: false,
  addProject: () => {},
  deleteProject: () => {},
  onScanComplete: () => {},
});

export const useAppStore = (): AppStore => useContext(Ctx);

/** Look up a project by id from the live set (helper for param-driven screens). */
export function useProject(id: string | undefined): Project | undefined {
  const { projects } = useAppStore();
  return projects.find((p) => p.id === id);
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(() => clone(DATA.projects));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let alive = true;
    loadProjects().then((p) => {
      if (alive) {
        setProjects(p);
        setHydrated(true);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (hydrated) saveProjects(projects);
  }, [projects, hydrated]);

  const addProject = (p: Project) => setProjects((list) => [p, ...list]);
  const deleteProject = (id: string) => setProjects((list) => list.filter((p) => p.id !== id));

  // Record a completed scan: bump scan count + "last scan". A fresh (0%) project gets a plausible
  // starter coverage so the scan produces a real-looking report (verbatim from the PWA).
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

  return (
    <Ctx.Provider value={{ projects, hydrated, addProject, deleteProject, onScanComplete }}>{children}</Ctx.Provider>
  );
}
