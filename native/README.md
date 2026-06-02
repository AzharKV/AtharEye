# Athar Eye — native comparison ports (planned)

> **Placeholder.** The working native app already exists in **[`../reactnative/`](../reactnative/)**
> (React Native + Expo — an exact 1:1 copy of the PWA, validated). This folder is reserved for
> **stack-by-stack comparison ports** of the same locked design, so the team can compare native
> feel / performance / DX before committing the production build to one stack.

## Planned comparison ports
- **Native iOS (Swift / SwiftUI)** — the platform-native baseline (ARKit/RealityKit is the eventual
  real-LiDAR path).
- **Flutter** — single codebase, native feel (Azhar's primary stack).

Each should reuse the **locked design system + demo data** from the root `SPEC.md` (§6 design, §10 data)
and the PWA's `pwa/src/theme.ts` / `data.ts`, and match `reactnative/` 1:1 — so the only variable being
compared is the stack itself.

## Production direction (post-comparison)
Whichever stack wins carries the real product: **ARKit LiDAR** capture (iPhone **Pro** only), **IFC / BIM
import**, scan↔BIM point-cloud registration, coverage % by geometric comparison, cloud analysis and **PDF
export**.

## Distribution
git → Ajmal's Mac → build in Xcode → **TestFlight** once an Apple Developer account exists. (A free Apple ID
sideload signature expires in 7 days — rebuild before any demo. Firebase App Distribution does **not** remove
the Apple-account requirement for iOS.) The `reactnative/` app already runs on a physical iPhone today via
`npx expo run:ios --device` with a free Apple ID.
