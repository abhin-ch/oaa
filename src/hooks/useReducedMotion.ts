'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Returns `true` when the user has enabled the "prefers-reduced-motion"
 * OS/browser setting.  Listens for live changes (e.g. the user toggling
 * the setting while the app is open).
 *
 * Returns `false` during SSR (server snapshot) to avoid hydration mismatches.
 */
export function useReducedMotion(): boolean {
  const subscribe = (callback: () => void) => {
    const mql = window.matchMedia(QUERY);
    mql.addEventListener('change', callback);
    return () => mql.removeEventListener('change', callback);
  };

  const getSnapshot = () => window.matchMedia(QUERY).matches;

  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
