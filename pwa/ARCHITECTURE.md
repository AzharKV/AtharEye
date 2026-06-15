# OptiSync PWA — Architecture & Engineering Reference

> **Living document — the single source of truth for the PWA codebase.**
> Read this to get the full picture without scanning the project. **Keep it
> updated on every change** (see [Maintaining this doc](#maintaining-this-doc)).
>
> Companion docs (do not duplicate — cross-reference):
> - [`../SPEC.md`](../SPEC.md) — product, data, competitive analysis, design system, **decision log (§15)**.
> - [`../CLAUDE_CODE_BUILD.md`](../CLAUDE_CODE_BUILD.md) — engineering brief + native-feel acceptance criteria (§4).
> - [`../design-source/`](../design-source/) — the locked Claude Design export (visual reference; **ported, not reinvented**).
> - [`../CLAUDE.md`](../CLAUDE.md) — how an AI/dev session should work in this repo.

**Last updated:** 2026-06-15 (SPEC §15 v1.23) · **Status:** **OptiSync redesign in progress** (branch
`feature/optisync-phase-1`). The PWA is being rebuilt from *Athar Eye* (dark) into **OptiSync** (light
"Blueprint + teal") per the handoff bundle — see `../SPEC.md` §15 v1.21 (report rebuild: UX reorder + zone/project depth split + NSR works breakdown + PDF improvements — builds on v1.20 async scan lifecycle).

**Done — all 9 phases.** rebrand shell; **data layer**; light **tokens + primitives**; in-memory
**store**; **portfolio + report document**; **timeline scrubber (signature #1) + full CRUD**; **scan flow
(signature #2)**; **reports** (history/per-scan/variants/share-export); the **account cluster** (Account
hub, Issues, Plans, Team, Settings); and **phase 9 — real logo + PWA icons + design reconciliation**:
the supplied OptiSync logo (`public/optisync-logo.jpeg`) drives the in-app Mark, the static + React
splash, and the generated icons (apple-touch / 180 / 192 / 512 / maskable / favicon via `sips`); SW
runtime-caches gallery photos + scan videos (CacheFirst) so they work offline after first view.

**Design reconciliation (against the recovered Claude Design export, `app/*.jsx` + `tokens/`):** tokens
verified (only `teal-bright`/`grey-sev` tweaked); donut centre → ink on a `navy-08` track; sparkline →
area-gradient + dotted; StageChip → tinted pill + dot, StatusPill → dot + label (no bg); ZoneBars →
navy/teal only; Card → r14 + subtler shadow; **list headers → the 22px white app-bar with the 2px navy
underline** (was a 32px large title); **tab bar → navy scan button + active `navy-08` pills** (was a teal
FAB); the **Projects row → stage chip top-right + pin-location + status dot below**. Verified in preview
against the design's `projects.png`.

**Post-build bug-fix + parity pass (SPEC §15 v1.15, 12 Jun 2026):** nine manual-test issues fixed against
`design-source/`, verified in the browser preview — (1) the **tab bar + install banner now render only on
the three tab roots** (pushed screens are full-screen), via a new `Navigator` `onDepth` signal that
`AppRoot` uses to hide the bar when the active tab's depth > 1; (2) detail/report **footers** use the
design's transparent→canvas **gradient fade** and are pinned with **`position: absolute; bottom: 0`** (not
`sticky`, which floated mid-content in the centered desktop-card layout); (3) the **launch splash + manifest
`background_color` are white** to match `theme-color`/headers (status-bar seam fix); (4) the **scrubber**
rebuilt to a continuous rail + absolute nodes (line no longer kinks at the selected node); (5) the detail
**edit** button is a pencil icon + zone rows show a pencil affordance; (6) **project captures open a
full-screen lightbox**; (7) the **scan flow re-ported to the prototype** (light project picker → light
**area select** → aim/Begin capture → capture → process → result; frozen from→to delta written on finish;
zone-specific stills, not the video); (8) **Issues moved from Account → the Reports tab header**; (9)
**Settings → About** credits Athar Robotics instead of the demo company.

**Remaining manual step:** deploy `pwa/dist/` (Netlify) + verify Add-to-Home-Screen / standalone launch +
offline on a real iPhone.

### OptiSync module map (current)
- **`types.ts`** — domain model. **v1.23:** `Company` gains optional `monogram` (account-avatar override); `Project` gains optional `contractor` + `preparedBy` (report identity, replacing hardcoded "Cairn"/"J. Mackay" in `reports.ts`/`Reports.tsx`/`pdf.ts`); `Scan` gains a frozen snapshot — `prevCoverage` / `zonePrev` / `zoneNew` / `newFindings[]` / `resolvedFindings[]` — read by the report's "Changes since last scan" block. — `Project` (zones/issues/scans/bim/trades/team/captures), `Issue`
  (with `appear`/`clear` coverage thresholds for the scrubber; full finding fields: `location_detail`, `finding`, `measured`, `tolerance`, `deviation`, `impact`, `action`, `responsible`, `thumbnail`), `Scan` (now carries `status: ScanStatus`, `zoneId?`, `startedAt?`), `ScanStatus = 'Uploading' | 'Uploaded' | 'Processing' | 'Ready' | 'Failed'`, `Severity` (4-level: Critical/Major/Minor/Cosmetic), `AppData`. **v1.21:** `NsrUnit = 'LM' | 'SM' | 'NO'`, `NsrStatus = 'Outstanding' | 'In progress' | 'Done'`, `NsrItem { code, description, unit, qty, status }` added; `Zone` extended with `works?: NsrItem[]`.
- **`data.ts`** — seed selector + `DEMO_NOW`. **`VITE_DEMO`** chooses the recording preset and wins over everything; **`VITE_DATASET=legacy`** is a separate escape hatch consulted only when `VITE_DEMO` is unset. `(none)`/`client` → `SEED_CLIENT`, `optisync` → `SEED_OPTISYNC`, `house` → `SEED_HOUSE`, `legacy` → `SEED_LEGACY`. Also exports **`DEMO_NOW`** (ISO `YYYY-MM-DD`) — a single configurable "now" for *displayed* timestamps (`client` = `2026-06-12`, `optisync` = `2026-06-15`, `house`/`legacy` = `2026-06-13`); internal timing (`Date.now() - startedAt`) stays real. DEV rollup + ZONE_MEDIA assertions run over the active seed (rollup guards empty seeds).
- **`data.client.ts`** *(new)* — `SEED_CLIENT`, the **default** recording build: **CK Group of Construction** account identity (Clint John · Director) + the **Tabley Refurbishment** project (Tabley Rd, Liverpool L15 · contractor Cairn Refurbishment Ltd · prepared by Emanuel · Site Supervisor · BIM `tabley_Refurb_R3.ifc` LOD 300). One site-team member (Emanuel). Opens early-stage at 22% (4 zones z2–z5, baseline + progress scans dated ≤ 12 Jun with frozen per-zone snapshots; RV-01/RV-02 findings).
- **`data.optisync.ts`** *(new)* — `SEED_OPTISYNC` (`VITE_DEMO=optisync`): **Athar Robotics / OptiSync** account identity, **no projects** (empty state) — the demo creates a project live on camera; the live rear camera + BIM-mismatch result are wired in `ScanFlow` behind the same preset flag.
- **`data.house.ts`** — `SEED_HOUSE` (`VITE_DEMO=house`): single Bonaly Terrace renovation project — opens **early-stage at 22%** (84 m² whole-house GIA, **4 scanned zones** z2–z5, **2 scans** = baseline + first progress, 2 issues with full finding fields: **RV-01** Major/Bedroom 1 wall 17 mm out of plumb, **RV-02** Minor/Kitchen partition 38 mm off BIM; both scans `status: 'Ready'`). Kept for edge-case testing.
- **`data.legacy.ts`** — `SEED_LEGACY`: the original 6-project portfolio. All 28 scans carry `status: 'Ready'`. Loaded with `VITE_DATASET=legacy`.
- **`lib/photos.ts`** — p-index → asset path; **`ZONE_MEDIA`** + **`zoneMedia(zoneId)`** — single-source per-zone scan media (v1.19).
- **`lib/processing.ts`** *(new v1.20, retimed v1.23)* — `PROCESSING_MS = 300_000` (**5 min**); `processingStage(elapsedMs)` → staged label (`Queued → Aligning to BIM → Generating report`), thresholds are fractions of the window spread across the full 5 min; `ProcessingJob` interface (projectId/zoneId/scanId/startedAt). Jobs live in `AppRoot` state, not the domain store.
- **`lib/pdf.ts`** *(new v1.20, updated v1.22)* — **`generatePdf`** (detailed multipage) + **`generateClientPdf`** (single-page client summary, new v1.22). Both lazy-import jsPDF. **v1.22 fixes:** `displaySummary` computes zone-specific exec-summary prose for zone-scope exports (was project-level text); `toDataUrl` now uses Canvas decode → `canvas.toDataURL('image/jpeg', 0.85)` (was `fetch+FileReader`) — eliminates black-box rendering in `addImage`. `generateClientPdf`: A4 single page — header, project name + donut, teal rule, headline sentence, severity tally, compact findings list (severity dot + title + zone); no NSR/methodology/full fields.
- **`lib/reports.ts`** — `rollup`, `stateAt`, `reportFor` + staged prose. `sev()` severity rank updated to 4-level (Critical=0/Major=1/Minor=2/Cosmetic=3).
- **`lib/store.ts`** — in-memory `StoreProvider`/`useStore`; single mutation path `update(id, recipe, {rollup})`. **No localStorage** — refresh re-seeds.
- **`theme.ts`** — light Blueprint+teal `T` + `STATUS`/`SEV`/`STAGE`. `SEV` now includes `definition` text per level; 4th level `Cosmetic` added.
- **`components/primitives.tsx`** — Donut/Ring, ZoneBars/Bar, Sparkline, SevDot, Status/Stage pills, Card, Chips, **Button** (now has `disabled` prop), **KeyVal** (now has `tight` prop), Gallery + Lightbox, ScreenHeader, mono.
- **`navigation/`** — Navigator/backstack/Screen; `TabBar`; `PushHeader`; **`AppActions`** (v1.20: adds `startProcessing`, `isZoneProcessing`, `processingStageFor`).
- **`components/Sheet.tsx`** — bottom sheet + form fields.
- **`components/ShareSheet.tsx`** *(rewritten v1.20, updated v1.22)* — **v1.22:** `REPORT_TYPES` cut from 4 to 2 (removed Coverage snapshot + Issues list). "Client progress summary" calls `generateClientPdf` (single page); "Detailed site report" calls `generatePdf` (full multipage). `runExport` branches on `sel`. Web Share API + download fallback + AbortError handling unchanged.
- **`App.tsx`** *(updated v1.20)* — `AppRoot` holds `jobs: Record<string, ProcessingJob>` + `toastMsg`; `useEffect` timer (2 s tick) flips scan to `Ready` when `Date.now() - startedAt >= PROCESSING_MS`, clears job, fires toast. `GlobalToast` floats above tab bar (teal checkCircle, auto-hides 3 s).
- **`screens/editors.tsx`** — bottom-sheet CRUD editors + ScanLog/ScanDetail.
- **`screens/`** — `Projects` (list/search/filters/swipe-delete), `NewProject`, **`ProjectDetail`** (scrubber nodes pulse amber when Processing; zone rows show amber "Processing" badge + amber coverage bar; `sevRank` handles 4-level severity), **`Reports`** *(v1.21 major refactor)*: scope toggle "Whole project / By zone" + zone chips; **new layout order: donut → severity tally → zone bars → findings** above fold; meta in collapsible `CollapsibleSection`; `FindingCard` shows `thumbnail` scan image inline; **`ChangesSinceLastScan`** *(v1.23)* renders above the findings register in both scopes — previous→new coverage Δ + findings raised/resolved by the latest scan (reads the frozen `Scan` snapshot; considers Ready + Processing scans so a just-recorded live scan shows its delta immediately; hidden for a first-time/baseline report); `NsrRollup` (project scope: X/Y complete + per-zone counts); `NsrTable` (zone scope: full code/description/unit/qty/status table); zone scope adds `ZoneEvidenceFrame` (poster from `zoneMedia`); pending = slim `ProcessingBanner` when zone has prior data (not blank screen); `NsrItem`/`NsrStatus` from `types.ts`; `Account`, `Issues`, `Plans`, `Team`, `Settings`, **`scan/ScanFlow`** *(v1.22 fix)*: `step === 'result'` now shows "Capture complete · {zone} · ready to upload" + "Upload & finish" only — no BIM tick, no zone %, no delta tiles (BIM alignment is server-side; deltas revealed at Ready). `DeltaTile` helper removed.

*Sections below still describe Athar-Eye internals; they are revised as the later phases land.*

*(Prior status — Phase A Athar Eye, verified: responsive web, localStorage persistence, search, system
Back, install prompt, SW auto-update, live-camera scan + room wireframe, OS-matched splash. ~6k LOC.)*

---

## 1. What this is

An installable, offline-capable PWA that looks and feels like a native iOS app. It's a
**functionally simulated** product artifact for **OptiSync** (iPhone-LiDAR + BIM construction
progress & coverage reporting; tagline *Scan. Compare. Prove.*). Navigation, screens, data and the
scan→report→share *flow* are real;
the LiDAR scan, BIM upload, coverage maths, auth, payments and networking are faked. See
`SPEC.md` §4 for the real-vs-faked boundary.

**Definition of done (met):** `cd pwa && npm install && npm run build` → static `dist/` that
installs to the home screen, runs fullscreen offline, and passes every §4 criterion.

---

## 2. Stack & commands

| | |
|---|---|
| Bundler / dev | **Vite 5.4** (`build.target: es2020`, `cssTarget: safari15`) |
| UI | **React 18.3.1** + **TypeScript 5.6 (strict)** |
| PWA | **vite-plugin-pwa 0.21** (Workbox `generateSW`, `registerType: autoUpdate`) |
| Animation | **CSS transforms/opacity only** (keyframes in `index.html`). No framer-motion. |
| State | React `useState` + Context. No Redux/router. |
| Navigation | The design's own push/pop stack navigator + tab host. |
| Lint/format | ESLint 8 (`.eslintrc.cjs`) + Prettier (`.prettierrc.json`) |

```bash
cd pwa
npm install
npm run dev        # vite dev server (HMR; SW disabled in dev)
npm run build      # tsc --noEmit && vite build  →  dist/   (the deliverable)
npm run preview    # serve the built dist/ (SW active) — use to test offline/install
npm run lint       # eslint, --max-warnings 0
npm run typecheck  # tsc --noEmit
npm run format     # prettier --write
```

Preview servers are also wired in `../.claude/launch.json` (`pwa` = dev:5173, `pwa-preview` = 4173).

---

## 3. Directory map

Every `src/` file with its role. **Sizes are guidance, not contracts.**

```
pwa/
  index.html                  HTML shell: native-feel meta, global CSS + @keyframes, static
                              first-paint splash (real icon). vite-plugin-pwa injects the
                              manifest <link> + registerSW. No external/CDN requests.
  vite.config.ts              Vite + VitePWA config: the web manifest + Workbox precache.
  tsconfig.json               Single strict config (no project references).
  .eslintrc.cjs               TS + react-hooks rules (short-circuit calls allowed).
  .prettierrc.json            2-space, single quotes, semis, trailing commas, width 100.
  public/                     icon-180/192/512.png, icon-maskable-512.png, apple-touch-icon,
                              favicon — copied to dist root, precached.
  src/
    main.tsx                  createRoot + StrictMode + ErrorBoundary; registerSW (auto-update); removes #initial-splash.
    App.tsx                   Root: App (responsive container), Splash, ScanFallback, AppRoot
                              (tab host + per-tab Navigators + scan modal + InstallPrompt).
    vite-env.d.ts             Vite + vite-plugin-pwa client type references.
    theme.ts                  Design tokens (T, STATUS, SEV); imports ProjectStatus/Severity from types.ts.
    types.ts                  Domain types: ProjectStatus, Severity, Project, Room, Issue, BimModel, SubPlan…
    data.ts                   SPEC §10 demo data: DATA, PLANS/planFor, BIM/bimFor, SUB_PLANS, SUB_ADDONS.
    lib/
      haptic.ts               haptic() — navigator.vibrate(8), best-effort.
      format.ts               roundM(area,pct), teamName(initials).
      store.ts                localStorage persistence (load/save projects), seeded from data.ts.
    hooks/
      useCountUp.ts           Timer-driven count-up (donut/ring), respects a `run` gate.
      useReady.ts             App-shell skeleton gate; caches "settled" per key (instant on revisit).
      useBackLayer.ts         Make the system/browser Back button dismiss a boolean overlay (scan/sheet).
    components/
      Icon.tsx                Icon (line-icon set, IconName union), TypeGlyph, TYPE_GLYPH.
      Brand.tsx               Mark (the real product app icon, icon-192.png), Wordmark.
      primitives.tsx          Avatar, StatusBadge, Bar, Ring, Donut, BlueprintTile,
                              BannerBlueprint, Chips, Button, Card, SectionLabel, ScreenHeader.
      IsoMassing.tsx          Isometric BIM-vs-as-built massing; isoFills, isoColorFor.
      ShareSheet.tsx          ShareSheet (iOS action sheet) + Toast (auto-hide).
      Skeleton.tsx            SkeletonBlock/Card/List (transform-only shimmer).
      SearchBar.tsx           Inline iOS-style search field (used by the list screens).
      InstallPrompt.tsx       Add-to-home-screen banner (Android/desktop native + iOS hint).
      ErrorBoundary.tsx       Branded crash recovery screen.
    navigation/
      backstack.ts            System/gesture Back-button ↔ in-memory nav integration (History API).
      Navigator.tsx           Navigator (push/pop stack, iOS transitions, Back-integrated) + Screen + useNav.
      PushHeader.tsx          PushHeader (back bar) + RoundBtn.
      TabBar.tsx              Bottom tab bar: Projects · Reports · [Scan] · Settings.
      AppActions.tsx          AppActionsCtx + useAppActions (startScan/addProject/deleteProject/onScanComplete/projects/goToReports).
    screens/
      Projects.tsx            ProjectsList, ProjectDetail, NewProject (+ local BimUploadSheet, Field).
      Reports.tsx             ReportsList, ReportDetail (the hero screen).
      Settings.tsx            Settings, Profile, Plans (+ local Toggle, Row).
      scan/ScanFlow.tsx       ScanFlow (lazy chunk) + ScanSelect/ScanHome/ActiveScan/Processing/
                              ScanResult/CameraBG/makePoints.
```

---

## 4. Module reference (exports & behavior)

### Entry & shell
- **`main.tsx`** → `registerSW({ immediate: true })` (auto-update, see §7); mounts `<App/>` inside `<StrictMode><ErrorBoundary>`; on first frame fades out and removes `#initial-splash` (the static HTML splash) so there's never a blank flash.
- **`App.tsx`**
  - `App` — responsive container. `floating = innerWidth > 480 || innerHeight > 1024`. **Phone → fullscreen** (`width/height: 100%`, no chrome). **Desktop/tablet → centered 440×924 card** (`border-radius: 30`, hairline border, shadow) on a dark radial bg. **No device bezel, no fake status bar** (the OS/browser draws its own).
  - `Splash` — ~1.7s (fade-out at 1.4s). Solid `#0C0F12` bg with the `Mark` (112px) **centered** and the `Wordmark` + tagline absolutely positioned below — matches the OS native splash so the launch hand-off has no icon jump (see §9).
  - `ScanFallback` — branded `Suspense` fallback (pulsing `Mark`) while the scan chunk loads.
  - `AppRoot` — tab host. State: `tab`, `scan` (`{project}|null`), `projects`. Three persistent `Navigator`s (Projects/Reports/Settings) shown/hidden via `display`. Renders `TabBar` + `InstallPrompt` when not scanning; mounts lazy `ScanFlow` when `scan` set. `viewReport(p)` closes scan, switches to Reports, pushes `ReportDetail`.

### Navigation (`navigation/`)
- **`Navigator({ root, navRef })`** — one push/pop stack per tab. `useNav()` → `{ push(el), pop(), popToRoot(), canPop }`. `navRef` exposes an imperative `{push,pop,popToRoot,depth}` handle (used by `viewReport`). Animations are CSS keyframes (`navEnter/navExit/navToUnder/navFromUnder`, transform-only); a 380ms `lock` debounces double-taps; a dim overlay darkens the screen beneath.
- **`Screen({ padTop, padBottom, scrollRef, children })`** — scroll wrapper (`overflow-y:auto`, momentum, `overscroll-behavior:contain`, hidden bars). **`padTop` default = `calc(env(safe-area-inset-top) + 14px)`** (small gap in browser, clears the status bar/island when standalone). Detail screens pass explicit numeric `padTop` (0/92).
- **`PushHeader` / `RoundBtn`** — translucent back bar (top pad `calc(env(safe-area-inset-top) + 12px)`) + round icon button. Both have `aria-label`s.
- **`TabBar`** — sticky bottom bar, `paddingBottom: max(24px, env(safe-area-inset-bottom))`; center Scan is the emphasized teal action.
- **`AppActions`** — `useAppActions()` → `{ startScan(project?), addProject(p), deleteProject(id), onScanComplete(project), projects, goToReports() }`. `projects` is the **live, persisted** working set (every screen reads it from here, not from `data.ts`).
- **System/browser Back button** (`backstack.ts` + `useBackLayer`) — the app navigates in-memory (no URL routing), so the Android hardware/gesture Back button (and the browser Back button) is wired in via the History API: every open dismissible layer (pushed screen, scan modal, sheet) holds **one history entry**, and Back closes the **top-most** one — pops a screen / closes the scan / closes a sheet — instead of leaving the PWA. At the root, Back falls through (exits), the correct native behavior. `Navigator` integrates this for screen push/pop; `useBackLayer(open, onClose)` does it for boolean overlays (scan modal, `ShareSheet`, `BimUploadSheet`). In-app back controls and the system Back share one code path, so they never double-pop. (iOS standalone PWAs have no Back button/edge-swipe — users rely on the in-app back controls.)

### Components (`components/`)
- **`Icon`** — `name: IconName` (union of the keys in `ICONS`), `size/stroke/color/style`. Inline SVG; **add new icons to the `ICONS` map**. `TypeGlyph` + `TYPE_GLYPH` map project type → blueprint glyph.
- **`Mark`** — renders **the real product app icon** (`${import.meta.env.BASE_URL}icon-192.png`) as a rounded squircle (`borderRadius ≈ size*0.22`). Used by every brand lockup. `Wordmark` — "Athar**Eye**" text.
- **`primitives`** — the design-system atoms. Discipline: **one teal hero per screen**, everything structural grey, red only for missing/critical. Key ones: `Donut` (hero, count-up via `value`), `Ring` (mini, `accent` for hero), `Bar` (grey default; pass `color` for behind-rooms red), `StatusBadge`, `Button` (`primary`/`icon`/`full`), `Card` (`pressable`/`onClick`), `Chips`, `ScreenHeader`, `SectionLabel`, `BlueprintTile`/`BannerBlueprint` (branded placeholders — never fake photos).
- **`IsoMassing({ rooms, fills })`** — isometric floor-plan massing. `isoColorFor(pct)`: ≥70 built (teal), ≥45 partial (grey via `isoFills`), else missing (red, hatched). Pass `fills={isoFills}` for the report's BIM-vs-as-built legend.
- **`ShareSheet` / `Toast`** — iOS-style share sheet (report type × send-to target → `onShared(msg)`) and an auto-hiding toast (2.2s). Both animate via the shared keyframes; safe-area bottom padding.
- **`Skeleton*`** — app-shell loaders; shimmer is a transform-only `translateX` overlay (§4.2).
- **`InstallPrompt`** — see [§7](#7-pwa--install-behavior).
- **`ErrorBoundary`** — catches render errors, shows a branded "reload" screen.

### Data & helpers
- **`theme.ts`** — `T` (all colors + fonts), `STATUS` (status → dot color + label), `SEV` (severity → color).
- **`data.ts`** — see [§5](#5-data-model). All values are **SPEC §10 verbatim** — change there first if the spec changes.
- **`hooks`** — `useCountUp(target, dur?, run?)`, `useReady(key, delay?)`.

### Screens (`screens/`)
- **`Projects.tsx`** — `ProjectsList` (portfolio summary ring + counts, filter chips, **search** (`SearchBar` → live filter by name/location/type/client), skeleton list, cards → `ProjectDetail`), `ProjectDetail` (scroll-aware floating header, parallax `BannerBlueprint`, progress `Ring` card, BIM model card + `BimUploadSheet`, coverage-by-area `Bar`s, team `Avatar`s, CTAs → `actions.startScan` / push `ReportDetail`, and **Delete project** → `DeleteConfirm` action sheet → `actions.deleteProject` (persisted)), `NewProject` (form + `Field`s + BIM attach → builds a `Project` and `actions.addProject`). Local: `DeleteConfirm`, `BimUploadSheet` (faked upload→align), `Field`, `BIM_SAMPLES`, `PTYPES`.
- **`Reports.tsx`** — `ReportsList` (filter chips, **search**, skeleton, cards → `ReportDetail`), `ReportDetail` (branded sticky header, **count-up `Donut`**, Covered/Missing m², `IsoMassing`, meta table, coverage-by-room, open-issues with severity badges, `ShareSheet` + PDF `Toast`).
- **`Settings.tsx`** — `Settings` (profile row → `Profile`, subscription card + usage `Bar` → `Plans`, scanning/app `Row`s + `Toggle`s, footer lockup), `Profile` (avatar, stats, details), `Plans` (tier cards, add-ons, switch `Toast`). Local: `Toggle`, `Row`.
- **`scan/ScanFlow.tsx`** (lazy chunk) — prototype flow: light **project picker** → light **area select** → aim → capture → process → result. Feed element is a `<video ref src={media.feed} poster={media.poster} muted playsInline preload="auto">` where `media = zoneMedia(zone.id)` — **one source for both `src` and `poster`**, so the aim freeze and the played clip are always the same room (the v1.18 split-source bug, where a by-name poster and a by-id feed could diverge — e.g. Bathroom froze on the bathroom still but played the living-room clip). It has **no `autoPlay`, no `loop`**, so it behaves like a real capture: **aim** holds the feed paused on its first frame (poster) with the aim grid, reticle, a "Hold steady" indicator and an optional `scanDrift` stabilising scale (toggle `AIM_DRIFT`); **Begin** runs `currentTime = 0; play()` and starts a fresh point cloud; **capture** shows the progress bar + a **"Capture complete"** stop button; capture ends on whichever fires first — the clip's `ended`, the wall-clock sweep reaching the clip's duration, the stop tap, or `CAP_SAFETY_MS` — then `pause()`s on the **last frame** (never reset to poster, never looped) for process → result. The sweep is wall-clock-driven over the clip length (robust if a device throttles the muted feed). Per-step filter: `process` → dim+desaturate; `result` → brightness `.7`; default → `.86`. Delta frozen at capture start; scan written to store on user's finish action (not on entering Result) so from→to numbers stay stable. **v1.22 (FIX A):** `step === 'result'` shows only "Capture complete · {zone} · ready to upload" + "Upload & finish" — no BIM tick, no deltas (alignment is server-side). Unused `DeltaTile` removed.

---

## 5. Data model

Types in `types.ts`; values in `data.ts` (**SPEC §10 verbatim**, UK/Scotland, £, metric).

```ts
Project { id, name, type, location, pct, status: 'On Track'|'Needs Review'|'Complete',
          area /*m²*/, client, scans, team: string[], last, rooms: Room[], issues: Issue[], bim? }
Room   { name, pct }              Issue { t, loc, sev: 'high'|'med'|'low' }
BimModel { file, size, ver, uploaded, elements }
PlanRoom { name, x, y, w, h, pct } // iso massing grid cell
SubPlan { id, name, price, period, tagline, current?, features[] }
```

**6 projects** (use for tests): `p1` Byres Road 74% Needs Review · `p2` Morningside 58% · `p3` Union St 91% · `p4` Dundee 82% Needs Review · `p5` Stirling **39%** (red massing) · `p6` Leith **100% Complete** (empty issues). User: James Mackay (Site Supervisor). Sub: Small Business £99/mo, 3/5 projects. `scanStats`: 1.84 M points, ±21 mm.

> `PLANS`/`planFor(id)` gives the iso-massing grid (only `p1`, `p5` are bespoke; others fall back). `BIM`/`bimFor(id)` gives each project's linked model.

**Persistence (`lib/store.ts`).** `data.ts` is the **seed** (typed, editable single source). On
first run the app seeds from it, then persists the live `projects` to `localStorage`
(key `athar-eye:data`, with a `SEED_VERSION`) — so **created projects and recorded scans survive a
reload / relaunch**. Every screen reads the live set via `useAppActions().projects` (never `data.ts`
directly), so the data is centralized and manipulable. A completed scan calls
`onScanComplete(project)` → bumps `scans` + `last` (and gives a fresh 0% project a starter
coverage). **Reset:** bump `SEED_VERSION`, or run `localStorage.removeItem('athar-eye:data')`. This
is the seam where a backend (e.g. Firebase, for multi-device sync) would later slot in.

---

## 6. Design system

Tokens (`theme.ts`, from SPEC §6.2): bg `#0C0F12`, surface `#15191E`/`#1B2026`, text `#F4F6F8`,
muted `#8A949E`, **accent (teal) `#14B8C0`**, accent2 `#45D6DD`, warning `#E8A33D`, danger `#E5484D`.
Font: system (`-apple-system`). **Rule: one teal hero per screen; grey for structure; red only
for missing/critical.** Motion 220–340ms, ease `cubic-bezier(.32,.72,0,1)`. No fake status bar;
opaque push/pop. All `@keyframes` live in `index.html` (`navEnter/Exit/ToUnder/FromUnder`,
`sheetUp/scrimIn/toastUp/modalUp`, `spin/pulse/fadeIn/fadeUp/splashRise/splashOut/shimmerX`).

Brand: `Mark` = the real app icon; `Wordmark` = "Athar**Eye**". Icons live in `public/`
(180/192/512 + maskable-512 + apple-touch), generated from `design-source/app/icon-512.png`.

---

## 7. PWA & install behavior

**Manifest** (`vite.config.ts` → `dist/manifest.webmanifest`): `id`/`start_url`/`scope` = `/`,
`display: standalone` + `display_override: [standalone]`, `orientation: portrait`,
theme/bg `#0C0F12`, icons 192 + 512 (`any`) + maskable 512. **Assumes a root deploy.**

**Service worker** (Workbox `generateSW`, `registerType: autoUpdate`): precaches the app shell —
`index.html`, the main JS bundle, **the lazy `ScanFlow` chunk**, manifest, all icons (~17 entries).
`navigateFallback: index.html`. → full **offline / Airplane-mode** support after first load.
(There is no separate CSS file — all styles are inline, baked into JS + `index.html`.)

**Updates / why a refresh may show old code.** Because the SW serves the app from cache (that's
what makes it offline/installable), a plain refresh after a rebuild/deploy can serve the *cached old
JS*. `main.tsx` calls `registerSW({ immediate: true })` (from `virtual:pwa-register`) so a new
version is fetched and the app **auto-reloads to the latest on the next visit/refresh** (one
refresh, not two; localStorage data is untouched). In **`npm run dev` the SW is disabled**
(`devOptions.enabled: false`) so dev refresh is always fresh. To force-clear during manual testing:
DevTools → Application → Service Workers → *Update on reload* / Unregister, or clear site data.
> ⚠️ Don't confuse the **SW code cache** (above — affects whether new *code* loads) with
> **localStorage data** (`lib/store.ts` — your projects). They're independent: clearing site data
> wipes both; `localStorage.removeItem('athar-eye:data')` only re-seeds the *data*.

**Install (`InstallPrompt.tsx`):** shown only in a browser (never standalone), after ~2.8s,
dismissible (7-day, `localStorage`). **Android/desktop Chromium** → captures `beforeinstallprompt`
and an **Install** button triggers the real install (→ standalone WebAPK). **iOS Safari** (no
programmatic install) → shows the *Share → Add to Home Screen* instruction.

**Standalone vs browser:** the app detects nothing about framing beyond viewport size (`floating`).
Installed/standalone runs fullscreen; the **`env(safe-area-inset-*)`** values (only non-zero in
standalone) drive header/tab/scan safe-area padding. In a browser those insets are 0, so the
small base paddings keep it clean (no top gap).

> ⚠️ A standalone install needs **HTTPS** (or localhost). Over plain http / a LAN IP, Android
> Chrome only makes a browser shortcut. Deploy to Netlify/Vercel/Cloudflare (auto-HTTPS).

---

## 8. Native-feel acceptance criteria (§4) — where each is met

| § | Criterion | Implementation |
|---|---|---|
| 4.1 | Fast first paint + instant relaunch | Static HTML splash; Workbox precache; main bundle ~65 KB gzip |
| 4.2 | 60fps (transform/opacity only) | CSS keyframes; rAF scan canvas; CSS-spin processing; transform shimmer. *(One-shot `Bar` width / `Donut` stroke-dasharray fills on load are from the locked design — not continuous motion.)* |
| 4.3 | No blank flashes | Static splash → React splash handoff; `useReady` skeleton lists |
| 4.4 | No tap delay | `viewport maximum-scale=1`, `touch-action: manipulation`, tap-highlight off, pointer press states |
| 4.5 | Native scroll | `-webkit-overflow-scrolling`, `overscroll-behavior: contain`, hidden bars |
| 4.6 | Safe areas | `viewport-fit=cover`; `calc(env(safe-area-inset-top)+base)` headers; `env(...-bottom)` tab bar/scan/sheets |
| 4.7 | Offline | SW precache of shell + lazy scan chunk |
| 4.8 | Installable | Hardened manifest + apple-touch + `black-translucent` |
| 4.9 | Scan canvas | Single rAF, DPR ≤ 2, cancelled on unmount, time-based progress |
| 4.10 | Code-split | `React.lazy(ScanFlow)` + `Suspense` skeleton fallback |

---

## 9. Key decisions & deviations

Authoritative list lives in **`SPEC.md` §15** (v1.2 – v1.9). Summary of code-affecting ones:
- In-app brand `Mark` = the **real product icon** (not the design-source's separate eye glyph) — owner direction.
- **No desktop device-frame/fake status bar** — responsive web (fullscreen phone / centered card desktop). `IOSDevice` deleted.
- **Skeleton loaders** added (`useReady`) — not in the static design but required by §4.3.
- **Static first-paint splash** in `index.html`.
- **Single rAF** scan canvas + **CSS-spin** processing (perf hardening over the design's `setInterval`).
- **Deterministic SVG pattern IDs** (no `Math.random`) in `BlueprintTile`/`IsoMassing`.
- **System Back button integrated** (`backstack.ts`) with the in-memory nav via the History API — Android/browser Back pops screens / closes the scan & sheets instead of leaving the app. Not in the design-source.
- **Persisted to localStorage** (`lib/store.ts`) seeded from `data.ts` — created projects + recorded scans survive reload; no backend. (Firebase/etc. is the future multi-device path.)
- **Scan visual:** per-zone walkthrough **video** as the live feed, `muted playsInline preload="auto"`. **As of v1.18 the feed is a single user-triggered capture, not an autoplaying loop** — paused on its first frame in aim, played once from `currentTime = 0` on Begin, and frozen on its last frame on completion (clip `ended` / sweep-complete / "Capture complete" tap / safety net); it never loops. **As of v1.19 the `src` and `poster` come from one `zoneMedia(zone.id)` entry** (`ZONE_MEDIA` in `lib/photos.ts`) so the aim freeze and the played clip are always the same room — fixing the split-source mismatch (by-name poster vs by-id feed) where e.g. Bathroom played the living-room clip. The Bonaly demo has 4 zone-specific ~8 s mp4s + matching frame-0 `poster_*.jpg` (`scan_/poster_{living,kitchen,bathroom,bedroom}`, re-cut with clean in-room starts so freeze→play is seamless); an unmapped zone (e.g. legacy ids) gets a **consistent** generic room (`SCAN_FEED` + `SCAN_BG.living`), never a cross-room substitution, with a DEV warn. Posters are .jpg so the existing Workbox `optisync-images` runtime CacheFirst rule covers them (mp4s → `optisync-media`); both work offline after first view. A DEV `console.assert` in `data.ts` checks every non-legacy zone id has a `ZONE_MEDIA` entry. Grid overlay + point-cloud canvas layered on top. Zone coverages are area-weighted to match each project's `overall_coverage` (DEV-mode `console.assert` in `data.ts`).
- **Splash matches the OS splash:** the static HTML splash, the React `<Splash>`, and the manifest `background_color` all use solid `#0C0F12` with the icon centered, so the Android/iOS native launch splash hands off to the web splash with no icon jump/shrink.
- ESLint relaxed for the design's idiomatic `cond && fn()` statements; Fast-Refresh co-location hint off.

---

## 10. Verified test matrix

Verified on small (375), large (428) and desktop (centered card) — dev + production preview:
all 6 projects incl. 100% Leith (empty state) & 39% Stirling (red massing/bars); Projects
list/detail/New-project→BIM→create→empty-state→**persists across reload**, and **delete**
(confirm sheet → removed → persists); **search** on Projects & Reports (filters by
name/location/type/client; Back closes it); Reports list/detail (count-up, massing, issues);
Settings/Profile/Plans; full scan select→guidance→**live point cloud + camera**→processing→result→
view-report/share/done; share sheet + PDF/share toasts; filters; cancel-scan; install banner;
**system Back button** (pops one screen at a time, closes the scan modal, closes sheets without
popping the screen beneath, coexists with in-app back — no double-pop); SW active + full precache
(offline) + auto-update on refresh; OS-matched splash (icon centered, no jump). Lint + build clean.

**Not yet device-tested** (needs the physical iPhone + an HTTPS deploy): actual WebAPK/standalone
launch + real Airplane-mode relaunch on hardware.

---

## 11. How to make common changes

| Task | Where |
|---|---|
| Change demo data | `SPEC.md` §15 **first**, then `src/data.house.ts` (house) or `src/data.legacy.ts` (6-project) |
| Add/scale a design token | `src/theme.ts` (`T`) — never hardcode a token's hex elsewhere |
| Add an icon | add a path to `ICONS` in `src/components/Icon.tsx` (name auto-joins `IconName`) |
| Add a screen | create in `src/screens/`, push via `useNav().push(<X/>)` from a parent; lazy-load if heavy |
| Add a root tab | `TabBar.tsx` (`TabName` + item), `App.tsx` `AppRoot` (new `Navigator` pane) |
| Change brand icon | replace `design-source/app/icon-512.png` → regenerate `public/` icons (see below) |
| Edit the manifest | `vite.config.ts` → `VitePWA({ manifest })`; rebuild; re-verify `dist/manifest.webmanifest` |
| Tune install prompt | `src/components/InstallPrompt.tsx` (timing, copy, dismiss window) |
| Adjust safe-area gap | header `padding` / `Screen` `padTop` (`calc(env(safe-area-inset-top) + N)`) |
| Change search fields | the `searchList` filter in `ProjectsList`/`ReportsList` (currently name/location/type/client) |
| Persist a new data field | it's already in the `Project` shape → `lib/store.ts` saves the whole array; add a mutation action in `AppRoot` + `AppActions` |
| Reset persisted data | `localStorage.removeItem('athar-eye:data')`, or bump `SEED_VERSION` in `lib/store.ts` |
| Swap camera ↔ generated bg | `CameraBG` in `scan/ScanFlow.tsx` (remove `getUserMedia` to keep only the gradient) |
| Make updates a prompt not silent | `registerSW({ onNeedRefresh })` in `main.tsx` + a "reload" toast |

**Regenerate icons** (macOS `sips`):
```bash
SRC=design-source/app/icon-512.png
for sz in 512 192 180; do sips -s format png -z $sz $sz "$SRC" --out pwa/public/icon-$sz.png; done
cp pwa/public/icon-180.png pwa/public/apple-touch-icon.png
cp pwa/public/icon-192.png pwa/public/favicon.png
sips -z 410 410 "$SRC" --out /tmp/i.png && sips -p 512 512 --padColor 0C0F12 /tmp/i.png --out pwa/public/icon-maskable-512.png
```

---

## 12. Deploy

Build `npm run build` → publish **`dist/`** (static, self-contained, 0 external URLs) to
**Netlify / Vercel / Cloudflare Pages** (auto-HTTPS) or drag to **Netlify Drop**. SPA, in-memory
nav → no redirect rules needed. Share the **https://** URL → on iPhone open in Safari → the
install banner / Share → *Add to Home Screen*. Preload once on Wi-Fi, then it's offline.

---

## 13. Known limitations / backlog

- Persistence is **per-device** localStorage (no cross-device sync, no real auth). A real backend (Firebase/etc.) is the future path — `lib/store.ts` is the seam.
- Bumping `SEED_VERSION` to ship updated demo data **discards** any runtime additions on existing installs.
- Scan uses the **live rear camera** (`getUserMedia`) behind the point cloud — needs HTTPS + a one-time camera permission; gracefully falls back to a gradient if denied/unavailable.
- No GitHub Actions CI yet (the repo has a GitHub remote + PR flow, but no workflow). Optional: lint+build on push.
- Icon-only buttons have `aria-label`s; deeper a11y (focus traps in sheets, full keyboard nav) not audited.
- Subpath deploys would need a Vite `base` + manifest path changes (currently root-only).
- System Back across a **tab switch** is approximate: go deep in one tab, switch tabs, then press Back → it may pop the (now-hidden) other tab's screen / cost one extra press. The common cases (Back within a tab, close scan/sheet) are exact.
- A small monochrome mark for tiny placements is an option if the detailed icon ever feels busy.

---

## Maintaining this doc

**On every change to the PWA, update the relevant section here in the same commit**, and:
- log product/decision changes in **`SPEC.md` §15** (bump the version),
- bump **Last updated** at the top.
Treat "code changed but docs didn't" as an incomplete change. `CLAUDE.md` enforces this rule for AI/dev sessions.
