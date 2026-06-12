// store.ts — the in-memory app state tree, seeded from data.ts (SEED).
//
// Deterministic + offline by design: there is NO localStorage for core state. A page refresh
// re-seeds from SEED, which is the intended "reset" before a live demo (OPTISYNC_CODE_PROMPT.md).
// One mutation path: `update(projectId, recipe, {rollup})` for project edits (recipe mutates a
// cloned draft; rollup recomputes the area-weighted overall coverage), plus addProject /
// deleteProject and `patch` for top-level state (company, user, team, subscription, settings).
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { createElement } from 'react';
import { SEED } from '../data';
import type { AppData, Project } from '../types';
import { rollup } from './reports';

const clone = <T,>(x: T): T =>
  typeof structuredClone === 'function' ? structuredClone(x) : (JSON.parse(JSON.stringify(x)) as T);

/** A fresh copy of the seed — used at boot and by any reset. */
export const seedData = (): AppData => clone(SEED);

export interface Store {
  data: AppData;
  /** Single project mutation path. Mutate `draft` in `recipe`; pass `{ rollup: true }` to
   *  recompute overall coverage from the zones (e.g. after editing a zone's coverage). */
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
  const [data, setData] = useState<AppData>(seedData);

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

  const deleteProject = useCallback<Store['deleteProject']>((id) => {
    setData((prev) => ({ ...prev, projects: prev.projects.filter((p) => p.id !== id) }));
  }, []);

  const patch = useCallback<Store['patch']>((partial) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  const store = useMemo<Store>(
    () => ({ data, update, addProject, deleteProject, patch }),
    [data, update, addProject, deleteProject, patch],
  );

  return createElement(Ctx.Provider, { value: store }, children);
}
