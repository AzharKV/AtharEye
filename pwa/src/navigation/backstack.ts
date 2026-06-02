// backstack.ts — make the system/gesture Back button behave like a native app.
//
// The app navigates with an in-memory stack (no URL routing), so without this the
// Android hardware/gesture Back button (and the browser Back button) would leave
// or close the PWA instead of going back inside it. Here, every open dismissible
// layer — a pushed screen, the scan modal, a sheet — owns ONE history entry, and
// Back closes the top-most layer. At the root, Back falls through (exits), which
// is the correct native behavior.
//
// iOS standalone PWAs have no Back button or edge-swipe, so users there rely on
// the in-app back controls; this primarily helps Android + every browser.

type Layer = { onBack: () => void };

const layers: Layer[] = [];
let listening = false;
let suppress = 0; // count of our own history.back() calls to ignore in popstate

function ensureListening() {
  if (listening || typeof window === 'undefined' || !window.history) return;
  listening = true;
  window.addEventListener('popstate', () => {
    if (suppress > 0) {
      suppress--;
      return;
    }
    const layer = layers.pop();
    if (layer) layer.onBack();
  });
}

/**
 * Register an open layer and add a history entry to absorb the next Back press.
 * Returns `release()` — call it when the layer is closed by an in-app action
 * (not by Back) so its history entry is consumed without double-closing.
 */
export function openBackLayer(onBack: () => void): () => void {
  ensureListening();
  const layer: Layer = { onBack };
  layers.push(layer);
  try {
    window.history.pushState({ ae: layers.length }, '');
  } catch {
    /* history unavailable — degrade gracefully */
  }
  return () => {
    const i = layers.lastIndexOf(layer);
    if (i === -1) return; // already closed via Back
    layers.splice(i, 1);
    suppress++;
    try {
      window.history.back();
    } catch {
      suppress--;
    }
  };
}
