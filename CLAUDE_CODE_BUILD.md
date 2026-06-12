# Athar Eye — Claude Code Build Brief (production PWA)
**Companion to `SPEC.md`. Read both before writing code.**

> **⚠️ Legacy / superseded.** This is the *original Athar Eye* engineering brief. The product is now
> **OptiSync** and the PWA was rebuilt on the light "Blueprint + teal" design (see `SPEC.md` §15 v1.14,
> `pwa/ARCHITECTURE.md`, and `design-source/`). The product/data/screens/tokens here are **out of date**
> — use the OptiSync sources instead. The **native-feel acceptance criteria in §4 still apply** to the
> PWA (instant loads, 60fps, offline, opaque transitions, safe areas, no fake status bar).

**Goal:** rebuild the validated Claude Design prototype as a production-grade, installable PWA that is **indistinguishable from a native iOS app** — no jank, instant loads, offline-capable, deployable to free hosting. The design is locked; this is an engineering task, not a redesign.

---

## 0. Inputs in this workspace
- `design-source/` — the Claude Design export (React components + the approved look). **This is the visual + interaction reference. Port it faithfully; do not redesign.**
- `SPEC.md` — product / data / competitive / design-system source of truth. Use the demo data in **§10 verbatim**.
- `CLAUDE_CODE_BUILD.md` — this file: stack + engineering acceptance criteria + kickoff prompt.

## 1. Finalised stack (do not deviate without logging it in SPEC §15)
- **Vite** — bundler + dev server (fast HMR, optimized static output).
- **React 18 + TypeScript** (strict) — maximal reuse of the React design; type safety.
- **vite-plugin-pwa** (Workbox) — manifest, service worker, offline precache, auto-update. Don't hand-roll a service worker.
- **Animation:** CSS transforms/opacity first (GPU-composited). `framer-motion` only if a transition genuinely needs orchestration — keep the bundle lean.
- **State:** React state + Context. No Redux/global store.
- **Navigation:** port the design's own push/pop stack navigator + tab host. No heavy router needed.
- **Target:** ES2020 / Safari 15+.
- **Hosting:** Netlify / Vercel / Cloudflare Pages (free, git-connected). Build `npm run build`, publish `dist/`.

*Rationale:* design is already React → port not rewrite; Vite → tiny fast static bundle deployable anywhere free; vite-plugin-pwa → real offline + install without bespoke SW code.

## 2. Target repo structure
```
athar-eye/
  index.html
  vite.config.ts          # + VitePWA({ registerType:'autoUpdate', manifest, workbox })
  tsconfig.json
  package.json
  public/                 # icon-512.png, icon-180.png, apple-touch assets
  src/
    main.tsx
    App.tsx               # splash + (desktop) device frame + tab host
    theme.ts              # design tokens (T)
    data.ts               # SPEC §10 data, typed
    types.ts
    components/           # Button, Card, Donut, Bar, Ring, StatusBadge, BlueprintTile, Icon, ...
    navigation/           # Navigator (push/pop), TabBar, PushHeader, Screen
    screens/              # Projects, ProjectDetail, Reports, ReportDetail, Settings, Profile, scan/*
  SPEC.md
  CLAUDE_CODE_BUILD.md
```

## 3. Migration plan (port the design — don't rebuild blind)
1. Scaffold Vite React-TS; strict tsconfig.
2. Add `vite-plugin-pwa` using the manifest from `design-source/manifest.json` (name "Athar Eye", theme `#0C0F12`, display standalone, orientation portrait, icons).
3. Port tokens → `theme.ts`; data → `data.ts` with typed interfaces (Project, Room, Issue, etc.).
4. Convert each `window`-global component into a typed ES module with named exports/imports. **Keep markup and styles identical to the approved design.**
5. Port the nav stack, tab host, and scan canvas as-is (logic unchanged).
6. Apply the loading strategy (§5) and lazy-load the scan flow.
7. Wire icons, apple-touch-icon, safe-area insets, status-bar meta.
8. `npm run build`, test on a real iPhone, deploy.

## 4. Native-feel acceptance criteria — the "no lag" bar (ALL must pass)
1. **Fast first paint** (< ~1s on a mid iPhone); **instant** repeat launch (precached). Initial JS (excl. React) gzipped lean; **scan flow lazy-loaded**.
2. **60fps animation:** animate only `transform`/`opacity`. Never animate width/height/top/left/box-shadow/filter in motion. `will-change` only on layers mid-animation, removed after.
3. **No blank flashes:** app shell + skeletons render immediately; splash covers JS hydration; lists show skeleton rows until data; scan/processing always show progress.
4. **No tap delay / grey flash:** `viewport` `maximum-scale=1`, `touch-action: manipulation`, `-webkit-tap-highlight-color: transparent`; press states via `:active`/pointer events.
5. **Native scrolling:** `-webkit-overflow-scrolling: touch`, `overscroll-behavior: contain`, hidden scrollbars, momentum; sticky headers don't jump.
6. **Safe areas:** `env(safe-area-inset-*)` on header, tab bar, scan controls; `viewport-fit=cover`.
7. **Offline:** after first load, the whole app works in **Airplane mode** (Workbox precache of app shell + assets).
8. **Installable:** Add to Home Screen → fullscreen, no Safari chrome, correct icon + splash; `apple-mobile-web-app-status-bar-style: black-translucent`.
9. **Scan canvas:** single `requestAnimationFrame` loop, DPR capped at 2, loop cancelled on unmount; point count tuned to stay smooth on device (test, don't assume).
10. **Code-split** heavy/rare screens (scan flow) via `React.lazy` + `Suspense` with a skeleton fallback.

## 5. Loading & performance strategy
- **App-shell pattern:** shell + skeletons paint instantly; content fills in (even though data is local, treat transitions as async for perceived speed).
- Route/screen **code-splitting**; no runtime external deps (system font, inline SVG icons — no web-font or icon-CDN requests).
- `vite-plugin-pwa` `registerType: 'autoUpdate'`; precache `index.html`, JS/CSS, icons, manifest.
- Optimize the icon (provide 180 + 512). Vite inlines critical CSS and hashes assets.
- Respect `prefers-reduced-motion`.

## 6. Deploy (free)
1. `git init` → push to GitHub.
2. Connect **Netlify / Vercel / Cloudflare Pages**: build `npm run build`, publish `dist/`. Auto-deploys on push. (One-off alternative: drag `dist/` to Netlify Drop.)
3. Share URL → iPhone **Safari** → **Add to Home Screen**. Preload once on Wi-Fi before the demo.

## 7. Working method (anti-drift)
- Keep `SPEC.md` + this file in the repo; reload them each session.
- After scaffolding, **post a short plan before porting screens**, then commit per logical step (small reviewable diffs).
- §4 acceptance criteria are the definition of done. **Test on the real iPhone before sign-off** (desktop preview is not proof).

## 8. Kickoff prompt — paste this into Claude Code
> Read `SPEC.md` and `CLAUDE_CODE_BUILD.md` in this repo, and the design in `design-source/`. Build **Athar Eye** as a production-grade, installable PWA that feels like a native iOS app, using the finalised stack in the brief: **Vite + React 18 + TypeScript + vite-plugin-pwa**. Port the approved design from `design-source/` faithfully — identical look and interactions — do **not** redesign. Use the demo data in `SPEC.md` §10 verbatim. Meet **every** native-feel acceptance criterion in `CLAUDE_CODE_BUILD.md` §4 (60fps via transform/opacity only, instant + offline loads, safe-area insets, no tap delay, lazy-loaded scan flow, skeleton loaders). After scaffolding, give me a short build plan before porting screens, then work step by step committing per logical change. The result must `npm run build` to a static `dist/` deployable to Netlify/Vercel/Cloudflare Pages, and pass an Airplane-mode relaunch test.
