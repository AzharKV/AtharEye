// haptic.ts — best-effort tactile tick on taps/nav (the RN equivalent of the PWA's
// navigator.vibrate(8)). expo-haptics selection feedback is the closest light "tick".
import * as Haptics from 'expo-haptics';

export const haptic = (): void => {
  Haptics.selectionAsync().catch(() => {
    /* unsupported / simulator — ignore */
  });
};

/** Stronger success cue (scan complete). */
export const hapticSuccess = (): void => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
};
