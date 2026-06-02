# CLAUDE.md — working guide for Athar Eye

Guidance for any AI/dev session in this repo. Read this first, then the doc that fits the task.

## What this is
**Athar Eye** — an iPhone-LiDAR + BIM construction **progress/coverage** reporting app for
small/medium UK (Scotland-first) contractors, by **Athar Robotics**. This is a **monorepo** of the
same product across stacks: a finished **PWA prototype** (the Wednesday pitch artifact — visually
production-grade, functionally simulated, offline, installable), a **React Native + Expo native app**
in `reactnative/` (an exact 1:1 copy of the PWA), and planned **native-iOS-Swift + Flutter** comparison
ports under `native/`.

## Repo layout
```
SPEC.md                 Product/data/competitive/design source of truth + decision log (§15)
CLAUDE_CODE_BUILD.md    Engineering brief + native-feel acceptance criteria (§4)
design-source/          Locked Claude Design export — the visual reference (PORT, don't redesign)
README.md               Monorepo overview
pwa/                    ✅ Phase A — the production PWA (Vite + React 18 + TS + vite-plugin-pwa)
  ARCHITECTURE.md       ⭐ Full engineering reference for the PWA codebase (read this, don't scan)
reactnative/            ✅ Phase B — native iOS app (React Native + Expo) — exact 1:1 copy of the PWA
  ARCHITECTURE.md       ⭐ Full engineering reference for the RN app (read this, don't scan)
flutter/                🔬 Comparison — Flutter port (tokens + data + hero screens; `flutter analyze` clean)
ios-native/             🔬 Comparison — native iOS SwiftUI port (tokens + data + hero screens; builds for simulator)
```

## Read in this order
1. **`pwa/ARCHITECTURE.md`** — the full codebase view (structure, every module, data, PWA behavior,
   "how to change X" recipes). **Start here for any PWA work** — it exists so you don't scan the project.
2. **`SPEC.md`** — for product facts, demo data (§10, verbatim), the design system (§6), and the
   **decision log (§15)**. Binding context — don't invent product facts; flag gaps in §14.
3. **`CLAUDE_CODE_BUILD.md`** — the native-feel acceptance criteria (§4) that define "done".

## Commands (run inside `pwa/`)
```bash
npm install
npm run dev        # dev server (HMR)
npm run build      # tsc --noEmit && vite build  →  dist/  (the deliverable)
npm run preview    # serve built dist/ (SW active) — test offline/install here, not dev
npm run lint       # must pass clean (--max-warnings 0)
```
The deliverable is a static **`pwa/dist/`** deployed to Netlify/Vercel/Cloudflare (root, HTTPS).

For the native app, run inside **`reactnative/`** with **Node 20 LTS** (`nvm use 20`):
```bash
npm install
npx expo start                 # Metro dev server
npx expo run:ios --device      # build + install on a connected iPhone (free Apple ID) — the deliverable
npx tsc --noEmit               # typecheck (strict, clean)
npx expo lint                  # eslint (clean)
```
For native work, **start with `reactnative/ARCHITECTURE.md`**. SDK 56 APIs differ from older Expo (see `reactnative/AGENTS.md`).

## How to work here
- **Port, don't redesign.** The design in `design-source/` is locked. Match look, layout, motion and
  brand exactly (navy `#0C0F12` + teal `#14B8C0`, the AtharEye wordmark, the real app icon). If a
  change deviates from the design, it must be a deliberate, logged decision.
- **Design rules** (SPEC §6.1): no fake status bar; opaque push/pop transitions; one teal hero per
  screen (grey for structure, red only for missing/critical); system font.
- **Strict TypeScript**, ESLint clean, Prettier formatting. No new runtime deps without reason
  (keep the bundle lean; CSS transforms/opacity for animation — no framer-motion).
- **Commit per logical step** with conventional messages (`feat(pwa):`, `fix(pwa):`, `docs(spec):`…).
  End commit messages with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- **Test as you go**: dev for visuals, `npm run preview` for SW/offline/install. Cover the edge cases
  (the 100% Leith and 39% Stirling projects, empty states, the full scan→report→share flow,
  small/large iPhone sizes).

## 📌 Keep the docs updated (mandatory)
On **every** change, in the **same commit**:
1. Update the affected section of **`pwa/ARCHITECTURE.md`** and bump its **Last updated** date.
2. Log product/decision/behavior changes in **`SPEC.md` §15** (bump the version).
3. If repo structure, commands, or working rules change, update **this file**.

A change where the code moved but the docs didn't is **incomplete**. These docs are the
"full view" so future sessions don't have to re-scan the project — keep them true. **For RN changes,
update `reactnative/ARCHITECTURE.md` (+ its date) and `SPEC.md` §15 in the same commit.**

## Current status
**Phase A PWA** — complete and verified (all §4 criteria; test matrix in `pwa/ARCHITECTURE.md` §10):
responsive web shell, localStorage persistence (create/delete/scan), search, system Back, install
prompt, SW auto-update, live-camera scan, OS-matched splash. See `SPEC.md` §15 (v1.2–v1.11).

**Phase B React Native app (`reactnative/`)** — complete and validated as an exact 1:1 copy of the PWA
(all 13 screens; Expo SDK 56 + expo-router + react-native-skia point cloud + expo-camera + AsyncStorage).
Passes `tsc`, Metro bundle, `expo-doctor`, iOS prebuild and lint clean. See `SPEC.md` §15 (v1.12) and
`reactnative/ARCHITECTURE.md`. **Not yet device-tested:** the remaining manual step is
`npx expo run:ios --device` on the iPhone (free Apple ID + the on-device camera-permission grant).

**Comparison subsets** — `flutter/` (Flutter 3.41) and `ios-native/` (SwiftUI) — are **built & validated**
(`flutter analyze` clean / `xcodebuild` simulator build succeeds). They port the tokens + demo data + the
hero screens (Projects list, animated Report donut, the LiDAR point-cloud scan) to compare native feel /
animation perf across stacks; Reports/Settings are stubs and the other screens are out of scope by design.
