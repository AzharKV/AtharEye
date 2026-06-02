# Athar Eye — Flutter comparison build

A focused **visual + performance comparison** port of the finished Athar Eye PWA
(`../pwa`), rebuilt with Flutter so the team can judge Flutter's native feel against
the React Native build (`../reactnative`). Same locked **navy `#0C0F12` + teal
`#14B8C0`** design system and the same demo data (the 6 Scotland projects, verbatim).

> This is **not** all 13 screens — it is a deliberate subset. Only the three
> "hero" screens are ported; Reports and Settings are simple stubs.

## What's included
- **Projects** (`lib/screens/projects_screen.dart`) — large title, a portfolio
  summary card (teal **progress ring** for the average % + On track / Review /
  Complete counts), single-select **filter chips** (live-filtering), and project
  **cards** (mini ring + name + `location · area m² · scans` + status badge +
  chevron). Tapping a card pushes the Report detail.
- **Report detail** (`lib/screens/report_detail_screen.dart`) — branded header
  (teal mark + `AtharEye · PROGRESS REPORT`), the hero **animated count-up
  coverage donut** (a `CustomPainter` arc with a teal→accent2 gradient, the %
  counting up 0→pct over ~1.1s), Covered / Missing m² tiles, a meta table, and a
  coverage-by-room list (grey bars, **red** when a room is < 45%).
- **Active scan** (`lib/screens/scan_active_screen.dart`) — **the performance
  showcase.** A dark immersive screen with a teal **LiDAR point cloud building up
  over ~7s** (`CustomPainter` + `AnimationController`, vsync, repaint each frame —
  `makePoints(2000)` + the 1-point-perspective projection + a fading room
  wireframe), a pulsing-red "SCANNING" pill, live stats (Points / Coverage /
  Tracking Strong), a teal progress bar, and a round stop button. Auto-finishes at
  100%. Opened from the center teal **Scan** tab (which first asks which project).

Stubs: **Reports** and **Settings** tabs.

### Centerpieces
The **donut count-up** and the **point cloud** are the comparison centerpieces and
are built to run at 60fps with `CustomPainter` (no extra packages).

## Stack
Flutter 3.41.9 / Dart 3.11 · Material 3 · dark theme only · **no third-party
packages** (all visuals are `CustomPainter` + built-in animation). Toolchain is
pinned via **fvm**.

## Run
```bash
cd flutter
fvm flutter pub get
fvm flutter run            # launch on a connected device / simulator
fvm flutter analyze        # static analysis — clean (0 issues)
fvm flutter test           # widget smoke test
```

## What was simplified / omitted (vs the PWA)
- Only 3 of 13 screens (Projects, Report detail, Active scan); Reports + Settings
  are stubs. No search, persistence, new-project flow, BIM upload, iso-massing,
  share sheet, or scan processing/result screens.
- The active scan uses a **gradient room backdrop** instead of a live camera feed
  (no camera plugin in this analyze-only comparison build).
- The brand **Mark** is drawn as a teal aperture/eye on the navy squircle rather
  than bundling the PNG app icon, to keep the build asset-free.

## Status
`fvm flutter analyze` passes with **0 issues**; the widget smoke test passes. Not
yet run on a physical device.
