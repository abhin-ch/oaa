/**
 * Shared test fixtures — reusable Building objects for engine tests.
 */

import type { Building } from '@/schema/building';
import { createEmptyBuilding } from '@/schema/building';

/**
 * Simple residential building for TEUI1 tests.
 * 1000 m2, uses 20000 kWh electricity and 2000 m3 gas.
 *
 * Expected:
 *   Gas kWh = 2000 * 10.3321 = 20664.2 kWh
 *   Total = 20000 + 20664.2 = 40664.2 kWh
 *   TEUI = 40664.2 / 1000 = 40.6642 kWh/m2/yr
 */
export function createSimpleResidential(): Building {
  const b = createEmptyBuilding('test-simple-residential');
  b.geometry.conditionedAreaM2 = 1000;
  b.energySources.electricityKwh = 20000;
  b.energySources.gasM3 = 2000;
  b.occupancy.type = 'residential';
  b.occupancy.count = 4;
  return b;
}

/**
 * Building with all fuel types for comprehensive conversion tests.
 * 500 m2, electricity + gas + oil + wood.
 */
export function createMultiFuel(): Building {
  const b = createEmptyBuilding('test-multi-fuel');
  b.geometry.conditionedAreaM2 = 500;
  b.energySources.electricityKwh = 10000;
  b.energySources.gasM3 = 1000;
  b.energySources.oilL = 500;
  b.energySources.woodM3 = 2;
  b.occupancy.type = 'residential';
  b.occupancy.count = 3;
  return b;
}

/**
 * Building with renewables and offsets for TEUI2 tests.
 */
export function createWithRenewables(): Building {
  const b = createSimpleResidential();
  b.id = 'test-with-renewables';
  b.renewables.pvAnnualKwh = 5000;
  b.renewables.windAnnualKwh = 1000;
  b.renewables.otherAnnualKwh = 500;
  b.offsets.recsKwh = 2000;
  b.offsets.greenGasM3 = 100;
  b.offsets.carbonCreditsKgCO2 = 500;
  b.embodiedCarbon = { totalKgCO2e: 50000, perM2KgCO2e: 50 };
  return b;
}

/**
 * Full building with envelope, systems, climate — for TEUI3/4 tests.
 * Represents a typical Toronto office building.
 */
export function createFullOfficeBuilding(): Building {
  const b = createEmptyBuilding('test-full-office');

  // Meta
  b.meta.name = 'Test Office';
  b.meta.address = 'Toronto, ON';
  b.meta.latitude = 43.65;
  b.meta.longitude = -79.38;

  // Climate — Toronto
  b.climate.zone = '6A';
  b.climate.hddC = 3520;
  b.climate.cddC = 350;
  b.climate.designHeatTempC = -20;
  b.climate.designCoolTempC = 33;

  // Geometry
  b.geometry.floors = 3;
  b.geometry.conditionedAreaM2 = 2000;
  b.geometry.volumeM3 = 6000;
  b.geometry.orientation = 0;

  // Occupancy
  b.occupancy.type = 'office';
  b.occupancy.count = 50;
  b.occupancy.scheduleHoursPerDay = 10;

  // Envelope
  b.envelope.walls = [
    { areaM2: 200, uValue: 0.2, orientation: 'N' },
    { areaM2: 200, uValue: 0.2, orientation: 'S' },
    { areaM2: 150, uValue: 0.2, orientation: 'E' },
    { areaM2: 150, uValue: 0.2, orientation: 'W' },
  ];
  b.envelope.roof = { areaM2: 667, uValue: 0.15 };
  b.envelope.windows = [
    { areaM2: 50, uValue: 1.6, shgc: 0.3, orientation: 'N' },
    { areaM2: 80, uValue: 1.6, shgc: 0.3, orientation: 'S' },
    { areaM2: 40, uValue: 1.6, shgc: 0.3, orientation: 'E' },
    { areaM2: 40, uValue: 1.6, shgc: 0.3, orientation: 'W' },
  ];
  b.envelope.doors = [{ areaM2: 10, uValue: 1.5 }];
  b.envelope.airtightnessACH = 2.5;

  // Internal loads
  b.internalLoads.lightingWPerM2 = 8;
  b.internalLoads.equipmentWPerM2 = 12;
  b.internalLoads.scheduleHoursPerDay = 10;

  // Ventilation
  b.ventilation.rateACH = 0.6;
  b.ventilation.type = 'hrv';
  b.ventilation.hrvEfficiency = 0.75;

  // Systems
  b.systems.heating = { type: 'gas_furnace', cop: 0.95 };
  b.systems.cooling = { type: 'central_ac', cop: 3.5 };
  b.systems.dhw = { type: 'gas_tank', efficiency: 0.8 };

  // Energy sources (actual consumption for TEUI1/2 calculations)
  b.energySources.electricityKwh = 80000;
  b.energySources.gasM3 = 15000;

  // Renewables
  b.renewables.pvKw = 20;
  b.renewables.pvAnnualKwh = 24000;

  return b;
}

/**
 * Building with actuals for calibration tests.
 */
export function createWithActuals(): Building {
  const b = createFullOfficeBuilding();
  b.id = 'test-with-actuals';
  b.actuals = [
    { month: 1, electricityKwh: 7000, gasM3: 2500 },
    { month: 2, electricityKwh: 6500, gasM3: 2200 },
    { month: 3, electricityKwh: 6000, gasM3: 1800 },
    { month: 4, electricityKwh: 5500, gasM3: 1200 },
    { month: 5, electricityKwh: 5800, gasM3: 600 },
    { month: 6, electricityKwh: 7000, gasM3: 200 },
    { month: 7, electricityKwh: 8000, gasM3: 100 },
    { month: 8, electricityKwh: 7500, gasM3: 100 },
    { month: 9, electricityKwh: 6500, gasM3: 400 },
    { month: 10, electricityKwh: 5800, gasM3: 1000 },
    { month: 11, electricityKwh: 6000, gasM3: 1800 },
    { month: 12, electricityKwh: 6800, gasM3: 2400 },
  ];
  return b;
}

/**
 * Zero-area building for edge case testing.
 */
export function createZeroArea(): Building {
  const b = createEmptyBuilding('test-zero-area');
  b.energySources.electricityKwh = 10000;
  return b;
}

/**
 * Empty building with no energy for edge case testing.
 */
export function createNoEnergy(): Building {
  const b = createEmptyBuilding('test-no-energy');
  b.geometry.conditionedAreaM2 = 1000;
  return b;
}
