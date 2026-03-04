/**
 * Unit tests for src/engine/shared/carbon.ts
 */

import { describe, it, expect } from 'vitest';
import {
  GAS_KGCO2_PER_M3,
  OIL_KGCO2_PER_L,
  GAS_KGCO2_PER_KWH,
  OIL_KGCO2_PER_KWH,
  WOOD_KGCO2_PER_KWH,
  getGridFactor,
  getEmissionFactor,
  calculateGHGI,
  calculateTotalEmissions,
  type EnergyBreakdown,
} from '@/engine/shared/carbon';
import { GAS_KWH_PER_M3 } from '@/engine/shared/units';

describe('carbon — constants', () => {
  it('gas emission factor is 2.63 kgCO2/m3', () => {
    expect(GAS_KGCO2_PER_M3).toBe(2.63);
  });

  it('gas per-kWh factor is derived correctly', () => {
    // 2.63 kgCO2/m3 / 10.3321 kWh/m3
    expect(GAS_KGCO2_PER_KWH).toBeCloseTo(2.63 / GAS_KWH_PER_M3, 6);
  });

  it('wood is carbon-neutral (0 kgCO2/kWh)', () => {
    expect(WOOD_KGCO2_PER_KWH).toBe(0);
  });
});

describe('carbon — getGridFactor', () => {
  it('Ontario grid is 0.04 kgCO2/kWh', () => {
    expect(getGridFactor('ON')).toBe(0.04);
  });

  it('Quebec grid is very low (hydro)', () => {
    expect(getGridFactor('QC')).toBeLessThan(0.01);
  });

  it('Alberta grid is high (fossil heavy)', () => {
    expect(getGridFactor('AB')).toBeGreaterThan(0.4);
  });
});

describe('carbon — getEmissionFactor', () => {
  it('electricity in Ontario returns 0.04', () => {
    expect(getEmissionFactor('electricity', 'ON')).toBe(0.04);
  });

  it('electricity in Alberta returns higher factor', () => {
    expect(getEmissionFactor('electricity', 'AB')).toBe(0.54);
  });

  it('gas returns per-kWh factor regardless of province', () => {
    expect(getEmissionFactor('gas', 'ON')).toBe(GAS_KGCO2_PER_KWH);
    expect(getEmissionFactor('gas', 'AB')).toBe(GAS_KGCO2_PER_KWH);
  });

  it('oil returns per-kWh factor', () => {
    expect(getEmissionFactor('oil')).toBe(OIL_KGCO2_PER_KWH);
  });

  it('wood returns 0', () => {
    expect(getEmissionFactor('wood')).toBe(0);
  });
});

describe('carbon — calculateGHGI', () => {
  it('returns 0 for zero area', () => {
    const breakdown: EnergyBreakdown = {
      electricityKwh: 10000,
      gasKwh: 5000,
      oilKwh: 0,
      woodKwh: 0,
    };
    expect(calculateGHGI(breakdown, 0)).toBe(0);
  });

  it('calculates GHGI for electricity-only building', () => {
    const breakdown: EnergyBreakdown = {
      electricityKwh: 10000,
      gasKwh: 0,
      oilKwh: 0,
      woodKwh: 0,
    };
    // 10000 * 0.04 / 1000 = 0.4 kgCO2/m2
    expect(calculateGHGI(breakdown, 1000, 'ON')).toBeCloseTo(0.4, 4);
  });

  it('calculates GHGI for mixed sources', () => {
    const breakdown: EnergyBreakdown = {
      electricityKwh: 20000,
      gasKwh: 10000,
      oilKwh: 5000,
      woodKwh: 2000,
    };
    const area = 1000;
    const expected =
      (20000 * 0.04 + 10000 * GAS_KGCO2_PER_KWH + 5000 * OIL_KGCO2_PER_KWH + 2000 * 0) / area;
    expect(calculateGHGI(breakdown, area, 'ON')).toBeCloseTo(expected, 4);
  });

  it('different provinces yield different GHGI', () => {
    const breakdown: EnergyBreakdown = {
      electricityKwh: 50000,
      gasKwh: 0,
      oilKwh: 0,
      woodKwh: 0,
    };
    const ghgiON = calculateGHGI(breakdown, 1000, 'ON');
    const ghgiAB = calculateGHGI(breakdown, 1000, 'AB');
    expect(ghgiAB).toBeGreaterThan(ghgiON);
  });
});

describe('carbon — calculateTotalEmissions', () => {
  it('calculates total emissions from native units', () => {
    const sources = {
      electricityKwh: 20000,
      gasM3: 1000,
      oilL: 500,
      woodM3: 2,
    };
    const expected = 20000 * 0.04 + 1000 * GAS_KGCO2_PER_M3 + 500 * OIL_KGCO2_PER_L + 2 * 0;
    expect(calculateTotalEmissions(sources, 'ON')).toBeCloseTo(expected, 2);
  });

  it('returns 0 for all-zero sources', () => {
    const sources = {
      electricityKwh: 0,
      gasM3: 0,
      oilL: 0,
      woodM3: 0,
    };
    expect(calculateTotalEmissions(sources)).toBe(0);
  });
});
