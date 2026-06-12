# OptiSync — monorepo

**OptiSync** turns an iPhone-LiDAR scan + a BIM model into an instant construction
**progress & coverage** report. Built by **Athar Robotics** for small & medium UK
(Scotland-first) contractors. Tagline: **Scan. Compare. Prove.** See [`SPEC.md`](SPEC.md)
for the full product, data, competitive and design specification (the single source of truth).

> One-liner: *OpenSpace-grade progress evidence at SME pricing, using the iPhone the
> contractor already owns — no 360° rig, with a drone-automation roadmap.*
>
> *OptiSync was previously named **Athar Eye**. The PWA below is the current OptiSync build;
> the `reactnative/` · `flutter/` · `ios-native/` directories are **frozen Athar-Eye-era
> comparison ports** kept for reference (the prior dark design) and not yet re-ported.*

## Repository layout

```
.
├── SPEC.md                  # Product / data / design source of truth (binding) — §15 decision log
├── CLAUDE.md                # How to work in this repo (AI/dev orientation)
├── CLAUDE_CODE_BUILD.md     # Original Athar-Eye engineering brief (native-feel criteria still apply)
├── design-source/           # Locked OptiSync Claude Design export — the visual reference (PORT, don't redesign)
├── pwa/                     # ✅ OptiSync — production PWA (Vite + React 18 + TS + vite-plugin-pwa)  ← the product
├── reactnative/             # 🧊 Frozen legacy — Athar-Eye-era React Native + Expo port (prior dark design)
├── flutter/                 # 🧊 Frozen legacy — Athar-Eye-era Flutter comparison port
└── ios-native/              # 🧊 Frozen legacy — Athar-Eye-era SwiftUI comparison port
```

## `pwa/` — OptiSync (the product)

A production-grade, installable PWA that feels like a native iOS app — instant first paint,
60fps, offline after first load, installs to the home screen and runs fullscreen with no
browser chrome. Functionally simulated (the LiDAR scan, BIM upload and coverage maths are
deterministic demo data) but visually and interactively a shipping product.

**Design:** light **"Blueprint + teal"** system (navy `#1E3A66` / teal `#18837E`), **Inter**
type with tabular numerals, white headers with a 2px navy underline.

**Includes:** all 12 screens (Projects · New project · Project detail · Scan · Progress report ·
Reports history · Issues/snags · Plans/billing · Account · Team & access · Settings · Share/export);
**full CRUD** (projects, zones with area-weighted coverage roll-up, issues, trades, team, BIM,
captures); and the **two signature interactions** — the **timeline scrubber** (tap a scan point and
the whole report re-renders at that coverage) and the **scan flow** (a looping room-walkthrough video
with an accreting LiDAR point cloud, writing a real new scan). State is **in-memory, seeded from a
typed data module — a refresh resets to baseline** (deterministic for demos). 6 UK demo projects;
in-app contractor account **Cairn Refurbishment Ltd**. Full detail in
[`pwa/ARCHITECTURE.md`](pwa/ARCHITECTURE.md).

```bash
cd pwa
npm install
npm run dev      # local dev server (HMR)
npm run build    # tsc --noEmit && vite build → static dist/ (Netlify / Vercel / Cloudflare)
npm run preview  # serve the production build (SW active) — test offline / install here
npm run lint     # ESLint, must pass clean (--max-warnings 0)
```

Deploy: `npm run build`, publish `pwa/dist/` (root, HTTPS). Share the URL → iPhone **Safari** →
**Add to Home Screen**. Load once online, then it runs offline.

## `reactnative/` · `flutter/` · `ios-native/` — frozen legacy (Athar Eye era)

These were comparison ports of the **previous Athar Eye** design (dark navy + green), built to
compare native feel / animation performance across stacks. They predate the OptiSync redesign and
**have not been re-ported** — kept in the repo (and in git history) for reference only. Don't treat
them as current OptiSync. If a native OptiSync app is built later, it ports from `pwa/` + `design-source/`.

## Documentation

| Doc | Purpose |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | How to work in this repo (AI/dev orientation; reading order; the "keep docs updated" rule) |
| [`SPEC.md`](SPEC.md) | Product / data / competitive / design **source of truth** + decision log (§15) |
| [`pwa/ARCHITECTURE.md`](pwa/ARCHITECTURE.md) | ⭐ **Full engineering reference for the OptiSync PWA** — read this instead of scanning the project |
| [`design-source/`](design-source/) | Locked OptiSync Claude Design export (visual reference — ported, not reinvented) |
| [`OPTISYNC_PORTING_GUIDE.md`](OPTISYNC_PORTING_GUIDE.md) | How to migrate the frozen RN/Flutter/iOS ports from Athar Eye → OptiSync (the redesign delta) |
| [`CLAUDE_CODE_BUILD.md`](CLAUDE_CODE_BUILD.md) | Original Athar-Eye engineering brief — superseded for the PWA by the OptiSync handoff, but the native-feel §4 criteria still apply |

## Working method

- `SPEC.md` is the contract; decisions are logged in `SPEC.md` §15.
- The design in `design-source/` is locked — port it faithfully, don't redesign.
- Commit per logical step; keep diffs small and reviewable.
- **Keep the docs current**: on every PWA change update `pwa/ARCHITECTURE.md` (+ its date) and
  `SPEC.md` §15 in the same commit. See `CLAUDE.md`.
