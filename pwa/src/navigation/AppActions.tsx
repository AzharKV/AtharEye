// AppActions.tsx — app-level actions provided by App (launch scan, add project,
// jump to reports) + the live projects list. Ported from design-source/app/app-nav.jsx
// (AppActionsCtx) and app.jsx (the provider value).
import { createContext, useContext } from 'react';
import type { Project } from '../types';

export interface AppActions {
  startScan: (project?: Project | null) => void;
  addProject: (p: Project) => void;
  projects: Project[];
  goToReports: () => void;
}

export const AppActionsCtx = createContext<AppActions>({
  startScan: () => {},
  addProject: () => {},
  projects: [],
  goToReports: () => {},
});

export const useAppActions = (): AppActions => useContext(AppActionsCtx);
