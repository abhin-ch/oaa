/**
 * Common result types shared across all TEUI engine versions.
 *
 * All engines return at minimum a TEUIResult. Higher versions extend this.
 */

import type { EnergyBreakdown } from './carbon';
import type { BenchmarkComparison, BenchmarkValues } from './benchmarks';

// ============================================
// Base result (TEUI1+)
// ============================================

export interface TEUIResult {
  /** Total Energy Use Intensity in kWh/m2/yr */
  teui: number;
  /** GHG Intensity in kgCO2e/m2/yr */
  ghgi: number;
  /** Total energy consumption in kWh/yr */
  totalEnergyKwh: number;
  /** Energy breakdown by source, all in kWh */
  breakdown: EnergyBreakdown;
}

// ============================================
// Extended result (TEUI2)
// ============================================

export interface TEUI2Result extends TEUIResult {
  /** Net TEUI after renewable subtraction */
  netTeui: number;
  /** Total renewable generation in kWh/yr */
  totalRenewablesKwh: number;
  /** Simplified TEDI (heating energy per area) */
  tediSimplified: number;
  /** TEUI per occupant (kWh/person/yr) */
  teuiPerOccupant: number | null;
  /** Benchmark comparison if available */
  benchmarkComparison: BenchmarkComparison | null;
  /** Benchmark values used for comparison */
  benchmarkUsed: BenchmarkValues | null;
  /** Percent of national average TEUI */
  percentOfNationalAverage: number;
  /** Embodied carbon in kgCO2e/m2 (if provided) */
  embodiedCarbonPerM2: number | null;
}

// ============================================
// Energy balance model (TEUI3)
// ============================================

export interface EnergyBalanceModel {
  /** Label for this model */
  label: string;
  /** Total transmission losses through envelope (kWh/yr) */
  envelopeLossKwh: number;
  /** Ventilation heat losses (kWh/yr) */
  ventilationLossKwh: number;
  /** Infiltration heat losses (kWh/yr) */
  infiltrationLossKwh: number;
  /** Internal heat gains from occupants, lighting, equipment (kWh/yr) */
  internalGainsKwh: number;
  /** Solar heat gains through windows (kWh/yr) */
  solarGainsKwh: number;
  /** Net heating demand before system efficiency (kWh/yr) */
  netHeatingDemandKwh: number;
  /** Net cooling demand before system efficiency (kWh/yr) */
  netCoolingDemandKwh: number;
  /** Heating energy after COP (kWh/yr) */
  heatingEnergyKwh: number;
  /** Cooling energy after COP (kWh/yr) */
  coolingEnergyKwh: number;
  /** DHW energy (kWh/yr) */
  dhwEnergyKwh: number;
  /** Lighting energy (kWh/yr) */
  lightingEnergyKwh: number;
  /** Equipment/plug load energy (kWh/yr) */
  equipmentEnergyKwh: number;
  /** Fan/circulation energy (kWh/yr) */
  fanEnergyKwh: number;
  /** Total energy (kWh/yr) */
  totalEnergyKwh: number;
  /** TEUI for this model (kWh/m2/yr) */
  teui: number;
  /** TEDI for this model (kWh/m2/yr) */
  tedi: number;
}

export interface TEUI3Result extends TEUIResult {
  /** Thermal Energy Demand Intensity (kWh/m2/yr) */
  tedi: number;
  /** Full energy balance for design model */
  energyBalance: EnergyBalanceModel;
  /** Reference (code minimum) model */
  referenceModel: EnergyBalanceModel;
  /** Design (user values) model */
  designModel: EnergyBalanceModel;
  /** Actual model (from utility bills, if available) */
  actualModel: EnergyBalanceModel | null;
}

// ============================================
// Sankey / scenario types (TEUI4)
// ============================================

export interface SankeyNode {
  id: string;
  label: string;
  value: number;
  unit: string;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export interface ScenarioDiff {
  metricName: string;
  scenarioAValue: number;
  scenarioBValue: number;
  absoluteDiff: number;
  percentDiff: number;
  unit: string;
}

export interface TEUI4Result extends TEUI3Result {
  /** Sankey diagram data for D3 visualization */
  sankeyData: SankeyData;
}
