'use client';

import { useTranslations } from 'next-intl';
import type { Building, OccupancyType } from '@/schema/building';
import { AreaInput } from './AreaInput';

interface BuildingTabProps {
  building: Building;
  onUpdate: (changes: Partial<Building>) => void;
}

const BUILDING_TYPES: OccupancyType[] = [
  'residential',
  'office',
  'retail',
  'assembly',
  'institutional',
  'industrial',
  'mixed',
];

export function BuildingTab({ building, onUpdate }: BuildingTabProps) {
  const t = useTranslations('buildings.types');
  const tl = useTranslations('teui1.building');

  return (
    <div className="space-y-8 pb-8">
      {/* Building Type Selector */}
      <div>
        <label className="mb-4 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
          {tl('typology')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {BUILDING_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onUpdate({ occupancy: type })}
              className={`border px-4 py-3 text-left text-sm font-medium transition-all ${
                building.occupancy === type
                  ? 'border-text-primary bg-text-primary text-text-inverse'
                  : 'border-border-default bg-bg-surface text-text-secondary hover:border-border-strong'
              }`}
            >
              {t(type)}
            </button>
          ))}
        </div>
      </div>

      {/* Area Input */}
      <AreaInput
        valueM2={building.energySources?.conditionedAreaM2 ?? 0}
        onChange={(m2) =>
          onUpdate({
            energySources: {
              ...building.energySources,
              conditionedAreaM2: m2,
            },
          })
        }
      />
    </div>
  );
}
