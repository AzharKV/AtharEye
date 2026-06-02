# Athar Eye — Master Specification & Build Brief
**Version 1.1 · Single source of truth · Last updated: 2 June 2026**

> **Purpose of this document.** This is the authoritative brief for the *Athar Eye* construction-progress app. It exists so that any chat, agent, or tool (Claude Code, a design agent, a fresh conversation, a human collaborator) can pick up the work **without losing a single detail** and without re-deriving decisions. If you are an AI agent reading this: treat every section as binding context. Do not invent product facts, pricing, screens, or data that are not here — if something is missing, flag it under §14 *Open Decisions* rather than guessing.

---

## 0. How to use this document
- **Owner (build):** Azhar — senior mobile software engineer (5+ yrs, Flutter-primary, some native iOS/Android). Has MacBook Pro + iOS simulators; gets a physical iPhone 3 Jun.
- **Owner (business):** Ajmal — co-founder, BE Mechatronics + MSc Robotic Engineering. Based in Scotland. Has iPhone 16 + MacBook Pro. Runs the vendor pitch.
- **Relationship of artifacts:**
  - *This spec* = the contract. Update it when decisions change; bump the version and log it in §15.
  - *PWA prototype* = the Wednesday pitch artifact (built first, see §12–13).
  - *Native app* = the real product, built after vendor validation (Flutter or native iOS).
- **Golden rule:** the prototype must *look and feel like a shipping professional product*, never like a tech demo. Polish > feature count.

---

## 1. Company & product context
- **Company:** Athar Robotics.
- **Product:** Athar Eye (working name; formerly "BuildScan" — renamed due to an existing trademark; may change again post-funding).
- **One-liner:** Turn an iPhone LiDAR scan + a BIM model into an instant construction progress/coverage report — affordable, visual, easy to share.
- **Mission:** Make site-progress checking affordable, visual and easy to share.
- **Target customer:** Small and medium UK construction companies, refurbishment/fit-out contractors, surveyors, BIM consultants. Initial geography: **Scotland / UK**.
- **Validation to date:** ~20 UK construction-related companies contacted; early interest reported for both the app and the future drone roadmap. Next evidence step: collect written letters/emails of interest.
- **Phased vision:**
  1. **Phase 1 (now):** iPhone-LiDAR + BIM coverage reporting app. No expensive hardware.
  2. **Phase 2 (post-validation):** indoor drone automates the same scanning workflow; sold as a premium service first, not hardware the customer buys.
  3. **Scale:** UK → US.
- **Indicative budget (from company deck):** Phase 1 MVP £6,000; full staged roadmap £20,500 (Phase 2 drone parts £5,000; Phase 3 drone software/testing £6,500; contingency £3,000).

---

## 2. The pitch problem this solves
BIM planning is digital, but progress checking is still manual for many smaller teams: site walks, photos, written notes. The planned BIM model is not connected to real site condition, so missing areas and delays are found late → rework and disputes. Athar Eye closes that loop cheaply.

---

## 3. Market & competitive positioning (UK)
*Researched 2 Jun 2026. Use this for the vendor's "what makes you different?" question.*

**The market has three tiers; Athar Eye occupies the empty middle.**

| Tier | Examples | What they do | Pricing band | Limitation Athar Eye exploits |
|---|---|---|---|---|
| Cheap iPhone-LiDAR capture | SiteScape, Canvas, Dot3D, RoomScan LiDAR, MagicPlan, Twindo, Scanbrix | Capture point clouds; export to CAD/BIM (RCP/E57/PLY); scan-to-CAD modelling (often human-assisted) | Free–~£30/mo | **Capture only — no automated progress/coverage % vs BIM.** Require iPhone **Pro** (LiDAR). |
| Enterprise progress monitoring | OpenSpace, Buildots, Doxel, Versatile | As-built vs BIM/schedule comparison, AI progress detection | ~$300–5,000/mo per project **+ hardware** ($5k–10k cameras) | Need 360°/proprietary hardware; built for large GCs; expensive; overkill for SME. |
| SME field/task management | Fieldwire (Hilti), PlanRadar, Autodesk Build, Procore | Drawings, tasks, punch lists, photo logs, reports | Free–~$104/user/mo (PlanRadar ~$35, Autodesk Build ~$39–65) | **No LiDAR scan-to-BIM coverage analytics.** |

**Athar Eye's wedge:** *OpenSpace-style progress evidence, at Fieldwire-style SME pricing, using the iPhone the contractor already owns — no 360° rig, no laser scanner — with a drone-automation roadmap.* No competitor serves small/medium UK contractors with automated coverage reporting at a £29–£299/mo price point.

**Differentiation — say both, weighted equally:**
- *Technical:* iPhone-LiDAR-only (commodity hardware), instant coverage %, then drone automation as the moat.
- *Commercial:* affordable subscription tuned to small/medium UK contractors that the big platforms ignore; report-based pricing + premium drone visits later.

**Honest competitive risks (be ready):** SiteScape/Canvas could add progress analytics; OpenSpace could launch a phone-only cheap tier; accuracy of phone LiDAR (~1 inch / ~1% of dimension) is lower than terrestrial scanners — position for *progress evidence*, not survey-grade as-built.

---

## 4. Prototype scope — what is REAL vs FAKED
The prototype is a *pitch artifact*. It must be visually production-grade but is functionally simulated.
- **Faked (hardcoded, no backend):** the LiDAR scan (animated point cloud, not real ARKit), BIM upload, alignment, coverage computation, all analysis, auth, payments, networking.
- **Real (must work flawlessly):** navigation, all screens, realistic data, the scan→processing→result→report→share *flow*, share interactions, offline operation.
- **Demo data set:** see §10. UK/Scotland projects only.

---

## 5. Buildability validation (for the vendor Q&A)
Every shown capability maps to proven technology, so nothing in the demo is fantasy:
| Demo feature | Real implementation | Maturity |
|---|---|---|
| iPhone LiDAR scan → point cloud | ARKit Scene Reconstruction + Depth API | Shipping. **Only iPhone/iPad Pro have LiDAR** — confirm Ajmal's iPhone 16 is **Pro**; base 16 has no LiDAR. |
| BIM import | IFC (open ISO standard) parsers; Revit/IFC4 | Mature |
| Align scan ↔ BIM | Point-cloud registration (ICP & variants) | Established; accuracy tuning = core eng. effort |
| Coverage % | Geometric comparison of captured vs planned surfaces | Buildable |
| Report / PDF / cloud analysis | Standard backend + PDF generation | Routine |
| Drone phase | Indoor SLAM + autonomy (caged drone) | Harder; Phase 2, funded later |
**Pitch framing:** the *workflow* is proven; funding buys alignment accuracy + the analysis engine.

---

## 6. Design system (CORRECTED — supersedes prototype v1)
v1 was rejected for looking unprofessional. These rules are mandatory.

### 6.1 Hard design rules (do / don't)
- **DO NOT draw a fake status bar** (time, signal, wifi, battery). The OS renders that. In a standalone PWA / native app the real device status bar shows. v1's hardcoded bar was wrong — remove entirely.
- **Screen transitions must be opaque.** A pushed screen has a solid background; the previous screen must never bleed through (v1 bug). Use correct stacking + opaque backgrounds; iOS-correct push/pop (incoming slides from right, outgoing parallax-shifts left ~30% under a subtle dim).
- **No tiny/awkward wordmark.** Use a proper logo lockup at correct size, or omit the wordmark in-app and rely on the home-screen icon. Never a cramped label.
- **Restraint over spectacle.** Industrial/professional, not "sci-fi". Benchmark the polish of Procore, Fieldwire, PlanRadar, OpenSpace, and Apple's own Health/Fitness apps. Smooth, calm, high-contrast, legible.
- **Performance:** must feel instant. No heavy webview lag. Lazy-render; 60fps animations using transform/opacity only.

### 6.2 Brand & color tokens
Dark, professional, navy + teal (from the AtharEye mockups). Tokens (refine in design step):
```
--bg            #0B1622   /* app background, deep navy */
--surface       #11212F   /* cards */
--surface-2     #16293A   /* raised cards / sheets */
--hairline      rgba(255,255,255,0.08)
--text          #F1F5F8
--text-muted    #93A6B6
--accent        #14B8C0   /* teal — primary actions, brand */
--accent-press  #0F949B
--success       #2FBF71   /* on-track / covered */
--warning       #E8A33D   /* needs review */
--danger        #E5484D   /* missing / high issue */
```
Light mode: out of scope for prototype (ship dark only).

### 6.3 Typography
- **Native iOS / PWA:** use the **system font (SF Pro via `-apple-system`)**. This is the correct, professional, HIG-native choice — it renders identically to shipping iOS apps. Do not import decorative web fonts for this product.
- Type scale (pt): Large title 32/800 · Title 22/700 · Headline 17/600 · Body 16/450 · Subhead 14/500 · Caption 12.5/500. Generous line-height (1.4–1.5 body).

### 6.4 Spacing, radius, elevation
- 4-pt grid. Screen side padding 18–20. Card radius 16–20. Sheet radius 22. Buttons radius 14, height 52.
- Elevation via soft shadows + 1px hairline borders, not harsh glows.

### 6.5 Iconography & motion
- Line icons, 1.8–2px stroke, rounded joins. Consistent 24px grid.
- Motion: purposeful only — page-load stagger, donut count-up, scan build-up, sheet slide. Durations 220–340ms, ease `cubic-bezier(.32,.72,0,1)`.

---

## 7. Information architecture & navigation
- **Root tabs (bottom tab bar):** Projects · Reports · **Scan** (center, emphasized) · Settings.
- **Profile:** reached from Settings header (not a root tab).
- **Stacks:** each tab pushes detail screens (Project → Report, etc.). Center Scan launches the scan flow modally/full-screen.
- **Scan flow (full-screen, immersive, no tab bar):** Scan home/guidance → Active scan (point cloud) → Processing → Result → (Report / Share).
- Back affordance on every pushed screen; user must never be trapped.

---

## 8. Screen-by-screen specification
> States to handle for each: default, empty (where relevant), loading/animating, success toast.

1. **Splash** — logo lockup + tagline ("See Progress · Prove Progress"). Auto-dismiss ~1.6s with subtle rise animation. No fake chrome.
2. **Projects (tab/home)** — Large title "Projects"; filter chips (All / On site / Needs review / Complete); list of project cards: thumbnail, name, location · type, progress bar, %, status badge. Tap → Project detail.
3. **Project detail** — header (thumb + name + location/type); progress summary card (overall %, status badge, scans / area / open issues counts); coverage-by-area list (per room, color-coded bar); site team avatars; primary CTA "New Scan", secondary "View latest report".
4. **Reports (tab)** — Large title; filter chips; list of report cards (project, last-scan time, area, %, status). Tap → Report detail.
5. **Report detail** — branded header (logo + "Athar Eye Progress Report" + timestamp); meta table (project, location, client, area, status); **coverage donut** (covered % green / missing % red) with count-up; **BIM-vs-as-built isometric** (green=built, red=missing); coverage-by-room list; open-issues list (severity badges, location, thumbnail placeholder); CTAs: "Share report" (sheet), "Export as PDF" (toast).
6. **Scan home / guidance (full-screen)** — title (project name); short instruction; pre-scan checklist (good lighting / move slowly / capture all areas / keep stable); "Start Scan" CTA.
7. **Active scan (full-screen)** — live point-cloud build-up over an AR-style viewport; hint pill (rotating tips); live stats (points, coverage %, tracking strength); progress bar; round stop control. Auto-advances at 100%.
8. **Processing (full-screen)** — spinner + stepped checklist: Reconstructing geometry → Aligning with BIM model → Computing coverage → Detecting missing areas. ~3s total, then Result.
9. **Result (full-screen)** — "Scan complete" confirmation; animated coverage donut (count-up); stats card (covered/missing m², points captured, alignment accuracy ±mm); CTAs: "View full report", "Share now"; "Done" → Projects.
10. **Share sheet (modal over dim scrim)** — iOS-style action sheet: share targets row (Messages, Mail, WhatsApp, AirDrop, Teams, Copy Link) **and** report-type options (Client Progress Summary / Detailed Site Report / Coverage Snapshot / Issues List for subcontractor). Each → confirmation toast. Cancel.
11. **Settings (tab)** — profile row (→ Profile); Subscription card (plan, price, renewal, usage meter); Scanning section (scan quality, units, BIM format, auto-upload); App section (notifications, privacy, about/version).
12. **Profile** — avatar, name, role/company; stats (projects/scans/reports); details (company, role, region, member since); Done.

---

## 9. The demo script (tap-by-tap for Ajmal)
*The flow that wins the room. Rehearse twice; run offline.*
1. Open from home-screen icon → splash → Projects. *"This is what a site supervisor sees — every job, live progress at a glance."*
2. Tap through tabs (Projects → Reports → Settings → Profile). *"Lightweight, familiar, runs on the phone they already carry."*
3. Open a Report (e.g. Byres Road, 74%). Walk the donut, room-by-room, issues. *"This is the evidence they currently produce by hand over hours."*
4. Tap **Scan** → guidance → Start. Show the point cloud building. *"Same workflow OpenSpace charges thousands for — but with the iPhone, no 360° rig."*
5. Processing → Result donut count-up. *"Coverage and missing areas, computed against the BIM model."*
6. **Share** → Client Progress Summary. *"One tap to send the client a professional report."*
7. Close on the differentiation line (see §3 wedge) + the drone roadmap.

---

## 10. Data model & demo content (authoritative — use verbatim)
All projects UK/Scotland. Currency £. Units metric (m / m²).

**User:** James Mackay · Site Supervisor · Athar Robotics · Scotland, UK · member since Jan 2026 · stats: 12 projects / 64 scans / 8 reports.
**Subscription:** Small Business · £99/month · renews 14 Jun · 3 of 5 projects used.

**Projects:**
| id | Name | Type | Location | % | Status | Area | Client | Scans | Team | Last scan |
|---|---|---|---|---|---|---|---|---|---|---|
| p1 | Byres Road Retail Unit | Shop refit | Glasgow | 74 | Needs Review | 128 m² | Westend Lettings Ltd | 9 | JM, AR, KD | 2h ago |
| p2 | Morningside Townhouse Ext. | Residential extension | Edinburgh | 58 | On Track | 46 m² | Private — Mr A. Sutherland | 6 | JM, PB | 1d ago |
| p3 | Union Street Office Fit-Out | Commercial · Level 3 | Aberdeen | 91 | On Track | 310 m² | Granite Workspace plc | 14 | KD, AR, PB, JM | 4h ago |
| p4 | Dundee Waterfront Warehouse | Industrial | Dundee | 82 | Needs Review | 1,140 m² | Tay Logistics | 11 | AR, KD | Yesterday |
| p5 | Stirling Flat Renovation | Residential | Stirling | 39 | On Track | 72 m² | Forth Property Co. | 3 | PB | 3d ago |
| p6 | Leith Café Build | Hospitality | Edinburgh | 100 | Complete | 88 m² | Shore & Bean | 18 | JM, AR, KD | Handover complete |

**Coverage-by-room (examples):**
- p1: Shop Floor 88, Stock Room 62, Staff WC 96, Shopfront 70, Rear Lobby 54
- p2: Kitchen Ext. 64, Utility 71, Roof Structure 40, Foundations 95
- p3: Open Plan 94, Meeting Rms 88, Reception 97, Server Room 85, Kitchenette 90
- p4: Main Floor 86, Mezzanine 74, Loading Bay 91, Office Block 62
- p5: Living Room 48, Bathroom 30, Bedroom 1 52, Hallway 26
- p6: all 100

**Open issues (examples; severity high/med/low):**
- p1: First-fix electrics incomplete — Shop Floor · Grid B2 (high); Stud wall not boarded — Stock Room · Grid C1 (med); Ceiling grid not installed — Rear Lobby (low)
- p2: Wall insulation pending — Kitchen Ext. · North (med); Roof felt not laid — Roof Structure (high)
- p3: Raised floor tile gap — Open Plan · Zone D (low); MEP final connections — Server Room (med)
- p4: Mezzanine slab thickness query — Grid F4 (high); Loading dock door missing — Loading Bay (med)
- p5: Bathroom first-fix plumbing (high); Plastering not started — Living Room (med)
- p6: none (handover complete)

**Result-screen scan stats (faked but plausible):** points captured ~1.84 M; alignment accuracy ±21 mm; covered/missing m² derived from project %.

---

## 11. Subscription & revenue model (for Settings + pitch)
- Free Trial £0 (30 days, 1 project) · Starter £29/mo (1 user, basic report) · Small Business £99/mo (3 users, scan history) · Pro £199/mo (more projects + exports) · Team £299/mo (team dashboard).
- Paid reports £300–£750; BIM/project setup ~£500. Phase 2 drone scan visit ~£1,000 (premium service).

---

## 12. Distribution plan
- **PWA (Wednesday demo):** deploy static files to **Netlify Drop** (drag folder → instant URL) or connect GitHub repo to Netlify for auto-deploy. Share URL → open in **Safari** → Share → **Add to Home Screen** → launches fullscreen, app icon, runs **offline** after first load. No Apple account, vendor can self-install via the same link. *Tell Ajmal: open once on wifi first; Safari only for Add-to-Home-Screen.*
- **Native (post-validation):** Flutter or native iOS. Distribute to Ajmal via git → he builds in Xcode on his Mac and sideloads to his iPhone with a free Apple ID (**signature expires in 7 days — rebuild before any demo**). For clean remote install, buy the Apple Developer Program ($99/yr) and use **TestFlight** (note: Firebase App Distribution does NOT remove the Apple-account requirement for iOS).

---

## 13. Build roadmap & engineering setup
**Phase A — PWA prototype.** Design locked via Claude Design (the approved React prototype is the reference implementation). Rebuilt as a production PWA in Claude Code. **Finalised stack: Vite + React 18 + TypeScript + vite-plugin-pwa (Workbox).** CSS transforms/opacity for animation (GPU-composited); React Context for state; the design's own push/pop stack navigator. Must meet the native-feel acceptance criteria (60fps, instant + offline loads, safe areas, no tap delay, lazy-loaded scan, skeleton loaders) — see `CLAUDE_CODE_BUILD.md`. Output: git repo `athar-eye` building to static `dist/`, deployed free to Netlify/Vercel/Cloudflare Pages. No fake status bar; opaque transitions.

**Phase B — Native app (after validation, if required).** Flutter recommended (Azhar's primary stack; single codebase; native feel). Real ARKit LiDAR via platform channel / plugin on iPhone Pro; IFC import; cloud analysis; PDF export. Distribute via git → Ajmal's Mac → TestFlight once Apple account exists.

**Working model with AI tooling (to avoid context loss):**
- Use **Claude Code** as the build environment (real repo, file-level diffs, survives long sessions). Use a **design agent** for the high-fidelity clickable design *before* coding so Azhar can validate the look in one view.
- Suggested repo layout:
```
athar-eye/
  README.md
  SPEC.md            <- this file (keep updated)
  /pwa               <- Phase A static prototype
    index.html
    /assets (icon-180.png, icon-512.png, manifest.json)
  /app               <- Phase B Flutter project (later)
  /design            <- exported design references / wireframes
```
- Claude Code setup (Azhar's Mac): install Node ≥18 + the Claude Code CLI/app; open the `athar-eye` repo; keep `SPEC.md` in-repo so every session reloads full context; commit per logical change; never let one chat hold the only copy of state.

---

## 14. Open decisions / TODO
- [ ] Confirm Ajmal's iPhone 16 is **Pro** (LiDAR) — affects real-product hardware story.
- [ ] Final product name (Athar Eye vs alternatives) — post-funding.
- [ ] Logo/icon are AI-generated, not finalised — refine post-funding.
- [x] **Design: LOCKED** — approved via Claude Design; that React export is the reference implementation.
- [x] **PWA stack: DECIDED** — Vite + React + TypeScript + vite-plugin-pwa (see `CLAUDE_CODE_BUILD.md`).
- [ ] Decide Phase B: Flutter vs native iOS (lean Flutter).
- [ ] Whether vendor needs the app on their own device (→ keep PWA link handy regardless).
- [ ] Collect written letters of interest from the ~20 contacted companies.
- [ ] "How long to complete?" timeline doc for the vendor (separate deliverable — not yet written).
- [x] **Scan background: DECIDED (v1.5)** — generated perspective room wireframe + point cloud (no permission prompt, controlled visuals). A real-camera `getUserMedia` background remains an optional future toggle if a live-camera "wow" is wanted for the demo.

---

## 15. Change log
- **v1.5 (2 Jun 2026) — persistence, scan recording, scan visual + layout (owner feedback).**
  - **Local persistence (supersedes the v1.2 "in-memory" note):** `data.ts` is now the *seed*; the
    app persists the live projects to `localStorage` (`pwa/src/lib/store.ts`, key `athar-eye:data`,
    `SEED_VERSION`) so **created projects and recorded scans survive a reload / relaunch**. Every
    screen reads the live set via `useAppActions().projects` — data is centralized & manipulable.
    Offline-friendly, no backend; Firebase/etc. is the future multi-device path (this is the seam).
  - **Scan recording:** completing a scan calls `onScanComplete(project)` → bumps the project's
    `scans` + `last`; a fresh (0%) project gets a plausible starter coverage so the scan produces a
    real-looking report.
  - **Scan visual:** added a faint perspective **room wireframe** (floor grid + walls) under the
    point cloud so the scan reads as reconstructing a room. (Generated, not the live device camera —
    avoids a permission prompt; a real-camera background is an optional future toggle, ref §14.)
  - **Scan layout fix:** the AR brackets + live stats + progress bar no longer overlap — bottom
    controls are now one safe-area-aware stacked column.
- **v1.4 (2 Jun 2026) — system Back button (native-app feel).** The app navigates with an
  in-memory stack (no URL routing), so the Android hardware/gesture Back button (and the browser
  Back button) would have left/closed the PWA instead of going back inside it. Added a History-API
  back-stack (`pwa/src/navigation/backstack.ts` + `useBackLayer`): every open layer (pushed screen,
  scan modal, sheet) owns one history entry; Back closes the top-most layer (pops a screen / closes
  the scan / closes a sheet), and at the root falls through (exits) — correct native behavior.
  In-app back controls and the system Back share one path (no double-pop). iOS standalone has no
  Back button, so users there use the in-app back controls. Verified in-browser; the real Android
  hardware-Back behavior needs a device + HTTPS deploy to fully confirm.
- **v1.3 (2 Jun 2026) — PWA install + browser-experience fixes (owner feedback).**
  - **Removed the desktop device-frame "simulator" (and its hardcoded status bar).** The app is now a pure responsive web app: it fills the screen on phones and floats as a clean centered phone-width card (rounded, subtle border/shadow, **no fake status bar / bezel / home indicator**) on desktop & large tablets. Fully honours §6.1 and supersedes the v1.2 "device-frame standalone-detection" note (`IOSDevice` deleted).
  - **Fixed the browser top gap.** Header / large-title top padding changed from `max(Npx, env(safe-area-inset-top))` to `calc(env(safe-area-inset-top) + base)`. In a browser (inset = 0) there's only a small intentional gap; installed/standalone still clears the status bar / Dynamic Island.
  - **Hardened the manifest for Android standalone install** (was opening as a browser shortcut, not a WebAPK): absolute `id` / `start_url` / `scope` = `/`, added `display_override: ["standalone"]`. Assumes a **root deploy** (Netlify/Vercel/Cloudflare).
  - **Added an in-app install prompt** (`InstallPrompt`): on Android/desktop Chromium it captures `beforeinstallprompt` and triggers the real install (→ standalone WebAPK); on iOS Safari it shows the *Share → Add to Home Screen* instruction (no programmatic install exists there). Dismissible (7-day), auto-hidden when already installed.

- **v1.2 (2 Jun 2026) — PWA build (Claude Code), engineering decisions log.** Repo set up as a monorepo: shared `SPEC.md` / `CLAUDE_CODE_BUILD.md` / `design-source/` at root; production PWA built in `pwa/`; `native/` placeholder for Phase B. Faithful port of the locked design (`design-source/app/*.jsx` is the running reference; `athar-primitives.jsx` and `frames/design-canvas.jsx` are unused by the running app and were not ported). Decisions / deviations:
  - **Device frame standalone-detection:** the desktop-preview iPhone frame (which draws a mock status bar) is now suppressed whenever the app runs as an installed standalone PWA (`display-mode: standalone` / `navigator.standalone`), so the installed app is always fullscreen and the OS draws the real status bar (honours §6.1). The design's size-only heuristic would have wrongly framed 430pt-wide iPhones.
  - **Skeleton loaders added** (`useReady` hook): app shell + skeleton rows paint instantly, real content fills in after a short simulated fetch, cached per tab so revisits are instant. Required by `CLAUDE_CODE_BUILD.md` §4.3/§5; not present in the static design.
  - **Static first-paint splash** inlined in `index.html` (identical to the React `<Splash>`), removed on mount — guarantees no blank flash before hydration (§4.3).
  - **Motion wired up:** sheet/scrim/toast/splash keyframes the design defined in its `index.html` are now applied to the share sheet, BIM sheet, toasts and splash for the native-feel motion bar (§6.5). Look unchanged.
  - **Deterministic SVG pattern IDs** (per-instance sequence) replace `Math.random()` in `BlueprintTile` / `IsoMassing` to avoid hydration mismatch and ID collisions.
  - **In-app brand mark = the real product icon (owner direction).** The design-source used a *separate* stylized "scan-aperture eye" SVG glyph for the in-app `Mark` while the home-screen icon is the drone+scanning-eye `icon-512.png`. Per owner feedback these are now unified: the `Mark` component renders the actual app icon (`icon-192.png`, iOS-squircle rounding) so every lockup — splash (static + React), report header, settings footer, scan home/select, processing spinner, scan fallback, error screen — matches the installed icon exactly. This is a deliberate deviation from the design-source for brand consistency.
  - **Tooling:** strict TypeScript (single `tsconfig.json`, no project references), ESLint + Prettier, an `ErrorBoundary`, safe-area padding on sheets. Brand design unchanged.
  - **Icons** generated at 180/192/512 + a padded maskable 512 + apple-touch from the 1254px brand `icon-512.png`.
  - **State is in-memory** (no backend, per §4). A user-created project lives for the session and is intentionally not persisted across a hard reload — fine for the pitch (the demo script never reloads mid-flow).
  - **Top bars are safe-area aware:** header / scan-top-bar top padding uses `max(Npx, env(safe-area-inset-top))` so controls clear a Dynamic Island; the bottom tab bar, scan controls and sheets use `env(safe-area-inset-bottom)` (§4.6).
  - **Verified (375/428/desktop, dev + production preview):** all 6 projects incl. the 100% Leith (empty "Handover complete" state) and 39% Stirling (red hatched "missing" massing + red sub-45% room bars); Projects list/detail (scroll-aware header) / New project → BIM upload → create → "No scans yet"; Reports list/detail (count-up donut, iso massing, issues); Settings / Profile / Plans; full Scan select → guidance → live rAF point cloud → processing → result → View full report / Share / Done; share sheet + PDF/share toasts; filters; cancel-scan. Service worker active + controlling with the full app shell precached (index.html, main JS, **lazy scan chunk**, manifest, icons) → offline / Airplane-mode relaunch confirmed. `npm run build` → static `dist/`; lint clean.
- **v1.1 (2 Jun 2026):** Design locked (Claude Design export = reference). Finalised PWA stack (Vite + React + TS + vite-plugin-pwa). Added `CLAUDE_CODE_BUILD.md` (engineering brief + native-feel acceptance criteria + Claude Code kickoff prompt).
- **v1.0 (2 Jun 2026):** Initial master spec. Captures company/product context, UK competitive analysis, corrected design system (post-v1 critique), full screen spec, demo data, distribution + roadmap.

---

## 16. Context handoff block (copy-paste primer for a fresh agent)
> You are helping build **Athar Eye**, an iPhone-LiDAR + BIM construction *progress/coverage* reporting app for small/medium UK (Scotland-first) contractors, by **Athar Robotics**. Two deliverables: (1) a **PWA prototype** for a vendor pitch (functionally faked, visually production-grade, offline, no Apple account, deployed via Netlify + Add-to-Home-Screen) — needed first; (2) a **native Flutter/iOS app** built after validation. The builder is a senior Flutter engineer; respect that level. Design must be professional/industrial (benchmark Procore, Fieldwire, OpenSpace, Apple Health) — **no fake status bar, opaque screen transitions, system font (SF Pro), navy+teal palette**. Differentiator: OpenSpace-grade progress evidence at SME pricing using a commodity iPhone, no 360° hardware, drone automation roadmap. Use the data in §10 verbatim. Do not invent product facts not in this spec; flag gaps in §14.
