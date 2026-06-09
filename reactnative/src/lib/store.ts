// store.ts — local persistence for the working data set (RN port of the PWA's localStorage store).
//
// The app seeds from `data.ts` (the typed SPEC §10 demo data) and then persists the live projects
// to AsyncStorage, so user-created projects and recorded scans survive an app relaunch. Offline-
// friendly, no backend; for the real multi-device product this layer is where a backend (e.g.
// Firebase) would slot in.
//
// Reset: bump SEED_VERSION (re-seeds from data.ts) or call resetData().
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DATA } from '../data';
import type { Project } from '../types';

const KEY = 'athar-eye:data';
// Bump when the seed shape or demo content in data.ts changes and you want existing installs to
// re-seed (this discards runtime additions).
const SEED_VERSION = 1;

interface Persisted {
  v: number;
  projects: Project[];
}

const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));

/** Load the working projects — persisted set if present & current, else the seed. */
export async function loadProjects(): Promise<Project[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
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
export async function saveProjects(projects: Project[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify({ v: SEED_VERSION, projects } satisfies Persisted));
  } catch {
    /* storage full / disabled — ignore (in-memory still works this session) */
  }
}

/** Wipe persistence (next load re-seeds from data.ts). */
export async function resetData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
