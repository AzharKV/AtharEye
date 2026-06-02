// haptic.ts — best-effort tactile tick on supported devices (no-op elsewhere).
export const haptic = (): void => {
  try {
    if (navigator.vibrate) navigator.vibrate(8);
  } catch {
    /* unsupported — ignore */
  }
};
