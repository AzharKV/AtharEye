// store.ts — local persistence for the working data set.
//
// The app seeds from `data.ts` (the typed SPEC §10 demo data — the editable
// single source) and then persists the live projects to localStorage, so
// user-created projects and recorded scans survive a reload / app relaunch.
// This is offline-friendly and needs no backend; for the real multi-device
// product this layer is where a backend (e.g. Firebase) would slot in.
//
// Reset: bump SEED_VERSION (re-seeds from data.ts) or run
//   localStorage.removeItem('athar-eye:data')  in the console.
import { DATA } from '../data';
import type { Project } from '../types';

const KEY = 'athar-eye:data';
// Bump when the seed shape or demo content in data.ts changes and you want
// existing installs to re-seed (this discards runtime additions).
const SEED_VERSION = 1;

interface Persisted {
  v: number;
  projects: Project[];
}

const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));

/** Load the working projects — persisted set if present & current, else the seed. */
export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Persisted;
      if (parsed && parsed.v === SEED_VERSION && Array.isArray(parsed.projects)) {
        return parsed.projects;
      }
    }
  } catch {
    /* unavailable / corrupt — fall back to the seed */
  }
  return clone(DATA.projects);
}

/** Persist the working projects. */
export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ v: SEED_VERSION, projects } satisfies Persisted));
  } catch {
    /* storage full / disabled — ignore (in-memory still works this session) */
  }
}

/** Wipe persistence (next load re-seeds from data.ts). */
export function resetData(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
