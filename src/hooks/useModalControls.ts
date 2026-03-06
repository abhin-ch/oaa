import { useEffect, type RefObject } from 'react';

/** Close modal on Escape key and auto-focus an element when opened. */
export function useModalControls(
  open: boolean,
  onClose: () => void,
  focusRef?: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!open) return;
    if (focusRef) setTimeout(() => focusRef.current?.focus(), 100);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose, focusRef]);
}
