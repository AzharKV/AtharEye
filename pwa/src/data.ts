// OptiSync seed selector.
//
// VITE_DEMO chooses the recording preset; it wins over everything. VITE_DATASET=legacy is a
// separate edge-case escape hatch (only consulted when VITE_DEMO is unset).
//   • (no env)            → SEED_CLIENT   — CK Group / Tabley Refurbishment (the default build)
//   • VITE_DEMO=client    → SEED_CLIENT
//   • VITE_DEMO=optisync  → SEED_OPTISYNC — Athar Robotics, empty project list (our own app demo)
//   • VITE_DEMO=house     → SEED_HOUSE    — the original Bonaly Terrace single-project dataset
//   • VITE_DATASET=legacy → SEED_LEGACY   — the 6-project portfolio (edge-case testing)
//
// Set the flag in .env.local or at build time, e.g. `VITE_DEMO=optisync npm run build`.
import { SEED_LEGACY } from './data.legacy';
import { SEED_HOUSE } from './data.house';
import { SEED_CLIENT } from './data.client';
import { SEED_OPTISYNC } from './data.optisync';
import { ZONE_MEDIA } from './lib/photos';
import type { AppData } from './types';

const DEMO = import.meta.env.VITE_DEMO;
const LEGACY = import.meta.env.VITE_DATASET === 'legacy';

export const SEED: AppData =
  DEMO === 'optisync'
    ? SEED_OPTISYNC
    : DEMO === 'house'
      ? SEED_HOUSE
      : DEMO === 'client'
        ? SEED_CLIENT
        : LEGACY
          ? SEED_LEGACY
          : SEED_CLIENT;

// Single configurable "now" for user-visible timestamps (scan-completion date, newly-raised
// issue dates, new-project start date). Internal timing math (Date.now() - startedAt) stays
// real-time; only the *displayed* date is overridden so a live on-camera scan stamps a pinned
// pre-LOD date instead of the real current date. Pinned per preset; ISO `YYYY-MM-DD`.
export const DEMO_NOW: string =
  DEMO === 'optisync'
    ? '2026-06-15'
    : DEMO === 'house' || LEGACY
      ? '2026-06-13'
      : '2026-06-12'; // client / default — on or before the LOD-300 model's 13 Jun creation

if (import.meta.env.DEV) {
  for (const p of SEED.projects) {
    const totalArea = p.zones.reduce((s, z) => s + z.area_m2, 0);
    const weighted = p.zones.reduce((s, z) => s + z.area_m2 * z.coverage, 0);
    const computed = totalArea === 0 ? 0 : Math.max(0, Math.min(100, Math.round(weighted / totalArea)));
    console.assert(computed === p.overall_coverage, `data.ts: ${p.name} rollup=${computed} !== headline=${p.overall_coverage}`);
  }
  // Demo (non-legacy) zones must each have a dedicated ZONE_MEDIA entry so the scan poster + feed can't
  // diverge. Legacy zone ids intentionally fall back to the generic media, so this check is house-only.
  if (!LEGACY) {
    for (const p of SEED.projects)
      for (const z of p.zones)
        console.assert(z.id in ZONE_MEDIA, `data.ts: zone ${z.id} (${z.name}) in ${p.name} has no ZONE_MEDIA entry`);
  }
}
