# OptiSync Design System

**OptiSync** is an iPhone-first, BIM-integrated construction **progress & coverage** tracker for UK SME contractors. A user scans a site room-by-room with iPhone LiDAR, the app aligns the scan to the BIM model, and it reports **coverage % vs plan**, deviations, snags and progress over time — producing a client-ready report at any stage. Tagline: **"Scan. Compare. Prove."**

This design system was extracted from the validated OptiSync prototype. It captures the locked **"Blueprint + teal" (light)** visual language as reusable tokens, components, and a click-through UI kit.

> **Sources:** built from the in-project prototype (`OptiSync Prototype.html` + `app/*`). Original brief and demo data: `uploads/files (3)/OPTISYNC_*.md`. The app is used by a fictional contractor, **Cairn Refurbishment Ltd** (distinct from the product name, OptiSync).

---

## Index / manifest

- **`styles.css`** — global entry point. Link this one file. `@import`s tokens + base.
- **`tokens/`** — `colors.css`, `typography.css`, `spacing.css`, `fonts.css` (CSS custom properties + webfont).
- **`base.css`** — reset, type defaults, and the utility/component classes (`.card`, `.btn`, `.chip`, `.status`, `.sev`, `.zbar-*`, `.field`, `.mono`, `.section-label`) shipped to consumers.
- **`components/`** — React primitives:
  - `buttons/` — **Button**
  - `status/` — **StageChip**, **StatusPill**, **SeverityDot**
  - `dataviz/` — **Donut**, **ZoneBars**, **Sparkline**
  - `surfaces/` — **Card**, **SectionHeader**
  - `forms/` — **Field**, **Segmented**
- **`ui_kits/optisync-app/`** — interactive iPhone recreation: Projects → Project detail (tappable scan scrubber) → Progress report.
- **`guidelines/`** — foundation specimen cards (Colors, Type, Spacing, Brand).
- **`assets/`** — `optisync-logo.jpeg` (product logo).
- **`SKILL.md`** — Agent-Skill manifest for downstream use.

---

## Content fundamentals

How OptiSync writes copy:

- **Voice:** plain, professional, trade-literate. It talks like a site manager writing a clear client update, not a SaaS marketer. No hype, no exclamation marks.
- **Person:** third-person and impersonal in reports ("28% of the BIM model verified against site"); second-person only in guidance ("Move slowly across the room").
- **State language is fixed:** **Early stage → Mid-build → Finishing → Complete** for build phase; **On track / Needs review / Behind / Complete** for health. "Needs review" always signals something needing attention (amber).
- **Numbers carry the message.** Coverage %, deviations (mm), dates, prices are the nouns — always set in tabular lining figures (`.mono`). Example deltas: "Kitchen +6% · 62 → 66%", "partition 220 mm off plan".
- **Casing:** Sentence case for titles and buttons ("New scan", "Share / export"). UPPERCASE only for tiny section labels and document tags ("PROGRESS REPORT", "ZONE COVERAGE").
- **Concrete, never filler.** Real zones, real trades, real snags ("Boiler flue clearance below regs to new window"). No lorem, no invented stats.
- **No emoji.** Iconography is line-based SVG only.

---

## Visual foundations

- **Palette — "Blueprint + teal", light.** Canvas `#EDF1F6`, white surfaces, hairline `#D8E1EC` borders, ink `#1B2A3D` text, muted `#64748B`. **Navy `#1E3A66`** is the structural/primary colour (nav, buttons, in-progress rings). **Blue `#2D6FB0`** = in progress; **teal `#18837E`** = verified / complete / positive; **amber `#B5781A`** = needs review/behind; **red `#C0492F`** = critical. A brighter **teal `#2FB6AD`** is reserved for the live scan accent only. Colours are flat — **no gradients** except a brief protection gradient behind sticky action footers and the scan camera overlay.
- **Type — Inter throughout.** Headings track tight (`-0.02em`, 700); body is 400 at 15px with a hair of negative tracking (`-0.006em`); section labels are 11.5px/700 uppercase with `+0.06em`. There is no separate mono family — numerics use Inter with `tabular-nums lining-nums` (the `.mono` class) so figures align in columns.
- **Numerics are a motif.** Every %, coverage figure, mm deviation, date and price is tabular. Donut centres, zone-bar values, report header tables all use it.
- **Cards:** white surface, 1px hairline border, `--r` 14px radius, and a very soft two-part shadow (`--sh-card`). Sheets/popovers use a deeper `--sh-pop` and 20px radius.
- **Corner radii:** 10 (inputs) · 14 (cards/buttons) · 20 (sheets) · pill (chips/filters).
- **Header pattern:** white app bar with a **2px navy bottom border** — a signature. Document/report headers repeat it.
- **Data-viz language:** coverage shown as a **donut + horizontal bars**; progress over time as an area **sparkline** (last point teal); issues as **severity dots** (red/amber/grey). Bars and rings are navy until 100%, then flip teal.
- **Motion:** quick and functional. Screen enters with a 6–7px translate (no fade, so content is visible at rest and in print). Donut/bar fills animate `stroke-dashoffset`/`width` over ~0.4–0.7s `cubic-bezier(.4,0,.2,1)`. Scrubber crossfades report state <200ms. Respects `prefers-reduced-motion`. No decorative/infinite loops.
- **Press states:** buttons scale to `.975` and darken on `:active`; primary navy → `#16294a`. **Hover** is minimal (this is a touch product).
- **Inputs:** hairline border, navy focus ring (`0 0 0 3px var(--navy-08)`).
- **Imagery:** real site photography (warm, natural, un-filtered), shown in 4:3 tiles with a bottom protection gradient + white caption. Commercial projects render **no** gallery ("captures pending sync").
- **Layout:** single-column iPhone (390×844). Sticky bottom tab bar (Projects · Reports · Scan · Account) and sticky action footers fade in over a protection gradient.

---

## Iconography

- **Line SVG icons, 24×24 grid, ~1.6–1.8 stroke, round caps/joins.** No fills. Drawn inline; the set covers projects (house), reports (doc), scan (viewfinder), pin, share, BIM (cube/wireframe), team, camera, check, alert (triangle), clock, trash, plus, chevrons, user, bolt, layers.
- **No icon font, no emoji, no unicode glyphs** as icons.
- The **logo** (`assets/optisync-logo.jpeg`) is a raster mark used for splash, report headers, and the iOS home-screen app icon. The wordmark sets "Sync" in teal: Opti**Sync**.
- When extending: match the existing stroke weight and keep icons monochrome (`currentColor`), inheriting the text colour of their context.

---

## Caveats

- **Font:** Inter is loaded from Google Fonts CDN (`tokens/fonts.css`). It's the real typeface, not a substitute — swap in self-hosted binaries for offline/production if needed.
- The component cards and UI kit mount against the compiler-generated `_ds_bundle.js`; they render in the Design System tab once the system is compiled.
