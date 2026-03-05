'use client';

import { useTranslations } from 'next-intl';
import { useProjectStore } from '@/store/project';
import { useUIStore } from '@/store/ui';

export function Step2BuildingBasics() {
  const t = useTranslations();
  const { building, updateBuilding } = useProjectStore();
  const { nextStep, prevStep } = useUIStore();

  if (!building) return null;

  const canProceed = building.geometry.conditionedAreaM2 > 0;

  const updateGeometry = (changes: Partial<typeof building.geometry>) => {
    updateBuilding({ geometry: { ...building.geometry, ...changes } });
  };

  const updateOccupancy = (changes: Partial<typeof building.occupancy>) => {
    updateBuilding({ occupancy: { ...building.occupancy, ...changes } });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-text-primary">{t('wizard.step2.title')}</h2>
        <p className="mt-1 text-sm text-text-secondary">{t('wizard.step2.description')}</p>
      </div>

      {/* Floor area */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="area" className="text-sm font-medium text-text-secondary">
          {t('wizard.step2.areaLabel')} ({t('units.m2')})
        </label>
        <input
          id="area"
          type="number"
          min="0"
          step="1"
          value={building.geometry.conditionedAreaM2 || ''}
          onChange={(e) => updateGeometry({ conditionedAreaM2: Number(e.target.value) || 0 })}
          placeholder={t('wizard.step2.areaPlaceholder')}
          className="h-11 rounded-lg border border-border-default bg-bg-surface px-3.5 text-base text-text-primary placeholder:text-text-tertiary transition-colors focus:border-energy-400 focus:outline-none focus:ring-3 focus:ring-energy-100"
        />
      </div>

      {/* Number of floors */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="floors" className="text-sm font-medium text-text-secondary">
          {t('wizard.step2.floorsLabel')}
        </label>
        <input
          id="floors"
          type="number"
          min="1"
          max="200"
          value={building.geometry.floors}
          onChange={(e) => updateGeometry({ floors: Number(e.target.value) || 1 })}
          placeholder={t('wizard.step2.floorsPlaceholder')}
          className="h-11 rounded-lg border border-border-default bg-bg-surface px-3.5 text-base text-text-primary placeholder:text-text-tertiary transition-colors focus:border-energy-400 focus:outline-none focus:ring-3 focus:ring-energy-100"
        />
      </div>

      {/* Volume */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="volume" className="text-sm font-medium text-text-secondary">
          {t('wizard.step2.volumeLabel')} ({t('units.m3')})
        </label>
        <input
          id="volume"
          type="number"
          min="0"
          step="1"
          value={building.geometry.volumeM3 || ''}
          onChange={(e) => updateGeometry({ volumeM3: Number(e.target.value) || 0 })}
          placeholder={t('wizard.step2.volumePlaceholder')}
          className="h-11 rounded-lg border border-border-default bg-bg-surface px-3.5 text-base text-text-primary placeholder:text-text-tertiary transition-colors focus:border-energy-400 focus:outline-none focus:ring-3 focus:ring-energy-100"
        />
      </div>

      {/* Occupant count */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="occupants" className="text-sm font-medium text-text-secondary">
          {t('wizard.step2.occupancyLabel')}
        </label>
        <input
          id="occupants"
          type="number"
          min="0"
          value={building.occupancy.count || ''}
          onChange={(e) => updateOccupancy({ count: Number(e.target.value) || 0 })}
          placeholder={t('wizard.step2.occupancyPlaceholder')}
          className="h-11 rounded-lg border border-border-default bg-bg-surface px-3.5 text-base text-text-primary placeholder:text-text-tertiary transition-colors focus:border-energy-400 focus:outline-none focus:ring-3 focus:ring-energy-100"
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <button
          onClick={prevStep}
          className="rounded-lg border border-border-default px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-raised"
        >
          ← {t('common.back')}
        </button>
        <button
          onClick={nextStep}
          disabled={!canProceed}
          className="rounded-lg bg-energy-400 px-5 py-2.5 text-sm font-medium text-text-primary transition-all hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t('common.next')} →
        </button>
      </div>
    </div>
  );
}
