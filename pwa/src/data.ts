// OptiSync seed selector.
// Default (no env var): SEED_HOUSE — Bonaly Terrace single-project demo dataset.
// VITE_DATASET=legacy: SEED_LEGACY — the original 6-project portfolio.
//
// Set the flag in .env.local or at build time:
//   VITE_DATASET=legacy npm run dev
import { SEED_LEGACY } from './data.legacy';
import { SEED_HOUSE } from './data.house';
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
}
