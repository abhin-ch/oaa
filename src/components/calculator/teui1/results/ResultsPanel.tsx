'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
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
      className="relative flex h-full flex-col overflow-hidden bg-bg-raised"
      style={{
        backgroundImage:
          'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
    >
      {!hasAnything ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8">
          <Building3D occupancy={occupancy} area={0} hasEnergy={false} />
          <p className="mt-8 max-w-[240px] text-center text-sm leading-relaxed text-text-tertiary">
            {t('results.noData')}
          </p>
        </div>
      ) : (
        <>
          {/* ── Tab bar ── */}
          <div className="relative z-10 flex shrink-0 border-b border-border-default bg-bg-base">
            {(['results', 'energyMix'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex-1 px-4 py-3 text-[11px] font-extrabold uppercase tracking-[0.15em] transition-colors ${
                  activeTab === tab
                    ? 'text-text-primary'
                    : 'text-text-tertiary hover:text-text-secondary'
                }`}
              >
                {tab === 'results' ? t('results.title') : t('results.breakdown')}
                {activeTab === tab && (
                  <motion.div
                    layoutId="results-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-text-primary"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* ── Tab content ── */}
          {activeTab === 'results' ? (
            <>
              {/* TEUI Hero */}
              {hasEnergy ? (
                <motion.div
                  className="relative z-10 shrink-0 border-b border-border-default bg-bg-base px-6 py-5"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-baseline gap-2">
                    <AnimatedNumber
                      value={result.teui}
                      decimals={1}
                      className="font-mono text-5xl font-extrabold tabular-nums tracking-tight text-text-primary"
                    />
                    <span className="text-xs font-semibold text-text-secondary">
                      {t('results.teuiUnit')}
                    </span>
                  </div>

                  {/* Scale bar */}
                  <div className="mt-4">
                    <div className="relative flex h-3 w-full items-center">
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
                        style={{ marginLeft: '-8px' }}
                      >
                        <div
                          className="h-4 w-4 border-2 border-white bg-text-primary shadow-md"
                          style={{ transform: 'rotate(45deg)', borderRadius: '1px' }}
                        />
                      </motion.div>
                    </div>
                    <div className="mt-1 flex justify-between text-[9px] font-semibold text-text-tertiary">
                      <span>0</span>
                      <span>500+</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="relative z-10 shrink-0 border-b border-border-default bg-bg-base px-6 py-5">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-4xl font-extrabold tabular-nums text-text-tertiary">
                      --
                    </span>
                    <span className="text-xs font-semibold text-text-tertiary">
                      {t('results.teuiUnit')}
                    </span>
                  </div>
                </div>
              )}

              {/* 3D Building */}
              <div className="relative flex flex-1 items-center justify-center -mt-8">
                <Building3D occupancy={occupancy} area={area} hasEnergy={hasEnergy} />
                <div className="pointer-events-none absolute bottom-0 h-10 w-full bg-gradient-to-t from-bg-raised to-transparent" />
              </div>

              {/* Bottom metrics */}
              <AnimatePresence>
                {hasEnergy && (
                  <motion.div
                    className="relative z-10 shrink-0"
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.25 }}
                  >
                    <div className="grid grid-cols-3 gap-px bg-border-default">
                      <div className="bg-bg-base px-5 py-4">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-text-secondary">
                          {t('results.totalEnergy')}
                        </p>
                        <div className="mt-1.5">
                          <AnimatedNumber
                            value={result.totalEnergyKwh}
                            decimals={0}
                            className="font-mono text-xl font-extrabold tabular-nums text-text-primary"
                          />
                          <span className="ml-1.5 text-[10px] font-bold text-text-secondary">
                            kWh
                          </span>
                        </div>
                      </div>

                      <div className="bg-bg-base px-5 py-4">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-text-secondary">
                          {t('results.netEnergy')}
                        </p>
                        <div className="mt-1.5">
                          <AnimatedNumber
                            value={result.netEnergyKwh}
                            decimals={0}
                            className="font-mono text-xl font-extrabold tabular-nums text-text-primary"
                          />
                          <span className="ml-1.5 text-[10px] font-bold text-text-secondary">
                            kWh
                          </span>
                        </div>
                      </div>

                      <div className="bg-bg-base px-5 py-4">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-text-secondary">
                          {t('results.ghgiUnit')}
                        </p>
                        <div className="mt-1.5">
                          <AnimatedNumber
                            value={result.ghgi.kgCo2PerM2}
                            decimals={2}
                            className="font-mono text-xl font-extrabold tabular-nums text-text-primary"
                          />
                        </div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="h-2 flex-1 bg-bg-raised">
                            <motion.div
                              className="h-full bg-text-secondary"
                              initial={prefersReducedMotion ? undefined : { width: 0 }}
                              animate={{
                                width: `${Math.min((result.ghgi.mtCo2Total / CANADIAN_AVG_GHGI_MT) * 100, 100)}%`,
                              }}
                              transition={{ duration: 0.4 }}
                            />
                          </div>
                          <span className="font-mono text-[10px] font-bold tabular-nums text-text-secondary">
                            {result.ghgi.mtCo2Total.toFixed(1)} MT
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            /* ── Energy Mix tab ── */
            <div className="flex flex-1 flex-col overflow-hidden bg-bg-base">
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
        </>
      )}

      {/* Accessible live region */}
      <div aria-live="polite" className="sr-only">
        {hasEnergy &&
          `TEUI: ${result.teui.toFixed(1)} kWh per square meter per year. GHGI: ${result.ghgi.kgCo2PerM2.toFixed(2)} kg CO2e per square meter.`}
      </div>
    </div>
  );
}
