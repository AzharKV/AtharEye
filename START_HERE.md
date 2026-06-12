# OptiSync — start here

**OptiSync** is an iPhone-LiDAR + BIM construction **progress & coverage** PWA (Scan. Compare. Prove.),
by Athar Robotics. (Formerly *Athar Eye*.)

## Where things are
- **The product** → [`pwa/`](pwa/) — the OptiSync PWA. Full engineering reference: [`pwa/ARCHITECTURE.md`](pwa/ARCHITECTURE.md).
- **Source of truth** → [`SPEC.md`](SPEC.md) (product / data / design + the §15 decision log).
- **Visual reference** → [`design-source/`](design-source/) — the locked OptiSync Claude Design export (port it, don't redesign).
- **Working rules** → [`CLAUDE.md`](CLAUDE.md).
- **Frozen legacy** → `reactnative/` · `flutter/` · `ios-native/` are Athar-Eye-era comparison ports (not current OptiSync).

## Run / build / deploy the PWA
```bash
cd pwa
npm install
npm run dev      # local dev (HMR)
npm run build    # → static dist/
npm run preview  # serve the build (SW active) — test offline / install
```
Hosting: build `npm run build`, publish `pwa/dist/` at the site root over HTTPS (Netlify / Vercel /
Cloudflare). Then on iPhone: **Safari → Add to Home Screen**; load once online, then it runs offline.
