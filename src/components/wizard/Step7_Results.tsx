'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useProjectStore } from '@/store/project';
import { useUIStore } from '@/store/ui';
import { TEUIHeroNumber } from '@/components/charts/TEUIHeroNumber';
import { BenchmarkBars } from '@/components/charts/BenchmarkBars';
import { SankeyDiagram } from '@/components/charts/SankeyDiagram';
import { calculateTEUI2 } from '@/engine/teui2';
import { calculateTEUI3 } from '@/engine/teui3';
import { generateSankeyData } from '@/engine/teui4';
import { isValidForTEUI1, isValidForTEUI3 } from '@/schema/building';
import { getBenchmark } from '@/engine/shared/benchmarks';
import type { SankeyData } from '@/engine/shared/types';

export function Step7Results() {
  const t = useTranslations();
  const { building } = useProjectStore();
  const { prevStep } = useUIStore();

  const results = useMemo(() => {
    if (!building) return null;

    if (isValidForTEUI3(building)) {
      const r3 = calculateTEUI3(building);
      const sankeyData = generateSankeyData(r3);
      return {
        teui: r3.designModel.teui,
        tedi: r3.designModel.tedi,
        ghgi: r3.ghgi,
        totalEnergyKwh: r3.totalEnergyKwh,
        sankeyData,
        referenceTeui: r3.referenceModel.teui,
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
        sankeyData: null as SankeyData | null,
        referenceTeui: null as number | null,
        level: 2 as const,
      };
    }

    return null;
  }, [building]);

  if (!building) return null;

  const benchmark = getBenchmark('NECB', building.occupancy.type);
  const benchmarkMax = benchmark?.teui ?? 198;

  const teui = results?.teui ?? 0;
  const ghgi = results?.ghgi ?? 0;
  const tedi = results?.tedi ?? 0;

  const benchmarks = [
    { label: t('results.teuiLabel'), value: teui, color: '#fbbf24', isUser: true },
    ...(results?.referenceTeui != null
      ? [{ label: t('results.referenceCode'), value: results.referenceTeui, color: '#94a3b8' }]
      : []),
    { label: t('results.codeMaximum'), value: benchmarkMax, color: '#cbd5e1' },
    { label: t('results.passiveHouse'), value: 45, color: '#2dd4bf' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-text-primary">{t('wizard.step7.title')}</h2>
        <p className="mt-1 text-sm text-text-secondary">{t('wizard.step7.description')}</p>
      </div>

      {/* Hero TEUI */}
      <div className="rounded-xl border border-border-default bg-bg-surface p-6">
        <TEUIHeroNumber
          value={teui}
          benchmarkMax={benchmarkMax}
          averageValue={167}
          label={t('results.teuiLabel')}
          unit={t('units.kwhPerM2Yr')}
        />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border-default bg-bg-surface p-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
            {t('results.tediLabel')}
          </p>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-text-primary">
            {tedi.toFixed(1)}
          </p>
          <p className="text-xs text-text-tertiary">{t('units.kwhPerM2Yr')}</p>
        </div>
        <div className="rounded-xl border border-border-default bg-bg-surface p-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
            {t('results.ghgiLabel')}
          </p>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-text-primary">
            {ghgi.toFixed(1)}
          </p>
          <p className="text-xs text-text-tertiary">{t('units.kgCo2PerM2Yr')}</p>
        </div>
      </div>

      {/* Benchmark comparison */}
      <div className="rounded-xl border border-border-default bg-bg-surface p-6">
        <h3 className="mb-4 text-sm font-medium text-text-secondary">{t('results.benchmarks')}</h3>
        <BenchmarkBars entries={benchmarks} unit={t('units.kwhPerM2Yr')} />
      </div>

      {/* Sankey diagram */}
      <div className="rounded-xl border border-border-default bg-bg-surface p-6">
        <h3 className="mb-4 text-sm font-medium text-text-secondary">{t('results.sankey')}</h3>
        {results?.sankeyData ? (
          <SankeyDiagram data={results.sankeyData} />
        ) : (
          <div className="flex h-48 items-center justify-center rounded-lg bg-bg-raised text-sm text-text-tertiary">
            {t('wizard.step3.description')}
          </div>
        )}
      </div>

      {/* Export actions */}
      <div className="flex flex-wrap gap-2">
        <button className="rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-raised">
          {t('common.export')} PDF
        </button>
        <button className="rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-raised">
          {t('common.export')} CSV
        </button>
      </div>

      {/* Navigation */}
      <div className="flex justify-start pt-2">
        <button
          onClick={prevStep}
          className="rounded-lg border border-border-default px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-raised"
        >
          ← {t('common.back')}
        </button>
      </div>
    </div>
  );
}
