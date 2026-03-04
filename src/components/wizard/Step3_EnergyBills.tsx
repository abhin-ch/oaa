'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useProjectStore } from '@/store/project';
import { useUIStore } from '@/store/ui';
import { calculateTEUI1 } from '@/engine/teui1';
import { isValidForTEUI1 } from '@/schema/building';

const defaultSources = {
  electricityKwh: 0,
  gasM3: 0,
  oilL: 0,
  woodM3: 0,
};

export function Step3EnergyBills() {
  const t = useTranslations();
  const { building, updateBuilding } = useProjectStore();
  const { nextStep, prevStep } = useUIStore();

  const quickTeui = useMemo(() => {
    if (!building || !isValidForTEUI1(building)) return null;
    return calculateTEUI1(building);
  }, [building]);

  if (!building) return null;

  const hasAnyEnergy =
    building.energySources.electricityKwh > 0 ||
    building.energySources.gasM3 > 0 ||
    building.energySources.oilL > 0 ||
    building.energySources.woodM3 > 0;

  const updateSource = (key: keyof typeof defaultSources, value: number) => {
    updateBuilding({
      energySources: { ...building.energySources, [key]: value },
    });
  };

  const fields = [
    {
      id: 'electricity',
      label: t('wizard.step3.electricityLabel'),
      unit: t('units.kwh') + '/yr',
      key: 'electricityKwh' as keyof typeof defaultSources,
      placeholder: t('wizard.step3.electricityPlaceholder'),
    },
    {
      id: 'gas',
      label: t('wizard.step3.gasLabel'),
      unit: t('units.m3') + '/yr',
      key: 'gasM3' as keyof typeof defaultSources,
      placeholder: t('wizard.step3.gasPlaceholder'),
    },
    {
      id: 'oil',
      label: t('wizard.step3.oilLabel'),
      unit: 'L/yr',
      key: 'oilL' as keyof typeof defaultSources,
      placeholder: t('wizard.step3.oilPlaceholder'),
    },
    {
      id: 'wood',
      label: t('wizard.step3.woodLabel'),
      unit: t('units.m3') + '/yr',
      key: 'woodM3' as keyof typeof defaultSources,
      placeholder: t('wizard.step3.woodPlaceholder'),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-text-primary">{t('wizard.step3.title')}</h2>
        <p className="mt-1 text-sm text-text-secondary">{t('wizard.step3.description')}</p>
      </div>

      {/* Energy source inputs */}
      <div className="flex flex-col gap-4">
        {fields.map((field) => (
          <div key={field.id} className="flex flex-col gap-1.5">
            <label htmlFor={field.id} className="text-sm font-medium text-text-secondary">
              {field.label}
              <span className="ml-1 text-xs text-text-tertiary">({field.unit})</span>
            </label>
            <input
              id={field.id}
              type="number"
              min="0"
              step="1"
              value={building.energySources[field.key] || ''}
              onChange={(e) => updateSource(field.key, Number(e.target.value) || 0)}
              placeholder={field.placeholder}
              className="h-11 rounded-lg border border-border-default bg-bg-surface px-3.5 text-base text-text-primary placeholder:text-text-tertiary transition-colors focus:border-energy-400 focus:outline-none focus:ring-3 focus:ring-energy-100"
            />
          </div>
        ))}
      </div>

      {/* Quick TEUI preview */}
      {quickTeui && (
        <div className="rounded-lg border border-energy-200 bg-energy-50 p-4" aria-live="polite">
          <p className="text-xs font-medium uppercase tracking-wider text-energy-700">
            {t('results.teuiLabel')}
          </p>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-energy-700">
            {quickTeui.teui.toFixed(1)}{' '}
            <span className="text-sm font-normal">{t('units.kwhPerM2Yr')}</span>
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <button
          onClick={prevStep}
          className="rounded-lg border border-border-default px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-raised"
        >
          ← {t('common.back')}
        </button>
        <div className="flex gap-2">
          <button
            onClick={nextStep}
            className="rounded-lg border border-border-default px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-raised"
          >
            {t('wizard.step3.skip')}
          </button>
          <button
            onClick={nextStep}
            className="rounded-lg bg-energy-400 px-5 py-2.5 text-sm font-medium text-text-primary transition-all hover:brightness-105 active:scale-[0.98]"
          >
            {t('common.next')} →
          </button>
        </div>
      </div>
    </div>
  );
}
