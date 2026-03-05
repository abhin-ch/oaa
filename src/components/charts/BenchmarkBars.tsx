'use client';

import { useTranslations } from 'next-intl';

interface BenchmarkEntry {
  label: string;
  value: number;
  color: string;
  isUser?: boolean;
}

interface BenchmarkBarsProps {
  entries: BenchmarkEntry[];
  unit?: string;
  maxValue?: number;
}

/**
 * Horizontal benchmark comparison bars.
 * Shows the user's building vs code max, national average, and Passive House target.
 */
export function BenchmarkBars({ entries, unit = 'kWh/m²/yr', maxValue }: BenchmarkBarsProps) {
  const t = useTranslations();
  const max = maxValue ?? Math.max(...entries.map((e) => e.value)) * 1.1;

  return (
    <div className="flex flex-col gap-3" role="img" aria-label={t('results.benchmarkComparison')}>
      {entries.map((entry) => {
        const widthPercent = Math.min((entry.value / max) * 100, 100);

        return (
          <div key={entry.label} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-sm">
              <span
                className={`font-medium ${entry.isUser ? 'text-text-primary' : 'text-text-secondary'}`}
              >
                {entry.label}
              </span>
              <span className="font-mono text-sm tabular-nums text-text-secondary">
                {entry.value.toFixed(0)} {unit}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-bg-sunken">
              <div
                className="h-full rounded-full transition-all duration-400 ease-out"
                style={{
                  width: `${widthPercent}%`,
                  backgroundColor: entry.color,
                }}
              />
            </div>
          </div>
        );
      })}

      {/* Accessible data table (screen reader) */}
      <table className="sr-only">
        <caption>{t('results.benchmarkComparison')}</caption>
        <thead>
          <tr>
            <th>{t('results.buildingLabel')}</th>
            <th>
              {t('results.valueLabel')} ({unit})
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.label}>
              <td>{entry.label}</td>
              <td>{entry.value.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
