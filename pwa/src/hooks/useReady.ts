import { useEffect, useState } from 'react';

/**
 * A small page-load gate: returns `false` for `ms` after mount, then `true`. Mimics a real fetch on a
 * fresh screen so navigation into a data-heavy page isn't instantaneous. Keep `ms` small.
 */
export function useReady(ms = 340): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), ms);
    return () => window.clearTimeout(t);
  }, [ms]);
  return ready;
}
