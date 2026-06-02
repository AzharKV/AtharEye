# Athar Eye — React Native (Expo) app

The **native iOS app** for Athar Eye — an **exact feature + visual copy** of the finished PWA
(`../pwa`), rebuilt with React Native + Expo for true native smoothness (60fps Skia point cloud,
live camera, native navigation + haptics). All 13 screens, the navy/teal design, the demo data and
the scan → report → share flow, matching the PWA 1:1.

> **Read [`ARCHITECTURE.md`](ARCHITECTURE.md) for the full engineering reference** (every screen,
> component, the navigation model, the scan point cloud, the PWA→RN port rules, validation status).

## Stack
Expo SDK 56 · React Native 0.85 · React 19 · TypeScript (strict) · **expo-router** (file-based) ·
**@shopify/react-native-skia** (scan point cloud) · **expo-camera** (live scan background) ·
**react-native-svg** · **react-native-reanimated** · **AsyncStorage** · expo-haptics / sharing / blur /
linear-gradient. React Compiler enabled.

## Commands
```bash
cd reactnative
npm install                      # use Node 20 LTS (nvm use 20)
npx expo start                   # dev server (Metro)
npx expo run:ios --device        # ⭐ build + install on a connected iPhone (free Apple ID) — the deliverable
npx tsc --noEmit                 # typecheck (clean)
npx expo lint                    # lint (clean)
```

## Run on a physical iPhone (free Apple ID — no paid account)
1. `npm install` (Node 20). 2. Connect + trust the iPhone. 3. `npx expo run:ios --device` → choose the
device; on first run pick your Apple ID as the **Signing Team** (Personal Team). 4. On device, trust the
dev cert (**Settings → General → VPN & Device Management**). 5. Grant the **camera** permission when the
scan starts (else it falls back to a gradient). The free-ID signature expires in ~7 days — rebuild before a demo.

## Status
Complete & validated: `tsc` · Metro bundle · `expo-doctor` (21/21) · iOS prebuild · `expo lint` all clean.
**Not yet run on a physical device** — that's the one remaining manual step (see `ARCHITECTURE.md` §9–10).

`ios/` and `android/` are Continuous Native Generation output (gitignored); `expo run:ios` regenerates them
from `app.json` + the config plugins.
