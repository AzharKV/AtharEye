import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

// Auto-update the PWA: when a new build is deployed, the service worker fetches
// it and the app reloads to the latest on the next visit/refresh — no manual
// cache-clear or second refresh. Data lives in localStorage, so a reload loses
// nothing. (In `npm run dev` the SW is disabled, so dev refresh is always fresh.)
registerSW({ immediate: true });

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('#root not found');

createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

// Hand off from the static HTML splash to the React app once mounted, on the
// next frame so React has painted underneath — seamless (no blank flash, §4.3).
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const el = document.getElementById('initial-splash');
    if (!el) return;
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 420);
  });
});
