// OptiSync seed selector.
// Default (no env var): SEED_HOUSE — Bonaly Terrace single-project demo dataset.
// VITE_DATASET=legacy: SEED_LEGACY — the original 6-project portfolio.
//
// Set the flag in .env.local or at build time:
//   VITE_DATASET=legacy npm run dev
import { SEED_LEGACY } from './data.legacy';
import { SEED_HOUSE } from './data.house';
import { ZONE_MEDIA } from './lib/photos';
import type { AppData } from './types';

export const SEED: AppData =
  import.meta.env.VITE_DATASET === 'legacy' ? SEED_LEGACY : SEED_HOUSE;

if (import.meta.env.DEV) {
  for (const p of SEED.projects) {
    const totalArea = p.zones.reduce((s, z) => s + z.area_m2, 0);
    const weighted = p.zones.reduce((s, z) => s + z.area_m2 * z.coverage, 0);
    const computed = Math.max(0, Math.min(100, Math.round(weighted / totalArea)));
    console.assert(computed === p.overall_coverage, `data.ts: ${p.name} rollup=${computed} !== headline=${p.overall_coverage}`);
  }
  // Demo (non-legacy) zones must each have a dedicated ZONE_MEDIA entry so the scan poster + feed can't
  // diverge. Legacy zone ids intentionally fall back to the generic media, so this check is house-only.
  if (import.meta.env.VITE_DATASET !== 'legacy') {
    for (const p of SEED.projects)
      for (const z of p.zones)
        console.assert(z.id in ZONE_MEDIA, `data.ts: zone ${z.id} (${z.name}) in ${p.name} has no ZONE_MEDIA entry`);
  }
}
