import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// OptiSync — Vite + React 18 + TypeScript + vite-plugin-pwa (Workbox).
// Static output → dist/, deployable free to Netlify / Vercel / Cloudflare Pages.
// Target ES2020 / Safari 15+ per CLAUDE_CODE_BUILD.md §1.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Precache the app shell + every emitted asset so the whole app works in
      // Airplane mode after first load (acceptance criterion §4.7).
      includeAssets: [
        'favicon.png',
        'apple-touch-icon.png',
        'icon-180.png',
        'icon-192.png',
        'icon-512.png',
        'icon-maskable-512.png',
      ],
      // Manifest: OptiSync, light Blueprint+teal theme, standalone, portrait.
      manifest: {
        // Absolute id/start_url/scope + 192/512 (any) and a maskable icon are
        // what Android needs to build a standalone WebAPK (not a browser
        // shortcut). Assumes a root deploy (Netlify/Vercel/Cloudflare).
        id: '/',
        name: 'OptiSync',
        short_name: 'OptiSync',
        description:
          'Scan a site with iPhone LiDAR, align to BIM, and prove progress & coverage. Scan. Compare. Prove.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        display_override: ['standalone'],
        orientation: 'portrait',
        background_color: '#EDF1F6',
        theme_color: '#FFFFFF',
        categories: ['business', 'productivity', 'utilities'],
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
        // SPA fallback so deep links / reloads resolve offline.
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        // Enable the SW in `vite preview` checks; off during `vite dev` HMR.
        enabled: false,
      },
    }),
  ],
  build: {
    target: 'es2020',
    cssTarget: 'safari15',
    sourcemap: false,
  },
});
