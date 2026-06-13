// processing.ts — async scan lifecycle: Uploading → Uploaded → Processing → Ready.
// Processing simulates cloud-side alignment + report generation (SPEC §16 v1.20).
// Default ≥ 60 s; stage labels advance proportionally through the window.

export const PROCESSING_MS = 60_000; // configurable ≥ 60 s

const STAGES = [
  { label: 'Queued', threshold: 0 },
  { label: 'Aligning to BIM', threshold: 0.15 },
  { label: 'Generating report', threshold: 0.60 },
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
