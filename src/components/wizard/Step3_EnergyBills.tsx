'use client';

import { useProjectStore } from '@/store/project';
import { useUIStore } from '@/store/ui';

interface EnergyField {
  id: string;
  label: string;
  unit: string;
  key: keyof typeof defaultSources;
  placeholder: string;
}

const defaultSources = {
  electricityKwh: 0,
  gasM3: 0,
  oilL: 0,
  woodM3: 0,
};

const fields: EnergyField[] = [
  {
    id: 'electricity',
    label: 'Electricity',
    unit: 'kWh/yr',
    key: 'electricityKwh',
    placeholder: 'e.g. 20000',
  },
  { id: 'gas', label: 'Natural Gas', unit: 'm³/yr', key: 'gasM3', placeholder: 'e.g. 5000' },
  { id: 'oil', label: 'Fuel Oil', unit: 'L/yr', key: 'oilL', placeholder: 'e.g. 0' },
  { id: 'wood', label: 'Wood', unit: 'm³/yr', key: 'woodM3', placeholder: 'e.g. 0' },
];

export function Step3EnergyBills() {
  const { building, updateBuilding } = useProjectStore();
  const { nextStep, prevStep } = useUIStore();

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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-text-primary">Energy Bills</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Enter your annual energy consumption from utility bills. This gives you an instant TEUI.
        </p>
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

      {/* Quick TEUI preview if we have data */}
      {hasAnyEnergy && building.geometry.conditionedAreaM2 > 0 && (
        <div className="rounded-lg border border-energy-200 bg-energy-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-energy-700">
            Quick TEUI Estimate
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Based on your energy bills and floor area, your building&apos;s detailed TEUI will be
            calculated on the Results page.
          </p>
        </div>
      )}

      {/* Skip option */}
      <p className="text-xs text-text-tertiary">
        Don&apos;t have utility bills? You can skip this step and the app will estimate energy use
        from your building&apos;s physical characteristics.
      </p>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <button
          onClick={prevStep}
          className="rounded-lg border border-border-default px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-raised"
        >
          ← Back
        </button>
        <div className="flex gap-2">
          <button
            onClick={nextStep}
            className="rounded-lg border border-border-default px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-raised"
          >
            Skip
          </button>
          <button
            onClick={nextStep}
            className="rounded-lg bg-energy-400 px-5 py-2.5 text-sm font-medium text-text-primary transition-all hover:brightness-105 active:scale-[0.98]"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
