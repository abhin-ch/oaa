/** Shared framer-motion animation presets for modal dialogs. */

export const MODAL_BACKDROP = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.4 },
} as const;

export const MODAL_CONTENT = {
  initial: { opacity: 0, scale: 0.85, rotateX: -12, y: 40, filter: 'blur(8px)' },
  animate: { opacity: 1, scale: 1, rotateX: 0, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 0.9, rotateX: 8, y: -30, filter: 'blur(4px)' },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  style: { perspective: 1200 },
} as const;
