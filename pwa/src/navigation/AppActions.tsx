// App-level cross-cutting actions (launch the scan modal, jump to Reports / open a report).
// Project data + mutations live in lib/store (useStore); this context is only for navigation
// that crosses tab boundaries.
import { createContext, useContext } from 'react';

export interface AppActions {
  /** Open the full-screen scan modal (optionally targeting a project). */
  startScan: (projectId?: string | null) => void;
  /** Switch to the Reports tab (history root). */
  goToReports: () => void;
  /** Switch to Reports and open a project's report (optionally at a scrubbed coverage). */
  openReport: (projectId: string, coverage?: number) => void;
}

export const AppActionsCtx = createContext<AppActions>({
  startScan: () => {},
  goToReports: () => {},
  openReport: () => {},
});

export const useAppActions = (): AppActions => useContext(AppActionsCtx);
