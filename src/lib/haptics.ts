/**
 * Centralized haptic feedback utility.
 *
 * Uses `navigator.vibrate()` to provide tactile feedback on supported devices.
 * Automatically no-ops when:
 *   - Running on the server (SSR)
 *   - The browser does not support the Vibration API
 *   - The user prefers reduced motion
 */

export type HapticStyle =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'selection'
  | 'success'
  | 'warning'
  | 'error';

/**
 * Vibration patterns per style (durations in milliseconds).
 * Single numbers produce a single pulse; arrays alternate vibrate/pause.
 *
 * Mapping:
 *   light      — Tab switch, toggle, minor interaction
 *   medium     — Button press, step completion
 *   heavy      — Delete, destructive action
 *   selection  — Picker change, slider snap to detent
 *   success    — Project saved, calculation complete
 *   warning    — Validation error
 *   error      — Failed action
 */
const patterns: Record<HapticStyle, number | number[]> = {
  light: 10,
  medium: 15,
  heavy: 25,
  selection: 5,
  success: [10, 50, 15],
  warning: [15, 30, 15],
  error: [20, 40, 20, 40, 20],
};

/**
 * Trigger a haptic vibration matching the given `style`.
 *
 * Safe to call in any environment — silently does nothing when the Vibration
 * API is unavailable or the user has enabled "prefers-reduced-motion".
 */
export function haptic(style: HapticStyle): void {
  if (typeof navigator === 'undefined') return;
  if (!navigator.vibrate) return;

  // Respect user motion preferences
  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }

  navigator.vibrate(patterns[style]);
}
