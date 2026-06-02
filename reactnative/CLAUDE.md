# Working in `reactnative/` (Athar Eye native app)

This is the **React Native + Expo** native app — an **exact 1:1 copy of the PWA** (`../pwa`). Read in order:

1. **[`ARCHITECTURE.md`](ARCHITECTURE.md)** — ⭐ the full engineering reference for THIS app (every screen,
   component, the navigation model, the scan point cloud, the PWA→RN port rules, validation status). Start here.
2. **[`AGENTS.md`](AGENTS.md)** — Expo SDK 56 changed many APIs; check the versioned docs before using a native module.
3. **[`../CLAUDE.md`](../CLAUDE.md)** — repo-wide working rules. **[`../SPEC.md`](../SPEC.md)** — product/data/design + decision log (§15).

Key rules: **port, don't redesign** — match the PWA's exact pixels/colours/copy (it's the reference).
Strict TypeScript, `expo lint` clean. Use **Node 20 LTS**. On every change, update `ARCHITECTURE.md` (+ its
date) and `SPEC.md` §15 in the same commit. Commit messages end with
`Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

@AGENTS.md
