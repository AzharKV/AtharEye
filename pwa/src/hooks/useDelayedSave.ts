import { useCallback, useRef, useState } from 'react';

/**
 * Wrap a write action with a small "real app" latency. Shows a pending state, waits `ms`, then runs
 * `commit` (which usually closes the sheet, so there's no need to reset). Re-entrancy is guarded, so
 * a double-tap can't fire the mutation twice. Keep `ms` small — this is flavour, not a real request.
 */
export function useDelayedSave(ms = 480) {
  const [saving, setSaving] = useState(false);
  const lock = useRef(false);
  const run = useCallback(
    (commit: () => void) => {
      if (lock.current) return;
      lock.current = true;
      setSaving(true);
      window.setTimeout(commit, ms);
    },
    [ms],
  );
  return { saving, run };
}
