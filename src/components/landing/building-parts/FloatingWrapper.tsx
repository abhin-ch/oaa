'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';

interface FloatingWrapperProps {
  children: React.ReactNode;
  delay?: number;
  floatAmp?: number;
  floatSpeed?: number;
  entryOffset?: [number, number, number];
}

export function FloatingWrapper({
  children,
  delay = 0,
  floatAmp = 0.08,
  floatSpeed = 1,
  entryOffset = [0, 1.5, 0],
}: FloatingWrapperProps) {
  const groupRef = useRef<Group>(null);
  const elapsed = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from external media query
    setReducedMotion(mq.matches);
    const h = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    elapsed.current += delta;

    const t = elapsed.current - delay;

    if (t < 0) {
      // Not yet started
      groupRef.current.position.set(entryOffset[0], entryOffset[1], entryOffset[2]);
      groupRef.current.scale.setScalar(0);
      return;
    }

    // Entry animation (0 to 1.2s)
    const entryDur = 1.2;
    const entryProgress = Math.min(t / entryDur, 1);
    // Cubic ease-out
    const ease = 1 - Math.pow(1 - entryProgress, 3);

    const ox = entryOffset[0] * (1 - ease);
    const oy = entryOffset[1] * (1 - ease);
    const oz = entryOffset[2] * (1 - ease);

    // Float
    const floatY = reducedMotion ? 0 : Math.sin(t * floatSpeed) * floatAmp;

    groupRef.current.position.set(ox, oy + floatY, oz);
    groupRef.current.scale.setScalar(ease);
  });

  return <group ref={groupRef}>{children}</group>;
}
