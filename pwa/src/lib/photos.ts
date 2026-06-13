// Photo + media asset map (OPTISYNC_PHOTO_MAP.md). Resolves the curated p-index references
// in data.ts to the real files copied into public/captures/design-assets. Only the shipped
// curated subset exists (galleries are ~5/deep-project; the longer DATA_SPEC lists were reserve
// frames that were not shipped). Commercial projects carry no captures by design.
import type { Stage } from '../types';

const ROOT = `${import.meta.env.BASE_URL}captures/design-assets`;

/** p-index → public path, for every shipped gallery photo + asset. */
export const PHOTO: Record<string, string> = {
  // Stirling (Early)
  p016: `${ROOT}/stirling-early/stirling_early_kitchen_barebrick_p016.jpeg`,
  p018: `${ROOT}/stirling-early/stirling_early_room_stripped_p018.jpeg`,
  p027: `${ROOT}/stirling-early/stirling_early_ceiling_joists_p027.jpeg`,
  p040: `${ROOT}/stirling-early/stirling_early_bareplaster_p040.jpeg`,
  p055: `${ROOT}/stirling-early/stirling_early_bedroom_stripped_p055.jpeg`,
  p037: `${ROOT}/stirling-early/stirling_early_floorplan_sketch_p037.jpeg`,
  // Morningside (Mid)
  p015: `${ROOT}/morningside-mid/morningside_mid_kitchen_units_p015.jpeg`,
  p035: `${ROOT}/morningside-mid/morningside_mid_plastering_p035.jpeg`,
  p043: `${ROOT}/morningside-mid/morningside_mid_kitchen_plaster_p043.jpeg`,
  p046: `${ROOT}/morningside-mid/morningside_mid_before_after_split_p046.jpeg`,
  p047: `${ROOT}/morningside-mid/morningside_mid_bathroom_firstfix_p047.jpeg`,
  p062: `${ROOT}/morningside-mid/morningside_mid_kitchen_p062.jpeg`,
  // Hyndland (Mid, light)
  p011: `${ROOT}/hyndland-mid/hyndland_mid_bathroom_p011.jpeg`,
  p012: `${ROOT}/hyndland-mid/hyndland_mid_hall_stair_p012.jpeg`,
  p048: `${ROOT}/hyndland-mid/hyndland_mid_bathroom_2_p048.jpeg`,
  p060: `${ROOT}/hyndland-mid/hyndland_mid_kitchen_sink_p060.jpeg`,
  // Leith (Complete)
  p026: `${ROOT}/leith-complete/leith_complete_kitchen_p026.jpeg`,
  p051: `${ROOT}/leith-complete/leith_complete_hall_runner_p051.jpeg`,
  p066: `${ROOT}/leith-complete/leith_complete_bedroom_p066.jpeg`,
  p070: `${ROOT}/leith-complete/leith_complete_bathroom_p070.jpeg`,
  p080: `${ROOT}/leith-complete/leith_complete_kitchen_2_p080.jpeg`,
  p088: `${ROOT}/leith-complete/kitchen_finished_p088.jpeg`,
  // Before/after pairs
  p083: `${ROOT}/before-after/kitchen_before_dated_p083.jpeg`,
  p084: `${ROOT}/before-after/kitchen_after_finished_p084.jpeg`,
  p085: `${ROOT}/before-after/room_before_bareplaster_p085.jpeg`,
  p086: `${ROOT}/before-after/room_before_stripped_p086.jpeg`,
  p087: `${ROOT}/before-after/room_after_finished_p087.jpeg`,
  // Plans
  p089: `${ROOT}/plans/floorplan_sketch_p089.jpeg`,
};

/** Resolve a p-index to its path. Uploaded captures are stored as blob:/data:/http(s):/ paths and
 *  pass through unchanged (undefined only for an unknown p-index). */
export const photoSrc = (id: string): string | undefined =>
  PHOTO[id] ?? (/^(blob:|data:|https?:|\/)/.test(id) ? id : undefined);

/** Stage band each gallery photo belongs to — drives the scrubber's stage-appropriate captures. */
export const PHOTO_STAGE: Record<string, Stage> = {
  p016: 'Early', p018: 'Early', p027: 'Early', p040: 'Early', p055: 'Early', p083: 'Early', p085: 'Early', p086: 'Early',
  p015: 'Mid', p035: 'Mid', p043: 'Mid', p047: 'Mid', p062: 'Mid', p011: 'Mid', p012: 'Mid', p048: 'Mid', p060: 'Mid',
  p026: 'Complete', p051: 'Complete', p066: 'Complete', p070: 'Complete', p080: 'Complete', p088: 'Complete', p084: 'Complete', p087: 'Complete',
};

/** Global stage pools — used when scrubbing a project to a historical coverage (the project's own
 *  captures are single-stage, so a scrubbed point shows believable stage-appropriate frames). */
export const STAGE_POOL: Record<Stage, string[]> = {
  Early: ['p016', 'p018', 'p027', 'p040', 'p055'],
  Mid: ['p015', 'p043', 'p047', 'p035', 'p062'],
  Complete: ['p026', 'p070', 'p066', 'p080', 'p051'],
};

/** The coverage band → stage used across reports/scrubber (visuals §F). */
export function bandFor(coverage: number): Stage {
  if (coverage < 40) return 'Early';
  if (coverage <= 80) return 'Mid';
  return 'Complete';
}

/** Plan / BIM-detail imagery (the floor-plan sketches). */
export const PLAN_ASSET = { stirling: PHOTO.p037, generic: PHOTO.p089 };

/** Before/after comparison pairs (reserve assets — wired into report over-time visuals). */
export const BEFORE_AFTER = {
  kitchen: { before: PHOTO.p083, after: PHOTO.p084, label: 'Kitchen — dated → finished' },
  room: { before: PHOTO.p085, after: PHOTO.p087, label: 'Room — bare plaster → finished' },
  morningside: PHOTO.p046,
};

/** Scan-flow camera backgrounds (people-free walkthrough stills) — the result freeze + video fallback. */
export const SCAN_BG = {
  living: `${ROOT}/scan-background/scanbg_livingroom_9s.jpeg`,
  kitchen: `${ROOT}/scan-background/scanbg_kitchen_18s.jpeg`,
  stairs: `${ROOT}/scan-background/scanbg_stairs_39s.jpeg`,
  bedroom: `${ROOT}/scan-background/scanbg_bedroom_66s.jpeg`,
};
export const SCAN_BG_LIST = [SCAN_BG.living, SCAN_BG.kitchen, SCAN_BG.stairs, SCAN_BG.bedroom];

/** The looping scan-flow walkthrough videos (`<video … playsinline>`). */
export const SCAN_FEED = `${import.meta.env.BASE_URL}scans/scan_feed.mp4`;
export const SCAN_FEED_2 = `${import.meta.env.BASE_URL}scans/scan_feed_2.mp4`;

/** Per-zone scan media for the demo — **poster and feed for each scanned zone come from ONE entry**, so
 *  the aim freeze and the played clip can never be different rooms (the v1.18 split-source bug, where the
 *  poster was resolved by room name and the feed by zone id). Keyed by zone.id; all four demo zones are
 *  present, so there is no silent cross-room fallback. Each `poster_*.jpg` is frame 0 of its `scan_*.mp4`,
 *  so the aim freeze → Begin (play from t=0) hand-off is seamless and same-room by construction. */
const BASE = import.meta.env.BASE_URL;
export const ZONE_MEDIA: Record<string, { feed: string; poster: string }> = {
  z2: { feed: `${BASE}scans/scan_living.mp4`, poster: `${BASE}scans/poster_living.jpg` },
  z3: { feed: `${BASE}scans/scan_kitchen.mp4`, poster: `${BASE}scans/poster_kitchen.jpg` },
  z4: { feed: `${BASE}scans/scan_bathroom.mp4`, poster: `${BASE}scans/poster_bathroom.jpg` },
  z5: { feed: `${BASE}scans/scan_bedroom.mp4`, poster: `${BASE}scans/poster_bedroom.jpg` },
};

/** Neutral generic media for a zone with no dedicated entry (e.g. legacy-dataset zone ids). Poster and
 *  feed share the SAME generic room, so even the fallback never shows one room's still over another
 *  room's clip — it is consistent, not a cross-room mismatch. */
const GENERIC_MEDIA = { feed: SCAN_FEED, poster: SCAN_BG.living };

/** Resolve the scan poster + feed for a zone from a single source (they can't diverge). `fallback` is
 *  true when no dedicated entry exists (generic room used) — surfaced so DEV can warn rather than
 *  silently substituting another room. */
export function zoneMedia(zoneId: string): { feed: string; poster: string; fallback: boolean } {
  const m = ZONE_MEDIA[zoneId];
  return m ? { ...m, fallback: false } : { ...GENERIC_MEDIA, fallback: true };
}
