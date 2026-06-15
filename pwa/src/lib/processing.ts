// processing.ts — async scan lifecycle: Uploading → Uploaded → Processing → Ready.
// Processing simulates cloud-side alignment + report generation (SPEC §16 v1.20, v1.23).
// Default 5 min; stage labels are fractions of the window so they spread across the full duration.

export const PROCESSING_MS = 300_000; // 5 min (configurable)

// Thresholds are fractions of PROCESSING_MS, deliberately spread across the 5-min window:
// Queued 0–30 s · Aligning to BIM 30 s–2:45 · Generating report 2:45–5:00.
const STAGES = [
  { label: 'Queued', threshold: 0 },
  { label: 'Aligning to BIM', threshold: 0.1 },
  { label: 'Generating report', threshold: 0.55 },
] as const;

/** Compute the current processing stage label from elapsed ms. */
export function processingStage(elapsedMs: number): string {
  const pct = Math.min(1, elapsedMs / PROCESSING_MS);
  let label: string = STAGES[0].label;
  for (const s of STAGES) {
    if (pct >= s.threshold) label = s.label;
  }
  return label;
}

/** In-memory job entry (held in AppRoot state, not the domain store). */
export interface ProcessingJob {
  projectId: string;
  zoneId: string;
  scanId: string;
  startedAt: number; // Date.now() at job creation
}
