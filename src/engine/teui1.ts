/**
 * TEUI v1 Calculation Engine
 *
 * Pure TypeScript — no React, no DOM, no side effects.
 * Computes Total Energy Use Intensity and Greenhouse Gas Intensity
 * from energy bill data.
 */

import type { Building } from '@/schema/building';

// ── Result types ──────────────────────────────────────────────

export interface TEUI1Result {
  teui: number; // kWh/m2/yr
  totalEnergyKwh: number;
  renewablesKwh: number;
  netEnergyKwh: number;
  gradientPosition: number; // 0–99 (for bar indicator)
  breakdown: EnergyBreakdown[];
  ghgi: GHGIResult;
}

export interface GHGIResult {
  kgCo2PerM2: number;
  mtCo2Total: number;
}

export interface EnergyBreakdown {
  source: string;
  kwhPerM2: number;
  percentage: number;
}

// ── Conversion constants ──────────────────────────────────────

export const GAS_M3_TO_KWH = 10.2764;
export const PROPANE_LBS_TO_KWH = 6.3267;
export const OIL_L_TO_KWH = 10.36;
export const BIOFUEL_M3_TO_KWH = 1000;
export const AREA_FT2_PER_M2 = 10.764;

// ── Emission factors ─────────────────────────────────────────

export const CO2_ELECTRICITY = 0.000031; // MT CO2e per kWh (Ontario grid ~31g/kWh)
export const CO2_GAS_PER_M3 = 0.00263; // MT CO2e per m3
export const CO2_OIL_PER_L = 0.00273; // MT CO2e per litre
export const CO2_PROPANE_FACTOR = 1.38167; // kg CO2e per lb (used as multiplier / area)

// ── Canadian average for comparison ──────────────────────────

export const CANADIAN_AVG_GHGI_MT = 6.35; // MT CO2e per building (reference)

// ── Helpers ──────────────────────────────────────────────────

function safe(n: number | undefined | null): number {
  if (n == null || isNaN(n)) return 0;
  return n;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ── Main calculation ─────────────────────────────────────────

export const ZERO_RESULT: TEUI1Result = {
  teui: 0,
  totalEnergyKwh: 0,
  renewablesKwh: 0,
  netEnergyKwh: 0,
  gradientPosition: 0,
  breakdown: [],
  ghgi: { kgCo2PerM2: 0, mtCo2Total: 0 },
};

export function calculateTEUI1(building: Building): TEUI1Result {
  const es = building.energySources;
  const rn = building.renewables;

  const area = safe(es?.conditionedAreaM2);
  if (area <= 0) return ZERO_RESULT;

  // Convert all sources to kWh
  const electricityKwh = safe(es?.electricityKwh);
  const gasKwh = safe(es?.naturalGasM3) * GAS_M3_TO_KWH;
  const propaneKwh = safe(es?.propaneLbs) * PROPANE_LBS_TO_KWH;
  const oilKwh = safe(es?.heatingOilL) * OIL_L_TO_KWH;
  const biofuelKwh = safe(es?.biofuelM3) * BIOFUEL_M3_TO_KWH;

  const totalEnergyKwh = electricityKwh + gasKwh + propaneKwh + oilKwh + biofuelKwh;

  // Renewables offset
  const renewablesKwh =
    safe(rn?.onSiteKwh) + safe(rn?.offSiteElectricityKwh) + safe(rn?.offSiteGasKwh);

  const netEnergyKwh = totalEnergyKwh - renewablesKwh;
  const teui = netEnergyKwh / area;

  // Gradient position: 0 (best) to 99 (worst), scale is 0–500 kWh/m2
  const gradientPosition = clamp(Math.round((teui / 500) * 100), 0, 99);

  // Energy breakdown
  const sources = [
    { source: 'electricity', kwh: electricityKwh },
    { source: 'naturalGas', kwh: gasKwh },
    { source: 'propane', kwh: propaneKwh },
    { source: 'heatingOil', kwh: oilKwh },
    { source: 'biofuel', kwh: biofuelKwh },
  ];

  if (renewablesKwh > 0) {
    sources.push({ source: 'renewables', kwh: renewablesKwh });
  }

  const totalForPercentage = totalEnergyKwh + renewablesKwh;
  const breakdown: EnergyBreakdown[] = sources
    .filter((s) => s.kwh > 0)
    .map((s) => ({
      source: s.source,
      kwhPerM2: s.kwh / area,
      percentage: totalForPercentage > 0 ? (s.kwh / totalForPercentage) * 100 : 0,
    }));

  // GHGI calculation
  const co2Elec = Math.max(0, electricityKwh - renewablesKwh) * CO2_ELECTRICITY; // MT
  const co2Gas = safe(es?.naturalGasM3) * CO2_GAS_PER_M3; // MT
  const co2Oil = safe(es?.heatingOilL) * CO2_OIL_PER_L; // MT
  const co2Propane = (safe(es?.propaneLbs) * CO2_PROPANE_FACTOR) / area; // kg/m2

  const kgCo2PerM2 = ((co2Elec + co2Oil + co2Gas) / area) * 1000 + co2Propane;
  const mtCo2Total = (kgCo2PerM2 / 1000) * area;

  return {
    teui,
    totalEnergyKwh,
    renewablesKwh,
    netEnergyKwh,
    gradientPosition,
    breakdown,
    ghgi: { kgCo2PerM2, mtCo2Total },
  };
}

/** Convert ft2 to m2 */
export function ft2ToM2(ft2: number): number {
  return ft2 / AREA_FT2_PER_M2;
}

/** Convert m2 to ft2 */
export function m2ToFt2(m2: number): number {
  return m2 * AREA_FT2_PER_M2;
}
