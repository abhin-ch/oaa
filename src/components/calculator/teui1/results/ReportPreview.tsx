'use client';

import { forwardRef } from 'react';
import { useTranslations } from 'next-intl';
import type { Building } from '@/schema/building';
import type { TEUI1Result } from '@/engine/teui1';
import { GAS_M3_TO_KWH, PROPANE_LBS_TO_KWH, OIL_L_TO_KWH, BIOFUEL_M3_TO_KWH } from '@/engine/teui1';
import { Building3D } from './Building3D';

interface ReportPreviewProps {
  building: Building;
  result: TEUI1Result;
  inline?: boolean;
}

const BREAKDOWN_COLORS = ['#171717', '#525252', '#737373', '#a3a3a3', '#d4d4d4', '#4ade80'];

export const ReportPreview = forwardRef<HTMLDivElement, ReportPreviewProps>(function ReportPreview(
  { building, result, inline },
  ref,
) {
  const t = useTranslations('teui1.download');
  const tEnergy = useTranslations('teui1.energy');
  const tRenew = useTranslations('teui1.renewables');
  const tProj = useTranslations('teui1.project');
  const tBuild = useTranslations('teui1.building');
  const tResults = useTranslations('teui1.results');
  const tTypes = useTranslations('buildings.types');

  const es = building.energySources ?? {};
  const rn = building.renewables ?? {};
  const ep = building.evaluationPeriod ?? {};
  const area = es.conditionedAreaM2 ?? 0;
  const hasEnergy = result.totalEnergyKwh > 0;
  const occupancy = typeof building.occupancy === 'string' ? building.occupancy : 'residential';

  const reportBody = (
    <>
      {/* Header */}
      <div className="report-header mb-4 flex items-start justify-between border-b-2 border-[#171717] pb-3">
        <div className="report-header-left">
          <h1 className="text-xl font-extrabold tracking-tight">
            {building.meta.name ?? 'Building'}
          </h1>
          <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-[#737373]">
            {tTypes(occupancy)} — {t('reportTitle')}
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/oaa-logo.svg" alt="OAA" className="report-logo w-24 opacity-70" />
      </div>

      {/* Score cards */}
      <div className="score-section mb-4 grid grid-cols-3 gap-px border border-[#e5e5e5] bg-[#e5e5e5]">
        <div className="score-card bg-white p-3">
          <p className="score-label text-[8px] font-extrabold uppercase tracking-[0.15em] text-[#737373]">
            {tResults('title')}
          </p>
          <div className="mt-1">
            <span className="score-value font-mono text-base font-extrabold leading-tight">
              {hasEnergy ? result.teui.toFixed(2) : '--'}
            </span>
            <span className="score-unit block text-[9px] font-semibold text-[#737373]">
              kWh/m²/yr
            </span>
          </div>
        </div>
        <div className="score-card overflow-hidden bg-white p-3">
          <p className="score-label text-[8px] font-extrabold uppercase tracking-[0.15em] text-[#737373]">
            {tResults('totalEnergy')}
          </p>
          <div className="mt-1">
            <span
              className={`score-value block truncate font-mono font-extrabold leading-tight ${
                hasEnergy && result.totalEnergyKwh >= 1_000_000 ? 'text-xs' : 'text-base'
              }`}
            >
              {hasEnergy
                ? result.totalEnergyKwh.toLocaleString(undefined, { maximumFractionDigits: 2 })
                : '--'}
            </span>
            <span className="score-unit block text-[9px] font-semibold text-[#737373]">kWh</span>
          </div>
        </div>
        <div className="score-card bg-white p-3">
          <p className="score-label text-[8px] font-extrabold uppercase tracking-[0.15em] text-[#737373]">
            {tResults('ghgiUnit')}
          </p>
          <div className="mt-1">
            <span className="score-value font-mono text-base font-extrabold leading-tight">
              {hasEnergy ? result.ghgi.kgCo2PerM2.toFixed(2) : '--'}
            </span>
          </div>
        </div>
      </div>

      {/* Building 3D visualization */}
      <div
        className="relative mb-4 flex items-center justify-center border border-[#e5e5e5]"
        style={{ height: 240, background: '#fafafa' }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="relative" style={{ transform: 'scale(0.5)' }}>
          <Building3D occupancy={occupancy} area={area} hasEnergy={hasEnergy} />
        </div>
      </div>

      {/* Energy Breakdown */}
      {hasEnergy && result.breakdown.length > 0 && (
        <div className="section mb-4">
          <p className="section-title mb-2 border-b border-[#e5e5e5] pb-1.5 text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#737373]">
            {tResults('breakdown')}
          </p>
          {result.breakdown.map((b, i) => (
            <div
              key={b.source}
              className="breakdown-bar flex items-center gap-2 border-b border-[#f5f5f5] py-1.5"
            >
              <div
                className="breakdown-color h-5 w-1 rounded-sm"
                style={{ backgroundColor: BREAKDOWN_COLORS[i % BREAKDOWN_COLORS.length] }}
              />
              <span className="breakdown-name flex-1 text-xs capitalize">{tEnergy(b.source)}</span>
              <span className="breakdown-pct w-10 text-right font-mono text-xs font-bold">
                {Math.round(b.percentage)}%
              </span>
              <span className="breakdown-kwh w-20 text-right font-mono text-[10px] text-[#737373]">
                {b.kwhPerM2.toFixed(1)} kWh/m²
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Building Info */}
      <div className="section mb-4">
        <p className="section-title mb-2 border-b border-[#e5e5e5] pb-1.5 text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#737373]">
          {t('buildingInfo')}
        </p>
        <div className="data-row flex justify-between border-b border-[#f5f5f5] py-1">
          <span className="data-label text-xs text-[#525252]">{tBuild('typology')}</span>
          <span className="data-value text-xs font-bold">{tTypes(occupancy)}</span>
        </div>
        <div className="data-row flex justify-between border-b border-[#f5f5f5] py-1">
          <span className="data-label text-xs text-[#525252]">{tBuild('conditionedArea')}</span>
          <span className="data-value font-mono text-xs font-bold">
            {area > 0 ? area.toLocaleString() : '--'}
            <span className="data-unit text-[9px] text-[#737373]"> m²</span>
          </span>
        </div>
      </div>

      {/* Energy Inputs */}
      <div className="section mb-4">
        <p className="section-title mb-2 border-b border-[#e5e5e5] pb-1.5 text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#737373]">
          {t('energyInputs')}
        </p>
        {[
          { label: tEnergy('electricity'), value: es.electricityKwh, unit: 'kWh' },
          {
            label: tEnergy('naturalGas'),
            value: es.naturalGasM3,
            unit: 'm³',
            kwh: (es.naturalGasM3 ?? 0) * GAS_M3_TO_KWH,
          },
          {
            label: tEnergy('propane'),
            value: es.propaneLbs,
            unit: 'lbs',
            kwh: (es.propaneLbs ?? 0) * PROPANE_LBS_TO_KWH,
          },
          {
            label: tEnergy('heatingOil'),
            value: es.heatingOilL,
            unit: 'litres',
            kwh: (es.heatingOilL ?? 0) * OIL_L_TO_KWH,
          },
          {
            label: tEnergy('biofuel'),
            value: es.biofuelM3,
            unit: 'm³',
            kwh: (es.biofuelM3 ?? 0) * BIOFUEL_M3_TO_KWH,
          },
        ].map((row) => (
          <div
            key={row.label}
            className="data-row flex justify-between border-b border-[#f5f5f5] py-1"
          >
            <span className="data-label text-xs text-[#525252]">{row.label}</span>
            <span className="data-value font-mono text-xs font-bold">
              {(row.value ?? 0) > 0 ? (row.value ?? 0).toLocaleString() : '--'}
              <span className="data-unit text-[9px] text-[#737373]"> {row.unit}</span>
              {row.kwh != null && (row.value ?? 0) > 0 && (
                <span className="text-[9px] text-[#a3a3a3]">
                  {' '}
                  = {row.kwh.toLocaleString(undefined, { maximumFractionDigits: 0 })} kWh
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Renewable Inputs */}
      <div className="section mb-4">
        <p className="section-title mb-2 border-b border-[#e5e5e5] pb-1.5 text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#737373]">
          {t('renewableInputs')}
        </p>
        {[
          { label: tRenew('onSite'), value: rn.onSiteKwh },
          { label: tRenew('offSiteElectricity'), value: rn.offSiteElectricityKwh },
          { label: tRenew('offSiteGas'), value: rn.offSiteGasKwh },
        ].map((row) => (
          <div
            key={row.label}
            className="data-row flex justify-between border-b border-[#f5f5f5] py-1"
          >
            <span className="data-label text-xs text-[#525252]">{row.label}</span>
            <span className="data-value font-mono text-xs font-bold">
              {(row.value ?? 0) > 0 ? (row.value ?? 0).toLocaleString() : '--'}
              <span className="data-unit text-[9px] text-[#737373]"> kWh</span>
            </span>
          </div>
        ))}
      </div>

      {/* Evaluation Period */}
      <div className="section">
        <p className="section-title mb-2 border-b border-[#e5e5e5] pb-1.5 text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#737373]">
          {t('evaluationPeriod')}
        </p>
        <div className="data-row flex justify-between border-b border-[#f5f5f5] py-1">
          <span className="data-label text-xs text-[#525252]">{tProj('beginDate')}</span>
          <span className="data-value font-mono text-xs font-bold">{ep.beginDate ?? '--'}</span>
        </div>
        <div className="data-row flex justify-between py-1">
          <span className="data-label text-xs text-[#525252]">{tProj('endDate')}</span>
          <span className="data-value font-mono text-xs font-bold">{ep.endDate ?? '--'}</span>
        </div>
      </div>
    </>
  );

  if (inline) {
    return (
      <div ref={ref} className="border border-border-default bg-white p-4 text-[#171717] shadow-sm">
        {reportBody}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header bar */}
      <div className="shrink-0 border-b border-border-default px-4 py-2.5 md:px-5">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary">
          {t('preview')}
        </span>
      </div>

      {/* Scrollable report — hidden scrollbar */}
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto p-4 md:p-5">
        <div
          ref={ref}
          className="mx-auto max-w-[640px] border border-border-default bg-white p-5 text-[#171717] shadow-sm"
        >
          {reportBody}
        </div>
      </div>
    </div>
  );
});
