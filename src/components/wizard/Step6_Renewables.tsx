'use client';

import { useProjectStore } from '@/store/project';
import { useUIStore } from '@/store/ui';

export function Step6Renewables() {
  const { building, updateBuilding } = useProjectStore();
  const { nextStep, prevStep } = useUIStore();

  if (!building) return null;

  const updateRenewables = (changes: Partial<typeof building.renewables>) => {
    updateBuilding({ renewables: { ...building.renewables, ...changes } });
  };

  const updateOffsets = (changes: Partial<typeof building.offsets>) => {
    updateBuilding({ offsets: { ...building.offsets, ...changes } });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-text-primary">Renewables & Offsets</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Add on-site generation and carbon offsets to reduce your net energy and emissions.
        </p>
      </div>

      {/* Solar PV */}
      <fieldset className="flex flex-col gap-3 rounded-lg border border-border-default p-4">
        <legend className="px-1 text-sm font-medium text-text-secondary">Solar PV</legend>
        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="pv-kw" className="text-xs text-text-tertiary">
              Installed Capacity (kW)
            </label>
            <input
              id="pv-kw"
              type="number"
              min="0"
              step="0.1"
              value={building.renewables.pvKw || ''}
              onChange={(e) => updateRenewables({ pvKw: Number(e.target.value) || 0 })}
              placeholder="e.g. 10"
              className="h-10 w-full rounded-lg border border-border-default bg-bg-surface px-3 text-sm"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="pv-kwh" className="text-xs text-text-tertiary">
              Annual Generation (kWh)
            </label>
            <input
              id="pv-kwh"
              type="number"
              min="0"
              step="100"
              value={building.renewables.pvAnnualKwh || ''}
              onChange={(e) => updateRenewables({ pvAnnualKwh: Number(e.target.value) || 0 })}
              placeholder="e.g. 12000"
              className="h-10 w-full rounded-lg border border-border-default bg-bg-surface px-3 text-sm"
            />
          </div>
        </div>
      </fieldset>

      {/* Wind */}
      <fieldset className="flex flex-col gap-3 rounded-lg border border-border-default p-4">
        <legend className="px-1 text-sm font-medium text-text-secondary">Wind</legend>
        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="wind-kw" className="text-xs text-text-tertiary">
              Capacity (kW)
            </label>
            <input
              id="wind-kw"
              type="number"
              min="0"
              step="0.1"
              value={building.renewables.windKw || ''}
              onChange={(e) => updateRenewables({ windKw: Number(e.target.value) || 0 })}
              className="h-10 w-full rounded-lg border border-border-default bg-bg-surface px-3 text-sm"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="wind-kwh" className="text-xs text-text-tertiary">
              Annual (kWh)
            </label>
            <input
              id="wind-kwh"
              type="number"
              min="0"
              step="100"
              value={building.renewables.windAnnualKwh || ''}
              onChange={(e) => updateRenewables({ windAnnualKwh: Number(e.target.value) || 0 })}
              className="h-10 w-full rounded-lg border border-border-default bg-bg-surface px-3 text-sm"
            />
          </div>
        </div>
      </fieldset>

      {/* Offsets */}
      <fieldset className="flex flex-col gap-3 rounded-lg border border-border-default p-4">
        <legend className="px-1 text-sm font-medium text-text-secondary">Offsets & Credits</legend>
        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor="recs" className="text-xs text-text-tertiary">
              Renewable Energy Certificates (kWh/yr)
            </label>
            <input
              id="recs"
              type="number"
              min="0"
              value={building.offsets.recsKwh || ''}
              onChange={(e) => updateOffsets({ recsKwh: Number(e.target.value) || 0 })}
              className="h-10 w-full rounded-lg border border-border-default bg-bg-surface px-3 text-sm"
            />
          </div>
          <div>
            <label htmlFor="green-gas" className="text-xs text-text-tertiary">
              Green Gas (m³/yr)
            </label>
            <input
              id="green-gas"
              type="number"
              min="0"
              value={building.offsets.greenGasM3 || ''}
              onChange={(e) => updateOffsets({ greenGasM3: Number(e.target.value) || 0 })}
              className="h-10 w-full rounded-lg border border-border-default bg-bg-surface px-3 text-sm"
            />
          </div>
          <div>
            <label htmlFor="credits" className="text-xs text-text-tertiary">
              Carbon Credits (kgCO₂)
            </label>
            <input
              id="credits"
              type="number"
              min="0"
              value={building.offsets.carbonCreditsKgCO2 || ''}
              onChange={(e) => updateOffsets({ carbonCreditsKgCO2: Number(e.target.value) || 0 })}
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
          View Results →
        </button>
      </div>
    </div>
  );
}
