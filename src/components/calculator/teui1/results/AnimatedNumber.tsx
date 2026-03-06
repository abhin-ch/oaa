'use client';

import { useEffect, useRef } from 'react';
import {
  motion,
  useSpring,
  useTransform,
  useReducedMotion,
  type SpringOptions,
} from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  className?: string;
  springConfig?: SpringOptions;
}

const DEFAULT_SPRING: SpringOptions = { stiffness: 100, damping: 30 };

export function AnimatedNumber({
  value,
  decimals = 1,
  className,
  springConfig = DEFAULT_SPRING,
}: AnimatedNumberProps) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);

  const spring = useSpring(0, springConfig);
  const display = useTransform(spring, (v) => v.toFixed(decimals));

  useEffect(() => {
    if (prefersReducedMotion) {
      spring.jump(value);
    } else {
      spring.set(value);
    }
  }, [value, spring, prefersReducedMotion]);

  useEffect(() => {
    const unsubscribe = display.on('change', (v) => {
      if (ref.current) {
        ref.current.textContent = v;
      }
    });
    return unsubscribe;
  }, [display]);

  return (
    <motion.span ref={ref} className={className}>
      {value.toFixed(decimals)}
    </motion.span>
  );
}
