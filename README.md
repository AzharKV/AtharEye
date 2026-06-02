# Athar Eye — monorepo

**Athar Eye** turns an iPhone-LiDAR scan + a BIM model into an instant construction
progress / coverage report. Built by **Athar Robotics** for small & medium UK
(Scotland-first) contractors. See [`SPEC.md`](SPEC.md) for the full product, data,
competitive and design specification (the single source of truth) and
[`CLAUDE_CODE_BUILD.md`](CLAUDE_CODE_BUILD.md) for the engineering brief.

> One-liner: *OpenSpace-grade progress evidence at SME pricing, using the iPhone the
> contractor already owns — no 360° rig, with a drone-automation roadmap.*

## Repository layout

This is a monorepo holding two stacks that build the same product at different fidelities.

```
.
├── SPEC.md                  # Product / data / design source of truth (binding)
├── CLAUDE_CODE_BUILD.md     # Engineering brief + native-feel acceptance criteria
├── design-source/           # Approved Claude Design export — the visual reference
├── pwa/                     # ✅ Phase A — production PWA (Vite + React 18 + TS + vite-plugin-pwa)
└── native/                  # ⏳ Phase B — native Flutter / iOS app (placeholder for now)
```

### `pwa/` — Phase A (now)

The Wednesday-pitch artifact: a production-grade, installable PWA that is
indistinguishable from a native iOS app — instant first paint, 60fps, offline after
first load, installs to the home screen and runs fullscreen with no browser chrome.
Functionally simulated (the scan, BIM upload, coverage maths are faked) but visually
and interactively a shipping product.

```bash
cd pwa
npm install
npm run dev      # local dev server
npm run build    # → static dist/, deployable free to Netlify / Vercel / Cloudflare Pages
npm run preview  # preview the production build
```

Deploy: build `npm run build`, publish `dist/`. Share the URL → iPhone **Safari** →
**Add to Home Screen**. Preload once on Wi-Fi, then it runs offline.

### `native/` — Phase B (after validation)

The real product, built once the vendor pitch validates the workflow. Flutter is the
lean (single codebase, native feel, Azhar's primary stack), with real ARKit LiDAR via
platform channel, IFC import, cloud analysis and PDF export. Placeholder only today —
see [`native/README.md`](native/README.md).

## Working method

- `SPEC.md` and `CLAUDE_CODE_BUILD.md` are the contract. Deviations / decisions are
  logged in `SPEC.md` §15.
- The design in `design-source/` is locked — port it faithfully, don't redesign.
- Commit per logical step; keep diffs small and reviewable.
