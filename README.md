# Athar Eye — monorepo

**Athar Eye** turns an iPhone-LiDAR scan + a BIM model into an instant construction
progress / coverage report. Built by **Athar Robotics** for small & medium UK
(Scotland-first) contractors. See [`SPEC.md`](SPEC.md) for the full product, data,
competitive and design specification (the single source of truth) and
[`CLAUDE_CODE_BUILD.md`](CLAUDE_CODE_BUILD.md) for the engineering brief.

> One-liner: *OpenSpace-grade progress evidence at SME pricing, using the iPhone the
> contractor already owns — no 360° rig, with a drone-automation roadmap.*

## Repository layout

This is a monorepo holding the same product built across multiple stacks (so the look/feel can be compared).

```
.
├── SPEC.md                  # Product / data / design source of truth (binding)
├── CLAUDE_CODE_BUILD.md     # Engineering brief + native-feel acceptance criteria
├── design-source/           # Approved Claude Design export — the visual reference
├── pwa/                     # ✅ Phase A — production PWA (Vite + React 18 + TS + vite-plugin-pwa)
├── reactnative/             # ✅ Phase B — native iOS app (React Native + Expo) — exact 1:1 copy of the PWA
└── native/                  # ⏳ Phase B (comparison) — native iOS (Swift) + Flutter ports (planned)
```

### `pwa/` — Phase A (now)

The Wednesday-pitch artifact: a production-grade, installable PWA that is
indistinguishable from a native iOS app — instant first paint, 60fps, offline after
first load, installs to the home screen and runs fullscreen with no browser chrome.
Functionally simulated (the scan, BIM upload, coverage maths are faked) but visually
and interactively a shipping product.

**Includes:** Projects / Reports / Settings + the full scan→processing→report→share flow;
live search; create / delete / persist projects (localStorage); recorded scans; a live-camera
scan background with point-cloud + room wireframe; system Back-button navigation; an install
prompt; service-worker auto-update + offline; and a responsive shell (fullscreen on phones,
centered card on desktop — no fake device chrome). Full detail in
[`pwa/ARCHITECTURE.md`](pwa/ARCHITECTURE.md).

```bash
cd pwa
npm install
npm run dev      # local dev server
npm run build    # → static dist/, deployable free to Netlify / Vercel / Cloudflare Pages
npm run preview  # preview the production build
```

Deploy: build `npm run build`, publish `dist/`. Share the URL → iPhone **Safari** →
**Add to Home Screen**. Preload once on Wi-Fi, then it runs offline.

### `reactnative/` — Phase B native app (now)

The **native iOS app**, built as an **exact feature + visual copy** of the PWA using
**React Native + Expo** (SDK 56, expo-router) — all 13 screens, the navy/teal design and
the full scan→report→share flow, with native smoothness: a **react-native-skia** point
cloud on the UI thread (60fps), the **live device camera**, native push/pop navigation,
native haptics, and AsyncStorage persistence. Validated (`tsc` · Metro bundle · expo-doctor ·
iOS prebuild · lint, all clean); runs on a physical iPhone via `npx expo run:ios --device`
with **a free Apple ID** (no paid Developer Program). Full detail in
[`reactnative/ARCHITECTURE.md`](reactnative/ARCHITECTURE.md).

```bash
cd reactnative
npm install                 # Node 20 LTS
npx expo run:ios --device   # build + install on a connected iPhone
```

### `native/` — Phase B comparison ports (planned)

A **native iOS (Swift/SwiftUI)** port and a **Flutter** port of the same design, for a
direct stack-by-stack comparison of native feel/performance against `reactnative/`. The
production direction (real ARKit LiDAR, IFC import, cloud analysis, PDF export) lands in
whichever stack wins. Placeholder today — see [`native/README.md`](native/README.md).

## Documentation

| Doc | Purpose |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | How to work in this repo (AI/dev orientation; reading order; the "keep docs updated" rule) |
| [`SPEC.md`](SPEC.md) | Product / data / competitive / design **source of truth** + decision log (§15) |
| [`CLAUDE_CODE_BUILD.md`](CLAUDE_CODE_BUILD.md) | Engineering brief + native-feel acceptance criteria (§4) |
| [`pwa/ARCHITECTURE.md`](pwa/ARCHITECTURE.md) | ⭐ **Full engineering reference for the PWA codebase** — read this instead of scanning the project |
| [`reactnative/ARCHITECTURE.md`](reactnative/ARCHITECTURE.md) | ⭐ **Full engineering reference for the React Native app** — the native 1:1 port |
| [`design-source/`](design-source/) | Locked design export (visual reference — ported, not reinvented) |

## Working method

- `SPEC.md` and `CLAUDE_CODE_BUILD.md` are the contract. Deviations / decisions are
  logged in `SPEC.md` §15.
- The design in `design-source/` is locked — port it faithfully, don't redesign.
- Commit per logical step; keep diffs small and reviewable.
- **Keep the docs current**: on every change update `pwa/ARCHITECTURE.md` (+ its date) and
  `SPEC.md` §15 in the same commit. See `CLAUDE.md`.
