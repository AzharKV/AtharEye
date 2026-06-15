// App-level cross-cutting actions (launch the scan modal, jump to Reports / open a report,
// start/query the async scan processing lifecycle).
// Project data + mutations live in lib/store (useStore); this context is only for navigation
// that crosses tab boundaries and for processing state that lives in AppRoot.
import { createContext, useContext } from 'react';

export interface AppActions {
  /** Open the full-screen scan modal (optionally targeting a project). */
  startScan: (projectId?: string | null) => void;
  /** Switch to the Reports tab (history root). */
  goToReports: () => void;
  /** Close any modal, switch to Projects and open the New-project form (used by empty states). */
  openNewProject: () => void;
  /** Switch to Reports and open a project's report (optionally at a scrubbed coverage). */
  openReport: (projectId: string, coverage?: number) => void;
  /**
   * Register a new async processing job after a scan upload.
   * AppRoot runs the timer; when PROCESSING_MS elapses it flips the scan to Ready + shows a toast.
   */
  startProcessing: (projectId: string, zoneId: string, scanId: string) => void;
  /** True while a zone has an in-progress processing job. Used to lock the zone in ScanFlow. */
  isZoneProcessing: (projectId: string, zoneId: string) => boolean;
  /** Current stage label for a scan id (empty string if not processing). */
  processingStageFor: (scanId: string) => string;
}

export const AppActionsCtx = createContext<AppActions>({
  startScan: () => {},
  goToReports: () => {},
  openNewProject: () => {},
  openReport: () => {},
  startProcessing: () => {},
  isZoneProcessing: () => false,
  processingStageFor: () => '',
});

export const useAppActions = (): AppActions => useContext(AppActionsCtx);
