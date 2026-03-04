'use client';

import { useTranslations } from 'next-intl';
import { useProjectStore } from '@/store/project';
import { useUIStore } from '@/store/ui';
import type { HeatingType, CoolingType, DHWType, VentilationType } from '@/schema/building';

const heatingTypeValues: HeatingType[] = [
  'gas_furnace',
  'boiler',
  'heat_pump',
  'electric_baseboard',
  'other',
];

const coolingTypeValues: CoolingType[] = ['central_ac', 'heat_pump', 'none', 'other'];

const dhwTypeValues: DHWType[] = ['gas_tank', 'electric_tank', 'heat_pump', 'tankless', 'other'];

const ventTypeValues: VentilationType[] = ['natural', 'mechanical', 'hrv', 'erv'];

const presets = [
  {
    key: 'presetStandardGas',
    heating: { type: 'gas_furnace' as HeatingType, cop: 0.92 },
    cooling: { type: 'central_ac' as CoolingType, cop: 3.0 },
    dhw: { type: 'gas_tank' as DHWType, efficiency: 0.67 },
  },
  {
    key: 'presetHeatPump',
    heating: { type: 'heat_pump' as HeatingType, cop: 3.5 },
    cooling: { type: 'heat_pump' as CoolingType, cop: 4.0 },
    dhw: { type: 'heat_pump' as DHWType, efficiency: 0.9 },
  },
  {
    key: 'presetAllElectric',
    heating: { type: 'electric_baseboard' as HeatingType, cop: 1.0 },
    cooling: { type: 'central_ac' as CoolingType, cop: 3.0 },
    dhw: { type: 'electric_tank' as DHWType, efficiency: 0.9 },
  },
];

export function Step5SystemsLoads() {
  const t = useTranslations();
  const { building, updateBuilding } = useProjectStore();
  const { nextStep, prevStep } = useUIStore();

  if (!building) return null;

  const applyPreset = (p: (typeof presets)[number]) => {
    updateBuilding({ systems: { heating: p.heating, cooling: p.cooling, dhw: p.dhw } });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-text-primary">{t('wizard.step5.title')}</h2>
        <p className="mt-1 text-sm text-text-secondary">{t('wizard.step5.description')}</p>
      </div>

      {/* Presets */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-text-secondary">
          {t('wizard.step5.systemPackages')}
        </span>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.key}
              onClick={() => applyPreset(p)}
              className="rounded-lg border border-border-default px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-energy-400 hover:bg-energy-50 hover:text-energy-700"
            >
              {t(`wizard.step5.${p.key}` as Parameters<typeof t>[0])}
            </button>
          ))}
        </div>
      </div>

      {/* Heating */}
      <fieldset className="flex flex-col gap-3 rounded-lg border border-border-default p-4">
        <legend className="px-1 text-sm font-medium text-text-secondary">
          {t('wizard.step5.heatingLabel')}
        </legend>
        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="heat-type" className="text-xs text-text-tertiary">
              {t('wizard.step5.typeLabel')}
            </label>
            <select
              id="heat-type"
              value={building.systems.heating.type}
              onChange={(e) =>
                updateBuilding({
                  systems: {
                    ...building.systems,
                    heating: { ...building.systems.heating, type: e.target.value as HeatingType },
                  },
                })
              }
              className="h-10 w-full rounded-lg border border-border-default bg-bg-surface px-3 text-sm"
            >
              {heatingTypeValues.map((v) => (
                <option key={v} value={v}>
                  {t(`wizard.step5.heatingTypes.${v}` as Parameters<typeof t>[0])}
                </option>
              ))}
            </select>
          </div>
          <div className="w-28">
            <label htmlFor="heat-cop" className="text-xs text-text-tertiary">
              {t('wizard.step5.copLabel')}
            </label>
            <input
              id="heat-cop"
              type="number"
              min="0"
              step="0.1"
              value={building.systems.heating.cop}
              onChange={(e) =>
                updateBuilding({
                  systems: {
                    ...building.systems,
                    heating: { ...building.systems.heating, cop: Number(e.target.value) || 0 },
                  },
                })
              }
              className="h-10 w-full rounded-lg border border-border-default bg-bg-surface px-3 text-sm"
            />
          </div>
        </div>
      </fieldset>

      {/* Cooling */}
      <fieldset className="flex flex-col gap-3 rounded-lg border border-border-default p-4">
        <legend className="px-1 text-sm font-medium text-text-secondary">
          {t('wizard.step5.coolingLabel')}
        </legend>
        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="cool-type" className="text-xs text-text-tertiary">
              {t('wizard.step5.typeLabel')}
            </label>
            <select
              id="cool-type"
              value={building.systems.cooling.type}
              onChange={(e) =>
                updateBuilding({
                  systems: {
                    ...building.systems,
                    cooling: { ...building.systems.cooling, type: e.target.value as CoolingType },
                  },
                })
              }
              className="h-10 w-full rounded-lg border border-border-default bg-bg-surface px-3 text-sm"
            >
              {coolingTypeValues.map((v) => (
                <option key={v} value={v}>
                  {t(`wizard.step5.coolingTypes.${v}` as Parameters<typeof t>[0])}
                </option>
              ))}
            </select>
          </div>
          <div className="w-28">
            <label htmlFor="cool-cop" className="text-xs text-text-tertiary">
              {t('wizard.step5.copCoolingLabel')}
            </label>
            <input
              id="cool-cop"
              type="number"
              min="0"
              step="0.1"
              value={building.systems.cooling.cop}
              onChange={(e) =>
                updateBuilding({
                  systems: {
                    ...building.systems,
                    cooling: { ...building.systems.cooling, cop: Number(e.target.value) || 0 },
                  },
                })
              }
              className="h-10 w-full rounded-lg border border-border-default bg-bg-surface px-3 text-sm"
            />
          </div>
        </div>
      </fieldset>

      {/* DHW */}
      <fieldset className="flex flex-col gap-3 rounded-lg border border-border-default p-4">
        <legend className="px-1 text-sm font-medium text-text-secondary">
          {t('wizard.step5.dhwLabel')}
        </legend>
        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="dhw-type" className="text-xs text-text-tertiary">
              {t('wizard.step5.typeLabel')}
            </label>
            <select
              id="dhw-type"
              value={building.systems.dhw.type}
              onChange={(e) =>
                updateBuilding({
                  systems: {
                    ...building.systems,
                    dhw: { ...building.systems.dhw, type: e.target.value as DHWType },
                  },
                })
              }
              className="h-10 w-full rounded-lg border border-border-default bg-bg-surface px-3 text-sm"
            >
              {dhwTypeValues.map((v) => (
                <option key={v} value={v}>
                  {t(`wizard.step5.dhwTypes.${v}` as Parameters<typeof t>[0])}
                </option>
              ))}
            </select>
          </div>
          <div className="w-28">
            <label htmlFor="dhw-eff" className="text-xs text-text-tertiary">
              {t('wizard.step5.efficiencyLabel')}
            </label>
            <input
              id="dhw-eff"
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={building.systems.dhw.efficiency}
              onChange={(e) =>
                updateBuilding({
                  systems: {
                    ...building.systems,
                    dhw: { ...building.systems.dhw, efficiency: Number(e.target.value) || 0 },
                  },
                })
              }
              className="h-10 w-full rounded-lg border border-border-default bg-bg-surface px-3 text-sm"
            />
          </div>
        </div>
      </fieldset>

      {/* Ventilation */}
      <fieldset className="flex flex-col gap-3 rounded-lg border border-border-default p-4">
        <legend className="px-1 text-sm font-medium text-text-secondary">
          {t('wizard.step5.ventilationLabel')}
        </legend>
        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="vent-type" className="text-xs text-text-tertiary">
              {t('wizard.step5.typeLabel')}
            </label>
            <select
              id="vent-type"
              value={building.ventilation.type}
              onChange={(e) =>
                updateBuilding({
                  ventilation: { ...building.ventilation, type: e.target.value as VentilationType },
                })
              }
              className="h-10 w-full rounded-lg border border-border-default bg-bg-surface px-3 text-sm"
            >
              {ventTypeValues.map((v) => (
                <option key={v} value={v}>
                  {t(`wizard.step5.ventTypes.${v}` as Parameters<typeof t>[0])}
                </option>
              ))}
            </select>
          </div>
          <div className="w-28">
            <label htmlFor="vent-rate" className="text-xs text-text-tertiary">
              {t('wizard.step5.rateLabel')}
            </label>
            <input
              id="vent-rate"
              type="number"
              min="0"
              step="0.1"
              value={building.ventilation.rateACH}
              onChange={(e) =>
                updateBuilding({
                  ventilation: { ...building.ventilation, rateACH: Number(e.target.value) || 0 },
                })
              }
              className="h-10 w-full rounded-lg border border-border-default bg-bg-surface px-3 text-sm"
            />
          </div>
          {(building.ventilation.type === 'hrv' || building.ventilation.type === 'erv') && (
            <div className="w-28">
              <label htmlFor="hrv-eff" className="text-xs text-text-tertiary">
                {t('wizard.step5.hrvEffLabel')}
              </label>
              <input
                id="hrv-eff"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={building.ventilation.hrvEfficiency}
                onChange={(e) =>
                  updateBuilding({
                    ventilation: {
                      ...building.ventilation,
                      hrvEfficiency: Number(e.target.value) || 0,
                    },
                  })
                }
                className="h-10 w-full rounded-lg border border-border-default bg-bg-surface px-3 text-sm"
              />
            </div>
          )}
        </div>
      </fieldset>

      {/* Internal Loads */}
      <fieldset className="flex flex-col gap-3 rounded-lg border border-border-default p-4">
        <legend className="px-1 text-sm font-medium text-text-secondary">
          {t('wizard.step5.internalLoadsLabel')}
        </legend>
        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="lighting" className="text-xs text-text-tertiary">
              {t('wizard.step5.lightingLabel')}
            </label>
            <input
              id="lighting"
              type="number"
              min="0"
              step="0.5"
              value={building.internalLoads.lightingWPerM2}
              onChange={(e) =>
                updateBuilding({
                  internalLoads: {
                    ...building.internalLoads,
                    lightingWPerM2: Number(e.target.value) || 0,
                  },
                })
              }
              className="h-10 w-full rounded-lg border border-border-default bg-bg-surface px-3 text-sm"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="equipment" className="text-xs text-text-tertiary">
              {t('wizard.step5.equipmentLabel')}
            </label>
            <input
              id="equipment"
              type="number"
              min="0"
              step="0.5"
              value={building.internalLoads.equipmentWPerM2}
              onChange={(e) =>
                updateBuilding({
                  internalLoads: {
                    ...building.internalLoads,
                    equipmentWPerM2: Number(e.target.value) || 0,
                  },
                })
              }
              className="h-10 w-full rounded-lg border border-border-default bg-bg-surface px-3 text-sm"
            />
          </div>
        </div>
      </fieldset>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <button
          onClick={prevStep}
          className="rounded-lg border border-border-default px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-raised"
        >
          &larr; {t('common.back')}
        </button>
        <button
          onClick={nextStep}
          className="rounded-lg bg-energy-400 px-5 py-2.5 text-sm font-medium text-text-primary transition-all hover:brightness-105 active:scale-[0.98]"
        >
          {t('common.next')} &rarr;
        </button>
      </div>
    </div>
  );
}
