// reports.ts — the coverage roll-up, the timeline-scrubber / per-scan resolver (`stateAt`), and the
// report view-model (`reportFor`) with faithful staged prose from OPTISYNC_DEEP_REPORTS.md.
//
// The scrubber (Project detail) and the per-scan report both render `reportFor(project, coverage)`:
// donut, zone bars (rescaled), the issues open AT that coverage (appear/clear thresholds), the
// stage-appropriate captures, and the matching narrative. Deterministic — no network, no maths
// engine; coverage is the single dial that moves the whole report.
import type { Issue, Project, Stage, Zone } from '../types';
import { bandFor, STAGE_POOL } from './photos';
import { clampPct, fmtDate } from './format';

/** Area-weighted overall coverage from a project's zones (the live CRUD roll-up). */
export function rollup(zones: Zone[]): number {
  const area = zones.reduce((s, z) => s + z.area_m2, 0);
  if (area === 0) return 0;
  return clampPct(zones.reduce((s, z) => s + z.area_m2 * z.coverage, 0) / area);
}

/** Finer report ladder rung for a coverage (visuals §F / DEEP_REPORTS ladder). */
export type Rung = 'Just started' | 'Early stage' | 'Mid-build' | 'Almost complete' | 'Complete';
export function rungFor(coverage: number): Rung {
  if (coverage >= 100) return 'Complete';
  if (coverage >= 80) return 'Almost complete';
  if (coverage >= 40) return 'Mid-build';
  if (coverage >= 15) return 'Early stage';
  return 'Just started';
}

const DESCRIPTOR: Record<Rung, string> = {
  'Just started': 'Strip-out & first fix',
  'Early stage': 'Strip-out & first fix',
  'Mid-build': 'Second fix & fit-out',
  'Almost complete': 'Finishing & snagging',
  Complete: 'Handover-ready',
};
export const descriptorFor = (coverage: number): string => DESCRIPTOR[rungFor(coverage)];

/** Issues open at a scrubbed coverage: appeared and not yet cleared. */
export function openIssuesAt(project: Project, coverage: number): Issue[] {
  return project.issues.filter((i) => i.appear <= coverage && (i.clear == null || coverage < i.clear));
}

/** Zone bars rescaled proportionally to a scrubbed coverage (current → exact zone values). */
export function zonesAt(project: Project, coverage: number): Zone[] {
  const base = project.overall_coverage;
  return project.zones.map((z) => ({
    ...z,
    coverage: base === 0 ? clampPct(coverage) : clampPct((z.coverage * coverage) / base),
  }));
}

/** Stage-appropriate captures: the project's own gallery at its current coverage, else the band pool. */
export function capturesAt(project: Project, coverage: number): string[] {
  if (project.captures.length === 0) return []; // commercial — captures pending sync
  if (coverage === project.overall_coverage) return project.captures;
  return STAGE_POOL[bandFor(coverage)];
}

/** Scan-history points up to (and including) a coverage — the coverage-over-time sparkline. */
export function sparkAt(project: Project, coverage: number): { date: string; coverage: number }[] {
  return project.scans.filter((s) => s.coverage <= coverage).map((s) => ({ date: s.date, coverage: s.coverage }));
}

export interface ScrubState {
  coverage: number;
  stage: Stage;
  rung: Rung;
  zones: Zone[];
  openIssues: Issue[];
  closedCount: number;
  captures: string[];
}

/** The full re-rendered state at a coverage — what the scrubber crossfades between. */
export function stateAt(project: Project, coverage: number): ScrubState {
  const c = clampPct(coverage);
  const openIssues = openIssuesAt(project, c);
  return {
    coverage: c,
    stage: bandFor(c),
    rung: rungFor(c),
    zones: zonesAt(project, c),
    openIssues,
    closedCount: project.issues.length - openIssues.length,
    captures: capturesAt(project, c),
  };
}

// ── Report prose ────────────────────────────────────────────────────────────
// Faithful summaries + next-actions for the documented snapshots (Reports A–E). Other coverages
// (e.g. mid-scrub) synthesize a concise summary. Light projects render a short card (no next actions).
interface Prose {
  summary: string;
  nextActions: string[];
  footerExtra?: string;
}
const PROSE: Record<string, Record<string, Prose>> = {
  'proj-stirling': {
    'Just started': {
      summary:
        '12% verified. Strip-out complete — the flat is back to brick and joists. This is the first real progress scan after the baseline: it confirms the as-found structure against the BIM and sets the risk register before any new work goes in. The value at this stage is catching what is behind the walls.',
      nextActions: [
        'Renew the lintel before any rebuild (ST-03).',
        'Treat the gable damp (ST-01).',
        'Begin first-fix electrical & plumbing; target next scan ~28%.',
      ],
    },
    'Early stage': {
      summary:
        '28% of the BIM model verified against site. Strip-out and structural/ceiling repairs are complete; first-fix electrical and plumbing are live. The flat is a shell — this report establishes the baseline and the early risk register before plastering. The value here is catching structural issues while they are cheap to fix.',
      nextActions: [
        'Renew lintel (ST-03) before plastering can proceed.',
        'Treat gable damp and re-scan the bathroom (ST-01).',
        'Upgrade the consumer unit to suit the new circuit count (ST-02).',
        'Book plastering once first fix is signed off; target next scan ~45%.',
      ],
    },
  },
  'proj-morningside': {
    'Mid-build': {
      summary:
        '62% verified. First fix and plastering are complete across all eight zones; the project is now in second fix, kitchen and bathroom fit, and early decoration. Coverage is climbing steadily and on programme for a September handover. Three live issues need attention before they reach the decoration stage — one is a regs-critical flue clearance.',
      nextActions: [
        'Resolve flue clearance (MO-01) — regs hold before sign-off.',
        'Re-set the kitchen socket bank to BIM position and re-scan (MO-03).',
        'Strip and re-lay the lippage tiles in the en-suite (MO-02).',
        'Second coat to Bedroom 3, then proceed to flooring; target next scan ~72%.',
      ],
    },
  },
  'proj-leith': {
    'Almost complete': {
      summary:
        '94% verified. Decoration and flooring are in; the flat is visually finished and in the snagging window. Four minor/major snags are open and being cleared ahead of the 30 May handover. This is the “almost there” report — the one that proves the last 6% is controlled, not guesswork.',
      nextActions: [
        'Clear the four open snags (LE-01 to LE-04).',
        'Final as-built scan to 100%; issue the handover report.',
        'Handover booked 30 May 2026.',
      ],
    },
    Complete: {
      summary:
        '100% verified against the as-built model. All trades complete, all snags closed, flat handed over to Shoreline Lettings on 30 May 2026. This report is the handover artifact: full coverage, a cleared snag list, and the as-built BIM delivered alongside.',
      nextActions: [
        'Project closed. As-built model + report issued to client.',
        'Retain the scan set as the baseline for any future works or warranty claims.',
      ],
      footerExtra: 'Handover signed 30 May 2026.',
    },
  },
  // Light projects: short one-line summary, no deep narrative.
  'proj-hyndland': {
    'Mid-build': {
      summary:
        '74% verified. The flat is in second fix and decoration. The latest scan flags a partition wall built 220 mm off the BIM position in the kitchen/hall line — a deviation that needs review and resolution before decoration completes.',
      nextActions: [],
    },
  },
  'proj-marischal': {
    'Almost complete': {
      summary:
        '91% verified. The Cat-B office fit-out is substantially complete and in commissioning and snagging. Coverage and BIM data only — site captures pending sync.',
      nextActions: [],
    },
  },
  'proj-cityquay': {
    'Almost complete': {
      summary:
        '82% verified. The warehouse conversion is largely complete; a fire-stopping gap on the mezzanine and an office-pod partition deviation are flagged for review. Coverage and BIM data only — site captures pending sync.',
      nextActions: [],
    },
  },
};

function proseFor(project: Project, coverage: number, rung: Rung): Prose {
  const exact = PROSE[project.id]?.[rung];
  if (exact) return exact;
  // Synthesized fallback for an undocumented scrub point.
  return {
    summary: `${coverage}% of the BIM model verified against site — ${descriptorFor(coverage).toLowerCase()}. This snapshot re-renders the report at the ${rung.toLowerCase()} stage of the programme.`,
    nextActions:
      project.depth === 'deep' && coverage < 100
        ? ['Resolve the open issues below.', `Continue on programme; target the next scan above ${coverage}%.`]
        : [],
  };
}

export interface ReportModel {
  project: Project;
  coverage: number;
  rung: Rung;
  descriptor: string;
  date: string; // DD MMM YYYY
  zones: Zone[];
  openIssues: Issue[];
  closedIssues: Issue[];
  closedCount: number;
  spark: { date: string; coverage: number }[];
  captures: string[];
  summary: string;
  nextActions: string[];
  footer: string;
  isCurrent: boolean;
}

/**
 * Assemble the A-to-Z report at a coverage (defaults to the project's current overall). Used by the
 * Progress report screen, the Reports history, and per-scan reports from the scrubber/log.
 */
export function reportFor(project: Project, coverage?: number): ReportModel {
  const isCurrent = coverage == null || coverage === project.overall_coverage;
  const c = clampPct(coverage ?? project.overall_coverage);
  const st = stateAt(project, c);
  const rung = st.rung;
  const prose = proseFor(project, c, rung);
  // Report date = the scan at that coverage, else the latest scan ≤ coverage, else start date.
  const exactScan = project.scans.find((s) => s.coverage === c);
  const lastScan = [...project.scans].reverse().find((s) => s.coverage <= c);
  const dateIso = exactScan?.date ?? lastScan?.date ?? project.start_date;
  const openIssues = st.openIssues;
  const closedIssues = project.issues.filter((i) => !openIssues.includes(i));
  const footerBase = `Prepared by Cairn Refurbishment Ltd · ${'A. Patel'} · ${fmtDate(dateIso)}`;
  return {
    project,
    coverage: c,
    rung,
    descriptor: descriptorFor(c),
    date: fmtDate(dateIso),
    zones: [...st.zones].sort((a, b) => b.coverage - a.coverage),
    openIssues: [...openIssues].sort((a, b) => sev(a.severity) - sev(b.severity)),
    closedIssues,
    closedCount: st.closedCount,
    spark: sparkAt(project, c),
    captures: st.captures,
    summary: prose.summary,
    nextActions: prose.nextActions,
    footer: prose.footerExtra ? `${footerBase} · ${prose.footerExtra}` : footerBase,
    isCurrent,
  };
}

const sev = (s: Issue['severity']): number => (s === 'Critical' ? 0 : s === 'Major' ? 1 : 2);
