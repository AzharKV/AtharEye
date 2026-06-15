/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// `VITE_DATASET=legacy` is an edge-case escape hatch (the 6-project portfolio). The client→optisync
// demo transition is a runtime localStorage phase flag (see lib/store.ts), not a build-time selector.
interface ImportMetaEnv {
  readonly VITE_DATASET?: 'legacy';
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
