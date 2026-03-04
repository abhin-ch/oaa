/**
 * Unit conversion functions for energy calculations.
 *
 * All conversions use the constants documented in research.md:
 *   Gas:  1 m3 = 0.0373 GJ, 1 GJ = 277 kWh  =>  1 m3 = 10.3321 kWh
 *   Oil:  1 L  = 0.0383 GJ, 1 GJ = 277 kWh  =>  1 L  = 10.6091 kWh
 *   Wood: ~1000 kWh/m3 (approximate)
 *
 * Pure functions only. No side effects.
 */

// ============================================
// Constants
// ============================================

/** GJ per cubic metre of natural gas */
export const GAS_GJ_PER_M3 = 0.0373;

/** GJ per litre of heating oil */
export const OIL_GJ_PER_L = 0.0383;

/** kWh per GJ */
export const KWH_PER_GJ = 277;

/** kWh per cubic metre of natural gas */
export const GAS_KWH_PER_M3 = GAS_GJ_PER_M3 * KWH_PER_GJ; // 10.3321

/** kWh per litre of heating oil */
export const OIL_KWH_PER_L = OIL_GJ_PER_L * KWH_PER_GJ; // 10.6091

/** kWh per cubic metre of cordwood (approximate) */
export const WOOD_KWH_PER_M3 = 1000;

// ============================================
// Forward conversions (fuel unit -> kWh)
// ============================================

/** Convert natural gas volume (m3) to kWh equivalent. */
export function gasM3ToKwh(m3: number): number {
  return m3 * GAS_KWH_PER_M3;
}

/** Convert heating oil volume (litres) to kWh equivalent. */
export function oilLToKwh(litres: number): number {
  return litres * OIL_KWH_PER_L;
}

/** Convert cordwood volume (m3) to kWh equivalent. */
export function woodM3ToKwh(m3: number): number {
  return m3 * WOOD_KWH_PER_M3;
}

/** Convert GJ to kWh. */
export function gjToKwh(gj: number): number {
  return gj * KWH_PER_GJ;
}

// ============================================
// Inverse conversions (kWh -> fuel unit)
// ============================================

/** Convert kWh to natural gas volume (m3). */
export function kwhToGasM3(kwh: number): number {
  return kwh / GAS_KWH_PER_M3;
}

/** Convert kWh to heating oil volume (litres). */
export function kwhToOilL(kwh: number): number {
  return kwh / OIL_KWH_PER_L;
}

/** Convert kWh to cordwood volume (m3). */
export function kwhToWoodM3(kwh: number): number {
  return kwh / WOOD_KWH_PER_M3;
}

/** Convert kWh to GJ. */
export function kwhToGj(kwh: number): number {
  return kwh / KWH_PER_GJ;
}

// ============================================
// Aggregate helper
// ============================================

/** Convert all energy sources to kWh and return the total. */
export function totalEnergyKwh(sources: {
  electricityKwh: number;
  gasM3: number;
  oilL: number;
  woodM3: number;
}): number {
  return (
    sources.electricityKwh +
    gasM3ToKwh(sources.gasM3) +
    oilLToKwh(sources.oilL) +
    woodM3ToKwh(sources.woodM3)
  );
}
