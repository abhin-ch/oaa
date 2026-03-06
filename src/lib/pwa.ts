/** Returns true when running as an installed PWA, not in a browser tab. */
export function isRunningAsStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Record<string, unknown>).standalone === true
  );
}
