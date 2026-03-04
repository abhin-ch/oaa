'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface OnlineStatus {
  /** Whether the browser currently reports being online. */
  isOnline: boolean;
  /**
   * Briefly `true` after the connection is restored (for showing a
   * "Back online" toast). Resets to `false` after `resetDelay` ms.
   */
  wasOffline: boolean;
}

/**
 * Detects online/offline state and provides a transient `wasOffline` flag
 * that stays `true` for a short period after reconnection so the UI can
 * display a "Back online" notification.
 *
 * @param resetDelay  How long `wasOffline` stays `true` after coming back
 *                    online, in milliseconds. Defaults to 3 000 ms.
 */
export function useOnlineStatus(resetDelay = 3000): OnlineStatus {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const [wasOffline, setWasOffline] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    setWasOffline(true);

    // Clear any existing timer so resets don't stack
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setWasOffline(false);
      timerRef.current = null;
    }, resetDelay);
  }, [resetDelay]);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
  }, []);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [handleOnline, handleOffline]);

  return { isOnline, wasOffline };
}
