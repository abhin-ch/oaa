/**
 * TEUI1 — Simple energy intensity calculator.
 *
 * The simplest TEUI version: sum all energy sources converted to kWh,
 * subtract renewables, divide by conditioned floor area.
 *
 * Input:  Building (uses energySources + geometry.conditionedAreaM2)
 * Output: TEUIResult { teui, ghgi, totalEnergyKwh, breakdown }
 *
 * Pure function. No side effects.
 */

import type { Building } from '@/schema/building';
import { gasM3ToKwh, oilLToKwh, woodM3ToKwh } from './shared/units';
import { calculateGHGI, type EnergyBreakdown } from './shared/carbon';
import type { TEUIResult } from './shared/types';

/**
 * Calculate TEUI using the simplest method: total energy / area.
 *
 * @param building - The building data
 * @returns TEUIResult with TEUI (kWh/m2/yr), GHGI, and breakdown
 * @throws Never — returns zeroes for invalid inputs
 */
export function calculateTEUI1(building: Building): TEUIResult {
  const area = building.geometry.conditionedAreaM2;
  const sources = building.energySources;

  // Convert all sources to kWh
  const electricityKwh = sources.electricityKwh;
  const gasKwh = gasM3ToKwh(sources.gasM3);
  const oilKwh = oilLToKwh(sources.oilL);
  const woodKwh = woodM3ToKwh(sources.woodM3);

  const breakdown: EnergyBreakdown = {
    electricityKwh,
    gasKwh,
    oilKwh,
    woodKwh,
  };

  const totalEnergyKwh = electricityKwh + gasKwh + oilKwh + woodKwh;

  // TEUI = total energy / area
  const teui = area > 0 ? totalEnergyKwh / area : 0;

  // GHGI = total emissions / area
  const ghgi = calculateGHGI(breakdown, area);

  return {
    teui,
    ghgi,
    totalEnergyKwh,
    breakdown,
  };
}
