'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useProjectStore } from '@/store/project';
import { TEUIHeroNumber } from './TEUIHeroNumber';
import { BenchmarkBars } from './BenchmarkBars';
import { calculateTEUI2 } from '@/engine/teui2';
import { isValidForTEUI1, isValidForTEUI3 } from '@/schema/building';
import { calculateTEUI3 } from '@/engine/teui3';
import { getBenchmark, compareToNationalAverage } from '@/engine/shared/benchmarks';

/**
 * Live results panel — shown in the right 60% on desktop.
 * Recalculates on every building change.
 */
export function LiveResultsPanel() {
  const t = useTranslations();
  const { building } = useProjectStore();

  const results = useMemo(() => {
    if (!building) return null;

    // Try TEUI3 first (full energy balance), fall back to TEUI2, then TEUI1
    if (isValidForTEUI3(building)) {
      const r3 = calculateTEUI3(building);
      return {
        teui: r3.designModel.teui,
        tedi: r3.designModel.tedi,
        ghgi: r3.ghgi,
        totalEnergyKwh: r3.totalEnergyKwh,
        level: 3 as const,
      };
    }

    if (isValidForTEUI1(building)) {
      const r2 = calculateTEUI2(building);
      return {
        teui: r2.netTeui,
        tedi: r2.tediSimplified,
        ghgi: r2.ghgi,
        totalEnergyKwh: r2.totalEnergyKwh,
        level: 2 as const,
      };
    }

    return null;
  }, [building]);

  if (!building || !results) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <p className="text-sm text-text-tertiary">{t('wizard.step3.description')}</p>
      </div>
    );
  }

  const benchmark = getBenchmark('NECB', building.occupancy.type);
  const benchmarkMax = benchmark?.teui ?? 198;
  const { percentOfAverage } = compareToNationalAverage(results.teui, building.occupancy.type);

  const benchmarks = [
    {
      label: t('results.benchmarks') + ' — ' + t('meta.appName'),
      value: results.teui,
      color: '#fbbf24',
      isUser: true,
    },
    { label: 'NECB', value: benchmarkMax, color: '#94a3b8' },
    { label: 'Passive House', value: 45, color: '#2dd4bf' },
  ];

  return (
    <div
      className="flex flex-col gap-6"
      role="region"
      aria-live="polite"
      aria-label={t('a11y.resultsUpdated')}
    >
      {/* Hero TEUI */}
      <TEUIHeroNumber
        value={results.teui}
        benchmarkMax={benchmarkMax}
        averageValue={167}
        label={t('results.teuiLabel')}
        unit={t('units.kwhPerM2Yr')}
      />

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border-default bg-bg-surface p-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
            {t('results.tediLabel')}
          </p>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-text-primary">
            {results.tedi.toFixed(1)}
          </p>
          <p className="text-xs text-text-tertiary">{t('units.kwhPerM2Yr')}</p>
        </div>
        <div className="rounded-xl border border-border-default bg-bg-surface p-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
            {t('results.ghgiLabel')}
          </p>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-text-primary">
            {results.ghgi.toFixed(1)}
          </p>
          <p className="text-xs text-text-tertiary">{t('units.kgCo2PerM2Yr')}</p>
        </div>
      </div>

      {/* Benchmark comparison */}
      <div className="rounded-xl border border-border-default bg-bg-surface p-6">
        <h3 className="mb-4 text-sm font-medium text-text-secondary">{t('results.benchmarks')}</h3>
        <BenchmarkBars entries={benchmarks} unit={t('units.kwhPerM2Yr')} />
      </div>

      {/* Total energy */}
      <div className="rounded-xl border border-border-default bg-bg-surface p-4 text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
          {t('results.energyBalance')}
        </p>
        <p className="mt-1 font-mono text-xl font-bold tabular-nums text-text-primary">
          {Math.round(results.totalEnergyKwh).toLocaleString()} {t('units.kwh')}
        </p>
      </div>
    </div>
  );
}
