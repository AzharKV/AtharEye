import { useEffect, useState } from 'react';

// useReady — app-shell loading pattern. The shell + skeletons paint instantly; real content fills
// in after a short simulated fetch so transitions feel like a live networked app and there is never
// a blank flash. Cached per key so revisiting a tab is instant (no re-skeleton). Ported from the PWA.
const settled = new Set<string>();

export function useReady(key: string, delay = 360): boolean {
  const [ready, setReady] = useState(() => settled.has(key));
  useEffect(() => {
    if (settled.has(key)) {
      setReady(true);
      return;
    }
    const id = setTimeout(() => {
      settled.add(key);
      setReady(true);
    }, delay);
    return () => clearTimeout(id);
  }, [key, delay]);
  return ready;
}
