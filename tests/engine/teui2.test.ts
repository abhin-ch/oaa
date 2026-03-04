/**
 * Unit tests for src/engine/teui2.ts
 */

import { describe, it, expect } from 'vitest';
import { calculateTEUI2 } from '@/engine/teui2';
import { gasM3ToKwh } from '@/engine/shared/units';
import {
  createSimpleResidential,
  createWithRenewables,
  createZeroArea,
  createNoEnergy,
} from './fixtures/buildings';

describe('teui2 — calculateTEUI2', () => {
  it('gross TEUI matches TEUI1 for building without renewables', () => {
    const building = createSimpleResidential();
    const result = calculateTEUI2(building);

    const expectedTotal = 20000 + gasM3ToKwh(2000);
    expect(result.teui).toBeCloseTo(expectedTotal / 1000, 2);
    // No renewables, so net = gross
    expect(result.netTeui).toBeCloseTo(result.teui, 2);
  });

  it('net TEUI is less than gross when renewables are present', () => {
    const building = createWithRenewables();
    const result = calculateTEUI2(building);
    expect(result.netTeui).toBeLessThan(result.teui);
  });

  it('totalRenewablesKwh sums all renewable sources', () => {
    const building = createWithRenewables();
    const result = calculateTEUI2(building);
    // 5000 PV + 1000 wind + 500 other = 6500
    expect(result.totalRenewablesKwh).toBe(6500);
  });

  it('net TEUI accounts for offsets', () => {
    const building = createWithRenewables();
    const result = calculateTEUI2(building);

    const totalEnergy = 20000 + gasM3ToKwh(2000);
    const renewables = 5000 + 1000 + 500; // 6500
    const offsets = 2000 + gasM3ToKwh(100); // RECs + green gas
    const expectedNet = Math.max(0, totalEnergy - renewables - offsets);

    expect(result.netTeui).toBeCloseTo(expectedNet / 1000, 1);
  });

  it('net TEUI never goes below zero', () => {
    const building = createSimpleResidential();
    // Set renewables higher than total energy
    building.renewables.pvAnnualKwh = 999999;
    const result = calculateTEUI2(building);
    expect(result.netTeui).toBeGreaterThanOrEqual(0);
  });

  it('simplified TEDI is based on heating fuels', () => {
    const building = createSimpleResidential();
    const result = calculateTEUI2(building);

    // TEDI ~ gas kWh / area (only gas is used for heating)
    const expectedTedi = gasM3ToKwh(2000) / 1000;
    expect(result.tediSimplified).toBeCloseTo(expectedTedi, 2);
  });

  it('TEUI per occupant is computed when occupancy > 0', () => {
    const building = createWithRenewables();
    const result = calculateTEUI2(building);
    expect(result.teuiPerOccupant).not.toBeNull();
    expect(result.teuiPerOccupant!).toBeGreaterThan(0);
  });

  it('TEUI per occupant is null when occupancy is 0', () => {
    const building = createSimpleResidential();
    building.occupancy.count = 0;
    const result = calculateTEUI2(building);
    expect(result.teuiPerOccupant).toBeNull();
  });

  it('benchmark comparison is returned for known standard/type', () => {
    const building = createSimpleResidential();
    const result = calculateTEUI2(building, 'NECB');
    expect(result.benchmarkComparison).not.toBeNull();
    expect(result.benchmarkUsed).not.toBeNull();
    expect(result.benchmarkComparison!.percentOfCode).toBeGreaterThan(0);
  });

  it('percent of national average is computed', () => {
    const building = createSimpleResidential();
    const result = calculateTEUI2(building);
    expect(result.percentOfNationalAverage).toBeGreaterThan(0);
  });

  it('embodied carbon is reported when provided', () => {
    const building = createWithRenewables();
    const result = calculateTEUI2(building);
    expect(result.embodiedCarbonPerM2).toBe(50);
  });

  it('embodied carbon is null when not provided', () => {
    const building = createSimpleResidential();
    const result = calculateTEUI2(building);
    expect(result.embodiedCarbonPerM2).toBeNull();
  });

  it('returns zero TEUI for zero area', () => {
    const building = createZeroArea();
    const result = calculateTEUI2(building);
    expect(result.teui).toBe(0);
    expect(result.netTeui).toBe(0);
  });

  it('GHGI accounts for carbon credits', () => {
    const buildingWithCredits = createWithRenewables();
    const buildingWithout = createWithRenewables();
    buildingWithout.offsets.carbonCreditsKgCO2 = 0;

    const resultWith = calculateTEUI2(buildingWithCredits);
    const resultWithout = calculateTEUI2(buildingWithout);

    // Credits reduce GHGI
    expect(resultWith.ghgi).toBeLessThanOrEqual(resultWithout.ghgi);
  });
});
