'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import type { EnergyBreakdown } from '@/engine/teui1';
import type { TEUI1Result } from '@/engine/teui1';

interface EnergyMixProps {
  breakdown: EnergyBreakdown[];
  result: TEUI1Result;
}

// Semantically meaningful, muted palette for an architectural energy app
const SOURCE_COLORS: Record<string, string> = {
  electricity: '#3b6f9e', // steel blue — grid power
  naturalGas: '#c4873b', // warm amber — gas flame
  propane: '#d4784b', // terracotta — propane flame
  heatingOil: '#5c5c6e', // slate — petroleum
  biofuel: '#7a8c5a', // sage — wood, biomass
  renewables: '#4a8c72', // eucalyptus — clean energy
};

function getColor(source: string): string {
  return SOURCE_COLORS[source] ?? '#a3a3a3';
}

/** Donut chart — clean, no center text */
function DonutChart({ breakdown }: { breakdown: EnergyBreakdown[] }) {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 88;
  const thickness = 30;
  const innerRadius = radius - thickness;
  const gap = 0.03;

  const { slices } = breakdown.reduce<{
    slices: { d: string; color: string; source: string }[];
    currentAngle: number;
  }>(
    (acc, b) => {
      const angle = Math.max((b.percentage / 100) * Math.PI * 2 - gap, 0.002);
      const startAngle = acc.currentAngle + gap / 2;
      const endAngle = startAngle + angle;

      const x1 = cx + radius * Math.cos(startAngle);
      const y1 = cy + radius * Math.sin(startAngle);
      const x2 = cx + radius * Math.cos(endAngle);
      const y2 = cy + radius * Math.sin(endAngle);
      const ix1 = cx + innerRadius * Math.cos(startAngle);
      const iy1 = cy + innerRadius * Math.sin(startAngle);
      const ix2 = cx + innerRadius * Math.cos(endAngle);
      const iy2 = cy + innerRadius * Math.sin(endAngle);

      const largeArc = angle > Math.PI ? 1 : 0;

      const d = [
        `M ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
        `L ${ix2} ${iy2}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}`,
        'Z',
      ].join(' ');

      acc.slices.push({ d, color: getColor(b.source), source: b.source });
      acc.currentAngle = startAngle + angle + gap / 2;
      return acc;
    },
    { slices: [], currentAngle: -Math.PI / 2 },
  );

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="h-full w-full"
      role="img"
      aria-label="Energy mix donut chart"
    >
      {slices.map((slice, i) => (
        <motion.path
          key={slice.source}
          d={slice.d}
          fill={slice.color}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: i * 0.06 }}
        />
      ))}
    </svg>
  );
}

export function EnergyBars({ breakdown, result }: EnergyMixProps) {
  const t = useTranslations('teui1.energy');
  const tResults = useTranslations('teui1.results');

  if (breakdown.length === 0) return null;

  const sorted = [...breakdown].sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* ── Two summary stats ── */}
      <div className="shrink-0 grid grid-cols-2 gap-px border-b border-border-default bg-border-default">
        <div className="bg-bg-base px-6 py-4">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-text-tertiary">
            {tResults('title')}
          </p>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="font-mono text-3xl font-extrabold tabular-nums tracking-tight text-text-primary">
              {result.teui.toFixed(1)}
            </span>
            <span className="text-[11px] text-text-tertiary">{tResults('teuiUnit')}</span>
          </div>
        </div>
        <div className="bg-bg-base px-6 py-4">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-text-tertiary">
            {tResults('totalEnergy')}
          </p>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="font-mono text-3xl font-extrabold tabular-nums tracking-tight text-text-primary">
              {result.totalEnergyKwh.toFixed(0)}
            </span>
            <span className="text-[11px] text-text-tertiary">kWh</span>
          </div>
        </div>
      </div>

      {/* ── Donut + inline legend ── */}
      <div className="flex shrink-0 items-center gap-6 px-6 py-6">
        {/* Donut */}
        <div className="h-40 w-40 shrink-0">
          <DonutChart breakdown={sorted} />
        </div>

        {/* Inline legend beside the donut */}
        <div className="flex-1 space-y-2">
          {sorted.map((b) => (
            <div key={b.source} className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: getColor(b.source) }}
              />
              <span className="flex-1 text-[12px] text-text-secondary">
                {t(b.source as Parameters<typeof t>[0])}
              </span>
              <span className="font-mono text-[12px] tabular-nums text-text-primary">
                {b.percentage.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Detail rows ── */}
      <div className="border-t border-border-default bg-bg-base">
        {sorted.map((b, i) => (
          <div
            key={b.source}
            className={`flex items-center gap-3.5 px-6 py-3 ${
              i < sorted.length - 1 ? 'border-b border-border-default' : ''
            }`}
          >
            <div
              className="h-7 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: getColor(b.source) }}
            />
            <span className="flex-1 text-sm text-text-primary">
              {t(b.source as Parameters<typeof t>[0])}
            </span>
            <span className="font-mono text-sm tabular-nums text-text-primary">
              {b.percentage.toFixed(0)}%
            </span>
            <span className="w-24 text-right font-mono text-[13px] tabular-nums text-text-tertiary">
              {b.kwhPerM2.toFixed(1)} kWh/m²
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export { EnergyBars as EnergyMix };
