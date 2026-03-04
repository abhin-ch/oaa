/**
 * Unit tests for src/engine/teui1.ts
 */

import { describe, it, expect } from 'vitest';
import { calculateTEUI1 } from '@/engine/teui1';
import { gasM3ToKwh, oilLToKwh, woodM3ToKwh } from '@/engine/shared/units';
import {
  createSimpleResidential,
  createMultiFuel,
  createZeroArea,
  createNoEnergy,
} from './fixtures/buildings';

describe('teui1 — calculateTEUI1', () => {
  it('calculates TEUI for simple residential (electricity + gas)', () => {
    const building = createSimpleResidential();
    const result = calculateTEUI1(building);

    // 20000 kWh + 2000 m3 * 10.3321 = 20000 + 20664.2 = 40664.2 kWh
    const expectedTotal = 20000 + gasM3ToKwh(2000);
    expect(result.totalEnergyKwh).toBeCloseTo(expectedTotal, 1);

    // TEUI = 40664.2 / 1000 = 40.664
    expect(result.teui).toBeCloseTo(expectedTotal / 1000, 2);
  });

  it('calculates TEUI for multi-fuel building', () => {
    const building = createMultiFuel();
    const result = calculateTEUI1(building);

    const expectedTotal = 10000 + gasM3ToKwh(1000) + oilLToKwh(500) + woodM3ToKwh(2);
    expect(result.totalEnergyKwh).toBeCloseTo(expectedTotal, 1);
    expect(result.teui).toBeCloseTo(expectedTotal / 500, 2);
  });

  it('breakdown contains correct per-source kWh', () => {
    const building = createMultiFuel();
    const result = calculateTEUI1(building);

    expect(result.breakdown.electricityKwh).toBe(10000);
    expect(result.breakdown.gasKwh).toBeCloseTo(gasM3ToKwh(1000), 2);
    expect(result.breakdown.oilKwh).toBeCloseTo(oilLToKwh(500), 2);
    expect(result.breakdown.woodKwh).toBe(woodM3ToKwh(2));
  });

  it('GHGI is positive for a building with gas', () => {
    const building = createSimpleResidential();
    const result = calculateTEUI1(building);
    expect(result.ghgi).toBeGreaterThan(0);
  });

  it('returns zero TEUI for zero area', () => {
    const building = createZeroArea();
    const result = calculateTEUI1(building);
    expect(result.teui).toBe(0);
    expect(result.ghgi).toBe(0);
    // Total energy should still be calculated
    expect(result.totalEnergyKwh).toBe(10000);
  });

  it('returns zero for building with no energy', () => {
    const building = createNoEnergy();
    const result = calculateTEUI1(building);
    expect(result.teui).toBe(0);
    expect(result.totalEnergyKwh).toBe(0);
    expect(result.ghgi).toBe(0);
  });

  it('handles electricity-only building', () => {
    const building = createSimpleResidential();
    building.energySources.gasM3 = 0;
    const result = calculateTEUI1(building);
    expect(result.teui).toBe(20); // 20000 / 1000
    expect(result.breakdown.gasKwh).toBe(0);
  });

  it('matches research.md example calculation', () => {
    // research.md example: 20,000 kWh electricity + 10,000 m3 gas, 1000 m2
    // Gas: 10000 * 10.3321 = 103321 kWh
    // Total: 20000 + 103321 = 123321 kWh
    // TEUI = 123321 / 1000 = 123.321
    const building = createSimpleResidential();
    building.energySources.electricityKwh = 20000;
    building.energySources.gasM3 = 10000;
    building.geometry.conditionedAreaM2 = 1000;

    const result = calculateTEUI1(building);
    expect(result.teui).toBeCloseTo(123.321, 0);
  });
});
