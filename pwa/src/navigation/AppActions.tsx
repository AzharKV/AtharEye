// App-level actions (launch scan, add/delete project, navigate to reports) + live projects list.
import { createContext, useContext } from 'react';
import type { Project } from '../types';

export interface AppActions {
  startScan: (project?: Project | null) => void;
  addProject: (p: Project) => void;
  /** Remove a project (and its data) — persisted. */
  deleteProject: (id: string) => void;
  /** Record a completed scan against a project (bumps scans/last; persisted). */
  onScanComplete: (project: Project) => void;
  projects: Project[];
  goToReports: () => void;
}

export const AppActionsCtx = createContext<AppActions>({
  startScan: () => {},
  addProject: () => {},
  deleteProject: () => {},
  onScanComplete: () => {},
  projects: [],
  goToReports: () => {},
});

export const useAppActions = (): AppActions => useContext(AppActionsCtx);
