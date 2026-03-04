/**
 * TEUI4 — Real-time platform engine.
 *
 * Builds on TEUI3 by adding:
 *   - Sankey diagram data generation for D3 visualization
 *   - Scenario comparison (diff two results)
 *   - All TEUI3 energy balance models
 *
 * Input:  Building (uses all fields)
 * Output: TEUI4Result (TEUI3Result + sankeyData)
 *
 * Pure functions. No side effects.
 */

import type { Building } from '@/schema/building';
import { calculateTEUI3 } from './teui3';
import type {
  TEUI4Result,
  TEUI3Result,
  SankeyData,
  SankeyNode,
  SankeyLink,
  ScenarioDiff,
  EnergyBalanceModel,
} from './shared/types';

// ============================================
// Sankey data generation
// ============================================

/**
 * Generate Sankey diagram data from a TEUI3 energy balance model.
 *
 * The Sankey shows energy flows from sources through uses to losses:
 *   Sources (Heating, Cooling, Lighting, Equipment, DHW, Fans)
 *     -> Uses (Envelope, Ventilation, Infiltration, Internal, Solar)
 *        -> Outputs (Heat Loss, Useful Energy)
 */
export function generateSankeyData(result: TEUI3Result): SankeyData {
  const model = result.designModel;
  const nodes: SankeyNode[] = [];
  const links: SankeyLink[] = [];

  // Source nodes (energy inputs)
  if (model.heatingEnergyKwh > 0) {
    nodes.push({
      id: 'heating_energy',
      label: 'Heating Energy',
      value: model.heatingEnergyKwh,
      unit: 'kWh',
    });
  }
  if (model.coolingEnergyKwh > 0) {
    nodes.push({
      id: 'cooling_energy',
      label: 'Cooling Energy',
      value: model.coolingEnergyKwh,
      unit: 'kWh',
    });
  }
  if (model.lightingEnergyKwh > 0) {
    nodes.push({
      id: 'lighting_energy',
      label: 'Lighting',
      value: model.lightingEnergyKwh,
      unit: 'kWh',
    });
  }
  if (model.equipmentEnergyKwh > 0) {
    nodes.push({
      id: 'equipment_energy',
      label: 'Equipment',
      value: model.equipmentEnergyKwh,
      unit: 'kWh',
    });
  }
  if (model.dhwEnergyKwh > 0) {
    nodes.push({
      id: 'dhw_energy',
      label: 'DHW',
      value: model.dhwEnergyKwh,
      unit: 'kWh',
    });
  }
  if (model.fanEnergyKwh > 0) {
    nodes.push({
      id: 'fan_energy',
      label: 'Fans',
      value: model.fanEnergyKwh,
      unit: 'kWh',
    });
  }

  // Loss/use nodes
  nodes.push({
    id: 'total_energy',
    label: 'Total Energy',
    value: model.totalEnergyKwh,
    unit: 'kWh',
  });

  if (model.envelopeLossKwh > 0) {
    nodes.push({
      id: 'envelope_loss',
      label: 'Envelope Losses',
      value: model.envelopeLossKwh,
      unit: 'kWh',
    });
  }
  if (model.ventilationLossKwh > 0) {
    nodes.push({
      id: 'ventilation_loss',
      label: 'Ventilation Losses',
      value: model.ventilationLossKwh,
      unit: 'kWh',
    });
  }
  if (model.infiltrationLossKwh > 0) {
    nodes.push({
      id: 'infiltration_loss',
      label: 'Infiltration Losses',
      value: model.infiltrationLossKwh,
      unit: 'kWh',
    });
  }

  // Gain nodes
  if (model.internalGainsKwh > 0) {
    nodes.push({
      id: 'internal_gains',
      label: 'Internal Gains',
      value: model.internalGainsKwh,
      unit: 'kWh',
    });
  }
  if (model.solarGainsKwh > 0) {
    nodes.push({
      id: 'solar_gains',
      label: 'Solar Gains',
      value: model.solarGainsKwh,
      unit: 'kWh',
    });
  }

  // Links: energy inputs -> total energy
  if (model.heatingEnergyKwh > 0) {
    links.push({
      source: 'heating_energy',
      target: 'total_energy',
      value: model.heatingEnergyKwh,
    });
  }
  if (model.coolingEnergyKwh > 0) {
    links.push({
      source: 'cooling_energy',
      target: 'total_energy',
      value: model.coolingEnergyKwh,
    });
  }
  if (model.lightingEnergyKwh > 0) {
    links.push({
      source: 'lighting_energy',
      target: 'total_energy',
      value: model.lightingEnergyKwh,
    });
  }
  if (model.equipmentEnergyKwh > 0) {
    links.push({
      source: 'equipment_energy',
      target: 'total_energy',
      value: model.equipmentEnergyKwh,
    });
  }
  if (model.dhwEnergyKwh > 0) {
    links.push({
      source: 'dhw_energy',
      target: 'total_energy',
      value: model.dhwEnergyKwh,
    });
  }
  if (model.fanEnergyKwh > 0) {
    links.push({
      source: 'fan_energy',
      target: 'total_energy',
      value: model.fanEnergyKwh,
    });
  }

  // Links: total energy -> losses
  if (model.envelopeLossKwh > 0) {
    links.push({
      source: 'total_energy',
      target: 'envelope_loss',
      value: model.envelopeLossKwh,
    });
  }
  if (model.ventilationLossKwh > 0) {
    links.push({
      source: 'total_energy',
      target: 'ventilation_loss',
      value: model.ventilationLossKwh,
    });
  }
  if (model.infiltrationLossKwh > 0) {
    links.push({
      source: 'total_energy',
      target: 'infiltration_loss',
      value: model.infiltrationLossKwh,
    });
  }

  return { nodes, links };
}

// ============================================
// Scenario comparison
// ============================================

/**
 * Compare two TEUI3/4 results and return metric diffs.
 */
export function compareScenarios(a: TEUI3Result, b: TEUI3Result): ScenarioDiff[] {
  const metrics: Array<{ name: string; aVal: number; bVal: number; unit: string }> = [
    { name: 'TEUI', aVal: a.teui, bVal: b.teui, unit: 'kWh/m\u00B2/yr' },
    { name: 'TEDI', aVal: a.tedi, bVal: b.tedi, unit: 'kWh/m\u00B2/yr' },
    { name: 'GHGI', aVal: a.ghgi, bVal: b.ghgi, unit: 'kgCO\u2082e/m\u00B2/yr' },
    { name: 'Total Energy', aVal: a.totalEnergyKwh, bVal: b.totalEnergyKwh, unit: 'kWh/yr' },
    {
      name: 'Envelope Loss',
      aVal: a.designModel.envelopeLossKwh,
      bVal: b.designModel.envelopeLossKwh,
      unit: 'kWh/yr',
    },
    {
      name: 'Ventilation Loss',
      aVal: a.designModel.ventilationLossKwh,
      bVal: b.designModel.ventilationLossKwh,
      unit: 'kWh/yr',
    },
    {
      name: 'Heating Energy',
      aVal: a.designModel.heatingEnergyKwh,
      bVal: b.designModel.heatingEnergyKwh,
      unit: 'kWh/yr',
    },
    {
      name: 'Cooling Energy',
      aVal: a.designModel.coolingEnergyKwh,
      bVal: b.designModel.coolingEnergyKwh,
      unit: 'kWh/yr',
    },
  ];

  return metrics.map(({ name, aVal, bVal, unit }) => {
    const absoluteDiff = bVal - aVal;
    const percentDiff = aVal !== 0 ? ((bVal - aVal) / Math.abs(aVal)) * 100 : 0;
    return {
      metricName: name,
      scenarioAValue: aVal,
      scenarioBValue: bVal,
      absoluteDiff,
      percentDiff,
      unit,
    };
  });
}

// ============================================
// Main export
// ============================================

/**
 * Calculate TEUI4 — full energy balance with Sankey data and scenario support.
 *
 * @param building - Complete building data
 * @returns TEUI4Result with all TEUI3 fields plus Sankey data
 */
export function calculateTEUI4(building: Building): TEUI4Result {
  const teui3Result = calculateTEUI3(building);
  const sankeyData = generateSankeyData(teui3Result);

  return {
    ...teui3Result,
    sankeyData,
  };
}
