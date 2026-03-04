'use client';

import { useProjectStore } from '@/store/project';
import { useUIStore } from '@/store/ui';
import { TEUIHeroNumber } from '@/components/charts/TEUIHeroNumber';
import { BenchmarkBars } from '@/components/charts/BenchmarkBars';

export function Step7Results() {
  const { building } = useProjectStore();
  const { prevStep } = useUIStore();

  if (!building) return null;

  // Placeholder: calculation will be wired in Gate 2
  const teui = 0;
  const ghgi = 0;
  const tedi = 0;

  const benchmarks = [
    { label: 'Your Building', value: teui, color: '#fbbf24', isUser: true },
    { label: 'Code Maximum', value: 198, color: '#94a3b8' },
    { label: 'National Average', value: 167, color: '#cbd5e1' },
    { label: 'Passive House', value: 45, color: '#2dd4bf' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-text-primary">Results Dashboard</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Your building&apos;s energy performance at a glance.
        </p>
      </div>

      {/* Hero TEUI */}
      <div className="rounded-xl border border-border-default bg-bg-surface p-6">
        <TEUIHeroNumber value={teui} benchmarkMax={198} averageValue={167} />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border-default bg-bg-surface p-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">TEDI</p>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-text-primary">
            {tedi.toFixed(1)}
          </p>
          <p className="text-xs text-text-tertiary">kWh/m²/yr</p>
        </div>
        <div className="rounded-xl border border-border-default bg-bg-surface p-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">GHGI</p>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-text-primary">
            {ghgi.toFixed(1)}
          </p>
          <p className="text-xs text-text-tertiary">kgCO₂e/m²/yr</p>
        </div>
      </div>

      {/* Benchmark comparison */}
      <div className="rounded-xl border border-border-default bg-bg-surface p-6">
        <h3 className="mb-4 text-sm font-medium text-text-secondary">Benchmark Comparison</h3>
        <BenchmarkBars entries={benchmarks} />
      </div>

      {/* Sankey placeholder */}
      <div className="rounded-xl border border-border-default bg-bg-surface p-6">
        <h3 className="mb-4 text-sm font-medium text-text-secondary">Energy Flows</h3>
        <div className="flex h-48 items-center justify-center rounded-lg bg-bg-raised text-sm text-text-tertiary">
          Sankey diagram will be rendered here
        </div>
      </div>

      {/* Export actions */}
      <div className="flex flex-wrap gap-2">
        <button className="rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-raised">
          Export PDF
        </button>
        <button className="rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-raised">
          Export CSV
        </button>
      </div>

      {/* Navigation */}
      <div className="flex justify-start pt-2">
        <button
          onClick={prevStep}
          className="rounded-lg border border-border-default px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-raised"
        >
          ← Back to Inputs
        </button>
      </div>
    </div>
  );
}
