# OptiSync Porting Guide — migrating the legacy ports (React Native / Flutter / iOS) from Athar Eye

**Purpose.** The PWA in [`pwa/`](pwa/) is the finished **OptiSync** reference. The three native ports
(`reactnative/`, `flutter/`, `ios-native/`) were built from the **old Athar Eye** PWA (dark navy + green)
and are currently **frozen**. This doc is the **delta** — everything that changed in the redesign — so a
future session can bring any port to OptiSync by applying the *same* changes, using the PWA as the
ground-truth implementation.

> **Do this AFTER the PWA is finalised** (i.e. after the current bug-fix pass). More PWA changes may add
> to this delta — re-check `pwa/ARCHITECTURE.md` + `SPEC.md` §15 before porting, and treat the latest
> `pwa/src` as the source of truth where this guide and the code disagree.

## How to use this
1. Read `pwa/ARCHITECTURE.md` (the OptiSync module map) and `SPEC.md` §6 + §15 v1.14 (design system + the
   redesign decision log).
2. The locked visual reference is [`design-source/`](design-source/) — the OptiSync Claude Design export
   (`tokens/`, `app/*.jsx`, `components/`, the prototype HTML). Port it, don't redesign.
3. For each port, work bottom-up in this order: **tokens → typography → data model → store → primitives →
   screens → signature interactions → brand/icons**. Each section below maps to the PWA file that is the
   reference implementation.

---

## 1. Brand & naming  (ref: `pwa/src/components/Brand.tsx`, `pwa/index.html`, `pwa/public/optisync-logo.jpeg`)
- **Athar Eye → OptiSync** everywhere: app name, display name, wordmark, splash, store metadata.
- Wordmark: "Opti" in ink + "**Sync**" in teal. Tagline: **Scan. Compare. Prove.**
- Logo / app icon: the real product logo is `pwa/public/optisync-logo.jpeg` (drone + scanning-eye over a
  building, light). Regenerate each platform's icon set from it (RN: `app.json` icon + adaptive; Flutter:
  `flutter_launcher_icons`; iOS: `Assets.xcassets/AppIcon`). In-app "Mark" = that image (rounded), not a
  drawn glyph.
- Bundle/app IDs that say `atharrobotics`/`AtharEye` can stay (don't break signing) but display strings
  become OptiSync. In-app **contractor account = Cairn Refurbishment Ltd** (not "Optisync Ltd").

## 2. Design tokens — old DARK → new LIGHT "Blueprint + teal"  (ref: `design-source/tokens/colors.css`, `pwa/src/theme.ts`)
Replace the old dark navy+green palette with the locked light palette:

| Token | New (OptiSync) | Was (Athar Eye, remove) |
|---|---|---|
| canvas / app bg | `#EDF1F6` | dark `#0C0F12` / `#0B1622` |
| surface (cards) | `#FFFFFF` | `#15191E` / `#11212F` |
| hairline | `#D8E1EC` | `rgba(255,255,255,.07)` |
| ink (text) | `#1B2A3D` | `#F4F6F8` |
| muted | `#64748B` | `#8A949E` |
| navy (primary/nav/structure) | `#1E3A66` | — |
| blue (in-progress) | `#2D6FB0` | — |
| teal (verified/complete/brand) | `#18837E` | old teal `#14B8C0` |
| teal-bright (live scan) | `#2FB6AD` | `#45D6DD` |
| amber (needs review) | `#B5781A` | `#E8A33D` |
| red (critical) | `#C0492F` | `#E5484D` |
| minor-severity grey | `#9AA7B6` | — |
| tints | `navy-08 rgba(30,58,102,.08)`, `blue .12`, `teal-10 .10`, `amber .12`, `red .10` | — |
| radii | card `14`, sm `10`, lg `20` | — |
| card shadow | `0 1px 2px rgba(27,42,61,.04), 0 1px 1px rgba(27,42,61,.03)` | dark glows |

The theme is now **light only** (the old dark-only note is reversed). Status bar style → dark text on light.

## 3. Typography  (ref: `design-source/tokens/fonts.css`, `pwa/index.html`)
- System font → **Inter** (self-host the variable font; RN: `expo-font`/`@expo-google-fonts/inter`;
  Flutter: `google_fonts` or bundled; iOS: bundle Inter or use a close system fallback).
- All figures (%, coverage, dates, counts) use **tabular + lining numerals** (`tnum`/`lnum`) — the `.mono`
  treatment. Headings: tight negative tracking.

## 4. Data model & store  (ref: `pwa/src/types.ts`, `pwa/src/data.ts`, `pwa/src/lib/store.ts`, `pwa/src/lib/reports.ts`, `pwa/src/lib/photos.ts`)
- **Old model** (`{ pct, rooms[], scans:number, … }`) → **new rich model**: `Project` with `sector`,
  `stage` (Early/Mid/Complete), `overall_coverage`, `status`, `depth` (deep/light), `bim`, `team[]`,
  `trades[]`, `zones[]` (area + coverage + stage), `issues[]`, `scans[]` (history), `captures[]`. **Issues
  carry `appear`/`clear` coverage thresholds** (drive the scrubber). Plus top-level `company`, `user`,
  `team` (org roster + roles), `subscription`, `settings`.
- **6 UK projects, verbatim** — Stirling (Early 28%), Morningside (Mid 62%, hero), Leith (Complete 100%),
  Hyndland (Mid 74%, Needs review), Marischal (Aberdeen 91%, commercial, no photos), City Quay (Dundee
  82%, commercial, no photos). Source: `OPTISYNC_DATA_SPEC.md` (in the handoff bundle) — `pwa/src/data.ts`
  is the transcribed truth. Reports prose: `OPTISYNC_DEEP_REPORTS.md`. Photos: `OPTISYNC_PHOTO_MAP.md`.
- **Store**: localStorage / AsyncStorage → **in-memory, seeded from the data module, reset on relaunch**
  (no persistence for core state — the intended demo reset). Single mutation path
  `update(id, recipe, {rollup})` where rollup recomputes the **area-weighted** overall coverage from zones.

## 5. Primitives  (ref: `pwa/src/components/primitives.tsx`, `design-source/components/`)
- **Donut**: navy ring on a `navy-08` track; centre number is **ink** (not coloured) with a small `%`
  superscript; "verified" label. Mini-donut for list rows.
- **Zone bars**: navy fill, **teal at 100%** (drop any blue-for-low variant); ink % label (teal at 100).
- **Sparkline**: navy line + soft navy **area gradient** + dots (teal end dot, white stroke).
- **StageChip**: tinted pill + leading dot — Early (navy/navy-08), Mid-build (blue), Complete (teal).
- **StatusPill**: **dot + coloured label, no background** — On track/Complete teal, Needs review amber,
  Behind red.
- **Severity dot**: Critical red / Major amber / Minor `#9AA7B6`.
- **Card**: white, hairline, radius 14, the subtle shadow above.

## 6. Screens — old set → the 12 OptiSync screens  (ref: `pwa/src/screens/*`, `design-source/app/screens-*.jsx`)
- **Header**: iOS large-title → **22px white app-bar with a 2px navy underline** (list screens host
  search/filter rows inside it). Pushed screens: back chevron + centred title + the same underline.
- **Tab bar**: → **Projects · Reports · Scan · Account**; the Scan action is a **navy button** (not a teal
  FAB); active tab icon sits in a `navy-08` pill.
- **Projects row**: mini-donut + name + **stage chip top-right** + **pin-icon location** (area, postcode) +
  **status dot below**; search + stage filters (All · Needs review[amber] · Early · Mid · Complete);
  swipe-to-delete; + New.
- **Project detail**: overview (donut + facts) · **timeline scrubber** · View log → per-scan report ·
  zones · issues (open + closed) · captures · BIM · team · trades · **full CRUD** (latest scan only).
- **Scan flow**: select → Aim → Capturing → Processing → Result; writes a real scan.
- **Progress report**: header meta · donut + summary · zone bars · open issues · coverage-over-time
  sparkline · BIM · captures (deep only; commercial = none) · next actions · prepared-by footer
  (Cairn Refurbishment Ltd · A. Patel). Deep vs light/commercial variants.
- **Reports history · Issues/snags · Plans/billing · Account · Team & access · Settings · Share/export.**

## 7. The two signature interactions
- **Timeline scrubber** (ref: `pwa/src/lib/reports.ts` `stateAt()` + `screens/ProjectDetail.tsx`): tapping/
  dragging a scan point re-renders the report state at that coverage — zones rescaled proportionally,
  issues open where `appear ≤ c < clear`, stage-appropriate captures, donut + bars crossfade (<200ms).
  Leith scrubs 0→22→48→71→94→100, snags clear to 0 at handover. **Port the `stateAt`/`reportFor` logic
  verbatim** — it's pure and platform-agnostic.
- **Scan flow** (ref: `pwa/src/screens/scan/ScanFlow.tsx`): a looping room-walkthrough video as the live
  feed with a LiDAR **point cloud accreting on top**; four **timer-driven** beats; completing writes a new
  scan (Morningside 62→66, Kitchen +6%). The native ports already have point-cloud renderers
  (RN `react-native-skia`, Flutter `CustomPainter`, SwiftUI `Canvas`) — keep those, recolour to teal-bright
  → navy, add the beats + the real-scan write. Native can use the **real camera** behind the overlay.

## 8. Brand assets / icons / offline
- Generate platform icons from `optisync-logo.jpeg`. Wire it into splash + in-app Mark + report header
  uses the OptiSync wordmark.
- PWA-only: SW runtime-caches photos + videos. (Native bundles assets, so n/a.)

## 9. Per-port checklist (apply 1–8)
- **`reactnative/`** — `theme.ts`, `types.ts`, `data.ts`, the `app/` screens, `components/`, `app.json`
  (name/icon/splash), the Skia point cloud colours, expo-font Inter. It's currently a 1:1 port, so aim for
  full parity with `pwa/src`.
- **`flutter/`** — `lib/theme.dart`, `lib/data.dart`, `lib/widgets/*`, `lib/screens/*`, `lib/main.dart`,
  app name + launcher icons, `google_fonts` Inter. (Currently a hero-screen subset — decide subset vs full.)
- **`ios-native/`** — `Sources/Theme.swift`, `Data.swift`, `Components.swift`, the screen files,
  `project.yml` (display name), AppIcon set, Inter. (Currently a hero-screen subset.)

## 10. Authoritative sources
`pwa/src` (reference implementation) · `pwa/ARCHITECTURE.md` · `design-source/` (locked design) ·
`SPEC.md` §6 (design system) + §15 v1.14 (redesign decisions) · the OptiSync handoff docs
(`OPTISYNC_DATA_SPEC.md`, `OPTISYNC_DEEP_REPORTS.md`, `OPTISYNC_PHOTO_MAP.md`,
`OPTISYNC_VISUALS_PRESENTATION.md`). Where this guide and `pwa/src` disagree, **`pwa/src` wins.**
