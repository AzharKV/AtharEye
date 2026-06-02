import { useEffect, useRef } from 'react';
import { openBackLayer } from '../navigation/backstack';

// useBackLayer — make the system/browser Back button dismiss a boolean-controlled
// overlay (scan modal, share sheet, BIM sheet). When `open` is true the layer
// owns a history entry; Back (or an in-app close) removes it. See backstack.ts.
export function useBackLayer(open: boolean, onClose: () => void): void {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const release = openBackLayer(() => onCloseRef.current());
    return release; // in-app close / unmount → consume the history entry
  }, [open]);
}
