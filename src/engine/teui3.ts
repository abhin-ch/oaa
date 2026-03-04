/**
 * TEUI3 — Full energy balance calculator.
 *
 * Computes a complete building energy balance:
 *   - Envelope transmission losses: sum(U * A) * HDD * 24 / 1000
 *   - Ventilation losses (with heat recovery)
 *   - Infiltration losses
 *   - Internal gains (occupants, lighting, equipment)
 *   - Solar gains through windows
 *   - Net heating/cooling demand -> apply COP -> energy
 *   - Three models: Reference (code min), Design (user values), Actual
 *
 * Input:  Building (uses all fields)
 * Output: TEUI3Result
 *
 * Pure function. No side effects.
 */

import type { Building, Envelope, EnvelopeWall, EnvelopeWindow } from '@/schema/building';
import { gasM3ToKwh, oilLToKwh, woodM3ToKwh } from './shared/units';
import { calculateGHGI, type EnergyBreakdown } from './shared/carbon';
import type { TEUI3Result, EnergyBalanceModel, TEUIResult } from './shared/types';

// ============================================
// Constants
// ============================================

/** Hours in a year */
const HOURS_PER_YEAR = 8760;

/** Days in a year */
const DAYS_PER_YEAR = 365;

/** Air volumetric heat capacity: rho * Cp = 1.2 kg/m3 * 1005 J/(kg*K) / 3600 s/hr = 0.3348 Wh/(m3*K) */
const AIR_HEAT_CAPACITY_WH_PER_M3K = 0.3348;

/** Typical occupant heat gain (W/person) — sensible only */
const OCCUPANT_HEAT_W = 75;

/** DHW demand estimate (kWh/person/yr) — typical Canadian residential */
const DHW_KWH_PER_PERSON_YR = 2000;

/** Fan energy estimate as fraction of ventilation flow energy */
const FAN_ENERGY_FRACTION = 0.05;

/** Solar radiation by orientation (kWh/m2/yr) — typical for climate zone 6A (Toronto) */
const SOLAR_IRRADIANCE: Record<string, number> = {
  N: 400,
  NE: 550,
  E: 700,
  SE: 900,
  S: 1100,
  SW: 900,
  W: 700,
  NW: 550,
};

// ============================================
// Reference model defaults (code minimum)
// ============================================

const REFERENCE_DEFAULTS = {
  wallUValue: 0.278, // ~R-20
  roofUValue: 0.183, // ~R-30
  windowUValue: 2.0, // Double-pane
  doorUValue: 2.0,
  windowSHGC: 0.4,
  airtightnessACH: 3.0,
  ventilationACH: 0.5,
  hrvEfficiency: 0,
  heatingCOP: 0.92, // Gas furnace AFUE
  coolingCOP: 3.0,
  dhwEfficiency: 0.67,
  lightingWPerM2: 10,
  equipmentWPerM2: 5,
};

// ============================================
// Helper functions
// ============================================

/**
 * Calculate envelope transmission loss coefficient (W/K).
 * UA = sum of U*A for all components.
 */
function calculateUA(envelope: Envelope): number {
  let ua = 0;

  // Walls
  for (const wall of envelope.walls) {
    ua += wall.uValue * wall.areaM2;
  }

  // Roof
  ua += envelope.roof.uValue * envelope.roof.areaM2;

  // Windows
  for (const win of envelope.windows) {
    ua += win.uValue * win.areaM2;
  }

  // Doors
  for (const door of envelope.doors) {
    ua += door.uValue * door.areaM2;
  }

  return ua;
}

/**
 * Calculate reference model UA using code-minimum U-values
 * but the actual building areas.
 */
function calculateReferenceUA(envelope: Envelope): number {
  let ua = 0;

  for (const wall of envelope.walls) {
    ua += REFERENCE_DEFAULTS.wallUValue * wall.areaM2;
  }

  ua += REFERENCE_DEFAULTS.roofUValue * envelope.roof.areaM2;

  for (const win of envelope.windows) {
    ua += REFERENCE_DEFAULTS.windowUValue * win.areaM2;
  }

  for (const door of envelope.doors) {
    ua += REFERENCE_DEFAULTS.doorUValue * door.areaM2;
  }

  return ua;
}

/**
 * Calculate annual envelope transmission losses in kWh.
 * Loss = UA * HDD * 24 / 1000
 */
function envelopeLoss(ua: number, hdd: number): number {
  return (ua * hdd * 24) / 1000;
}

/**
 * Calculate annual ventilation heat losses in kWh.
 * Accounts for heat recovery efficiency.
 *
 * VentLoss = volumeM3 * ACH * airHeatCap * HDD * 24 / 1000 * (1 - hrvEff)
 */
function ventilationLoss(
  volumeM3: number,
  ventACH: number,
  hdd: number,
  hrvEfficiency: number,
): number {
  const flowRate = volumeM3 * ventACH; // m3/hr
  const lossWPerK = flowRate * AIR_HEAT_CAPACITY_WH_PER_M3K; // W/K
  const annualLoss = (lossWPerK * hdd * 24) / 1000; // kWh
  return annualLoss * (1 - hrvEfficiency);
}

/**
 * Calculate annual infiltration heat losses in kWh.
 * Uses airtightness at 50 Pa divided by ~20 for natural conditions.
 */
function infiltrationLoss(volumeM3: number, ach50: number, hdd: number): number {
  const naturalACH = ach50 / 20; // Rough approximation
  const flowRate = volumeM3 * naturalACH;
  const lossWPerK = flowRate * AIR_HEAT_CAPACITY_WH_PER_M3K;
  return (lossWPerK * hdd * 24) / 1000;
}

/**
 * Calculate annual internal heat gains in kWh.
 * Includes occupants, lighting, and equipment.
 */
function internalGains(
  areaM2: number,
  occupantCount: number,
  lightingWPerM2: number,
  equipmentWPerM2: number,
  scheduleHoursPerDay: number,
): number {
  const scheduleHoursPerYear = scheduleHoursPerDay * DAYS_PER_YEAR;

  // Occupant gains (kWh/yr) — assume present during schedule hours
  const occupantGains = (occupantCount * OCCUPANT_HEAT_W * scheduleHoursPerYear) / 1000;

  // Lighting gains (kWh/yr)
  const lightingGains = (lightingWPerM2 * areaM2 * scheduleHoursPerYear) / 1000;

  // Equipment gains (kWh/yr)
  const equipmentGains = (equipmentWPerM2 * areaM2 * scheduleHoursPerYear) / 1000;

  return occupantGains + lightingGains + equipmentGains;
}

/**
 * Calculate annual solar heat gains through windows in kWh.
 */
function solarGains(windows: EnvelopeWindow[]): number {
  let total = 0;
  for (const win of windows) {
    const irradiance = SOLAR_IRRADIANCE[win.orientation] ?? SOLAR_IRRADIANCE.S!;
    // Solar gain = area * SHGC * irradiance * utilization factor
    // Utilization factor ~0.6 accounts for shading, frames, and angle
    total += win.areaM2 * win.shgc * irradiance * 0.6;
  }
  return total;
}

/**
 * Calculate reference model solar gains using code-minimum SHGC.
 */
function referenceSolarGains(windows: EnvelopeWindow[]): number {
  let total = 0;
  for (const win of windows) {
    const irradiance = SOLAR_IRRADIANCE[win.orientation] ?? SOLAR_IRRADIANCE.S!;
    total += win.areaM2 * REFERENCE_DEFAULTS.windowSHGC * irradiance * 0.6;
  }
  return total;
}

/**
 * Build a full energy balance model from parameters.
 */
function buildEnergyBalance(params: {
  label: string;
  ua: number;
  hdd: number;
  cdd: number;
  volumeM3: number;
  areaM2: number;
  ventACH: number;
  ach50: number;
  hrvEfficiency: number;
  occupantCount: number;
  lightingWPerM2: number;
  equipmentWPerM2: number;
  scheduleHoursPerDay: number;
  windows: EnvelopeWindow[];
  solarGainsKwh: number;
  heatingCOP: number;
  coolingCOP: number;
  dhwEfficiency: number;
  dhwOccupants: number;
}): EnergyBalanceModel {
  const {
    label,
    ua,
    hdd,
    cdd,
    volumeM3,
    areaM2,
    ventACH,
    ach50,
    hrvEfficiency,
    occupantCount,
    lightingWPerM2,
    equipmentWPerM2,
    scheduleHoursPerDay,
    solarGainsKwh,
    heatingCOP,
    coolingCOP,
    dhwEfficiency,
    dhwOccupants,
  } = params;

  const envelopeLossKwh = envelopeLoss(ua, hdd);
  const ventilationLossKwh = ventilationLoss(volumeM3, ventACH, hdd, hrvEfficiency);
  const infiltrationLossKwh = infiltrationLoss(volumeM3, ach50, hdd);
  const internalGainsKwh = internalGains(
    areaM2,
    occupantCount,
    lightingWPerM2,
    equipmentWPerM2,
    scheduleHoursPerDay,
  );

  // Total losses and gains
  const totalLosses = envelopeLossKwh + ventilationLossKwh + infiltrationLossKwh;
  const totalGains = internalGainsKwh + solarGainsKwh;

  // Net heating demand = losses - gains (clamped to >= 0)
  const netHeatingDemandKwh = Math.max(0, totalLosses - totalGains);

  // Net cooling demand: in summer, gains exceed losses.
  // Simplified: cooling demand scales with CDD analogously.
  // Cooling load = internal gains + solar gains during cooling season
  // Approximate: use CDD/HDD ratio to scale cooling vs heating
  const coolingFraction = hdd > 0 ? cdd / hdd : 0;
  const netCoolingDemandKwh = Math.max(0, totalGains * coolingFraction);

  // Apply system efficiencies
  const heatingEnergyKwh = heatingCOP > 0 ? netHeatingDemandKwh / heatingCOP : 0;
  const coolingEnergyKwh = coolingCOP > 0 ? netCoolingDemandKwh / coolingCOP : 0;

  // DHW energy
  const dhwDemandKwh = dhwOccupants * DHW_KWH_PER_PERSON_YR;
  const dhwEnergyKwh = dhwEfficiency > 0 ? dhwDemandKwh / dhwEfficiency : 0;

  // Lighting and equipment energy (already kWh)
  const scheduleHoursPerYear = scheduleHoursPerDay * DAYS_PER_YEAR;
  const lightingEnergyKwh = (lightingWPerM2 * areaM2 * scheduleHoursPerYear) / 1000;
  const equipmentEnergyKwh = (equipmentWPerM2 * areaM2 * scheduleHoursPerYear) / 1000;

  // Fan energy (simplified estimate)
  const fanEnergyKwh = ventilationLossKwh * FAN_ENERGY_FRACTION;

  // Total
  const totalEnergyKwh =
    heatingEnergyKwh +
    coolingEnergyKwh +
    dhwEnergyKwh +
    lightingEnergyKwh +
    equipmentEnergyKwh +
    fanEnergyKwh;

  const teui = areaM2 > 0 ? totalEnergyKwh / areaM2 : 0;
  const tedi = areaM2 > 0 ? (heatingEnergyKwh + dhwEnergyKwh) / areaM2 : 0;

  return {
    label,
    envelopeLossKwh,
    ventilationLossKwh,
    infiltrationLossKwh,
    internalGainsKwh,
    solarGainsKwh,
    netHeatingDemandKwh,
    netCoolingDemandKwh,
    heatingEnergyKwh,
    coolingEnergyKwh,
    dhwEnergyKwh,
    lightingEnergyKwh,
    equipmentEnergyKwh,
    fanEnergyKwh,
    totalEnergyKwh,
    teui,
    tedi,
  };
}

/**
 * Build an "actual" energy balance model from utility bill data.
 * This uses the actual energy consumption rather than calculated values.
 */
function buildActualModel(building: Building): EnergyBalanceModel | null {
  if (building.actuals.length === 0) return null;

  const area = building.geometry.conditionedAreaM2;

  // Sum actuals
  let totalElecKwh = 0;
  let totalGasM3 = 0;
  for (const month of building.actuals) {
    totalElecKwh += month.electricityKwh;
    totalGasM3 += month.gasM3;
  }

  const totalGasKwh = gasM3ToKwh(totalGasM3);
  const totalEnergyKwh = totalElecKwh + totalGasKwh;
  const teui = area > 0 ? totalEnergyKwh / area : 0;

  // For actuals we can only report totals; detailed balance is not available
  return {
    label: 'Actual',
    envelopeLossKwh: 0,
    ventilationLossKwh: 0,
    infiltrationLossKwh: 0,
    internalGainsKwh: 0,
    solarGainsKwh: 0,
    netHeatingDemandKwh: 0,
    netCoolingDemandKwh: 0,
    heatingEnergyKwh: totalGasKwh, // Assume gas = heating
    coolingEnergyKwh: 0,
    dhwEnergyKwh: 0,
    lightingEnergyKwh: 0,
    equipmentEnergyKwh: totalElecKwh,
    fanEnergyKwh: 0,
    totalEnergyKwh,
    teui,
    tedi: area > 0 ? totalGasKwh / area : 0,
  };
}

// ============================================
// Main export
// ============================================

/**
 * Calculate TEUI3 — full energy balance with Reference, Design, and Actual models.
 *
 * @param building - Complete building data
 * @returns TEUI3Result with energy balance, three models, TEUI, TEDI, GHGI
 */
export function calculateTEUI3(building: Building): TEUI3Result {
  const area = building.geometry.conditionedAreaM2;
  const volume = building.geometry.volumeM3;
  const hdd = building.climate.hddC;
  const cdd = building.climate.cddC;

  // Design model: uses actual building values
  const designUA = calculateUA(building.envelope);
  const designSolarGains = solarGains(building.envelope.windows);

  const designModel = buildEnergyBalance({
    label: 'Design',
    ua: designUA,
    hdd,
    cdd,
    volumeM3: volume,
    areaM2: area,
    ventACH: building.ventilation.rateACH,
    ach50: building.envelope.airtightnessACH,
    hrvEfficiency: building.ventilation.hrvEfficiency,
    occupantCount: building.occupancy.count,
    lightingWPerM2: building.internalLoads.lightingWPerM2,
    equipmentWPerM2: building.internalLoads.equipmentWPerM2,
    scheduleHoursPerDay: building.internalLoads.scheduleHoursPerDay,
    windows: building.envelope.windows,
    solarGainsKwh: designSolarGains,
    heatingCOP: building.systems.heating.cop,
    coolingCOP: building.systems.cooling.cop,
    dhwEfficiency: building.systems.dhw.efficiency,
    dhwOccupants: building.occupancy.count,
  });

  // Reference model: uses code-minimum values with same geometry
  const referenceUA = calculateReferenceUA(building.envelope);
  const refSolarGains = referenceSolarGains(building.envelope.windows);

  const referenceModel = buildEnergyBalance({
    label: 'Reference',
    ua: referenceUA,
    hdd,
    cdd,
    volumeM3: volume,
    areaM2: area,
    ventACH: REFERENCE_DEFAULTS.ventilationACH,
    ach50: REFERENCE_DEFAULTS.airtightnessACH,
    hrvEfficiency: REFERENCE_DEFAULTS.hrvEfficiency,
    occupantCount: building.occupancy.count,
    lightingWPerM2: REFERENCE_DEFAULTS.lightingWPerM2,
    equipmentWPerM2: REFERENCE_DEFAULTS.equipmentWPerM2,
    scheduleHoursPerDay: building.internalLoads.scheduleHoursPerDay,
    windows: building.envelope.windows,
    solarGainsKwh: refSolarGains,
    heatingCOP: REFERENCE_DEFAULTS.heatingCOP,
    coolingCOP: REFERENCE_DEFAULTS.coolingCOP,
    dhwEfficiency: REFERENCE_DEFAULTS.dhwEfficiency,
    dhwOccupants: building.occupancy.count,
  });

  // Actual model: from utility bills
  const actualModel = buildActualModel(building);

  // Use design model as the primary result
  const sources = building.energySources;
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

  // Use design model TEUI as primary
  const teui = designModel.teui;
  const tedi = designModel.tedi;
  const ghgi = calculateGHGI(breakdown, area);

  return {
    teui,
    ghgi,
    totalEnergyKwh: designModel.totalEnergyKwh,
    breakdown,
    tedi,
    energyBalance: designModel,
    referenceModel,
    designModel,
    actualModel,
  };
}
