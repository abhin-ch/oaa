import { describe, it, expect } from 'vitest';
import {
  calculateTEUI1,
  ft2ToM2,
  m2ToFt2,
  GAS_M3_TO_KWH,
  PROPANE_LBS_TO_KWH,
  OIL_L_TO_KWH,
  BIOFUEL_M3_TO_KWH,
} from '@/engine/teui1';
import { createEmptyBuilding } from '@/schema/building';

function makeBuilding(overrides: {
  area?: number;
  electricity?: number;
  gas?: number;
  propane?: number;
  oil?: number;
  biofuel?: number;
  onSite?: number;
  offSiteElec?: number;
  offSiteGas?: number;
}) {
  const b = createEmptyBuilding('test-id');
  b.energySources = {
    conditionedAreaM2: overrides.area,
    electricityKwh: overrides.electricity,
    naturalGasM3: overrides.gas,
    propaneLbs: overrides.propane,
    heatingOilL: overrides.oil,
    biofuelM3: overrides.biofuel,
  };
  b.renewables = {
    onSiteKwh: overrides.onSite,
    offSiteElectricityKwh: overrides.offSiteElec,
    offSiteGasKwh: overrides.offSiteGas,
  };
  return b;
}

describe('calculateTEUI1', () => {
  it('returns zero result when area is 0', () => {
    const result = calculateTEUI1(makeBuilding({ area: 0, electricity: 10000 }));
    expect(result.teui).toBe(0);
    expect(result.totalEnergyKwh).toBe(0);
  });

  it('returns zero result when area is undefined', () => {
    const result = calculateTEUI1(makeBuilding({ electricity: 10000 }));
    expect(result.teui).toBe(0);
  });

  it('calculates TEUI for electricity only', () => {
    const result = calculateTEUI1(makeBuilding({ area: 100, electricity: 10000 }));
    expect(result.teui).toBe(100); // 10000 / 100
    expect(result.totalEnergyKwh).toBe(10000);
    expect(result.netEnergyKwh).toBe(10000);
  });

  it('converts natural gas m3 to kWh', () => {
    const result = calculateTEUI1(makeBuilding({ area: 100, gas: 100 }));
    expect(result.totalEnergyKwh).toBeCloseTo(100 * GAS_M3_TO_KWH);
    expect(result.teui).toBeCloseTo(GAS_M3_TO_KWH); // 1027.64 / 100
  });

  it('converts propane lbs to kWh', () => {
    const result = calculateTEUI1(makeBuilding({ area: 100, propane: 100 }));
    expect(result.totalEnergyKwh).toBeCloseTo(100 * PROPANE_LBS_TO_KWH);
  });

  it('converts heating oil L to kWh', () => {
    const result = calculateTEUI1(makeBuilding({ area: 100, oil: 100 }));
    expect(result.totalEnergyKwh).toBeCloseTo(100 * OIL_L_TO_KWH);
  });

  it('converts biofuel m3 to kWh', () => {
    const result = calculateTEUI1(makeBuilding({ area: 100, biofuel: 1 }));
    expect(result.totalEnergyKwh).toBeCloseTo(BIOFUEL_M3_TO_KWH);
  });

  it('sums multiple energy sources', () => {
    const result = calculateTEUI1(makeBuilding({ area: 100, electricity: 5000, gas: 100 }));
    const expectedTotal = 5000 + 100 * GAS_M3_TO_KWH;
    expect(result.totalEnergyKwh).toBeCloseTo(expectedTotal);
    expect(result.teui).toBeCloseTo(expectedTotal / 100);
  });

  it('subtracts renewables from net energy', () => {
    const result = calculateTEUI1(makeBuilding({ area: 100, electricity: 10000, onSite: 2000 }));
    expect(result.netEnergyKwh).toBe(8000);
    expect(result.teui).toBe(80);
    expect(result.renewablesKwh).toBe(2000);
  });

  it('sums all renewable sources', () => {
    const result = calculateTEUI1(
      makeBuilding({
        area: 100,
        electricity: 10000,
        onSite: 1000,
        offSiteElec: 500,
        offSiteGas: 500,
      }),
    );
    expect(result.renewablesKwh).toBe(2000);
    expect(result.teui).toBe(80);
  });

  it('clamps gradient position to 0-99', () => {
    // Very high TEUI
    const high = calculateTEUI1(makeBuilding({ area: 1, electricity: 100000 }));
    expect(high.gradientPosition).toBeLessThanOrEqual(99);

    // Zero TEUI
    const zero = calculateTEUI1(makeBuilding({ area: 100 }));
    expect(zero.gradientPosition).toBe(0);
  });

  it('produces breakdown with percentages summing to ~100', () => {
    const result = calculateTEUI1(makeBuilding({ area: 100, electricity: 5000, gas: 50 }));
    expect(result.breakdown.length).toBeGreaterThan(0);
    const totalPct = result.breakdown.reduce((s, b) => s + b.percentage, 0);
    expect(totalPct).toBeCloseTo(100, 0);
  });

  it('calculates GHGI values', () => {
    const result = calculateTEUI1(makeBuilding({ area: 100, electricity: 10000, gas: 100 }));
    expect(result.ghgi.kgCo2PerM2).toBeGreaterThan(0);
    expect(result.ghgi.mtCo2Total).toBeGreaterThan(0);
  });

  it('handles missing energySources gracefully', () => {
    const b = createEmptyBuilding('test');
    b.energySources = undefined;
    const result = calculateTEUI1(b);
    expect(result.teui).toBe(0);
  });
});

describe('unit conversion', () => {
  it('converts ft2 to m2 and back', () => {
    const m2 = ft2ToM2(1076.4);
    expect(m2).toBeCloseTo(100, 0);
    expect(m2ToFt2(m2)).toBeCloseTo(1076.4, 0);
  });
});
