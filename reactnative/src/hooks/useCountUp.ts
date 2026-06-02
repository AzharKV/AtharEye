import { useEffect, useState } from 'react';

// Timer-driven count-up (donut/ring). Respects a `run` gate. Ported from the PWA.
export function useCountUp(target: number, dur = 1100, run = true): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) {
      setV(target);
      return;
    }
    setV(0);
    const start = Date.now();
    const ease = (x: number) => 1 - Math.pow(1 - x, 3);
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / dur);
      setV(target * ease(p));
      if (p >= 1) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, run]);
  return v;
}
