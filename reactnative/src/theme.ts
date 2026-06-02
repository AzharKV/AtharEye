// Athar Eye design tokens — RN-adapted, ported 1:1 from pwa/src/theme.ts (SPEC §6.2/6.3).
// Dark navy + teal, SF system font, 4-pt grid. ONE teal hero per screen; structural elements
// grey; red only for missing/critical. RN supports #RRGGBBAA, so `T.accent + '33'` works inline.
import { Platform } from 'react-native';
import type { ProjectStatus, Severity } from './types';

export const T = {
  bg: '#0C0F12',
  surface: '#15191E',
  surface2: '#1B2026',
  surfaceHi: '#20262E',
  hairline: 'rgba(255,255,255,0.07)',
  hairline2: 'rgba(255,255,255,0.04)',
  text: '#F4F6F8',
  muted: '#8A949E',
  faint: '#5B646D',
  accent: '#14B8C0',
  accent2: '#45D6DD',
  accentPress: '#0F949B',
  onAccent: '#04222B',
  bar: '#AEB8C2',
  track: 'rgba(255,255,255,0.09)',
  warning: '#E8A33D',
  danger: '#E5484D',
  glow: 'rgba(20,184,192,0.20)',
} as const;

// System sans is RN's default (omit fontFamily). MONO is for filenames / technical labels —
// the PWA used `T.mono`; here we map it to the platform monospace face.
export const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) as string;

// Status: teal = positive, amber = the one caution accent (Needs Review only).
export const STATUS: Record<ProjectStatus, { c: string; label: string }> = {
  'On Track': { c: T.accent, label: 'On track' },
  'Needs Review': { c: T.warning, label: 'Needs review' },
  Complete: { c: T.accent, label: 'Complete' },
};

export const SEV: Record<Severity, string> = {
  high: T.danger,
  med: T.warning,
  low: T.faint,
};
