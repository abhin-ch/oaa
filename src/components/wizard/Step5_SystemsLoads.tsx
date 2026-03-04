'use client';

import { useProjectStore } from '@/store/project';
import { useUIStore } from '@/store/ui';
import type { HeatingType, CoolingType, DHWType, VentilationType } from '@/schema/building';

const heatingTypes: { value: HeatingType; label: string }[] = [
  { value: 'gas_furnace', label: 'Gas Furnace' },
  { value: 'boiler', label: 'Gas Boiler' },
  { value: 'heat_pump', label: 'Heat Pump' },
  { value: 'electric_baseboard', label: 'Electric Baseboard' },
  { value: 'other', label: 'Other' },
];

const coolingTypes: { value: CoolingType; label: string }[] = [
  { value: 'central_ac', label: 'Central AC' },
  { value: 'heat_pump', label: 'Heat Pump' },
  { value: 'none', label: 'None' },
  { value: 'other', label: 'Other' },
];

const dhwTypes: { value: DHWType; label: string }[] = [
  { value: 'gas_tank', label: 'Gas Tank' },
  { value: 'electric_tank', label: 'Electric Tank' },
  { value: 'heat_pump', label: 'Heat Pump' },
  { value: 'tankless', label: 'Tankless' },
  { value: 'other', label: 'Other' },
];

const ventTypes: { value: VentilationType; label: string }[] = [
  { value: 'natural', label: 'Natural' },
  { value: 'mechanical', label: 'Mechanical' },
  { value: 'hrv', label: 'HRV' },
  { value: 'erv', label: 'ERV' },
];

const presets = [
  {
    label: 'Standard Gas',
    heating: { type: 'gas_furnace' as HeatingType, cop: 0.92 },
    cooling: { type: 'central_ac' as CoolingType, cop: 3.0 },
    dhw: { type: 'gas_tank' as DHWType, efficiency: 0.67 },
  },
  {
    label: 'Heat Pump',
    heating: { type: 'heat_pump' as HeatingType, cop: 3.5 },
    cooling: { type: 'heat_pump' as CoolingType, cop: 4.0 },
    dhw: { type: 'heat_pump' as DHWType, efficiency: 0.9 },
  },
  {
    label: 'All Electric',
    heating: { type: 'electric_baseboard' as HeatingType, cop: 1.0 },
    cooling: { type: 'central_ac' as CoolingType, cop: 3.0 },
    dhw: { type: 'electric_tank' as DHWType, efficiency: 0.9 },
  },
];

export function Step5SystemsLoads() {
  const { building, updateBuilding } = useProjectStore();
  const { nextStep, prevStep } = useUIStore();

  if (!building) return null;

  const applyPreset = (p: (typeof presets)[number]) => {
    updateBuilding({ systems: { heating: p.heating, cooling: p.cooling, dhw: p.dhw } });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-text-primary">Systems & Loads</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Define your HVAC, hot water, lighting, and equipment systems.
        </p>
      </div>

      {/* Presets */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-text-secondary">System Packages</span>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="rounded-lg border border-border-default px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-energy-400 hover:bg-energy-50 hover:text-energy-700"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Heating */}
      <fieldset className="flex flex-col gap-3 rounded-lg border border-border-default p-4">
        <legend className="px-1 text-sm font-medium text-text-secondary">Heating</legend>
        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="heat-type" className="text-xs text-text-tertiary">
              Type
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
              {heatingTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="w-28">
            <label htmlFor="heat-cop" className="text-xs text-text-tertiary">
              COP / AFUE
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
        <legend className="px-1 text-sm font-medium text-text-secondary">Cooling</legend>
        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="cool-type" className="text-xs text-text-tertiary">
              Type
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
              {coolingTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="w-28">
            <label htmlFor="cool-cop" className="text-xs text-text-tertiary">
              COP
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
        <legend className="px-1 text-sm font-medium text-text-secondary">Hot Water</legend>
        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="dhw-type" className="text-xs text-text-tertiary">
              Type
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
              {dhwTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="w-28">
            <label htmlFor="dhw-eff" className="text-xs text-text-tertiary">
              Efficiency
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
        <legend className="px-1 text-sm font-medium text-text-secondary">Ventilation</legend>
        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="vent-type" className="text-xs text-text-tertiary">
              Type
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
              {ventTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="w-28">
            <label htmlFor="vent-rate" className="text-xs text-text-tertiary">
              Rate (ACH)
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
                HRV Eff.
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
        <legend className="px-1 text-sm font-medium text-text-secondary">Internal Loads</legend>
        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="lighting" className="text-xs text-text-tertiary">
              Lighting (W/m²)
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
              Equipment (W/m²)
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
          ← Back
        </button>
        <button
          onClick={nextStep}
          className="rounded-lg bg-energy-400 px-5 py-2.5 text-sm font-medium text-text-primary transition-all hover:brightness-105 active:scale-[0.98]"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
