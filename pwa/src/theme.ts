// OptiSync design tokens — "Blueprint + teal", LIGHT (SPEC §6.2, locked).
// navy = structure/nav · blue = in-progress · teal = verified/complete (brand accent) ·
// amber = needs review · red = critical. Inter type with tabular+lining numerals (.mono).
// Back-compat aliases (bg/text/accent/…) keep the reused nav-shell components compiling.
import type { Stage, Severity, Status } from './types';

export const T = {
  // Palette (locked)
  canvas: '#EDF1F6',
  surface: '#FFFFFF',
  surface2: '#F4F7FB',
  surfaceHi: '#FFFFFF',
  hairline: '#D8E1EC',
  hairline2: '#E6ECF3',
  ink: '#1B2A3D',
  muted: '#64748B',
  faint: '#94A3B8',
  navy: '#1E3A66',
  blue: '#2D6FB0',
  teal: '#18837E',
  amber: '#B5781A',
  red: '#C0492F',
  // Soft tints for pills / fills (single-source, match tokens/colors.css)
  navyTint: 'rgba(30,58,102,0.08)',
  blueTint: 'rgba(45,111,176,0.12)',
  tealTint: 'rgba(24,131,126,0.10)',
  amberTint: 'rgba(181,120,26,0.12)',
  redTint: 'rgba(192,73,47,0.10)',
  track: 'rgba(30,58,102,0.08)',
  // Semantic aliases (reused components + brand)
  bg: '#EDF1F6',
  text: '#1B2A3D',
  accent: '#18837E',
  accent2: '#2FB6AD',
  accentPress: '#136B67',
  onAccent: '#FFFFFF',
  bar: '#1E3A66',
  warning: '#B5781A',
  danger: '#C0492F',
  glow: 'rgba(24,131,126,0.18)',
  font: "'Inter', -apple-system, system-ui, sans-serif",
  mono: "'Inter', -apple-system, system-ui, sans-serif",
} as const;

/** Status pill: On track / Complete = teal · Needs review = amber · Behind = red. */
export const STATUS: Record<Status, { c: string; bg: string; label: string }> = {
  'On track': { c: T.teal, bg: T.tealTint, label: 'On track' },
  'Needs review': { c: T.amber, bg: T.amberTint, label: 'Needs review' },
  Behind: { c: T.red, bg: T.redTint, label: 'Behind' },
  Complete: { c: T.teal, bg: T.tealTint, label: 'Complete' },
};

/** Issue severity dot: Critical = red · Major = amber · Minor = grey. */
export const SEV: Record<Severity, { c: string; label: string }> = {
  Critical: { c: T.red, label: 'Critical' },
  Major: { c: T.amber, label: 'Major' },
  Minor: { c: '#9AA7B6', label: 'Minor' },
};

/** Stage chip: Early stage (navy) → Mid-build (blue) → Complete (teal). */
export const STAGE: Record<Stage, { c: string; bg: string; label: string; descriptor: string }> = {
  Early: { c: T.navy, bg: T.navyTint, label: 'Early stage', descriptor: 'Strip-out & first fix' },
  Mid: { c: T.blue, bg: T.blueTint, label: 'Mid-build', descriptor: 'Second fix & fit-out' },
  Complete: { c: T.teal, bg: T.tealTint, label: 'Complete', descriptor: 'Handover-ready' },
};
