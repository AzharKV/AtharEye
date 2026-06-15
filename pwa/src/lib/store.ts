// store.ts — the app state tree, PERSISTED to localStorage, with a two-phase demo flag.
//
// Persistence (owner direction): the full AppData + the demo `phase` are saved to localStorage on every
// change, so created projects, recorded scans, edits and identity survive a refresh / relaunch. Only
// clearing the browser cache re-seeds.
//
// Two runtime phases from ONE build:
//   • 'client'   — boot state on a fresh cache: CK Group identity + the seeded Tabley project.
//   • 'optisync' — after the seeded project is deleted (projects → empty), the app FLIPS: a flag is
//                  written to the cache, the identity swaps to Athar Robotics / OptiSync and the scan
//                  flow uses the live camera + a BIM-mismatch result. Stays flipped until the cache is
//                  cleared. `VITE_DATASET=legacy` seeds the 6-project portfolio and never flips.
//
// One mutation path for projects: `update(projectId, recipe, {rollup})`. Top-level identity via `patch`.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createElement } from 'react';
import { SEED_CLIENT, SEED_OPTISYNC, SEED_LEGACY, DEMO_NOW } from '../data';
import type { AppData, Project } from '../types';
import { rollup } from './reports';

export type Phase = 'client' | 'optisync';

const STORAGE_KEY = 'optisync:state';
const SCHEMA = 1;
const LEGACY = import.meta.env.VITE_DATASET === 'legacy';

const clone = <T,>(x: T): T =>
  typeof structuredClone === 'function' ? structuredClone(x) : (JSON.parse(JSON.stringify(x)) as T);

interface Persisted {
  v: number;
  phase: Phase;
  data: AppData;
}

/** Drop capture URLs that can't survive a reload (object/data URLs are revoked on unload). */
function sanitize(data: AppData): AppData {
  return {
    ...data,
    projects: data.projects.map((p) => ({ ...p, captures: p.captures.filter((c) => !/^(blob:|data:)/.test(c)) })),
  };
}

/** The boot state for a fresh cache: client phase (or the legacy portfolio under VITE_DATASET=legacy). */
function freshSeed(): { phase: Phase; data: AppData } {
  return { phase: 'client', data: clone(LEGACY ? SEED_LEGACY : SEED_CLIENT) };
}

function load(): { phase: Phase; data: AppData } {
  if (typeof localStorage === 'undefined') return freshSeed();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Persisted;
      if (p && p.v === SCHEMA && p.data && Array.isArray(p.data.projects)) {
        return { phase: p.phase === 'optisync' ? 'optisync' : 'client', data: sanitize(p.data) };
      }
    }
  } catch {
    /* corrupt → reseed */
  }
  return freshSeed();
}

function save(phase: Phase, data: AppData): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: SCHEMA, phase, data }));
  } catch {
    /* quota / private mode — stay in-memory */
  }
}

/** Swap to the OptiSync (Athar Robotics) identity, projects emptied — applied on the client→optisync flip. */
function toOptisync(data: AppData): AppData {
  return {
    ...data,
    projects: [],
    company: clone(SEED_OPTISYNC.company),
    user: clone(SEED_OPTISYNC.user),
    team: clone(SEED_OPTISYNC.team),
    subscription: clone(SEED_OPTISYNC.subscription),
    settings: clone(SEED_OPTISYNC.settings),
  };
}

export interface Store {
  data: AppData;
  /** Current demo phase (drives identity + the scan camera/BIM-mismatch behaviour). */
  phase: Phase;
  /** Pinned "now" (ISO) for displayed timestamps, resolved from the phase. */
  demoNow: string;
  /** Single project mutation path. Mutate `draft`; pass `{ rollup: true }` to recompute overall coverage. */
  update(projectId: string, recipe: (draft: Project) => void, opts?: { rollup?: boolean }): void;
  addProject(p: Project): void;
  deleteProject(id: string): void;
  /** Patch top-level app state (company / user / team / subscription / settings). */
  patch(partial: Partial<AppData>): void;
}

const Ctx = createContext<Store | null>(null);

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be used within a <StoreProvider>');
  return s;
}

/** Convenience: look up a project by id from the live store. */
export function useProject(id: string | null | undefined): Project | undefined {
  const { data } = useStore();
  return data.projects.find((p) => p.id === id);
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const boot = useRef<{ phase: Phase; data: AppData } | null>(null);
  if (!boot.current) boot.current = load();

  const [data, setData] = useState<AppData>(boot.current.data);
  const [phase, setPhase] = useState<Phase>(boot.current.phase);

  // Persist on every change.
  useEffect(() => {
    save(phase, data);
  }, [phase, data]);

  const update = useCallback<Store['update']>((projectId, recipe, opts) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => {
        if (p.id !== projectId) return p;
        const draft = clone(p);
        recipe(draft);
        if (opts?.rollup) draft.overall_coverage = rollup(draft.zones);
        return draft;
      }),
    }));
  }, []);

  const addProject = useCallback<Store['addProject']>((p) => {
    setData((prev) => ({ ...prev, projects: [p, ...prev.projects] }));
  }, []);

  const deleteProject = useCallback<Store['deleteProject']>(
    (id) => {
      const remaining = data.projects.filter((p) => p.id !== id);
      // Flip the demo to OptiSync once the predefined project is deleted (client phase → empty).
      if (phase === 'client' && remaining.length === 0 && !LEGACY) {
        setData((prev) => toOptisync(prev));
        setPhase('optisync');
      } else {
        setData((prev) => ({ ...prev, projects: prev.projects.filter((p) => p.id !== id) }));
      }
    },
    [data.projects, phase],
  );

  const patch = useCallback<Store['patch']>((partial) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  const store = useMemo<Store>(
    () => ({ data, phase, demoNow: DEMO_NOW[phase], update, addProject, deleteProject, patch }),
    [data, phase, update, addProject, deleteProject, patch],
  );

  return createElement(Ctx.Provider, { value: store }, children);
}
