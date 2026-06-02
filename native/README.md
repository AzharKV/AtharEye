# Athar Eye — native app (Phase B)

> **Placeholder.** This stack is built **after** the PWA prototype validates the
> workflow with the vendor. Nothing here yet.

## Plan (from `SPEC.md` §13, Phase B)

The real product. **Flutter recommended** — single codebase, native feel, and the
team's primary stack — with native iOS as the fallback. Scope:

- Real **ARKit LiDAR** scanning via a platform channel / plugin (iPhone **Pro** only —
  base models have no LiDAR).
- **IFC / BIM import** (open ISO standard; Revit / IFC4).
- Scan ↔ BIM alignment via point-cloud registration (ICP & variants).
- Coverage % via geometric comparison of captured vs planned surfaces.
- Cloud analysis + **PDF export**.

## Distribution

Distribute via git → Ajmal's Mac → build in Xcode → **TestFlight** once an Apple
Developer account exists. (A free Apple ID sideload signature expires in 7 days —
rebuild before any demo. Firebase App Distribution does **not** remove the
Apple-account requirement for iOS.)

## When starting this stack

Reuse the locked design system and demo data from the root `SPEC.md` and the PWA's
`src/theme.ts` / `src/data.ts` so the native app matches the prototype 1:1.
