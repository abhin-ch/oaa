/**
 * Code benchmark values for Canadian building energy standards.
 *
 * Provides reference TEUI, TEDI, and GHGI values by building type
 * and compliance standard (NECB, SB-10, SB-12).
 *
 * Pure functions only. No side effects.
 */

import type { OccupancyType } from '@/schema/building';

// ============================================
// Types
// ============================================

export type ComplianceStandard = 'NECB' | 'SB-10' | 'SB-12' | 'PassiveHouse';

export interface BenchmarkValues {
  /** TEUI target in kWh/m2/yr */
  teui: number;
  /** TEDI target in kWh/m2/yr */
  tedi: number;
  /** GHGI target in kgCO2e/m2/yr */
  ghgi: number;
}

export interface BenchmarkComparison {
  /** Calculated value as a percentage of the code benchmark (100 = exactly at code) */
  percentOfCode: number;
  /** Performance rating based on percentage of code */
  rating: 'excellent' | 'good' | 'fair' | 'poor';
}

// ============================================
// Benchmark data
// ============================================

/**
 * Benchmark values by standard and occupancy type.
 * Values are representative targets in kWh/m2/yr.
 * Sources: NECB 2020, OBC SB-10/SB-12 tiers, Passive House standard.
 */
const BENCHMARKS: Record<ComplianceStandard, Partial<Record<OccupancyType, BenchmarkValues>>> = {
  NECB: {
    residential: { teui: 170, tedi: 70, ghgi: 25 },
    office: { teui: 200, tedi: 55, ghgi: 28 },
    retail: { teui: 220, tedi: 60, ghgi: 30 },
    assembly: { teui: 250, tedi: 65, ghgi: 35 },
    institutional: { teui: 270, tedi: 75, ghgi: 38 },
    industrial: { teui: 300, tedi: 50, ghgi: 40 },
    mixed: { teui: 220, tedi: 60, ghgi: 30 },
  },
  'SB-10': {
    residential: { teui: 150, tedi: 50, ghgi: 20 },
    office: { teui: 180, tedi: 45, ghgi: 22 },
    retail: { teui: 200, tedi: 50, ghgi: 25 },
    assembly: { teui: 230, tedi: 55, ghgi: 30 },
    institutional: { teui: 240, tedi: 60, ghgi: 32 },
    industrial: { teui: 280, tedi: 45, ghgi: 35 },
    mixed: { teui: 200, tedi: 50, ghgi: 25 },
  },
  'SB-12': {
    residential: { teui: 130, tedi: 40, ghgi: 15 },
    office: { teui: 160, tedi: 35, ghgi: 18 },
    retail: { teui: 180, tedi: 40, ghgi: 22 },
    assembly: { teui: 210, tedi: 50, ghgi: 28 },
    institutional: { teui: 220, tedi: 55, ghgi: 30 },
    industrial: { teui: 260, tedi: 40, ghgi: 32 },
    mixed: { teui: 180, tedi: 40, ghgi: 22 },
  },
  PassiveHouse: {
    residential: { teui: 60, tedi: 15, ghgi: 5 },
    office: { teui: 85, tedi: 15, ghgi: 8 },
    retail: { teui: 90, tedi: 15, ghgi: 9 },
    assembly: { teui: 100, tedi: 15, ghgi: 10 },
    institutional: { teui: 100, tedi: 15, ghgi: 10 },
    industrial: { teui: 120, tedi: 15, ghgi: 12 },
    mixed: { teui: 85, tedi: 15, ghgi: 8 },
  },
};

/** National average TEUI values by occupancy type (kWh/m2/yr) */
const NATIONAL_AVERAGES: Record<OccupancyType, number> = {
  residential: 200,
  office: 250,
  retail: 280,
  assembly: 300,
  institutional: 330,
  industrial: 350,
  mixed: 270,
};

// ============================================
// Functions
// ============================================

/**
 * Get benchmark values for a given standard and building type.
 * Returns null if no benchmark exists for the combination.
 */
export function getBenchmark(
  standard: ComplianceStandard,
  buildingType: OccupancyType,
): BenchmarkValues | null {
  return BENCHMARKS[standard]?.[buildingType] ?? null;
}

/**
 * Get the national average TEUI for a building type.
 */
export function getNationalAverage(buildingType: OccupancyType): number {
  return NATIONAL_AVERAGES[buildingType] ?? NATIONAL_AVERAGES.mixed;
}

/**
 * Compare a calculated result against a benchmark.
 * Returns the percentage of code and a qualitative rating.
 */
export function compareToBaseline(
  result: { teui: number },
  benchmark: BenchmarkValues,
): BenchmarkComparison {
  if (benchmark.teui <= 0) {
    return { percentOfCode: 0, rating: 'poor' };
  }

  const percentOfCode = (result.teui / benchmark.teui) * 100;

  let rating: BenchmarkComparison['rating'];
  if (percentOfCode <= 50) {
    rating = 'excellent';
  } else if (percentOfCode <= 75) {
    rating = 'good';
  } else if (percentOfCode <= 100) {
    rating = 'fair';
  } else {
    rating = 'poor';
  }

  return { percentOfCode, rating };
}

/**
 * Compare a TEUI result against the national average for its building type.
 * Returns percentage of national average.
 */
export function compareToNationalAverage(
  teui: number,
  buildingType: OccupancyType,
): { percentOfAverage: number } {
  const avg = getNationalAverage(buildingType);
  return { percentOfAverage: avg > 0 ? (teui / avg) * 100 : 0 };
}

/**
 * Get all available standards.
 */
export function getAvailableStandards(): ComplianceStandard[] {
  return Object.keys(BENCHMARKS) as ComplianceStandard[];
}
