'use client';

/**
 * Dot grid background with subtle center fade.
 * Parent must have `position: relative` and `overflow: hidden`.
 */
export function DotGrid() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        backgroundImage: 'radial-gradient(circle, var(--dot-grid-color) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
        maskImage:
          'radial-gradient(ellipse at center, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.6) 40%, black 75%)',
        WebkitMaskImage:
          'radial-gradient(ellipse at center, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.6) 40%, black 75%)',
      }}
    />
  );
}
