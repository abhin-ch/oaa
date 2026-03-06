'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import type { Building } from '@/schema/building';
import type { TEUI1Result } from '@/engine/teui1';
import { CANADIAN_AVG_GHGI_MT } from '@/engine/teui1';
import { AnimatedNumber } from './AnimatedNumber';
import { Building3D } from './Building3D';
import { EnergyBars } from './EnergyBars';

interface ResultsPanelProps {
  result: TEUI1Result;
  building?: Building;
}

type ResultsTab = 'results' | 'energyMix';

export function ResultsPanel({ result, building }: ResultsPanelProps) {
  const t = useTranslations('teui1');
  const prefersReducedMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<ResultsTab>('results');

  const area = building?.energySources?.conditionedAreaM2 ?? 0;
  const hasArea = area > 0;
  const hasEnergy = result.totalEnergyKwh > 0;
  const hasAnything = hasArea || hasEnergy;
  const occupancy = building?.occupancy ?? 'residential';

  const pos = result.gradientPosition;

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundImage:
          'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        backgroundColor: 'var(--bg-raised)',
      }}
    >
      {/* Tab bar — top on desktop, bottom on mobile */}
      <div className="relative z-10 order-last flex shrink-0 border-t border-border-default bg-bg-base md:order-first md:border-b md:border-t-0">
        {(['results', 'energyMix'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative flex-1 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.15em] transition-colors ${
              activeTab === tab
                ? 'text-text-primary'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            {tab === 'results' ? t('results.title') : t('results.breakdown')}
            {activeTab === tab && (
              <motion.div
                layoutId="results-tab-indicator"
                className="absolute left-0 right-0 top-0 h-0.5 bg-text-primary md:bottom-0 md:top-auto"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'results' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateRows: 'auto minmax(0, 1fr) auto',
            overflow: 'hidden',
            minHeight: 0,
            flex: '1 1 0%',
          }}
        >
          {/* TEUI Hero — compact */}
          {hasEnergy ? (
            <motion.div
              className="relative z-10 border-b border-border-default bg-bg-base px-4 py-3"
              initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-baseline gap-2">
                <AnimatedNumber
                  value={result.teui}
                  decimals={1}
                  className="font-mono text-3xl font-extrabold tabular-nums tracking-tight text-text-primary"
                />
                <span className="text-[10px] font-semibold text-text-secondary">
                  {t('results.teuiUnit')}
                </span>
              </div>

              {/* Scale bar */}
              <div className="mt-2">
                <div className="relative flex h-2.5 w-full items-center">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'linear-gradient(to right, #d4d4d4, #737373 50%, #171717)',
                    }}
                  />
                  <motion.div
                    className="absolute z-10"
                    initial={false}
                    animate={{ left: `${pos}%` }}
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 200, damping: 25 }
                    }
                    style={{ marginLeft: '-6px' }}
                  >
                    <div
                      className="h-3 w-3 border-2 border-white bg-text-primary shadow-md"
                      style={{ transform: 'rotate(45deg)', borderRadius: '1px' }}
                    />
                  </motion.div>
                </div>
                <div className="mt-0.5 flex justify-between text-[8px] font-semibold text-text-tertiary">
                  <span>0</span>
                  <span>500+</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="relative z-10 border-b border-border-default bg-bg-base px-4 py-3">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-extrabold tabular-nums text-text-tertiary">
                  --
                </span>
                <span className="text-[10px] font-semibold text-text-tertiary">
                  {t('results.teuiUnit')}
                </span>
              </div>
            </div>
          )}

          {/* 3D Building — fills remaining space, clips */}
          <div
            className="relative flex items-center justify-center overflow-hidden"
            style={{ minHeight: 0 }}
          >
            <Building3D occupancy={occupancy} area={area} hasEnergy={hasEnergy} />
            <div className="pointer-events-none absolute bottom-0 h-8 w-full bg-gradient-to-t from-bg-raised to-transparent" />
          </div>

          {/* Bottom metrics — always visible */}
          <div className="relative z-10">
            <div className="grid grid-cols-3 gap-px bg-border-default">
              <div className="bg-bg-base px-3 py-2">
                <p className="text-[9px] font-extrabold uppercase tracking-wider text-text-secondary">
                  {t('results.totalEnergy')}
                </p>
                <div className="mt-1">
                  {hasEnergy ? (
                    <>
                      <AnimatedNumber
                        value={result.totalEnergyKwh}
                        decimals={0}
                        className="font-mono text-base font-extrabold tabular-nums text-text-primary"
                      />
                      <span className="ml-1 text-[9px] font-bold text-text-secondary">kWh</span>
                    </>
                  ) : (
                    <>
                      <span className="font-mono text-base font-extrabold tabular-nums text-text-tertiary">
                        --
                      </span>
                      <span className="ml-1 text-[9px] font-bold text-text-tertiary">kWh</span>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-bg-base px-3 py-2">
                <p className="text-[9px] font-extrabold uppercase tracking-wider text-text-secondary">
                  {t('results.netEnergy')}
                </p>
                <div className="mt-1">
                  {hasEnergy ? (
                    <>
                      <AnimatedNumber
                        value={result.netEnergyKwh}
                        decimals={0}
                        className="font-mono text-base font-extrabold tabular-nums text-text-primary"
                      />
                      <span className="ml-1 text-[9px] font-bold text-text-secondary">kWh</span>
                    </>
                  ) : (
                    <>
                      <span className="font-mono text-base font-extrabold tabular-nums text-text-tertiary">
                        --
                      </span>
                      <span className="ml-1 text-[9px] font-bold text-text-tertiary">kWh</span>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-bg-base px-3 py-2">
                <p className="text-[9px] font-extrabold uppercase tracking-wider text-text-secondary">
                  {t('results.ghgiUnit')}
                </p>
                <div className="mt-1">
                  {hasEnergy ? (
                    <AnimatedNumber
                      value={result.ghgi.kgCo2PerM2}
                      decimals={2}
                      className="font-mono text-base font-extrabold tabular-nums text-text-primary"
                    />
                  ) : (
                    <span className="font-mono text-base font-extrabold tabular-nums text-text-tertiary">
                      --
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <div className="h-1.5 flex-1 bg-bg-raised">
                    {hasEnergy && (
                      <motion.div
                        className="h-full bg-text-secondary"
                        initial={prefersReducedMotion ? undefined : { width: 0 }}
                        animate={{
                          width: `${Math.min((result.ghgi.mtCo2Total / CANADIAN_AVG_GHGI_MT) * 100, 100)}%`,
                        }}
                        transition={{ duration: 0.4 }}
                      />
                    )}
                  </div>
                  <span className="font-mono text-[9px] font-bold tabular-nums text-text-secondary">
                    {hasEnergy ? `${result.ghgi.mtCo2Total.toFixed(1)} MT` : '-- MT'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Energy Mix tab */
        <div className="flex flex-1 flex-col overflow-hidden bg-bg-base" style={{ minHeight: 0 }}>
          {hasEnergy && result.breakdown.length > 0 ? (
            <EnergyBars breakdown={result.breakdown} result={result} />
          ) : (
            <div className="flex flex-1 items-center justify-center px-8">
              <p className="text-center text-sm leading-relaxed text-text-tertiary">
                {t('results.noData')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Accessible live region */}
      <div aria-live="polite" className="sr-only">
        {hasEnergy &&
          `TEUI: ${result.teui.toFixed(1)} kWh per square meter per year. GHGI: ${result.ghgi.kgCo2PerM2.toFixed(2)} kg CO2e per square meter.`}
      </div>
    </div>
  );
}
