/**
 * Unit tests for src/engine/teui3.ts
 */

import { describe, it, expect } from 'vitest';
import { calculateTEUI3 } from '@/engine/teui3';
import {
  createFullOfficeBuilding,
  createWithActuals,
  createZeroArea,
  createSimpleResidential,
} from './fixtures/buildings';

describe('teui3 — calculateTEUI3', () => {
  it('returns all required TEUI3 fields', () => {
    const building = createFullOfficeBuilding();
    const result = calculateTEUI3(building);

    expect(result).toHaveProperty('teui');
    expect(result).toHaveProperty('tedi');
    expect(result).toHaveProperty('ghgi');
    expect(result).toHaveProperty('totalEnergyKwh');
    expect(result).toHaveProperty('breakdown');
    expect(result).toHaveProperty('energyBalance');
    expect(result).toHaveProperty('referenceModel');
    expect(result).toHaveProperty('designModel');
    expect(result).toHaveProperty('actualModel');
  });

  it('design model has positive envelope losses', () => {
    const building = createFullOfficeBuilding();
    const result = calculateTEUI3(building);
    expect(result.designModel.envelopeLossKwh).toBeGreaterThan(0);
  });

  it('design model has positive ventilation losses', () => {
    const building = createFullOfficeBuilding();
    const result = calculateTEUI3(building);
    expect(result.designModel.ventilationLossKwh).toBeGreaterThan(0);
  });

  it('HRV reduces ventilation losses', () => {
    const withHRV = createFullOfficeBuilding();
    withHRV.ventilation.hrvEfficiency = 0.75;

    const withoutHRV = createFullOfficeBuilding();
    withoutHRV.ventilation.hrvEfficiency = 0;

    const resultWith = calculateTEUI3(withHRV);
    const resultWithout = calculateTEUI3(withoutHRV);

    expect(resultWith.designModel.ventilationLossKwh).toBeLessThan(
      resultWithout.designModel.ventilationLossKwh,
    );
  });

  it('design model has positive internal gains', () => {
    const building = createFullOfficeBuilding();
    const result = calculateTEUI3(building);
    expect(result.designModel.internalGainsKwh).toBeGreaterThan(0);
  });

  it('design model has positive solar gains', () => {
    const building = createFullOfficeBuilding();
    const result = calculateTEUI3(building);
    expect(result.designModel.solarGainsKwh).toBeGreaterThan(0);
  });

  it('net heating demand is losses minus gains (clamped >= 0)', () => {
    const building = createFullOfficeBuilding();
    const result = calculateTEUI3(building);
    const model = result.designModel;

    const totalLosses =
      model.envelopeLossKwh + model.ventilationLossKwh + model.infiltrationLossKwh;
    const totalGains = model.internalGainsKwh + model.solarGainsKwh;
    const expectedHeatingDemand = Math.max(0, totalLosses - totalGains);

    expect(model.netHeatingDemandKwh).toBeCloseTo(expectedHeatingDemand, 1);
  });

  it('heating energy is net demand / COP', () => {
    const building = createFullOfficeBuilding();
    const result = calculateTEUI3(building);
    const model = result.designModel;

    const expectedHeatingEnergy = model.netHeatingDemandKwh / building.systems.heating.cop;
    expect(model.heatingEnergyKwh).toBeCloseTo(expectedHeatingEnergy, 1);
  });

  it('TEUI = totalEnergy / area', () => {
    const building = createFullOfficeBuilding();
    const result = calculateTEUI3(building);
    const model = result.designModel;

    expect(model.teui).toBeCloseTo(model.totalEnergyKwh / building.geometry.conditionedAreaM2, 2);
  });

  it('TEDI includes heating + DHW', () => {
    const building = createFullOfficeBuilding();
    const result = calculateTEUI3(building);
    const model = result.designModel;

    const expectedTedi =
      (model.heatingEnergyKwh + model.dhwEnergyKwh) / building.geometry.conditionedAreaM2;
    expect(model.tedi).toBeCloseTo(expectedTedi, 2);
  });

  it('reference model uses code-minimum values', () => {
    const building = createFullOfficeBuilding();
    const result = calculateTEUI3(building);

    // Reference model should have different values from design
    // because it uses default U-values and no HRV
    expect(result.referenceModel.label).toBe('Reference');
    expect(result.referenceModel.totalEnergyKwh).toBeGreaterThan(0);
  });

  it('better envelope reduces design TEUI below reference', () => {
    const building = createFullOfficeBuilding();
    // Building already has better-than-reference U-values (0.2 vs 0.278)
    // and HRV (0.75 vs 0)
    const result = calculateTEUI3(building);

    // Design should be better (lower TEUI) than reference
    expect(result.designModel.teui).toBeLessThan(result.referenceModel.teui);
  });

  it('actual model is null when no actuals provided', () => {
    const building = createFullOfficeBuilding();
    const result = calculateTEUI3(building);
    expect(result.actualModel).toBeNull();
  });

  it('actual model is present when actuals provided', () => {
    const building = createWithActuals();
    const result = calculateTEUI3(building);

    expect(result.actualModel).not.toBeNull();
    expect(result.actualModel!.label).toBe('Actual');
    expect(result.actualModel!.totalEnergyKwh).toBeGreaterThan(0);
    expect(result.actualModel!.teui).toBeGreaterThan(0);
  });

  it('total energy components sum to totalEnergyKwh', () => {
    const building = createFullOfficeBuilding();
    const result = calculateTEUI3(building);
    const model = result.designModel;

    const componentSum =
      model.heatingEnergyKwh +
      model.coolingEnergyKwh +
      model.dhwEnergyKwh +
      model.lightingEnergyKwh +
      model.equipmentEnergyKwh +
      model.fanEnergyKwh;

    expect(model.totalEnergyKwh).toBeCloseTo(componentSum, 1);
  });

  it('higher HDD increases envelope losses', () => {
    const cold = createFullOfficeBuilding();
    cold.climate.hddC = 6000;

    const mild = createFullOfficeBuilding();
    mild.climate.hddC = 2000;

    const resultCold = calculateTEUI3(cold);
    const resultMild = calculateTEUI3(mild);

    expect(resultCold.designModel.envelopeLossKwh).toBeGreaterThan(
      resultMild.designModel.envelopeLossKwh,
    );
  });

  it('handles zero area gracefully', () => {
    const building = createZeroArea();
    // Need walls for TEUI3
    building.climate.hddC = 3520;
    building.geometry.volumeM3 = 100;
    building.envelope.walls = [{ areaM2: 50, uValue: 0.3, orientation: 'N' }];

    const result = calculateTEUI3(building);
    expect(result.teui).toBe(0);
    expect(result.tedi).toBe(0);
  });

  it('handles building with no walls', () => {
    const building = createSimpleResidential();
    building.climate.hddC = 3520;
    building.geometry.volumeM3 = 3000;
    // No walls, no windows
    const result = calculateTEUI3(building);
    // Should still compute (just no envelope loss from walls)
    expect(result).toHaveProperty('teui');
  });
});
