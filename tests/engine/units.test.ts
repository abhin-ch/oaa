/**
 * Unit tests for src/engine/shared/units.ts
 */

import { describe, it, expect } from 'vitest';
import {
  gasM3ToKwh,
  oilLToKwh,
  woodM3ToKwh,
  gjToKwh,
  kwhToGasM3,
  kwhToOilL,
  kwhToWoodM3,
  kwhToGj,
  totalEnergyKwh,
  GAS_KWH_PER_M3,
  OIL_KWH_PER_L,
  WOOD_KWH_PER_M3,
  KWH_PER_GJ,
  GAS_GJ_PER_M3,
  OIL_GJ_PER_L,
} from '@/engine/shared/units';

describe('units — constants', () => {
  it('should have correct gas conversion constant', () => {
    // 1 m3 = 0.0373 GJ * 277 kWh/GJ = 10.3321 kWh
    expect(GAS_KWH_PER_M3).toBeCloseTo(10.3321, 3);
  });

  it('should have correct oil conversion constant', () => {
    // 1 L = 0.0383 GJ * 277 kWh/GJ = 10.6091 kWh
    expect(OIL_KWH_PER_L).toBeCloseTo(10.6091, 3);
  });

  it('should have correct wood conversion constant', () => {
    expect(WOOD_KWH_PER_M3).toBe(1000);
  });

  it('should have correct GJ conversion constant', () => {
    expect(KWH_PER_GJ).toBe(277);
  });
});

describe('units — forward conversions', () => {
  it('gasM3ToKwh: 1 m3 -> 10.3321 kWh', () => {
    expect(gasM3ToKwh(1)).toBeCloseTo(10.3321, 3);
  });

  it('gasM3ToKwh: 10000 m3 -> 103321 kWh', () => {
    expect(gasM3ToKwh(10000)).toBeCloseTo(103321, 0);
  });

  it('gasM3ToKwh: 0 -> 0', () => {
    expect(gasM3ToKwh(0)).toBe(0);
  });

  it('oilLToKwh: 1 L -> 10.6091 kWh', () => {
    expect(oilLToKwh(1)).toBeCloseTo(10.6091, 3);
  });

  it('oilLToKwh: 500 L -> 5304.55 kWh', () => {
    expect(oilLToKwh(500)).toBeCloseTo(5304.55, 1);
  });

  it('woodM3ToKwh: 1 m3 -> 1000 kWh', () => {
    expect(woodM3ToKwh(1)).toBe(1000);
  });

  it('woodM3ToKwh: 5 m3 -> 5000 kWh', () => {
    expect(woodM3ToKwh(5)).toBe(5000);
  });

  it('gjToKwh: 1 GJ -> 277 kWh', () => {
    expect(gjToKwh(1)).toBe(277);
  });

  it('gjToKwh: 0.0373 GJ -> 10.3321 kWh (matches gas)', () => {
    expect(gjToKwh(GAS_GJ_PER_M3)).toBeCloseTo(GAS_KWH_PER_M3, 4);
  });
});

describe('units — inverse conversions', () => {
  it('kwhToGasM3: round-trip 100 m3', () => {
    const kwh = gasM3ToKwh(100);
    expect(kwhToGasM3(kwh)).toBeCloseTo(100, 6);
  });

  it('kwhToOilL: round-trip 200 L', () => {
    const kwh = oilLToKwh(200);
    expect(kwhToOilL(kwh)).toBeCloseTo(200, 6);
  });

  it('kwhToWoodM3: round-trip 3 m3', () => {
    const kwh = woodM3ToKwh(3);
    expect(kwhToWoodM3(kwh)).toBeCloseTo(3, 6);
  });

  it('kwhToGj: round-trip 5 GJ', () => {
    const kwh = gjToKwh(5);
    expect(kwhToGj(kwh)).toBeCloseTo(5, 6);
  });
});

describe('units — totalEnergyKwh', () => {
  it('sums all sources correctly', () => {
    const sources = {
      electricityKwh: 20000,
      gasM3: 1000,
      oilL: 500,
      woodM3: 2,
    };
    const expected = 20000 + gasM3ToKwh(1000) + oilLToKwh(500) + woodM3ToKwh(2);
    expect(totalEnergyKwh(sources)).toBeCloseTo(expected, 2);
  });

  it('returns just electricity when other sources are zero', () => {
    const sources = {
      electricityKwh: 15000,
      gasM3: 0,
      oilL: 0,
      woodM3: 0,
    };
    expect(totalEnergyKwh(sources)).toBe(15000);
  });

  it('returns 0 when all sources are zero', () => {
    const sources = {
      electricityKwh: 0,
      gasM3: 0,
      oilL: 0,
      woodM3: 0,
    };
    expect(totalEnergyKwh(sources)).toBe(0);
  });
});
