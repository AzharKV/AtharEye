# Athar Eye — React Native (Expo) app — Architecture & Engineering Reference

> **Living document — the single source of truth for the `reactnative/` codebase.**
> Read this to get the full picture without scanning the project. **Keep it updated on every change.**
>
> Companion docs (don't duplicate — cross-reference):
> - [`../SPEC.md`](../SPEC.md) — product, data (§10), design system (§6), **decision log (§15)**.
> - [`../pwa/ARCHITECTURE.md`](../pwa/ARCHITECTURE.md) — the **PWA** this app is a 1:1 port of (the reference implementation).
> - [`../CLAUDE.md`](../CLAUDE.md) — how an AI/dev session should work in this repo.

**Last updated:** 2026-06-03 · **Status:** complete & validated (tsc · Metro bundle · expo-doctor · iOS prebuild · lint all clean). Not yet run on a physical device — that's the one remaining manual step (`npx expo run:ios --device`).

---

## 1. What this is

A **native iOS app (React Native + Expo)** that is an **exact feature + visual copy** of the finished
Athar Eye **PWA** (`../pwa`). Same 13 screens, same navy/teal design, same demo data and the same
scan → report → share flow — rebuilt with native navigation, a **react-native-skia** point cloud, the
**live device camera**, native haptics, and AsyncStorage persistence, so it has true native smoothness
(60fps point cloud on the UI thread, native push/pop, native share/modal behavior).

The LiDAR scan, BIM upload, coverage maths, auth and payments are **simulated** (same boundary as the
PWA — see `SPEC.md` §4). This is the Phase B native prototype for vendor validation.

**Definition of done (met):** `tsc`, Metro bundle, `expo-doctor`, iOS prebuild and `expo lint` all pass
clean. The deliverable runs on a physical iPhone via `npx expo run:ios --device` (Xcode + a **free**
Apple ID — no paid Developer Program needed).

---

## 2. Stack & commands

| | |
|---|---|
| Runtime | **Expo SDK 56** · React Native **0.85** · React **19** (New Architecture, default) |
| Language | **TypeScript 6 (strict)** |
| Navigation | **expo-router v6** (file-based; tabs + stacks + a full-screen modal) |
| Canvas | **@shopify/react-native-skia 2.6** — the scan point cloud (UI-thread `useClock`/`createPicture`) |
| Camera | **expo-camera** (`CameraView`) — live rear-camera scan background |
| Vector | **react-native-svg 15** — icons, donut/ring, iso massing, blueprint tiles |
| Animation | **react-native-reanimated 4** (worklets) — splash, sheets, skeleton sheen, scan progress |
| Storage | **@react-native-async-storage/async-storage** — replaces the PWA's localStorage |
| Haptics / Share / Blur / Gradient | expo-haptics · expo-sharing · expo-blur · expo-linear-gradient |
| Build perf | **React Compiler** enabled (`app.json` → `experiments.reactCompiler`) |

```bash
cd reactnative
npm install
npx expo start                  # dev server (Metro)
npx expo run:ios --device       # build + install on a connected iPhone (free Apple ID) — THE deliverable
npx tsc --noEmit                # typecheck (strict) — clean
npx expo lint                   # eslint (expo flat config) — clean
npx expo export --platform ios  # bundle the JS graph (CI validation) — clean
```
> Use **Node 20 LTS** for Expo commands (`nvm use 20`). Node 23 mostly works but 20 is the supported baseline.

`ios/` and `android/` are **Continuous Native Generation** output (gitignored). `expo run:ios` and
`expo prebuild` regenerate them from `app.json` + the config plugins.

---

## 3. Directory map

```
reactnative/
  app.json                  name "Athar Eye", bundleId com.atharrobotics.eye, dark-locked, navy splash,
                            camera-permission + splash config plugins, reactCompiler on.
  babel.config.js           babel-preset-expo (auto-wires Reanimated/worklets + React Compiler).
  eslint.config.js          expo flat config (+ set-state-in-effect off for the intentional timer hooks).
  tsconfig.json             strict; `@/*` → ./src/* path alias.
  assets/images/            icon.png (app icon, the real Athar mark) + athar-mark.png (in-app Mark) + favicon.
  src/
    app/                    ← expo-router file-based routes (see §4 Navigation)
      _layout.tsx           Root Stack + providers (GestureHandler, SafeArea, AppStore) + StatusBar + JS Splash gate.
      index.tsx             Redirect → /projects.
      (tabs)/
        _layout.tsx         Tabs host with the custom <TabBar/>.
        projects/           _layout (Stack) · index (list) · [id] (detail) · new (create)
        reports/            _layout (Stack) · index (list) · [id] (detail — the hero screen)
        settings/           _layout (Stack) · index · profile · plans
      scan/                 _layout (Stack, presented as a root full-screen modal)
        index · guidance · active · processing · result
    components/             Icon, Brand, primitives, IsoMassing, ShareSheet, SearchBar, Skeleton,
                            Screen, PushHeader, Splash, CameraBG, BimUploadSheet.
    navigation/TabBar.tsx   Custom bottom tab bar (Projects · Reports · [Scan FAB] · Settings).
    store/AppStore.tsx      Live persisted projects + actions (useAppStore, useProject).
    hooks/                  useCountUp, useReady, useModalBack.
    lib/                    haptic (expo-haptics), format, store (AsyncStorage), ui (fill, shadow, EASE).
    theme.ts                Design tokens (T, STATUS, SEV, MONO) — copied from the PWA.
    types.ts                Domain types — copied verbatim from the PWA.
    data.ts                 SPEC §10 demo data — copied verbatim from the PWA.
```

---

## 4. Navigation (expo-router)

The app is a **root Stack** containing the tab group and the scan modal:

- **Root `app/_layout.tsx`** — `GestureHandlerRootView` → `SafeAreaProvider` → `AppStoreProvider` →
  `StatusBar style="light"` → `<Stack>`. The native splash (expo-splash-screen) is hidden once React
  paints, and the JS `<Splash/>` overlay (icon + wordmark + tagline, ~1.7s) covers the hand-off so the
  icon never jumps (matches the PWA's OS→web splash).
  - `<Stack.Screen name="scan" presentation="fullScreenModal" animation="slide_from_bottom">` — the scan
    flow covers everything (no tab bar), exactly like the PWA's immersive scan.

- **Tabs `(tabs)/_layout.tsx`** — `<Tabs tabBar={props => <TabBar {...props}/>}>` with three tab routes
  (`projects`, `reports`, `settings`), **each a real folder with its own `Stack`**. Detail screens push
  **inside** their tab's stack, so **the tab bar stays visible on detail** — matching the PWA (and avoiding
  expo-router's duplicate-`index` route collision that bare `(group)` tabs would cause). The center Scan
  button in `TabBar` opens `/scan` (the modal); it is not a tab.

- **Within-tab navigation** — `router.push('/projects/' + id)`, `/projects/new`, `/reports/' + id`,
  `/settings/profile`, `/settings/plans`. Native iOS slide + edge-swipe-back come free from the native stack.

- **Scan flow** — steps **replace** one another so the scan group is a single root-stack entry:
  `/scan` (select) → `/scan/guidance` → `/scan/active` → `/scan/processing` → `/scan/result`, each carrying
  `?projectId=`. Launched from the tab FAB (→ select) or from Project detail "New scan" (→ guidance, project
  pre-chosen). Close/Done = `router.back()` (pops the modal). Result "View report" = `router.back()` then
  `router.push('/reports/' + id)`.

---

## 5. Data & store

Types in `types.ts`, values in `data.ts` (**both copied verbatim from the PWA / SPEC §10**). The live
working set lives in **`store/AppStore.tsx`**:

- `AppStoreProvider` seeds `projects` synchronously from `data.ts` (instant render), then **hydrates from
  AsyncStorage** (`lib/store.ts`, key `athar-eye:data`, `SEED_VERSION`) and **persists on every change** once
  hydrated. So created projects + recorded scans **survive a cold app restart**.
- `useAppStore()` → `{ projects, hydrated, addProject, deleteProject, onScanComplete }`. `useProject(id)` looks
  up a project by route param. **Every screen reads the live set via these — never `data.ts` directly.**
- `onScanComplete(project)` bumps `scans`/`last` and gives a fresh 0% project a starter coverage (verbatim
  from the PWA). This is the seam where a real backend (Firebase, etc.) would slot in.

---

## 6. The scan point cloud (the perf-critical part)

`app/scan/active.tsx` reproduces the PWA's 2D-canvas LiDAR build-up with **react-native-skia on the UI thread**:

- `makePoints(2000)` builds 3D points on the room-box surfaces (random reveal order) — verbatim from the PWA.
  `buildCloud(W,H)` projects them once into flat **`Float32Array`s** (`sx, sy, size, alpha`, depth-shaded).
  `buildWireframe(W,H)` precomputes the perspective room-wireframe line segments.
- `useClock()` (Skia) drives a `useDerivedValue` that computes progress `p = elapsed/7000` and returns a
  `createPicture(canvas => …)` redrawing the revealed points + wireframe each frame — **all on the UI thread**,
  using **two reused `SkPaint`s** (base teal + bright "fresh" leading edge) with per-point `setAlphaf`. This is
  one draw pass per frame, so it holds 60fps with 2000 points.
- The **progress bar** is Reanimated-driven (`useAnimatedStyle` width). The **live stats** + completion run on
  a low-frequency `setInterval` (decoupled from the 60fps canvas). At `p≥1` it replaces into `processing`.
- `CameraBG` (expo-camera `CameraView facing="back"`) sits behind the cloud; it requests permission and falls
  back to a dark gradient if denied/unavailable (same behavior as the PWA's `getUserMedia`).

`processing.tsx` is a Reanimated-rotated spinner + stepped checklist (~3s) → records the scan → `result.tsx`
(count-up `Donut` + stats + Share/Done/View-report).

---

## 7. Design-system port notes (PWA inline styles → RN)

The components in `src/components` are 1:1 ports of `pwa/src/components`. The consistent translation rules
(applied everywhere, incl. by the screen sub-agents):

- `<div>`→`<View>`; every string in `<Text>`; layout styles on View, text styles on Text.
- `fontWeight` is a **string** (`'700'`). CSS `lineHeight` multiplier → **pixels** (`fontSize * mult`).
- `inset:0` → the `fill` helper (`lib/ui`). `#RRGGBBAA` hex+alpha works inline (`T.accent + '33'`).
- `box-shadow` → `shadow()` (`lib/ui`, iOS shadow* + Android elevation). `backdrop-filter` → `BlurView`
  (headers, tab bar, scan pills). Gradients → `expo-linear-gradient`; the donut glow + arc use svg
  `RadialGradient`/`LinearGradient`. Radial card backgrounds are approximated with a vertical linear gradient.
- Rings/donut: an svg `<G rotation={-90}>` + a separate centered `<Text>` overlay. `Bar`/`Ring` render their
  value **statically** (the count-up hook drives the animated donut/ring by changing `value` — matching how the
  PWA's CSS transitions actually behaved).
- Sheets/confirats (`ShareSheet`, `BimUploadSheet`, `DeleteConfirm`) use RN `Modal` (its `onRequestClose` gives
  Android-back dismissal) + a Reanimated `SlideInDown` sheet over a tappable scrim. The inline search bar uses
  `useModalBack` (the RN equivalent of the PWA's `useBackLayer`).

---

## 8. Deviations from the PWA (deliberate, logged)

- **Folder is `reactnative/`** (not `native/`) — to sit alongside future `native iOS (Swift)` and `flutter`
  comparison stacks (owner direction).
- **Tab bar persists on detail** via per-tab Stacks in real folders (the PWA keeps it too; this also dodges
  expo-router's bare-`(group)` index collision). The scan flow is a full-screen modal (no tab bar) like the PWA.
- **Native navigation** replaces the PWA's CSS push/pop + History-API back integration — iOS slide + edge-swipe
  are native; the hardware back closes modals via `Modal.onRequestClose` / `useModalBack`.
- **Skia** point cloud + **expo-camera** replace the PWA's 2D canvas + `getUserMedia`. **AsyncStorage** replaces
  localStorage. **expo-haptics** replaces `navigator.vibrate`.
- **Vignette** on the camera is a flat dark overlay (RN has no inset box-shadow); **radial** card gradients are
  approximated with linear gradients.
- No PWA-only concepts (install prompt, service worker, responsive desktop card) — irrelevant on native.

---

## 9. Validation status

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ 0 errors |
| `npx expo export --platform ios` (Metro bundle) | ✅ 1945 modules, React Compiler on, 0 errors |
| `npx expo-doctor` | ✅ 21/21 checks |
| `npx expo prebuild -p ios` | ✅ clean — generates `AtharEye.xcodeproj`, camera permission, name, bundle id |
| `npx expo lint` | ✅ 0 problems |
| **Physical device** (`expo run:ios --device`) | ⏳ **not yet run** — the one remaining manual step (needs the iPhone connected + a one-time Xcode signing-team selection with a free Apple ID; the live camera needs the on-device permission grant) |

---

## 10. How to run on a physical iPhone

1. `cd reactnative && npm install` (Node 20).
2. Connect the iPhone via USB; trust the Mac.
3. `npx expo run:ios --device` → pick the device. First run prompts Xcode to pick a **Signing Team** — choose
   your free Apple ID (Personal Team). The free-ID signature expires in 7 days; rebuild before a demo.
4. On device, **Settings → General → VPN & Device Management** → trust the developer cert (first install only).
5. Launch; grant the **camera** permission when the scan starts (else it falls back to the gradient).

---

## 11. Known limitations / backlog

- Per-device AsyncStorage (no cross-device sync / real auth) — `store/AppStore.tsx` is the backend seam.
- Not device-tested yet (see §9). Skia/camera/haptics are wired to current SDK-56 APIs but unverified on metal.
- `react-native-skia` worklet drawing is the one area to eyeball on-device for 60fps; the architecture (UI-thread
  clock + flat arrays + 2 paints) is built for it.
- System back across a tab switch is native-stack default (close enough to the PWA's approximate behavior).

---

## Maintaining this doc

On every change to `reactnative/`, update the relevant section here in the same commit, bump **Last updated**,
log product/decision changes in `SPEC.md` §15, and keep this true to the code (it's the "full view" so future
sessions don't re-scan).
