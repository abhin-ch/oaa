/**
 * TEUI2 — Extended calculator.
 *
 * Builds on TEUI1 by adding:
 *   - Renewable energy subtraction (PV, wind, other)
 *   - Occupancy normalization (TEUI per occupant)
 *   - Offset handling (RECs, green gas, carbon credits)
 *   - Simplified TEDI estimate
 *   - Benchmark comparison against code standards
 *   - Embodied carbon reporting
 *
 * Input:  Building (uses energySources, renewables, occupancy, offsets, embodiedCarbon)
 * Output: TEUI2Result
 *
 * Pure function. No side effects.
 */

import type { Building } from '@/schema/building';
import { gasM3ToKwh, oilLToKwh, woodM3ToKwh } from './shared/units';
import { calculateGHGI, type EnergyBreakdown } from './shared/carbon';
import {
  getBenchmark,
  compareToBaseline,
  compareToNationalAverage,
  type ComplianceStandard,
} from './shared/benchmarks';
import type { TEUI2Result } from './shared/types';

/**
 * Calculate total renewable generation in kWh/yr.
 */
function totalRenewables(building: Building): number {
  const r = building.renewables;
  return r.pvAnnualKwh + r.windAnnualKwh + r.otherAnnualKwh;
}

/**
 * Calculate total offset energy in kWh/yr.
 * RECs are already in kWh; green gas is converted to kWh.
 */
function totalOffsets(building: Building): number {
  const o = building.offsets;
  return o.recsKwh + gasM3ToKwh(o.greenGasM3);
}

/**
 * Estimate a simplified TEDI from energy sources.
 *
 * Simplified approach: assume gas + oil + wood are primarily heating fuels,
 * so TEDI ~ (gasKwh + oilKwh + woodKwh) / area.
 * This is a rough proxy; TEUI3 does a proper energy balance.
 */
function estimateTEDI(building: Building): number {
  const area = building.geometry.conditionedAreaM2;
  if (area <= 0) return 0;

  const heatingKwh =
    gasM3ToKwh(building.energySources.gasM3) +
    oilLToKwh(building.energySources.oilL) +
    woodM3ToKwh(building.energySources.woodM3);

  return heatingKwh / area;
}

/**
 * Calculate TEUI2 — extended energy intensity with renewables, benchmarks, and carbon.
 *
 * @param building - The building data
 * @param standard - Compliance standard for benchmark comparison (default: NECB)
 * @returns TEUI2Result with net TEUI, benchmarks, embodied carbon, etc.
 */
export function calculateTEUI2(
  building: Building,
  standard: ComplianceStandard = 'NECB',
): TEUI2Result {
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

  // Subtract renewables and offsets for net energy
  const renewablesKwh = totalRenewables(building);
  const offsetsKwh = totalOffsets(building);
  const netEnergyKwh = Math.max(0, totalEnergyKwh - renewablesKwh - offsetsKwh);

  // Gross TEUI (before renewables)
  const teui = area > 0 ? totalEnergyKwh / area : 0;

  // Net TEUI (after renewables and offsets)
  const netTeui = area > 0 ? netEnergyKwh / area : 0;

  // GHGI based on net energy breakdown (proportionally reduced)
  const reductionFactor = totalEnergyKwh > 0 ? netEnergyKwh / totalEnergyKwh : 0;
  const netBreakdown: EnergyBreakdown = {
    electricityKwh: electricityKwh * reductionFactor,
    gasKwh: gasKwh * reductionFactor,
    oilKwh: oilKwh * reductionFactor,
    woodKwh: woodKwh * reductionFactor,
  };

  // Account for carbon credits as a direct subtraction from GHGI
  const ghgiBeforeCredits = calculateGHGI(netBreakdown, area);
  const creditReduction = area > 0 ? building.offsets.carbonCreditsKgCO2 / area : 0;
  const ghgi = Math.max(0, ghgiBeforeCredits - creditReduction);

  // Simplified TEDI
  const tediSimplified = estimateTEDI(building);

  // Per-occupant normalization
  const teuiPerOccupant =
    building.occupancy.count > 0 ? netEnergyKwh / building.occupancy.count : null;

  // Benchmark comparison
  const benchmark = getBenchmark(standard, building.occupancy.type);
  const benchmarkComparison = benchmark ? compareToBaseline({ teui: netTeui }, benchmark) : null;

  // National average comparison
  const { percentOfAverage } = compareToNationalAverage(netTeui, building.occupancy.type);

  // Embodied carbon
  const embodiedCarbonPerM2 = building.embodiedCarbon?.perM2KgCO2e ?? null;

  return {
    teui,
    ghgi,
    totalEnergyKwh,
    breakdown,
    netTeui,
    totalRenewablesKwh: renewablesKwh,
    tediSimplified,
    teuiPerOccupant,
    benchmarkComparison,
    benchmarkUsed: benchmark,
    percentOfNationalAverage: percentOfAverage,
    embodiedCarbonPerM2,
  };
}
