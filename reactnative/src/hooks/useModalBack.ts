import { useEffect } from 'react';
import { BackHandler } from 'react-native';

// useModalBack — RN equivalent of the PWA's useBackLayer: make the Android hardware/gesture Back
// button dismiss a boolean-controlled overlay (share sheet, BIM sheet, delete confirm) instead of
// leaving the screen. (iOS has no hardware back, so this is primarily an Android nicety — same as
// the PWA's note.) Pushed screens are handled natively by the stack navigator.
export function useModalBack(open: boolean, onClose: () => void): void {
  useEffect(() => {
    if (!open) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [open, onClose]);
}
