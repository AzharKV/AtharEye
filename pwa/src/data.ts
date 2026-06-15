// OptiSync seeds + demo "now".
//
// SINGLE BUILD, two runtime phases (see lib/store.ts):
//   • phase 'client'   → SEED_CLIENT  — CK Group / Tabley Refurbishment (the predefined demo; the boot
//                        state on a fresh cache).
//   • phase 'optisync' → identity from SEED_OPTISYNC — Athar Robotics, empty projects (our own-app demo).
// The app starts in 'client'; deleting the seeded project flips it to 'optisync' (a localStorage flag).
// Clearing the cache (or Settings → Reset demo) re-seeds 'client'. State is **persisted to localStorage** —
// a refresh no longer resets.
//
// `VITE_DATASET=legacy` is a separate edge-case escape hatch (the 6-project portfolio; no phase flip).
import { SEED_LEGACY } from './data.legacy';
import { SEED_CLIENT } from './data.client';
import { SEED_OPTISYNC } from './data.optisync';
import { ZONE_MEDIA } from './lib/photos';

export { SEED_CLIENT, SEED_OPTISYNC, SEED_LEGACY };

/** Pinned "now" per phase for *displayed* timestamps (new scan date, raised/closed issue dates,
 *  new-project start date). Internal timing math (`Date.now() - startedAt`) stays real. */
export const DEMO_NOW: Record<'client' | 'optisync', string> = {
  client: '2026-06-12', // on or before the LOD-300 model's 13 Jun creation
  optisync: '2026-06-15',
};

if (import.meta.env.DEV) {
  // Assert over the seed that carries zones (client). Optisync + legacy are validated elsewhere.
  for (const p of SEED_CLIENT.projects) {
    const totalArea = p.zones.reduce((s, z) => s + z.area_m2, 0);
    const weighted = p.zones.reduce((s, z) => s + z.area_m2 * z.coverage, 0);
    const computed = totalArea === 0 ? 0 : Math.max(0, Math.min(100, Math.round(weighted / totalArea)));
    console.assert(computed === p.overall_coverage, `data: ${p.name} rollup=${computed} !== headline=${p.overall_coverage}`);
    for (const z of p.zones)
      console.assert(z.id in ZONE_MEDIA, `data: zone ${z.id} (${z.name}) in ${p.name} has no ZONE_MEDIA entry`);
  }
}
