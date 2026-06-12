# CLAUDE.md — working guide for OptiSync

Guidance for any AI/dev session in this repo. Read this first, then the doc that fits the task.

## What this is
**OptiSync** (formerly *Athar Eye*) — an iPhone-LiDAR + BIM construction **progress & coverage**
reporting app for small/medium UK (Scotland-first) contractors, by **Athar Robotics**. Tagline:
**Scan. Compare. Prove.** The **product is the PWA in `pwa/`** — a visually production-grade,
functionally simulated, offline, installable app on the light **"Blueprint + teal"** design system.
The `reactnative/` · `flutter/` · `ios-native/` directories are **frozen Athar-Eye-era comparison
ports** (the prior dark design) — kept for reference, not current OptiSync.

## Repo layout
```
SPEC.md                 Product/data/competitive/design source of truth + decision log (§15)
CLAUDE_CODE_BUILD.md    Original Athar-Eye engineering brief (native-feel acceptance criteria §4 still apply)
design-source/          Locked OptiSync Claude Design export — the visual reference (PORT, don't redesign)
README.md               Monorepo overview
pwa/                    ✅ OptiSync — the production PWA (Vite + React 18 + TS + vite-plugin-pwa)  ← the product
  ARCHITECTURE.md       ⭐ Full engineering reference for the PWA codebase (read this, don't scan)
reactnative/            🧊 Frozen legacy — Athar-Eye-era React Native + Expo port (prior dark design)
flutter/                🧊 Frozen legacy — Athar-Eye-era Flutter comparison port
ios-native/             🧊 Frozen legacy — Athar-Eye-era SwiftUI comparison port
```

## Read in this order
1. **`pwa/ARCHITECTURE.md`** — the full codebase view (structure, every module, data, PWA behavior).
   **Start here for any PWA work** — it exists so you don't scan the project.
2. **`SPEC.md`** — product facts, the design system (§6), and the **decision log (§15)**. For the
   OptiSync PWA the authoritative data/report/photo/visual detail is the handoff bundle referenced in
   §15 v1.14. Binding context — don't invent product facts.
3. **`design-source/`** — the locked OptiSync Claude Design export (tokens, `app/*.jsx`, prototype).

## Commands (run inside `pwa/`)
```bash
npm install
npm run dev        # dev server (HMR)
npm run build      # tsc --noEmit && vite build  →  dist/  (the deliverable)
npm run preview    # serve built dist/ (SW active) — test offline/install here, not dev
npm run lint       # must pass clean (--max-warnings 0)
```
The deliverable is a static **`pwa/dist/`** deployed to Netlify/Vercel/Cloudflare (root, HTTPS), then
iPhone **Safari → Add to Home Screen**.

*(The `reactnative/` · `flutter/` · `ios-native/` ports are frozen Athar-Eye-era artifacts; they are not
part of the OptiSync build and aren't maintained here.)*

## How to work here
- **Port, don't redesign.** The design in `design-source/` is locked. Match look, layout, motion and
  brand exactly: light **Blueprint + teal** (canvas `#EDF1F6` · surface `#FFFFFF` · ink `#1B2A3D` ·
  navy `#1E3A66` · blue `#2D6FB0` · teal `#18837E` · amber `#B5781A` · red `#C0492F`), **Inter** type
  with tabular numerals, white headers with a **2px navy underline**, and the real OptiSync logo
  (`pwa/public/optisync-logo.jpeg`). Deviations must be deliberate and logged in `SPEC.md` §15.
- **Design rules** (SPEC §6): no fake status bar; opaque push/pop transitions; coverage = donut + zone
  bars; issues = severity dots (red/amber/grey); status = dot+label; stage = tinted pill.
- **Strict TypeScript**, ESLint clean (`--max-warnings 0`), Prettier formatting. No new runtime deps
  without reason (keep the bundle lean; CSS transforms/opacity + canvas for animation).
- **State is in-memory**, seeded from the typed data module (`src/data.ts`) via `lib/store`'s single
  mutation path `update(id, fn, {rollup})`. **A refresh resets to baseline** — no localStorage for core
  state (the intended demo reset).
- **Commit per logical step** with conventional messages (`feat(pwa):`, `fix(pwa):`, `docs(spec):`…).
  End commit messages with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- **Test as you go**: dev for visuals, `npm run preview` for SW/offline/install. Cover the edge cases
  (Leith 100% / Stirling 28%, the commercial no-photo projects, Hyndland "Needs review", empty states,
  the scrubber 0→100 ladder, the scan→report→share flow, small/large iPhone sizes).

## 📌 Keep the docs updated (mandatory)
On **every** PWA change, in the **same commit**:
1. Update the affected section of **`pwa/ARCHITECTURE.md`** and bump its **Last updated** date.
2. Log product/decision/behavior changes in **`SPEC.md` §15** (bump the version).
3. If repo structure, commands, or working rules change, update **this file**.

A change where the code moved but the docs didn't is **incomplete**. These docs are the "full view" so
future sessions don't have to re-scan the project — keep them true.

## Current status
**OptiSync PWA — all 9 build phases complete** (branch `feature/optisync-phase-1`; see `SPEC.md` §15
v1.14 and `pwa/ARCHITECTURE.md`): the light Blueprint+teal redesign with all 12 screens, full CRUD, the
in-memory store, both signature interactions (timeline scrubber + video/point-cloud scan flow), the
reports + share/export sheet, the account cluster (Issues/Plans/Team/Settings), the real logo + generated
PWA icons, and offline asset caching. `tsc` + ESLint + `vite build` clean; verified in the browser
preview. **Remaining manual step:** deploy `pwa/dist/` + verify Add-to-Home-Screen / standalone / offline
on a real iPhone.

**Frozen legacy ports** — `reactnative/` (Expo SDK 56), `flutter/` (3.41), `ios-native/` (SwiftUI) were
built against the **previous Athar Eye** dark design and have **not** been re-ported to OptiSync. They
remain for reference only. To migrate them later, follow **`OPTISYNC_PORTING_GUIDE.md`** (the Athar
Eye → OptiSync delta, with the PWA as the reference implementation).
