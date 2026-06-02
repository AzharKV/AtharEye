# Athar Eye PWA — Architecture & Engineering Reference

> **Living document — the single source of truth for the PWA codebase.**
> Read this to get the full picture without scanning the project. **Keep it
> updated on every change** (see [Maintaining this doc](#maintaining-this-doc)).
>
> Companion docs (do not duplicate — cross-reference):
> - [`../SPEC.md`](../SPEC.md) — product, data, competitive analysis, design system, **decision log (§15)**.
> - [`../CLAUDE_CODE_BUILD.md`](../CLAUDE_CODE_BUILD.md) — engineering brief + native-feel acceptance criteria (§4).
> - [`../design-source/`](../design-source/) — the locked Claude Design export (visual reference; **ported, not reinvented**).
> - [`../CLAUDE.md`](../CLAUDE.md) — how an AI/dev session should work in this repo.

**Last updated:** 2026-06-02 · **Status:** Phase A complete (production PWA, verified) + localStorage
persistence, system Back button, install prompt, and a room-wireframe scan visual. ~6k LOC in `src/`.

---

## 1. What this is

An installable, offline-capable PWA that looks and feels like a native iOS app. It's a
**functionally simulated** pitch artifact for **Athar Eye** (iPhone-LiDAR + BIM construction
progress reporting). Navigation, screens, data and the scan→report→share *flow* are real;
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
    main.tsx                  createRoot + StrictMode + ErrorBoundary; removes #initial-splash.
    App.tsx                   Root: App (responsive container), Splash, ScanFallback, AppRoot
                              (tab host + per-tab Navigators + scan modal + InstallPrompt).
    theme.ts                  Design tokens T, STATUS, SEV; ProjectStatus/Severity types.
    types.ts                  Domain interfaces (Project, Room, Issue, BimModel, SubPlan…).
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
      InstallPrompt.tsx       Add-to-home-screen banner (Android/desktop native + iOS hint).
      ErrorBoundary.tsx       Branded crash recovery screen.
    navigation/
      backstack.ts            System/gesture Back-button ↔ in-memory nav integration (History API).
      Navigator.tsx           Navigator (push/pop stack, iOS transitions, Back-integrated) + Screen + useNav.
      PushHeader.tsx          PushHeader (back bar) + RoundBtn.
      TabBar.tsx              Bottom tab bar: Projects · Reports · [Scan] · Settings.
      AppActions.tsx          AppActionsCtx + useAppActions (startScan/addProject/projects/goToReports).
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
- **`main.tsx`** → mounts `<App/>` inside `<StrictMode><ErrorBoundary>`; on first frame fades out and removes `#initial-splash` (the static HTML splash) so there's never a blank flash.
- **`App.tsx`**
  - `App` — responsive container. `floating = innerWidth > 480 || innerHeight > 1024`. **Phone → fullscreen** (`width/height: 100%`, no chrome). **Desktop/tablet → centered 440×924 card** (`border-radius: 30`, hairline border, shadow) on a dark radial bg. **No device bezel, no fake status bar** (the OS/browser draws its own).
  - `Splash` — 1.7s; inner content `splashRise`, then `splashOut` fade at 1.4s. Renders `Mark` + `Wordmark` + tagline.
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
- **`Projects.tsx`** — `ProjectsList` (portfolio summary ring + counts, filter chips, skeleton list, cards → `ProjectDetail`), `ProjectDetail` (scroll-aware floating header, parallax `BannerBlueprint`, progress `Ring` card, BIM model card + `BimUploadSheet`, coverage-by-area `Bar`s, team `Avatar`s, CTAs → `actions.startScan` / push `ReportDetail`, and **Delete project** → `DeleteConfirm` action sheet → `actions.deleteProject` (persisted)), `NewProject` (form + `Field`s + BIM attach → builds a `Project` and `actions.addProject`). Local: `DeleteConfirm`, `BimUploadSheet` (faked upload→align), `Field`, `BIM_SAMPLES`, `PTYPES`.
- **`Reports.tsx`** — `ReportsList` (filter chips, skeleton, cards → `ReportDetail`), `ReportDetail` (branded sticky header, **count-up `Donut`**, Covered/Missing m², `IsoMassing`, meta table, coverage-by-room, open-issues with severity badges, `ShareSheet` + PDF `Toast`).
- **`Settings.tsx`** — `Settings` (profile row → `Profile`, subscription card + usage `Bar` → `Plans`, scanning/app `Row`s + `Toggle`s, footer lockup), `Profile` (avatar, stats, details), `Plans` (tier cards, add-ons, switch `Toast`). Local: `Toggle`, `Row`.
- **`scan/ScanFlow.tsx`** (lazy chunk) — controller stepping `select → home → active → processing → result`. `ActiveScan` draws a faint **perspective room wireframe** (floor grid + walls) + the point cloud on a **single `requestAnimationFrame` loop** (DPR capped at 2, cancelled on unmount, time-based progress over `DUR=7000`); bottom controls (stats · progress · stop) are a single safe-area-aware **column** (no overlap). `Processing` spinner uses **CSS `spin`** (no per-frame React); on completion it calls `onScanComplete(project)` (persists the scan). `ScanResult` count-up donut + stats; CTAs → `onViewReport` / share / done. Complete projects are excluded from `ScanSelect`.

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

Authoritative list lives in **`SPEC.md` §15** (v1.2 / v1.3). Summary of code-affecting ones:
- In-app brand `Mark` = the **real product icon** (not the design-source's separate eye glyph) — owner direction.
- **No desktop device-frame/fake status bar** — responsive web (fullscreen phone / centered card desktop). `IOSDevice` deleted.
- **Skeleton loaders** added (`useReady`) — not in the static design but required by §4.3.
- **Static first-paint splash** in `index.html`.
- **Single rAF** scan canvas + **CSS-spin** processing (perf hardening over the design's `setInterval`).
- **Deterministic SVG pattern IDs** (no `Math.random`) in `BlueprintTile`/`IsoMassing`.
- **System Back button integrated** (`backstack.ts`) with the in-memory nav via the History API — Android/browser Back pops screens / closes the scan & sheets instead of leaving the app. Not in the design-source.
- **Persisted to localStorage** (`lib/store.ts`) seeded from `data.ts` — created projects + recorded scans survive reload; no backend. (Firebase/etc. is the future multi-device path.)
- **Scan visual:** a faint perspective **room wireframe** (floor grid + walls) renders under the point cloud so the scan reads as reconstructing a room (generated, not the device camera — no permission prompt).
- ESLint relaxed for the design's idiomatic `cond && fn()` statements; Fast-Refresh co-location hint off.

---

## 10. Verified test matrix

Verified on small (375), large (428) and desktop (centered card) — dev + production preview:
all 6 projects incl. 100% Leith (empty state) & 39% Stirling (red massing/bars); Projects
list/detail/New-project→BIM→create→empty-state→**persists across reload** (localStorage);
Reports list/detail (count-up, massing, issues);
Settings/Profile/Plans; full scan select→guidance→**live point cloud**→processing→result→
view-report/share/done; share sheet + PDF/share toasts; filters; cancel-scan; install banner;
**system Back button** (pops one screen at a time, closes the scan modal, closes sheets without
popping the screen beneath, coexists with in-app back — no double-pop); SW active + full precache
(offline). Lint + build clean.

**Not yet device-tested** (needs the physical iPhone + an HTTPS deploy): actual WebAPK/standalone
launch + real Airplane-mode relaunch on hardware.

---

## 11. How to make common changes

| Task | Where |
|---|---|
| Change demo data | `SPEC.md` §10 **first**, then `src/data.ts` (keep verbatim) |
| Add/scale a design token | `src/theme.ts` (`T`) — never hardcode a token's hex elsewhere |
| Add an icon | add a path to `ICONS` in `src/components/Icon.tsx` (name auto-joins `IconName`) |
| Add a screen | create in `src/screens/`, push via `useNav().push(<X/>)` from a parent; lazy-load if heavy |
| Add a root tab | `TabBar.tsx` (`TabName` + item), `App.tsx` `AppRoot` (new `Navigator` pane) |
| Change brand icon | replace `design-source/app/icon-512.png` → regenerate `public/` icons (see below) |
| Edit the manifest | `vite.config.ts` → `VitePWA({ manifest })`; rebuild; re-verify `dist/manifest.webmanifest` |
| Tune install prompt | `src/components/InstallPrompt.tsx` (timing, copy, dismiss window) |
| Adjust safe-area gap | header `padding` / `Screen` `padTop` (`calc(env(safe-area-inset-top) + N)`) |

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
- Scan visual is a generated room wireframe + point cloud, **not** the live device camera (deliberate — no permission prompt; a real-camera `getUserMedia` background is an optional future toggle).
- No GitHub Actions CI yet (repo has no remote). Optional: lint+build on push.
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
