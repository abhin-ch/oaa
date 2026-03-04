'use client';

import { useCallback, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Snap point definitions
// ---------------------------------------------------------------------------

export type SnapPoint = 'collapsed' | 'half' | 'full';

/** Pixel value (or vh-derived pixel value) for each snap point. */
function getSnapPixels(headerHeight: number): Record<SnapPoint, number> {
  if (typeof window === 'undefined') {
    return { collapsed: 56, half: 400, full: 800 };
  }
  const vh = window.innerHeight;
  return {
    collapsed: 56,
    half: vh * 0.5,
    full: vh - headerHeight,
  };
}

const SNAP_ORDER: SnapPoint[] = ['collapsed', 'half', 'full'];

// ---------------------------------------------------------------------------
// Spring physics constants (from design-system.md)
// ---------------------------------------------------------------------------

const DAMPING = 0.8;
const STIFFNESS = 300;

/**
 * Velocity threshold (px/ms) above which a drag is treated as a fast swipe
 * and overshoots to the *next* snap in the swipe direction.
 */
const VELOCITY_THRESHOLD = 0.5;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseBottomSheetReturn {
  /** The current snap point the sheet rests at. */
  snapPoint: SnapPoint;
  /** Imperatively set the snap point (triggers spring animation). */
  setSnapPoint: (point: SnapPoint) => void;
  /** Attach this ref to the bottom-sheet container element. */
  sheetRef: React.RefObject<HTMLDivElement | null>;
  /** Touch / pointer-down handler — attach to the drag handle. */
  handleDragStart: (clientY: number) => void;
  /** Touch / pointer-move handler. */
  handleDrag: (clientY: number) => void;
  /** Touch / pointer-up handler. */
  handleDragEnd: () => void;
}

/**
 * Manages bottom-sheet snap-point logic with velocity-aware snapping and
 * spring physics.
 *
 * @param headerHeight  Height of the app header in pixels so the "full" snap
 *                      point can be calculated as `100vh - headerHeight`.
 *                      Defaults to 56 (44px header + ~12px safe-area).
 */
export function useBottomSheet(headerHeight = 56): UseBottomSheetReturn {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const [snapPoint, setSnapPointState] = useState<SnapPoint>('collapsed');

  // Drag tracking refs (non-reactive for performance)
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const lastY = useRef(0);
  const lastTime = useRef(0);
  const velocityY = useRef(0); // px per ms (positive = expanding)

  // ------------------------------------------------------------------
  // Animate to a given height using a simple spring approximation
  // ------------------------------------------------------------------
  const animateTo = useCallback((targetHeight: number) => {
    const el = sheetRef.current;
    if (!el) return;

    // Use CSS transition with spring-like cubic-bezier derived from
    // our damping / stiffness constants.
    // A true spring requires rAF; the cubic-bezier below approximates
    // damping 0.8 / stiffness 300 decently for production use.
    const duration = Math.round(((2 * Math.PI) / Math.sqrt(STIFFNESS) / (1 - DAMPING)) * 100);
    el.style.transition = `height ${Math.min(duration, 500)}ms cubic-bezier(0.25, 1, 0.5, 1)`;
    el.style.height = `${targetHeight}px`;
  }, []);

  // ------------------------------------------------------------------
  // Snap to the nearest (or velocity-overshot) snap point
  // ------------------------------------------------------------------
  const snapTo = useCallback(
    (currentHeight: number, velocity: number) => {
      const snaps = getSnapPixels(headerHeight);
      const ordered = SNAP_ORDER.map((s) => ({ name: s, px: snaps[s] }));

      // Find nearest snap
      let nearestIdx = 0;
      let minDist = Math.abs(currentHeight - ordered[0]!.px);
      for (let i = 1; i < ordered.length; i++) {
        const dist = Math.abs(currentHeight - ordered[i]!.px);
        if (dist < minDist) {
          minDist = dist;
          nearestIdx = i;
        }
      }

      // If the user swiped fast, overshoot to the next snap in that direction
      if (Math.abs(velocity) > VELOCITY_THRESHOLD) {
        if (velocity > 0 && nearestIdx < ordered.length - 1) {
          nearestIdx = nearestIdx + 1; // expanding -> go bigger
        } else if (velocity < 0 && nearestIdx > 0) {
          nearestIdx = nearestIdx - 1; // collapsing -> go smaller
        }
      }

      const target = ordered[nearestIdx]!;
      setSnapPointState(target.name);
      animateTo(target.px);
    },
    [headerHeight, animateTo],
  );

  // ------------------------------------------------------------------
  // Public imperative setter
  // ------------------------------------------------------------------
  const setSnapPoint = useCallback(
    (point: SnapPoint) => {
      const snaps = getSnapPixels(headerHeight);
      setSnapPointState(point);
      animateTo(snaps[point]);
    },
    [headerHeight, animateTo],
  );

  // ------------------------------------------------------------------
  // Drag handlers
  // ------------------------------------------------------------------
  const handleDragStart = useCallback((clientY: number) => {
    const el = sheetRef.current;
    if (!el) return;

    // Remove transition during drag for immediate feedback
    el.style.transition = 'none';

    dragStartY.current = clientY;
    dragStartHeight.current = el.getBoundingClientRect().height;
    lastY.current = clientY;
    lastTime.current = performance.now();
    velocityY.current = 0;
  }, []);

  const handleDrag = useCallback(
    (clientY: number) => {
      const el = sheetRef.current;
      if (!el) return;

      const now = performance.now();
      const dt = now - lastTime.current;
      if (dt > 0) {
        // Positive velocity = dragging upward = expanding the sheet
        velocityY.current = (lastY.current - clientY) / dt;
      }
      lastY.current = clientY;
      lastTime.current = now;

      const delta = dragStartY.current - clientY; // positive = dragging up
      let newHeight = dragStartHeight.current + delta;

      // Rubber-band resistance beyond top snap
      const snaps = getSnapPixels(headerHeight);
      const maxHeight = snaps.full;
      if (newHeight > maxHeight) {
        const overshoot = newHeight - maxHeight;
        newHeight = maxHeight + overshoot * 0.3; // rubber-band factor
      }

      // Don't shrink below collapsed
      newHeight = Math.max(newHeight, snaps.collapsed);

      el.style.height = `${newHeight}px`;
    },
    [headerHeight],
  );

  const handleDragEnd = useCallback(() => {
    const el = sheetRef.current;
    if (!el) return;

    const currentHeight = el.getBoundingClientRect().height;
    snapTo(currentHeight, velocityY.current);
  }, [snapTo]);

  return {
    snapPoint,
    setSnapPoint,
    sheetRef,
    handleDragStart,
    handleDrag,
    handleDragEnd,
  };
}
