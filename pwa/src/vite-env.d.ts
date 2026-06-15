/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// Build-time demo selectors (see src/data.ts). VITE_DEMO chooses the recording preset;
// VITE_DATASET=legacy is a separate edge-case escape hatch.
interface ImportMetaEnv {
  readonly VITE_DEMO?: 'client' | 'optisync' | 'house';
  readonly VITE_DATASET?: 'legacy';
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
