/**
 * Emission factors and GHG intensity calculations.
 *
 * Constants from research.md:
 *   Ontario grid:  0.04 kgCO2/kWh  (0.00004 MTCO2/kWh)
 *   Natural gas:   2.63 kgCO2/m3
 *   Oil:           2.753 kgCO2/L (typical Canadian factor)
 *   Wood:          considered carbon-neutral for operational purposes (0.0)
 *
 * Pure functions only. No side effects.
 */

import { GAS_KWH_PER_M3, OIL_KWH_PER_L, WOOD_KWH_PER_M3 } from './units';

// ============================================
// Emission factor types
// ============================================

export type EnergySource = 'electricity' | 'gas' | 'oil' | 'wood';

export type Province =
  | 'ON'
  | 'QC'
  | 'BC'
  | 'AB'
  | 'SK'
  | 'MB'
  | 'NS'
  | 'NB'
  | 'PE'
  | 'NL'
  | 'NT'
  | 'NU'
  | 'YT';

// ============================================
// Constants — kgCO2 per native unit
// ============================================

/** kgCO2 per m3 of natural gas */
export const GAS_KGCO2_PER_M3 = 2.63;

/** kgCO2 per litre of heating oil */
export const OIL_KGCO2_PER_L = 2.753;

/** kgCO2 per m3 of cordwood (treated as carbon-neutral) */
export const WOOD_KGCO2_PER_M3 = 0;

// ============================================
// Grid emission factors by province (kgCO2/kWh)
// ============================================

const GRID_FACTORS: Record<Province, number> = {
  ON: 0.04,
  QC: 0.0012, // Hydro-dominant
  BC: 0.011, // Hydro-dominant
  AB: 0.54, // Gas/coal heavy
  SK: 0.65, // Coal heavy
  MB: 0.002, // Hydro-dominant
  NS: 0.69, // Coal heavy
  NB: 0.3,
  PE: 0.3,
  NL: 0.02, // Hydro
  NT: 0.21,
  NU: 0.84,
  YT: 0.08,
};

// ============================================
// Per-kWh emission factors (derived)
// ============================================

/** kgCO2 per kWh of natural gas */
export const GAS_KGCO2_PER_KWH = GAS_KGCO2_PER_M3 / GAS_KWH_PER_M3;

/** kgCO2 per kWh of heating oil */
export const OIL_KGCO2_PER_KWH = OIL_KGCO2_PER_L / OIL_KWH_PER_L;

/** kgCO2 per kWh of wood (0) */
export const WOOD_KGCO2_PER_KWH = WOOD_KGCO2_PER_M3 / WOOD_KWH_PER_M3;

// ============================================
// Functions
// ============================================

/**
 * Get the grid emission factor for a province in kgCO2/kWh.
 * Defaults to Ontario if province not found.
 */
export function getGridFactor(province: Province): number {
  return GRID_FACTORS[province] ?? GRID_FACTORS.ON;
}

/**
 * Get the emission factor for a given energy source.
 * For electricity, returns the grid factor for the specified province.
 * For fuels, returns kgCO2 per kWh equivalent.
 */
export function getEmissionFactor(source: EnergySource, province: Province = 'ON'): number {
  switch (source) {
    case 'electricity':
      return getGridFactor(province);
    case 'gas':
      return GAS_KGCO2_PER_KWH;
    case 'oil':
      return OIL_KGCO2_PER_KWH;
    case 'wood':
      return WOOD_KGCO2_PER_KWH;
  }
}

/**
 * Energy breakdown by source, all in kWh.
 */
export interface EnergyBreakdown {
  electricityKwh: number;
  gasKwh: number;
  oilKwh: number;
  woodKwh: number;
}

/**
 * Calculate GHG Intensity (kgCO2e/m2/yr) from an energy breakdown.
 *
 * GHGI = sum( sourceKwh * emissionFactor ) / area
 */
export function calculateGHGI(
  breakdown: EnergyBreakdown,
  areaM2: number,
  province: Province = 'ON',
): number {
  if (areaM2 <= 0) return 0;

  const totalKgCO2 =
    breakdown.electricityKwh * getEmissionFactor('electricity', province) +
    breakdown.gasKwh * getEmissionFactor('gas', province) +
    breakdown.oilKwh * getEmissionFactor('oil', province) +
    breakdown.woodKwh * getEmissionFactor('wood', province);

  return totalKgCO2 / areaM2;
}

/**
 * Calculate total GHG emissions in kgCO2e from native fuel units.
 */
export function calculateTotalEmissions(
  sources: {
    electricityKwh: number;
    gasM3: number;
    oilL: number;
    woodM3: number;
  },
  province: Province = 'ON',
): number {
  return (
    sources.electricityKwh * getGridFactor(province) +
    sources.gasM3 * GAS_KGCO2_PER_M3 +
    sources.oilL * OIL_KGCO2_PER_L +
    sources.woodM3 * WOOD_KGCO2_PER_M3
  );
}
