'use client';

import { useEffect, useRef, useState } from 'react';

interface TEUIHeroNumberProps {
  value: number; // TEUI in kWh/m²/yr
  benchmarkMax?: number; // Code maximum for comparison
  averageValue?: number; // National average for context
  label?: string;
  unit?: string;
}

function getPerformanceColor(value: number, benchmarkMax: number): string {
  const ratio = value / benchmarkMax;
  if (ratio <= 0.5) return 'text-success-500';
  if (ratio <= 0.8) return 'text-energy-500';
  return 'text-warning-500';
}

function getPerformanceLabel(value: number, averageValue: number): string {
  const diff = ((averageValue - value) / averageValue) * 100;
  if (diff > 0) return `${diff.toFixed(0)}% better than average`;
  if (diff < 0) return `${Math.abs(diff).toFixed(0)}% above average`;
  return 'At average';
}

/**
 * Animated TEUI hero number — the single most important visual element.
 * Shows the TEUI value with performance-based color and benchmark context.
 */
export function TEUIHeroNumber({
  value,
  benchmarkMax = 200,
  averageValue = 167,
  label = 'TEUI',
  unit = 'kWh/m²/yr',
}: TEUIHeroNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const animationRef = useRef<number | null>(null);
  const previousValue = useRef(value);

  // Animate number changes
  useEffect(() => {
    const from = previousValue.current;
    const to = value;
    previousValue.current = value;

    if (from === to) return;

    const duration = 400; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Spring-like ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;

      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value]);

  const colorClass = getPerformanceColor(value, benchmarkMax);
  const progressPercent = Math.min((value / benchmarkMax) * 100, 100);
  const performanceLabel = getPerformanceLabel(value, averageValue);
  const isBetter = value < averageValue;

  return (
    <div
      className="flex flex-col items-center gap-3 py-6"
      role="region"
      aria-label="Calculation results"
      aria-live="polite"
    >
      {/* Label */}
      <span className="text-sm font-medium text-text-secondary">{label}</span>

      {/* Big number */}
      <div className="flex items-baseline gap-1">
        <span className={`font-mono text-5xl font-bold tabular-nums ${colorClass}`}>
          {displayValue.toFixed(1)}
        </span>
      </div>

      {/* Unit */}
      <span className="text-sm text-text-tertiary">{unit}</span>

      {/* Progress bar — position relative to code maximum */}
      <div className="mt-2 w-full max-w-xs">
        <div className="h-1 w-full overflow-hidden rounded-full bg-bg-sunken">
          <div
            className={`h-full rounded-full transition-all duration-400 ease-out ${
              progressPercent <= 50
                ? 'bg-success-400'
                : progressPercent <= 80
                  ? 'bg-energy-400'
                  : 'bg-warning-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-text-tertiary">
          <span>0</span>
          <span>{progressPercent.toFixed(0)}% of code max</span>
          <span>{benchmarkMax}</span>
        </div>
      </div>

      {/* Context line */}
      <div className="flex items-center gap-1 text-sm">
        <span className={isBetter ? 'text-success-500' : 'text-warning-500'}>
          {isBetter ? '▼' : '▲'}
        </span>
        <span className="text-text-secondary">{performanceLabel}</span>
      </div>
    </div>
  );
}
