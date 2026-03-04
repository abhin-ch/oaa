'use client';

import { useProjectStore } from '@/store/project';
import { useUIStore } from '@/store/ui';
import type { OccupancyType } from '@/schema/building';

const buildingTypes: { type: OccupancyType; label: string; icon: string }[] = [
  { type: 'residential', label: 'Residential', icon: '🏠' },
  { type: 'office', label: 'Office', icon: '🏢' },
  { type: 'retail', label: 'Retail', icon: '🏪' },
  { type: 'assembly', label: 'Assembly', icon: '🏛️' },
  { type: 'institutional', label: 'Institutional', icon: '🏥' },
  { type: 'industrial', label: 'Industrial', icon: '🏭' },
  { type: 'mixed', label: 'Mixed Use', icon: '🏗️' },
];

export function Step1ProjectSetup() {
  const { building, updateBuilding } = useProjectStore();
  const { nextStep } = useUIStore();

  if (!building) return null;

  const canProceed = building.meta.name.trim().length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-text-primary">Project Setup</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Give your project a name and tell us what kind of building it is.
        </p>
      </div>

      {/* Project name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="project-name" className="text-sm font-medium text-text-secondary">
          Project Name
        </label>
        <input
          id="project-name"
          type="text"
          value={building.meta.name}
          onChange={(e) => updateBuilding({ meta: { ...building.meta, name: e.target.value } })}
          placeholder="e.g. 123 Main Street Office"
          className="h-11 rounded-lg border border-border-default bg-bg-surface px-3.5 text-base text-text-primary placeholder:text-text-tertiary transition-colors focus:border-energy-400 focus:outline-none focus:ring-3 focus:ring-energy-100"
          autoFocus
        />
      </div>

      {/* Address */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="address" className="text-sm font-medium text-text-secondary">
          Address
        </label>
        <input
          id="address"
          type="text"
          value={building.meta.address}
          onChange={(e) => updateBuilding({ meta: { ...building.meta, address: e.target.value } })}
          placeholder="e.g. Toronto, ON"
          className="h-11 rounded-lg border border-border-default bg-bg-surface px-3.5 text-base text-text-primary placeholder:text-text-tertiary transition-colors focus:border-energy-400 focus:outline-none focus:ring-3 focus:ring-energy-100"
        />
        <p className="text-xs text-text-tertiary">
          Climate data (HDD/CDD) will be auto-filled from your location.
        </p>
      </div>

      {/* Building type selector — visual cards */}
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-text-secondary">Building Type</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {buildingTypes.map((bt) => {
            const isSelected = building.occupancy.type === bt.type;
            return (
              <button
                key={bt.type}
                onClick={() =>
                  updateBuilding({
                    occupancy: { ...building.occupancy, type: bt.type },
                  })
                }
                className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all ${
                  isSelected
                    ? 'border-energy-400 bg-energy-50 shadow-sm'
                    : 'border-border-default bg-bg-surface hover:border-border-strong hover:bg-bg-raised'
                }`}
              >
                <span className="text-2xl">{bt.icon}</span>
                <span
                  className={`text-xs font-medium ${isSelected ? 'text-energy-700' : 'text-text-secondary'}`}
                >
                  {bt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Next button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={nextStep}
          disabled={!canProceed}
          className="rounded-lg bg-energy-400 px-5 py-2.5 text-sm font-medium text-text-primary transition-all hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
