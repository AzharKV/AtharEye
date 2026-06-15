# OptiSync PWA — Handoff Context (for a fresh Claude chat)

Paste this whole document as the first message in a new Claude conversation, then describe the feature you want to build. It gives Claude the full picture of the codebase without scanning.

---

## 1. What this is

**OptiSync** (formerly *Athar Eye*) — an **iPhone-LiDAR + BIM construction progress & coverage reporting** app for small/medium UK (Scotland-first) contractors, by **Athar Robotics**. Tagline: **Scan. Compare. Prove.**

The product is a **visually production-grade, functionally *simulated*, offline, installable PWA**. Navigation, screens, data, and the scan→report→share *flow* are real; the LiDAR scan, BIM upload, coverage maths, auth, payments and networking are **faked**.

The repo is now **PWA-only** — the old `reactnative/`, `flutter/`, and `ios-native/` comparison ports have been **deleted**.

Design system: light **"Blueprint + teal"**.

- Canvas `#EDF1F6` · surface `#FFFFFF` · ink `#1B2A3D` · navy `#1E3A66` · blue `#2D6FB0` · teal `#18837E` · amber `#B5781A` · red `#C0492F`
- **Inter** typeface with tabular numerals
- White headers with a **2px navy underline**
- Real OptiSync logo at `pwa/public/optisync-logo.jpeg`
- Rules: **no fake status bar**; opaque push/pop transitions; coverage = donut + zone bars; issues = severity dots (red/amber/grey); status = dot+label; stage = tinted pill. **One teal hero per screen; grey for structure; red only for missing/critical.**

> **Port, don't redesign.** The visual design is locked in `design-source/`. Match look/layout/motion/brand exactly; log deliberate deviations in `SPEC.md` §15.

---

## 2. Stack

| | |
|---|---|
| Bundler / dev | **Vite 5.4** (`build.target: es2020`, `cssTarget: safari15`) |
| UI | **React 18.3** + **TypeScript 5.6 (strict)** |
| PWA | **vite-plugin-pwa 0.21** (Workbox `generateSW`, `registerType: autoUpdate`) |
| PDF | **jspdf 4.2** (lazy-imported) |
| Animation | **CSS transforms/opacity only** (`@keyframes` in `index.html`). No framer-motion. |
| State | React `useState` + Context. **No Redux, no router.** |
| Navigation | Custom push/pop stack navigator + tab host (no URL routing). |
| Lint/format | ESLint 8 + Prettier (2-space, single quotes, semis, trailing commas, width 100) |

Runtime deps are only `react`, `react-dom`, `jspdf`. Keep the bundle lean — no new runtime deps without a clear reason.

### Commands (run inside `pwa/`)
```bash
npm install
npm run dev        # vite dev server (HMR; SW disabled in dev)
npm run build      # tsc --noEmit && vite build  →  dist/   (the deliverable)
npm run preview    # serve built dist/ (SW active) — test offline/install HERE, not dev
npm run lint       # eslint, --max-warnings 0   (must pass clean)
npm run typecheck  # tsc --noEmit
npm run format     # prettier --write
```
The deliverable is a static **`pwa/dist/`** deployed to Netlify/Vercel/Cloudflare (root, HTTPS), then iPhone Safari → Add to Home Screen.

---

## 3. State model — IMPORTANT

**State is in-memory only.** Seeded from the typed data module (`src/data.ts`) into `lib/store`'s `StoreProvider`/`useStore`, mutated through a **single path**: `update(id, recipe, {rollup})`.

**There is NO localStorage for core state — a refresh resets to baseline.** This is intentional (clean demo reset). Do not add localStorage persistence for project/scan/issue state. (localStorage is used only for trivial UI prefs like install-banner dismissal.)

> Note: `pwa/ARCHITECTURE.md` §5/§7/§9 still contain stale *Athar-Eye-era* prose describing localStorage persistence and a dark `#0C0F12` theme. **That is outdated.** The current truth is: in-memory store + light Blueprint+teal. Trust this document and `CLAUDE.md` over those stale sections.

---

## 4. Source tree (`pwa/src/`, ~7.3k LOC)

```
main.tsx                  createRoot + StrictMode + ErrorBoundary; registerSW (auto-update)
App.tsx                   AppRoot: tab host + per-tab Navigators + scan modal + InstallPrompt +
                          GlobalToast; holds processing jobs (jobs: Record<string, ProcessingJob>)
theme.ts                  Light Blueprint+teal tokens: T + STATUS + SEV (4-level, w/ definitions) + STAGE
types.ts                  Domain model (see §5)
data.ts                   Dataset selector: SEED = SEED_HOUSE (default) or SEED_LEGACY (VITE_DATASET=legacy)
data.house.ts             SEED_HOUSE — single Bonaly Terrace renovation, opens at 22% (the default demo)
data.legacy.ts            SEED_LEGACY — original 6-project portfolio
vite-env.d.ts             Vite + vite-plugin-pwa client types

lib/
  store.ts                In-memory StoreProvider/useStore; single mutation path update(id,fn,{rollup})
  reports.ts              rollup, stateAt, reportFor + staged prose; sev() rank (Critical0/Major1/Minor2/Cosmetic3)
  processing.ts           PROCESSING_MS=60_000; processingStage(elapsedMs); ProcessingJob interface
  pdf.ts                  generatePdf (detailed multipage) + generateClientPdf (single-page A4 summary); lazy jsPDF
  photos.ts               p-index → asset path; ZONE_MEDIA + zoneMedia(zoneId) single-source per-zone scan media
  format.ts               roundM(area,pct), teamName(initials)
  haptic.ts               haptic() — navigator.vibrate(8), best-effort

hooks/
  useCountUp.ts           Timer-driven count-up for donut/ring
  useBackLayer.ts         Wire system/browser Back to dismiss a boolean overlay (scan/sheet)

components/
  Icon.tsx                Icon (IconName union from ICONS map), TypeGlyph
  Brand.tsx               Mark (real product icon), Wordmark
  primitives.tsx          Donut/Ring, ZoneBars/Bar, Sparkline, SevDot, Status/Stage pills, Card, Chips,
                          Button (disabled prop), KeyVal (tight prop), Gallery + Lightbox, ScreenHeader, mono
  Sheet.tsx               Bottom sheet + form fields
  ShareSheet.tsx          Export sheet: 2 report types — "Client progress summary" (generateClientPdf,
                          1 page) + "Detailed site report" (generatePdf, multipage). Web Share API + download fallback
  InstallPrompt.tsx       Add-to-home-screen banner (Android/desktop native + iOS hint)
  ErrorBoundary.tsx       Branded crash recovery screen

navigation/
  Navigator.tsx           push/pop stack per tab; useNav() → {push,pop,popToRoot,canPop}; CSS-keyframe transitions
  backstack.ts            System/gesture Back ↔ in-memory nav via History API
  PushHeader.tsx          Back bar + RoundBtn
  TabBar.tsx              Bottom tabs: Projects · Reports · [navy Scan button] · Account
  AppActions.tsx          useAppActions() → startScan/addProject/deleteProject/goToReports/projects +
                          startProcessing/isZoneProcessing/processingStageFor

screens/
  Projects.tsx            List/search/filters/swipe-delete
  ProjectDetail.tsx       Timeline scrubber (signature #1) + zone rows; Processing badges pulse amber;
                          sevRank handles 4-level severity
  NewProject.tsx          Create-project form
  Reports.tsx             Report document (the hero screen): scope toggle Whole-project/By-zone + zone chips;
                          layout order donut → severity tally → zone bars → findings; FindingCard w/ inline
                          thumbnail; NsrRollup (project) / NsrTable (zone); ProcessingBanner for pending zones
  Issues.tsx              Issues list (reached from the Reports tab header)
  Account.tsx             Account hub
  Plans.tsx               Subscription tiers + add-ons
  Team.tsx                Team members
  Settings.tsx            Settings; About credits Athar Robotics
  editors.tsx             Bottom-sheet CRUD editors + ScanLog/ScanDetail
  scan/ScanFlow.tsx       Scan flow (signature #2), lazy chunk: project picker → area select → aim →
                          capture → process → result ("Capture complete · {zone} · Upload & finish")
```

---

## 5. Data model (`types.ts`)

```ts
Project { id, name, type, location, pct, status, area /*m²*/, client,
          zones: Zone[], issues: Issue[], scans: Scan[], bim?, trades?, team?, captures? }

Zone   { id, name, pct, ..., works?: NsrItem[] }     // works = non-standard-rate items

Issue  { id, severity: Severity, title, zoneId?,
         appear, clear,                              // coverage thresholds — drive the scrubber reveal
         location_detail, finding, measured, tolerance, deviation, impact, action,
         responsible, thumbnail }                    // full finding fields

Scan   { id, status: ScanStatus, zoneId?, startedAt?, ... }

ScanStatus = 'Uploading' | 'Uploaded' | 'Processing' | 'Ready' | 'Failed'
Severity   = 'Critical' | 'Major' | 'Minor' | 'Cosmetic'   // 4-level
NsrUnit    = 'LM' | 'SM' | 'NO'
NsrStatus  = 'Outstanding' | 'In progress' | 'Done'
NsrItem    { code, description, unit, qty, status }
AppData    { projects: Project[], ... }
```

### Default seed — `SEED_HOUSE` (Bonaly Terrace)
Single whole-house renovation, **opens early-stage at 22%** (84 m² GIA). **4 scanned zones** (z2–z5), **2 scans** (baseline + first progress, both `status:'Ready'`). 2 seeded issues with full finding fields:
- **RV-01** — Major / Bedroom 1 wall **17 mm out of plumb**
- **RV-02** — Minor / Kitchen partition **38 mm off BIM**

### Alt seed — `SEED_LEGACY` (`VITE_DATASET=legacy`)
Original 6-project portfolio, all 28 scans `status:'Ready'`. Use these edge cases for testing: **Leith 100% Complete** (empty issues / empty state), **Stirling 28–39%** (red massing), commercial no-photo projects, **Hyndland "Needs review"**.

A DEV-mode rollup assertion runs over the active seed (`console.assert` in `data.ts`); every non-legacy zone id must have a `ZONE_MEDIA` entry.

---

## 6. Signature interactions

1. **Timeline scrubber** (`ProjectDetail.tsx`) — drag across coverage 0→100; issues appear/clear at their `appear`/`clear` thresholds; nodes pulse amber while a zone is Processing.
2. **Scan flow** (`scan/ScanFlow.tsx`) — project picker → area select → aim (feed paused on poster frame + reticle/grid) → Begin (plays the zone clip once from `currentTime=0` over a point-cloud canvas) → process → result. Feed `src` and `poster` both come from one `zoneMedia(zone.id)` entry so the aim freeze and played clip are always the same room. No autoplay/loop — behaves like a real one-shot capture. BIM alignment is server-side; deltas are revealed when the scan reaches `Ready`.

---

## 7. PWA behavior

- **Manifest** (`vite.config.ts`): `id`/`start_url`/`scope` = `/`, `display: standalone`, `orientation: portrait`. Light theme/background. Assumes a **root deploy**.
- **Service worker** (Workbox `generateSW`, `autoUpdate`): precaches the app shell (incl. the lazy ScanFlow chunk) → full offline after first load. Runtime CacheFirst rules cache gallery photos (`optisync-images`) and scan videos (`optisync-media`) so they work offline after first view.
- **SW is disabled in `npm run dev`** — dev refresh is always fresh. Test offline/install only via `npm run preview` (or a real deploy).
- A standalone install needs **HTTPS** (or localhost). `env(safe-area-inset-*)` drives header/tab/scan safe-area padding (non-zero only in standalone).

---

## 8. Working conventions (mandatory)

- **Port, don't redesign** — match `design-source/` exactly; deliberate deviations logged in `SPEC.md` §15.
- **Strict TypeScript**, ESLint clean (`--max-warnings 0`), Prettier formatted.
- **No new runtime deps** without good reason (CSS transforms/opacity + canvas for animation).
- All mutations go through `lib/store`'s `update(id, fn, {rollup})`. Read live data via `useAppActions().projects` — never import `data.ts` directly in screens.
- Add tokens in `theme.ts` (`T`) — never hardcode a hex elsewhere. Add icons to the `ICONS` map in `Icon.tsx`.
- **Docs are part of every change (same commit):** update the affected section of `pwa/ARCHITECTURE.md` + bump its *Last updated*; log product/decision/behavior changes in `SPEC.md` §15 (bump version); update `CLAUDE.md` if repo structure/commands/rules change.
- **Commit per logical step**, conventional messages (`feat(pwa):`, `fix(pwa):`, `docs(spec):`). End commit messages with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- Test as you go: dev for visuals, `npm run preview` for SW/offline/install. Cover the edge cases (Leith 100% / Stirling low %, no-photo projects, empty states, scrubber 0→100, scan→report→share, small/large iPhone sizes).

---

## 9. Current status

All **9 build phases complete** on branch `feature/optisync-phase-1`: light Blueprint+teal redesign, all 12 screens, full CRUD, in-memory store, both signature interactions, reports + share/export (incl. PDF), account cluster (Account/Issues/Plans/Team/Settings), real logo + generated PWA icons, offline asset caching. `tsc` + ESLint + `vite build` all clean; verified in browser preview.

**Only remaining manual step:** deploy `pwa/dist/` and verify Add-to-Home-Screen / standalone launch / offline on a real iPhone.

### Key docs in the repo
- `CLAUDE.md` — working guide / rules (authoritative on conventions)
- `SPEC.md` — product/data/competitive/design source of truth + decision log (§15); design system in §6
- `pwa/ARCHITECTURE.md` — full engineering reference (⚠️ later sections still carry stale Athar-Eye prose — see §3 above)
- `design-source/` — locked OptiSync design export (tokens + `app/*.jsx` + prototype)

---

**To start building:** tell Claude the feature you want, point it at `pwa/ARCHITECTURE.md` + `SPEC.md` §15 for current detail, and remind it to keep state in-memory, port from `design-source/`, and update the docs in the same commit.
```
