'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useProjectStore } from '@/store/project';
import { useUIStore } from '@/store/ui';
import { getClimateData } from '@/engine/shared/climate';
import type { OccupancyType } from '@/schema/building';

const buildingTypes: { type: OccupancyType; icon: string }[] = [
  { type: 'residential', icon: '🏠' },
  { type: 'office', icon: '🏢' },
  { type: 'retail', icon: '🏪' },
  { type: 'assembly', icon: '🏛️' },
  { type: 'institutional', icon: '🏥' },
  { type: 'industrial', icon: '🏭' },
  { type: 'mixed', icon: '🏗️' },
];

// Simple geocoding lookup for Canadian cities (mock)
const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  toronto: { lat: 43.65, lon: -79.38 },
  ottawa: { lat: 45.42, lon: -75.69 },
  montreal: { lat: 45.5, lon: -73.57 },
  vancouver: { lat: 49.28, lon: -123.12 },
  calgary: { lat: 51.05, lon: -114.07 },
  edmonton: { lat: 53.55, lon: -113.49 },
  winnipeg: { lat: 49.9, lon: -97.14 },
  halifax: { lat: 44.65, lon: -63.57 },
};

function geocodeCity(address: string): { lat: number; lon: number } | null {
  const lower = address.toLowerCase();
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (lower.includes(city)) return coords;
  }
  return null;
}

export function Step1ProjectSetup() {
  const t = useTranslations();
  const { building, updateBuilding } = useProjectStore();
  const { nextStep } = useUIStore();
  const [climateStatus, setClimateStatus] = useState<string | null>(null);

  const handleAddressChange = useCallback(
    (address: string) => {
      if (!building) return;
      updateBuilding({ meta: { ...building.meta, address } });

      // Try to auto-fill climate data from address
      const coords = geocodeCity(address);
      if (coords) {
        const climate = getClimateData(coords.lat, coords.lon);
        updateBuilding({
          meta: { ...building.meta, address, latitude: coords.lat, longitude: coords.lon },
          climate: {
            hddC: climate.hdd,
            cddC: climate.cdd,
            designHeatTempC: climate.designHeatTemp,
            designCoolTempC: climate.designCoolTemp,
            zone: climate.zone,
          },
        });
        setClimateStatus(climate.location);
      } else {
        setClimateStatus(null);
      }
    },
    [building, updateBuilding],
  );

  if (!building) return null;

  const canProceed = building.meta.name.trim().length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-text-primary">{t('wizard.step1.title')}</h2>
        <p className="mt-1 text-sm text-text-secondary">{t('wizard.step1.description')}</p>
      </div>

      {/* Project name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="project-name" className="text-sm font-medium text-text-secondary">
          {t('wizard.step1.nameLabel')}
        </label>
        <input
          id="project-name"
          type="text"
          value={building.meta.name}
          onChange={(e) => updateBuilding({ meta: { ...building.meta, name: e.target.value } })}
          placeholder={t('wizard.step1.namePlaceholder')}
          className="h-11 rounded-lg border border-border-default bg-bg-surface px-3.5 text-base text-text-primary placeholder:text-text-tertiary transition-colors focus:border-energy-400 focus:outline-none focus:ring-3 focus:ring-energy-100"
          autoFocus
        />
      </div>

      {/* Address */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="address" className="text-sm font-medium text-text-secondary">
          {t('wizard.step1.addressLabel')}
        </label>
        <input
          id="address"
          type="text"
          value={building.meta.address}
          onChange={(e) => handleAddressChange(e.target.value)}
          placeholder={t('wizard.step1.addressPlaceholder')}
          className="h-11 rounded-lg border border-border-default bg-bg-surface px-3.5 text-base text-text-primary placeholder:text-text-tertiary transition-colors focus:border-energy-400 focus:outline-none focus:ring-3 focus:ring-energy-100"
        />
        {climateStatus ? (
          <p className="text-xs text-success-600">
            {t('wizard.step1.climateLoaded', {
              location: climateStatus,
              hdd: building.climate.hddC,
              cdd: building.climate.cddC,
              zone: building.climate.zone,
            })}
          </p>
        ) : (
          <p className="text-xs text-text-tertiary">{t('wizard.step1.climateHint')}</p>
        )}
      </div>

      {/* Building type selector — visual cards */}
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-text-secondary">
          {t('wizard.step1.buildingTypeLabel')}
        </span>
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
                  {t(`buildings.types.${bt.type}` as Parameters<typeof t>[0])}
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
          {t('common.next')} →
        </button>
      </div>
    </div>
  );
}
