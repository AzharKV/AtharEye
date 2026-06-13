# OptiSync — Master Specification & Build Brief
**Version 1.21 · Single source of truth · Last updated: 13 June 2026**

> **Naming.** The product is now **OptiSync** (formerly *Athar Eye*, formerly *BuildScan*), by **Athar Robotics**. The **PWA in `pwa/`** is the OptiSync build (this redesign); the **`reactnative/` · `flutter/` · `ios-native/`** comparison ports were built against the prior *Athar Eye* dark design and are **frozen** pending a re-port. For the OptiSync PWA the authoritative product/data/design source is the **handoff bundle** (`OPTISYNC_*` docs) summarised in §15 v1.14, which supersedes the Athar-Eye-era §6.2 tokens, §8 screens, and §10 data below (kept as the frozen-ports reference). Mentions of "Athar Eye" elsewhere in this doc are historical.

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
- **Product:** OptiSync (formerly "Athar Eye", earlier "BuildScan" — renamed; may change again post-funding). Tagline: *Scan. Compare. Prove.*
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
**OptiSync — "Blueprint + teal", LIGHT (locked).** This replaces the prior Athar-Eye dark
navy+green palette (retained only by the frozen `reactnative/`/`flutter/`/`ios-native/` ports).
```
--canvas        #EDF1F6   /* app background */
--surface       #FFFFFF   /* cards, headers */
--hairline      #D8E1EC   /* borders */
--ink           #1B2A3D   /* primary text */
--muted         #64748B   /* secondary text */
--navy          #1E3A66   /* primary, nav, buttons, structure */
--blue          #2D6FB0   /* in-progress */
--teal          #18837E   /* verified / complete / positive (brand accent) */
--amber         #B5781A   /* behind / needs review */
--red           #C0492F   /* critical */
```
Coverage = donut + horizontal bars. Issues = severity dots (red Critical / amber Major / grey Minor).
Status pills: On track (teal) · Needs review (amber) · Behind (red) · Complete (teal). Header = white
with a **2px navy underline**. Cards = white surface, hairline border, soft radius.

### 6.3 Typography
- **OptiSync:** **Inter** throughout (matches the Notion text style the client supplied; replaced an
  earlier IBM Plex pairing). Self-hosted variable woff2 (`pwa/public/fonts/`, precached by the SW — no
  CDN, offline-safe), stack `'Inter', -apple-system, system-ui, sans-serif`. **All figures** (every %,
  coverage, date, count) use a `.mono` class = Inter with `tnum` + `lnum` features (tabular + lining).
  *(The frozen comparison ports still use the system font per the prior Athar-Eye spec.)*
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
- [x] **Scan background: DECIDED (v1.5 → v1.9)** — **live rear camera** (`getUserMedia`, `facingMode: environment`) behind the room wireframe + point cloud, for a real "it's scanning the room" feel; falls back to a dark gradient if the camera is denied/unavailable. Needs HTTPS + a one-time camera permission (fine on the deployed site; the demoer grants it once).

---

## 15. Demo scenario — Bonaly Terrace Refurbishment

The default demo dataset (no `VITE_DATASET` env var) loads a single residential renovation
project. Set `VITE_DATASET=legacy` to restore the 6-project portfolio.

**Project:** Bonaly Terrace Refurbishment · id `rv1` · Residential full refurbishment ·
Colinton, Edinburgh EH13 · Private client · 84 m² · Stage Mid · Status **Needs review** ·
Overall coverage **69%** · Last scan 2026-06-11 · BIM: Autodesk Revit → IFC · `Bonaly_Refurb_R3.ifc` · LOD 300.

**Team:** J. Mackay · Site supervisor; Cairn Refurbishment Ltd · Main contractor; R. Stewart · Joiner.

**Zones (area-weighted rollup = 69%):**
| id | Name | Area | Coverage | Note |
|---|---|---|---|---|
| z1 | Hallway & stairs | 12 m² | 70% | Parquet to refinish |
| z2 | Living room | 18 m² | 72% | Bay reglazed; floor prep |
| z3 | Kitchen & dining | 16 m² | 80% | Units in; worktops set |
| z4 | Bathroom | 6 m² | 85% | Suite + tiling in |
| z5 | Bedroom 1 (front) | 14 m² | 58% | Plastered; plumb deviation flagged |
| z6 | Bedroom 2 (rear) | 12 m² | 60% | Plastered; boards lifted |
| z7 | Landing | 6 m² | 55% | Balustrade pending |

**Scan history:** sc1 2026-04-02 0% (Baseline) → sc2 2026-04-24 22% → sc3 2026-05-15 41% →
sc4 2026-05-30 58% → sc5 2026-06-11 69% (plumb deviation flagged).

**Issues:**
- **RV-01 · Major** · Bedroom 1 (front) · "Front wall 17 mm out of plumb over 2.4 m (NHBC limit 8 mm)" · Open · raised 2026-06-11 · appears at 65%.
  *Defensible: NHBC tolerance for internal walls is max 8 mm from plumb up to 3 m; scan reports 17 mm — ~2× tolerance, invisible to the naked eye.*
- **RV-02 · Minor** · Kitchen & dining · "Island partition 38 mm off BIM setting-out line" · Open · raised 2026-05-30 · appears at 45%.

**Review note:** "Our supervisor scanned the front bedroom in minutes — OptiSync flagged a 17 mm lean in the gable wall we'd otherwise only have caught at final inspection. Saved a re-plaster after decoration. — Cairn Refurbishment Ltd"

**Captures (10 stills, `pwa/public/captures/`):** bonaly_living_room, bonaly_kitchen,
bonaly_kitchen_diner, bonaly_bathroom, bonaly_bedroom1, bonaly_bedroom2, bonaly_hall,
bonaly_stairs, bonaly_landing, bonaly_garden.

**Per-zone scan feeds (`pwa/public/scans/`):**
- `scan_living.mp4` → z2 (Living room) + fallback
- `scan_kitchen.mp4` → z3 (Kitchen & dining)
- `scan_bathroom.mp4` → z4 (Bathroom)
- `scan_bedroom.mp4` → z5 (Bedroom 1) + z6 (Bedroom 2)

**Dataset switch:** `VITE_DATASET=legacy npm run dev` loads `SEED_LEGACY` (6-project portfolio from `data.legacy.ts`). Omit for the house demo (`SEED_HOUSE` from `data.house.ts`). Selector in `data.ts`.

---

## 16. Change log
- **v1.20 (13 Jun 2026) — Async scan lifecycle · Report rebuild · PDF export.**
  - **Task A — Async scan lifecycle.** New `ScanStatus` type: `Uploading | Uploaded | Processing | Ready | Failed`. After capture ScanFlow shows "Uploading… ✓ Uploaded" then auto-returns to project. New scan appears as **Processing** in the project (amber indicators in scrubber node, zone row, zone coverage bar). Timer runs in AppRoot state (`Record<string, ProcessingJob>`) — default `PROCESSING_MS = 60 000 ms`. Staged labels: `Queued → Aligning to BIM → Generating report → Ready`. On completion the scan flips to Ready and a toast notification fires. **Per-zone lock:** while any scan is Processing for a zone, that zone's scan button is disabled (amber "Processing" badge). Coverage updated immediately on scan write, not deferred to Ready.
  - **Task B — Report content & IA.** Reports screen gains a **scope toggle** ("Whole project / By zone") and per-zone chips. 4-level severity: **Critical · Major · Minor · Cosmetic** with definition text in `SEV` map. Severity tally (`SevTally` 4-column grid). Full **finding cards** (id · severity · zone · location_detail · measured / tolerance / deviation block · impact · action + responsible · status dot · raised date · optional thumbnail). Report header meta (project, client, contractor, BIM + LOD, coverage, accuracy, scan date). Footer: Methodology & limitations + Sign-off (prepared by J. Mackay / reviewed by TBC). Seeded findings: **RV-01** (Major, Bedroom 1, wall 17 mm out of plumb) · **RV-02** (Minor, Kitchen, partition 38 mm off BIM). Zone in Processing shows a "Pending" card. `Scan.status === 'Ready'` seeded on all existing scans in both datasets.
  - **Task C — PDF export.** `lib/pdf.ts` — client-side multipage PDF via jsPDF (lazy `import()`, not in main bundle). Pages: cover (navy header band + meta) → exec summary + severity legend → zone progress (bar charts) → findings register (full cards) → methodology + sign-off. Branding: OptiSync wordmark; footer "Generated by OptiSync · OptiSync P Ltd · Confidential". Share: Web Share API with `File` object on iOS; download fallback on desktop. Per-zone export when scope = zone. `ShareSheet` rewritten to use real `generatePdf()` with a fake progress bar.
  - **Styling:** no new colours — only locked design tokens (`T.*` from `theme.ts`). Minor = `#9AA7B6`; Cosmetic = `T.faint` (existing token, both were already in `theme.ts`). `Button` gains optional `disabled` prop. Scrubber nodes pulse amber when Processing.

- **v1.19 (13 Jun 2026) — Hotfix: scan poster/feed room mismatch.** Scan-flow visuals only — no data or
  coverage changes (rollup stays 22).
  - **The bug.** In the scan flow the aim freeze showed the correct room but the played clip could be a
    different room (e.g. Bathroom froze on the bathroom still, then played the living-room clip). Cause:
    poster and feed were resolved from **two separate sources** — the poster by room name (`bgForZone`),
    the feed by zone id (`ZONE_FEED[zone.id] ?? SCAN_FEED`) — and the `??` fallback silently substituted
    the living-room clip when an entry was missed, hiding the divergence.
  - **The fix — one source of truth.** Replaced the split logic with a single per-zone media map
    `ZONE_MEDIA: Record<string, { feed; poster }>` (keyed by `zone.id`, all four demo zones present) +
    a `zoneMedia(zoneId)` resolver, both in `lib/photos.ts`. In `ScanFlow.tsx` the `<video>` reads
    **both** `src={media.feed}` and `poster={media.poster}` from the same entry, so they cannot diverge.
    Removed the old `bgForZone` by-name poster path and the `ZONE_FEED[…] ?? SCAN_FEED` feed path; deleted
    `ZONE_FEED`. **No cross-room fallback:** an unmapped zone (e.g. legacy-dataset ids) resolves to a
    *consistent* generic room (`SCAN_FEED` + `SCAN_BG.living`, `fallback: true`) — never one room's still
    over another room's clip. DEV: `ScanFlow` logs the resolved `{ zoneId, feed }` on entering aim and
    warns on any fallback; `data.ts` asserts every non-legacy zone id has a `ZONE_MEDIA` entry.
  - **Posters == each clip's frame 0.** The four `pwa/public/scans/scan_{living,kitchen,bathroom,bedroom}
    .mp4` were re-cut (clean in-room starts, ~8 s) and four new `poster_*.jpg` (frame 0 of each clip)
    added, so aim freeze → Begin (play from t=0) is seamless and same-room by construction. Posters are
    .jpg, already covered by the existing Workbox `optisync-images` runtime CacheFirst rule (no
    `globPatterns`/precache change needed — jpgs/mp4s are runtime-cached by design). The single-play /
    "Capture complete" / hold-last-frame behaviour from v1.18 is unchanged.
  - Verified in the browser preview: for **all four zones** the aim poster and the played video are the
    **same room** (Bathroom now plays `scan_bathroom.mp4`); DEV console logs the resolved `{zoneId,feed}`
    with **no fallback warnings**; single-play + stop button + hold-last-frame still work. `tsc` + ESLint
    clean; default + `VITE_DATASET=legacy` builds clean; rollup assertion green (unchanged 22).
- **v1.18 (13 Jun 2026) — Demo round 2: lower starting state + scan-flow realism.** Two changes so the
  live demo scan is the meaningful action, and so the "scan" behaves like a real, user-triggered capture.
  - **Lower starting state (`data.house.ts`).** The project now opens **early-stage at 22%** (was 69%):
    `overall_coverage 22`, `stage Early`, status stays **Needs review**. **Zones reduced 7 → 4** — removed
    `z1` Hallway & stairs, `z6` Bedroom 2, `z7` Landing; kept `z2` Living (area 20 / cov 25), `z3`
    Kitchen & dining (16 / 23), `z4` Bathroom (6 / 26), `z5` Bedroom 1 (14 / 15, the problem zone), all
    `stage Early`. Ids kept z2–z5 so `ZONE_FEED` + capture refs stay valid. **Area-weighted rollup over
    the four scanned zones = 1234 / 56 ≈ 22** (project `area_m2` stays 84 m² whole-house GIA). **Scans
    5 → 2:** `sc1` 28 May (0, baseline) + `sc2` 11 Jun (22, first progress). **Issues:** RV-01 `appear`
    65 → **18**, RV-02 `appear` 45 → **14**, so both show by 22%. **Trades** → early state (strip-out &
    first fix Done; plastering / kitchen / bathroom In progress; joinery / flooring / decoration /
    snagging Not started). **Captures 10 → 6** (garden hero + the four scanned rooms; hall/stairs/landing/
    bedroom2 images left unused). `ZONE_FEED` `z6` entry removed — each of the four zones now has its own
    dedicated clip, no fallback. Result: donut 22% / "Early stage", a 2-point scrubber (0 → 22), both
    issues visible, and the Bedroom 1 scan is the meaningful demo action.
  - **Scan flow = a real single capture (`ScanFlow.tsx`).** The feed `<video>` loses `autoPlay` + `loop`,
    keeps `muted playsInline poster`, gains `preload="auto"`. New playback state machine (the scan
    animation/overlay itself is unchanged): **aim** holds the feed **paused on its first frame** (poster)
    with the aim grid, reticle, a **"Hold steady"** indicator and a subtle `scanDrift` stabilising scale
    (toggle `AIM_DRIFT`, keyframe in `index.html`); **Begin capture** runs `currentTime = 0; play()` and
    starts a fresh point cloud; **capture** shows the progress bar + a **"Capture complete"** stop button;
    capture **ends on whichever comes first** — the clip's `ended`, the sweep reaching the clip length,
    the stop tap, or `CAP_SAFETY_MS` — then `pause()`s on the **last frame** (never reset to poster,
    **never loops**) for process → result. The point-cloud sweep is now wall-clock-driven over the clip's
    duration (robust if a device throttles the muted feed). The from→to delta stays frozen at capture
    start; the scan is still written to the store on the user's finish action.
  - **Assets.** The four `pwa/public/scans/scan_{living,kitchen,bathroom,bedroom}.mp4` clips replaced with
    the re-cut **8.5–9 s** versions (same filenames), so capture length = clip length.
  - Verified in the browser preview: opens 22% / Early with 4 zones (detail + scan picker) + a 2-scan
    scrubber + both issues; aim feed still before Begin → plays once → "Capture complete" visible → ends
    on clip-end or tap → process → result with no looping and the video held on its last frame; Bedroom 1
    scan → report surfaces RV-01 (17 mm out of plumb). `tsc` + ESLint clean; `vite build` clean; DEV
    rollup assertion green (overall = 22); `VITE_DATASET=legacy` still restores the 6-project portfolio.
- **v1.21 (13 Jun 2026) — Report rebuild: UX reorder + zone/project depth split + NSR works + PDF improvements.**
  Full rebuild of the report screen and PDF export, aligned to UK construction industry standards (NSR, NHBC).
  - **Report screen reordered (§1).** Content now leads with the coverage donut → severity tally → zone bars →
    findings register above the fold. Project/report metadata moved into a **collapsible "Report details"**
    section lower down.
  - **Zone vs project depth split (§2).** "Whole project" scope = breadth (donut + exec summary + severity tally +
    all zone bars + full findings register + NSR rollup + project extras + sparkline + collapsible meta +
    methodology + sign-off). "By zone" scope = depth (zone donut + delta + zone scan evidence frame + zone
    findings only + full NSR works table for that zone + collapsible meta + methodology + sign-off).
    Both scopes share `FindingCard`, `NsrTable`, `NsrRollup` components and locked tokens.
  - **Pending: slim banner, not blank (§3).** When a zone scan is Processing but the zone already has prior
    coverage (> 0%), the last Ready report remains visible with a slim amber banner "New scan processing —
    updated report ready in ~60 s." The pending placeholder only shows when the zone has no prior report.
  - **NSR works breakdown (§5).** `NsrUnit = 'LM' | 'SM' | 'NO'`, `NsrStatus = 'Outstanding' | 'In progress' | 'Done'`,
    `NsrItem { code, description, unit, qty, status }` added to `types.ts`; `Zone` extended with `works?: NsrItem[]`.
    Real NSR lines seeded per zone in `data.house.ts` (14 items across 4 zones: N-431315/N-305709/N-330043/
    N-382001/N-442651/N-432251/N-525007/N-305705). Statuses set so done-ratio ≈ each zone's coverage %.
    Zone report shows full NSR table (code/description/unit/qty/status); project report shows rollup
    (X of Y complete + per-zone counts). "NSR (National Schedule of Rates)" named in methodology section.
  - **Findings with scan evidence.** Each `FindingCard` shows the `thumbnail` image inline (RV-01 → Bedroom 1,
    RV-02 → Kitchen). Zone scan evidence frame (poster still from `ZONE_MEDIA`) added to zone drill-down.
  - **Bonaly-specific prose added** (`lib/reports.ts`). `rv1` at `'Early stage'` now has a real summary +
    3 next-action items referencing RV-01 and RV-02. Synthesized fallback prose no longer contains
    "This snapshot re-renders…" dev language.
  - **PDF improvements (§6).** Scoped coverage: zone export shows zone % on cover/donut/meta (not project %);
    project export shows project %. Page count reduced: cover + exec summary combined on page 1;
    zone progress page skipped for zone-scope exports. Scan evidence images embedded per finding card
    (fetched as data URLs, `addImage` via jsPDF). NSR works breakdown page added (zone = single-zone table;
    project = rollup + per-zone tables). Methodology page names NSR. All dev language removed.
  - `tsc` + ESLint + `vite build` clean; rollup assertion green; `VITE_DATASET=legacy` still works.
    Verified in browser preview: project scope (donut→tally→bars→findings+photos→NSR rollup→project extras→
    collapsible meta→methodology with NSR→sign-off); zone scope (zone donut→scan frame→findings→NSR table→
    collapsible meta→methodology→sign-off); Bedroom 1 zone shows 15% (not 22%).
- **v1.17 (13 Jun 2026) — Demo dataset + per-zone scan feeds.**
  - **Dataset switch.** The default seed is now the single **Bonaly Terrace Refurbishment** project
    (`data.house.ts`, `SEED_HOUSE`). The original 6-project portfolio is preserved as
    `data.legacy.ts` (`SEED_LEGACY`), loaded when `VITE_DATASET=legacy`. `data.ts` is now a thin
    selector: `SEED = VITE_DATASET === 'legacy' ? SEED_LEGACY : SEED_HOUSE`. The DEV-mode
    rollup assertion runs over the active seed only.
  - **Bonaly Terrace seed.** Single residential renovation: 84 m², 7 zones, 5 scans, 10 photo
    captures, 2 issues (RV-01 wall 17 mm out of plumb — the hero defect for the demo; RV-02 island
    partition 38 mm off BIM). Area-weighted rollup verified = 69. Hero issue RV-01 appears at 65%
    (visible after the final Bedroom 1 scan in the demo flow).
  - **Per-zone scan feeds.** `lib/photos.ts` now exports `ZONE_FEED: Record<string,string>` mapping
    zone ids z2/z3/z4/z5/z6 to their zone-specific mp4 (living/kitchen/bathroom/bedroom/bedroom).
    `ScanFlow.tsx` sets `<video src={ZONE_FEED[zone.id] ?? SCAN_FEED}>` — z1/z7 and any unknown
    zones fall back to the existing `SCAN_FEED`. The four new mp4s are in `pwa/public/scans/`; the
    existing Workbox mp4 CacheFirst rule covers them for offline use.
  - **10 photo captures** added to `pwa/public/captures/` (478-px-wide video frames); wired as
    direct-path strings in the house project's `captures` array (`photoSrc` already handles
    paths starting with `/`).
  - `tsc` + ESLint clean; `vite build` clean; rollup assertion green.
- **v1.16 (12 Jun 2026) — OptiSync PWA: zone-coverage rollup fix + scan feed video.**
  Two correctness fixes found in a post-deploy test pass.
  - **Zone coverage reconciliation.** Four projects had `overall_coverage` headlines that did not equal
    the area-weighted rollup of their own zones (`Σ(area·coverage)/Σarea`), causing the headline to
    visibly jump on the first scan or zone edit. The locked headline numbers are the marketing/roster
    anchors; the minimal single-zone edit per project was applied to reconcile them: `st-z1` 35→31,
    `mo-z6` 58→52, `ma-z1` 95→94, `cq-z1` 86→84. A DEV-mode `console.assert` loop in `data.ts`
    now fires on module load if any seed project's rollup diverges from its headline, so this can't
    silently drift again.
  - **Scan feed switched to looping video.** The locked v0.9 decision was *scan = moving walkthrough
    footage + canvas overlay*. `ScanFlow.tsx` was still rendering the feed as a `<img>` with a CSS
    pan (`feedpan` keyframe); `SCAN_FEED` / `SCAN_FEED_2` (exported from `photos.ts`) were unused.
    The `<img>` is replaced with `<video src={SCAN_FEED} poster={bgForZone(zoneName)} autoPlay loop
    muted playsInline>`. The `poster` paints the per-zone still instantly before the video decodes.
    The `feedpan` keyframe is removed from `index.html`. The mp4 is served runtime CacheFirst
    (Workbox `optisync-media` rule, `rangeRequests: true`) — already present in `vite.config.ts`,
    not precached (too large). Airplane-mode works after one online load.
- **v1.15 (12 Jun 2026) — OptiSync PWA: manual-test bug-fix + prototype-parity pass.** Nine issues found
  in device testing, fixed against `design-source/` and verified in the browser preview (tsc + ESLint +
  build clean). No data/product-fact changes — UI/navigation/flow fidelity only.
  - **Tab bar scoped to root screens.** The bottom tab bar (and the install banner) now render **only on
    the three tab roots** (Projects / Reports / Account), matching the design (`app.jsx`
    `showTab = ['projects','reports','account']`). Pushed screens (project detail, report, issues,
    settings, plans, team) are full-screen with their own back bar. Implemented via a per-tab nav-depth
    signal: `Navigator` now reports `onDepth(stackLength)`; `AppRoot` hides the tab bar when the active
    tab's depth > 1. This also fixes the **"floating action buttons"** — the detail/report footer CTAs no
    longer sit *above* a visible tab bar (the double-bar read as floating).
  - **Detail/report footers** changed from a translucent frosted bar to the design's transparent→canvas
    **gradient fade** (`linear-gradient(transparent, canvas 26%)`), so body content fades out cleanly
    under the pinned CTAs instead of bleeding through a blurred bar. They are pinned with
    **`position: absolute; bottom: 0`** (the design's approach), **not `sticky`** — `sticky` left the bar
    floating mid-content in the centered desktop-card layout; `absolute` keeps it fixed to the screen
    frame in both the fullscreen-phone and the centered-card layouts.
  - **Launch splash status bar.** Static `#initial-splash`, the React `<Splash>`, and the manifest
    `background_color` are now **white** (`#FFFFFF`) to match `theme-color` + the in-app white headers —
    removes the status-bar seam on the splash (the in-app status bar was already correct).
  - **Scan-history scrubber** rebuilt to the design `Timeline`: one continuous navy rail + progress fill
    with absolutely-placed nodes, so the line no longer kinks/misaligns at the larger selected node.
  - **Project edit affordances.** The detail header "edit" button uses a **pencil** icon (was the `user`
    person glyph, which read as a profile link); zone-coverage rows show a small pencil next to the name
    so they read as editable (was no affordance).
  - **Project site captures** open a **full-screen lightbox** on tap (prev/next + counter), matching the
    progress report's gallery (previously the project's captures were not tappable to full screen).
  - **Scan flow re-ported to the prototype** (`screens-scan.jsx` + `ScanPicker`). Was a single dark list;
    now: **light project picker** (mini-donut + stage chip + zones/last-scan) → **light area select**
    (radio cards per zone with `coverage% · area m²`, "Start scan · {zone}") → **aim** (walkthrough still
    feed + blueprint grid + teal reticle + "Begin capture") → **capture** (counter + vertical point-cloud
    sweep + pts bar) → **process** ("Aligning to BIM…") → **result** ("Scan aligned to BIM", frozen
    from→to delta tiles, Done / View report). The from→to delta is **frozen at capture start** and the
    scan is written on the user's finish action (not on entering Result) so the result numbers don't
    drift once the store mutates. The scan visual now uses zone-specific stills (`bgForZone`) per the
    prototype rather than the prior `scan_feed.mp4` video.
  - **Issues relocated.** "Issues & snags" moved **out of the Account workspace** into the **Reports tab**
    (header shortcut), per the design (Issues is a portfolio/reporting concern, surfaced from
    `ReportsHistory`, not the profile). The Account "Open issues" stat stays.
  - **Settings → About** no longer appends the demo company ("Cairn Refurbishment Ltd"); it now credits the
    maker — "iPhone-LiDAR + BIM progress & coverage reporting. Scan. Compare. Prove. · © 2026 Athar
    Robotics".
- **v1.14 (12 Jun 2026) — OptiSync redesign: the `pwa/` is rebuilt as OptiSync (in progress).** Major
  redesign of the production PWA from *Athar Eye* (dark) to **OptiSync** (light "Blueprint + teal"),
  same stack (Vite + React 18 + TS strict + vite-plugin-pwa + Netlify), same repo, branch
  `feature/optisync-phase-1`. Driven by the validated Claude Design prototype + handoff bundle
  (`OPTISYNC_HANDOFF`: `OPTISYNC_CODE_PROMPT.md`, `OptiSync - Full Handoff & Build Documentation.md`,
  `OPTISYNC_DATA_SPEC.md`, `OPTISYNC_DEEP_REPORTS.md`, `OPTISYNC_PHOTO_MAP.md`,
  `OPTISYNC_VISUALS_PRESENTATION.md`). **Those docs are authoritative for the OptiSync PWA**; they
  supersede §6.2 (now updated to the locked light tokens), §8 screens, and §10 data here (kept as the
  frozen-ports reference). Locked decisions:
  - **Design system** — light Blueprint+teal (canvas `#EDF1F6` · surface `#FFFFFF` · hairline `#D8E1EC`
    · ink `#1B2A3D` · muted `#64748B` · navy `#1E3A66` · blue `#2D6FB0` · teal `#18837E` · amber
    `#B5781A` · red `#C0492F`); **Inter** type (self-hosted variable woff2, `.mono` tnum/lnum);
    white header with a 2px navy underline; donut + zone bars + severity dots + sparkline.
  - **Product** — iPhone-first BIM **progress & coverage tracker** for UK SME contractors. In-app
    contractor account = **Cairn Refurbishment Ltd** (report "Prepared by" footer too); "OptiSync" is
    the product/app name only. *(Resolves the `OPTISYNC_DATA_SPEC`/`DEEP_REPORTS` "Optisync Ltd"
    pre-rename drift — handoff doc decision #13 wins.)*
  - **Data** — 6 UK projects (verbatim from `OPTISYNC_DATA_SPEC`): Stirling (Early 28%), Morningside
    (Mid 62%, hero), Leith (Complete 100%), Hyndland (Mid 74%, Needs review — 220 mm partition
    deviation), Marischal (Aberdeen office 91%, commercial, no photos), City Quay (Dundee warehouse
    82%, commercial, no photos). Rich model: zones (area + coverage + roll-up), issues (severity +
    appear/clear thresholds), scan history, BIM, trades, team, captures. **State is in-memory, seeded
    from the typed data module — refresh = reset** (no localStorage for core state).
  - **12 screens + bottom nav** (Projects · Reports · Scan-centre · Account): Splash, Projects, New
    project, Project detail, Scan flow, Progress report, Reports history, Issues/snags, Plans/billing,
    Account/profile, Team & access, Settings, Share/export sheet. **Full CRUD** across projects, zones,
    issues, trades, captures, team, BIM, profile (single mutation path `api.update(id, fn, rollup?)`).
  - **Two signature interactions** — (1) **timeline scrubber** on Project detail: tap/drag a scan
    point → <200 ms crossfade of donut + zone bars + issues-open-at-date + stage captures (Leith scrubs
    0→22→48→71→94→100, snags → 0 at handover); (2) **scan animation** on Scan flow: a looping room
    walkthrough video (`scan_feed.mp4`, `<video … playsinline>`) with a canvas point-cloud overlay
    accreting on top (Aim → Capturing → Processing → Result), writing a real new scan to Morningside
    (62 → 66%). Deterministic, offline; honest scope = simulation of a LiDAR capture (real ARKit+LiDAR
    is the native-app roadmap).
  - **Gaps noted** — the bundle shipped no prototype HTML / Design source exports (building to the
    written spec) and no logo file (placeholder OptiSync SVG mark in use; real logo + PWA icons
    180/192/512 wired at the brand phase). No board/visa wording anywhere.
  - **Build phases (commit per unit):** ✓(1) rebrand shell + SPEC; ✓(2) data layer (types/data/photos/
    reports); ✓(3) light tokens + primitives; ✓(4) in-memory store + portfolio (Projects/NewProject/
    ProjectDetail overview/Reports doc/Account/Settings); ✓(5) detail timeline scrubber + full CRUD
    (bottom-sheet editors; zone-coverage edits roll up overall %; View log + per-scan report);
    ✓(6) scan video + point-cloud flow (writes a real scan to Morningside 62→66, opens as a report);
    ✓(7) reports history + per-scan + deep/light/commercial variants + share/export sheet (Save PDF /
    copy link / email, with progress→success) + Report→Project nav; ✓(8) account cluster — Account hub
    (CR monogram/stats/company/Edit profile), Issues & snags (portfolio aggregate + counts + filters +
    CRUD), Plans/billing (tier ladder + switch + add-ons), Team & access (roles, invite/edit/remove),
    Settings; ✓(9) real logo + PWA icons + offline caching + **design reconciliation** against the
    recovered Claude Design export (`app/*.jsx`, `tokens/`). **All 9 phases done.** The supplied OptiSync
    logo drives the Mark/splash/generated icons (apple-touch/180/192/512/maskable/favicon via sips); SW
    runtime-caches photos + scan videos. Reconciled to the locked design: 22px white app-bar + 2px navy
    underline (list screens), navy scan tab + active navy-08 pills, donut ink centre on navy-08 track,
    area-gradient sparkline, StageChip/StatusPill dot styles, Projects row (chip top-right + pin-location
    + status dot), card r14 + subtle shadow. Verified across screens in preview; build/tsc/lint clean.
    **Remaining:** deploy `pwa/dist/` (Netlify) + on-device Add-to-Home-Screen / offline check.
  - **Repo cleanup (pre-host):** PWA source fully de-Athar'd (InstallPrompt + ErrorBoundary → OptiSync,
    light skin; lockfile name). `design-source/` replaced with the **OptiSync** Claude Design export
    (app/*.jsx, tokens, prototype). README / START_HERE / CLAUDE.md updated to OptiSync;
    CLAUDE_CODE_BUILD.md banner-marked legacy/superseded. `reactnative/` · `flutter/` · `ios-native/`
    intentionally **kept as frozen Athar-Eye-era comparison ports** (prior dark design, not re-ported) —
    owner decision.
- **v1.13 (3 Jun 2026) — stack comparison ports: Flutter (`flutter/`) + native iOS SwiftUI (`ios-native/`).**
  Optional follow-on to v1.12, to compare native feel / animation performance across stacks. Each is a
  **focused comparison subset** (not all 13 screens): the navy/teal tokens + the 6 demo projects (verbatim)
  + the **hero screens** — Projects list, Report detail (animated count-up donut), and the **LiDAR
  point-cloud scan** (the perf showcase). The three stacks' point clouds are the headline comparison:
  RN **react-native-skia** vs Flutter **`CustomPainter` + `AnimationController`** vs SwiftUI
  **`TimelineView(.animation)` + `Canvas`**. Reports/Settings are stubs; search/persistence/BIM/iso-massing/
  live-camera are out of scope by design.
  - **`flutter/`** — Flutter 3.41 / Dart 3.11, Material 3 dark, no third-party deps (all visuals are
    `CustomPainter`). Validated: **`fvm flutter analyze` → "No issues found!"** + a widget smoke test.
    Run `fvm flutter run`. (Owner uses fvm; the bare `flutter` alias is interactive-only — use `fvm flutter`.)
  - **`ios-native/`** — SwiftUI, iOS 17+, Swift 6 (strict concurrency), project generated by **xcodegen**
    from `project.yml`. Validated: **`xcodebuild … -sdk iphonesimulator` → BUILD SUCCEEDED** (iPhone 16 Pro,
    pin `OS=18.6` — two same-named sims exist). Open `AtharEyeCompare.xcodeproj` in Xcode to run.
  - **Folder model:** each stack is its own root folder (`reactnative/`, `flutter/`, `ios-native/`) per the
    owner's "differentiate" direction; the old `native/` placeholder is retired. Both ports are **compile-
    validated only** (analyze / simulator build), not device- or pixel-verified; brand mark is drawn (not the
    PNG) and the active scan uses the gradient backdrop (no live camera) to keep the comparison asset-free.
- **v1.12 (3 Jun 2026) — Phase B native app: React Native + Expo (`reactnative/`).** Built the native iOS
  app as an **exact feature + visual copy** of the PWA, in a new **`reactnative/`** stack (renamed from the
  `native/` placeholder so future **native-iOS-Swift** and **Flutter** comparison ports can sit as siblings —
  owner direction). Stack: **Expo SDK 56 · React Native 0.85 · React 19 · TypeScript strict · expo-router**
  (file-based) with **@shopify/react-native-skia** (the scan point cloud, redrawn on the UI thread via
  `useClock`/`createPicture` for 60fps), **expo-camera** (live rear-camera scan background, gradient
  fallback), **react-native-svg** (icons / donut / ring / iso-massing / blueprint tiles),
  **react-native-reanimated 4** (splash, sheets, skeleton sheen, scan progress), **AsyncStorage**
  (replaces localStorage), and expo-haptics / expo-sharing / expo-blur / expo-linear-gradient.
  - **All 13 screens** ported 1:1 (Splash, Projects list/detail/new, Reports list/detail, Settings/Profile/
    Plans, Scan select/guidance/active/processing/result, Share sheet). `theme.ts` / `types.ts` / `data.ts`
    copied verbatim; the design tokens + every padding/size/colour match the PWA.
  - **Navigation:** native push/pop + edge-swipe-back via expo-router. Each tab is a real-folder Stack so the
    **tab bar persists on detail** (matches the PWA, and avoids expo-router's bare-`(group)` index collision);
    the scan flow is a full-screen modal. Sheets/confirms use RN `Modal` (`onRequestClose` = Android back).
  - **Persistence:** seeds from `data.ts`, hydrates from AsyncStorage, persists create/delete/scan across a
    cold restart (`store/AppStore.tsx` — the backend seam).
  - **Config:** `app.json` name "Athar Eye", bundleId `com.atharrobotics.eye`, dark-locked, navy OS-matched
    splash, camera-permission plugin. `ios/`/`android/` are gitignored CNG output.
  - **Validated:** `tsc --noEmit`, `expo export` (Metro bundle, 1945 modules, React Compiler on),
    `expo-doctor` (21/21), `expo prebuild -p ios`, and `expo lint` all clean. **Not yet device-tested** —
    the one remaining manual step is `npx expo run:ios --device` on the iPhone (free Apple ID; needs the
    on-device camera-permission grant). Full reference: [`reactnative/ARCHITECTURE.md`](reactnative/ARCHITECTURE.md).
  - **Deltas vs PWA (native equivalents, no behaviour change):** Skia↔2D-canvas, expo-camera↔getUserMedia,
    AsyncStorage↔localStorage, expo-haptics↔navigator.vibrate, native back↔History-API back-stack; the camera
    vignette + radial card gradients are approximated (RN has no inset shadow / radial gradient). PWA-only
    concepts (install prompt, service worker, responsive desktop card) are omitted as irrelevant on native.
- **v1.11 (3 Jun 2026) — codebase cleanup (no behavior change).** Structural and style pass: `ProjectStatus`/`Severity` types moved from `theme.ts` → `types.ts` (correct dependency direction; `theme.ts` now imports them). `vite-env.d.ts` moved to `src/` (standard Vite convention). `SEV2` in `Reports.tsx` replaced with the existing `SEV` from `theme.ts`. Optional chaining (`onClick?.()`) in `PushHeader`. Removed "Ported from design-source" provenance comments, `// ════════════════` section banners, and comments that restate what the code already says.
- **v1.10 (2 Jun 2026) — scan overlay visibility tuning (owner feedback).** The room wireframe and point cloud were barely readable against the live camera feed. Camera opacity reduced 72% → 55% (darker background lets the teal pop); wireframe start alpha raised from 5% → 18% (`roomA = 0.18 + 0.32 × p`, max ~50% at scan end); line width 1 px → 1.5 px. Point cloud unchanged. Net: the AR overlay is clearly legible on any real-world camera background.
- **v1.9 (2 Jun 2026) — splash OS-handoff + live camera scan.**
  - **Splash glitch fix (owner feedback):** on Android, the OS native splash (icon centered on the
    manifest colour) handed off to a web splash with a *different* layout (smaller icon, higher up,
    gradient bg) → the icon visibly jumped/shrank. Now the static HTML splash and the React `<Splash>`
    both use **solid `#0C0F12`** with the **icon centered at 112px** (wordmark fades in below,
    absolutely positioned so the icon never moves) — matching the OS splash, so the handoff is seamless.
  - **Live camera scan background:** `ActiveScan`'s `CameraBG` now uses the **live rear camera**
    (`getUserMedia`, dimmed + vignette) behind the wireframe + point cloud, with a gradient fallback
    (see §14). Adds realism; needs HTTPS + a one-time camera permission.
- **v1.8 (2 Jun 2026) — PWA auto-update on refresh (owner feedback).** Symptom: after a rebuild,
  a refresh kept showing the old code (new features like search only appeared after clearing site
  data). Cause: the service worker serves the app from cache (offline/installable), and the minimal
  auto-injected registration didn't reload the page when the new SW took over — so it needed a 2nd
  refresh / cache clear. Fix: `main.tsx` now calls `registerSW({ immediate: true })`
  (`virtual:pwa-register`), so a new deploy **auto-reloads to the latest on the next visit/refresh**.
  Dev (`npm run dev`) has the SW disabled, so dev refresh is always fresh. Note: the **SW code
  cache** (whether new code loads) is independent of **localStorage data** (your projects) — see
  ARCHITECTURE §7.
- **v1.7 (2 Jun 2026) — working search (owner feedback).** The Projects/Reports search icons were
  decorative (no handler). Wired up real search: tapping it reveals an inline iOS-style `SearchBar`
  (autofocus, clear ×, Cancel) that **live-filters** the list by name / location / type / client.
  System Back closes the search. Verified on both screens (e.g. "edinburgh" → both Edinburgh
  projects, "shop" → the Shop-refit one).
- **v1.6 (2 Jun 2026) — delete project (owner feedback).** Added a per-project **Delete** action
  (ProjectDetail → destructive "Delete project" button → iOS-style `DeleteConfirm` action sheet →
  `deleteProject(id)`). It removes only that project and **persists** (survives reload) — so the
  storage reset is no longer the only way to remove a project. System Back dismisses the confirm.
  Verified: delete → back to list → reload → stays gone (6 projects).
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
