'use client';

import { useCallback, useRef } from 'react';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export interface SwipeGestureOptions {
  /** Minimum horizontal distance (px) to qualify as a swipe. Default: 50 */
  threshold?: number;
  /** Called when a left swipe is detected. */
  onSwipeLeft?: () => void;
  /** Called when a right swipe is detected. */
  onSwipeRight?: () => void;
}

export interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

/**
 * Maximum angle (in degrees from horizontal) at which a gesture is still
 * considered a horizontal swipe rather than a vertical scroll.
 */
const MAX_ANGLE_DEG = 15;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Detects left/right swipe gestures on a touch element.
 *
 * Cancels the swipe if the touch trajectory exceeds 15 degrees from
 * horizontal (i.e. the user is scrolling vertically).
 *
 * @example
 * ```tsx
 * const handlers = useSwipeGesture({
 *   onSwipeLeft: () => goToNextSection(),
 *   onSwipeRight: () => goToPrevSection(),
 *   threshold: 60,
 * });
 *
 * return <div {...handlers}>…</div>;
 * ```
 */
export function useSwipeGesture(options: SwipeGestureOptions = {}): SwipeHandlers {
  const { threshold = 50, onSwipeLeft, onSwipeRight } = options;

  const startX = useRef(0);
  const startY = useRef(0);
  const tracking = useRef(true);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    tracking.current = true;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!tracking.current) return;

    const touch = e.touches[0];
    if (!touch) return;
    const dx = touch.clientX - startX.current;
    const dy = touch.clientY - startY.current;

    // Once we have enough movement to judge, check the angle
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 10) {
      const angle = Math.abs(Math.atan2(Math.abs(dy), Math.abs(dx))) * (180 / Math.PI);
      if (angle > MAX_ANGLE_DEG) {
        // Vertical scroll intent — cancel swipe tracking
        tracking.current = false;
      }
    }
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!tracking.current) return;

      const touch = e.changedTouches[0];
      if (!touch) return;
      const dx = touch.clientX - startX.current;
      const dy = touch.clientY - startY.current;

      // Final angle check
      const angle = Math.abs(Math.atan2(Math.abs(dy), Math.abs(dx))) * (180 / Math.PI);
      if (angle > MAX_ANGLE_DEG) return;

      if (dx < -threshold) {
        onSwipeLeft?.();
      } else if (dx > threshold) {
        onSwipeRight?.();
      }
    },
    [threshold, onSwipeLeft, onSwipeRight],
  );

  return { onTouchStart, onTouchMove, onTouchEnd };
}
