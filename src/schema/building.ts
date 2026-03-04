/**
 * Unified Building Schema — the single source of truth for all TEUI versions.
 *
 * TEUI1 uses: energySources + geometry.conditionedAreaM2
 * TEUI2 uses: above + occupancy + renewables + offsets + climate
 * TEUI3 uses: everything except some optional fields
 * TEUI4 uses: everything, plus actuals for calibration
 */

export const SCHEMA_VERSION = 1;

// ============================================
// Sub-types
// ============================================

export interface BuildingMeta {
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface ClimateData {
  zone: string;
  hddC: number; // Heating degree days (°C·days)
  cddC: number; // Cooling degree days (°C·days)
  designHeatTempC: number; // Design heating temperature (°C)
  designCoolTempC: number; // Design cooling temperature (°C)
}

export interface Geometry {
  floors: number;
  conditionedAreaM2: number;
  volumeM3: number;
  orientation: number; // Degrees from north (0-360)
}

export type OccupancyType =
  | 'residential'
  | 'office'
  | 'retail'
  | 'assembly'
  | 'institutional'
  | 'industrial'
  | 'mixed';

export interface Occupancy {
  type: OccupancyType;
  count: number;
  scheduleHoursPerDay: number;
}

export type CardinalDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export interface EnvelopeWall {
  areaM2: number;
  uValue: number; // W/(m²·K)
  orientation: CardinalDirection;
}

export interface EnvelopeRoof {
  areaM2: number;
  uValue: number;
}

export interface EnvelopeWindow {
  areaM2: number;
  uValue: number;
  shgc: number; // Solar heat gain coefficient (0-1)
  orientation: CardinalDirection;
}

export interface EnvelopeDoor {
  areaM2: number;
  uValue: number;
}

export interface Envelope {
  walls: EnvelopeWall[];
  roof: EnvelopeRoof;
  windows: EnvelopeWindow[];
  doors: EnvelopeDoor[];
  airtightnessACH: number; // Air changes per hour at 50 Pa
}

export interface InternalLoads {
  lightingWPerM2: number;
  equipmentWPerM2: number;
  scheduleHoursPerDay: number;
}

export type VentilationType = 'natural' | 'mechanical' | 'hrv' | 'erv';

export interface Ventilation {
  rateACH: number;
  type: VentilationType;
  hrvEfficiency: number; // 0-1, heat recovery efficiency
}

export type HeatingType = 'gas_furnace' | 'electric_baseboard' | 'heat_pump' | 'boiler' | 'other';
export type CoolingType = 'central_ac' | 'heat_pump' | 'none' | 'other';
export type DHWType = 'gas_tank' | 'electric_tank' | 'heat_pump' | 'tankless' | 'other';

export interface HeatingSystem {
  type: HeatingType;
  cop: number; // Coefficient of performance (or AFUE as decimal)
}

export interface CoolingSystem {
  type: CoolingType;
  cop: number;
}

export interface DHWSystem {
  type: DHWType;
  efficiency: number; // 0-1
}

export interface Systems {
  heating: HeatingSystem;
  cooling: CoolingSystem;
  dhw: DHWSystem;
}

export interface Renewables {
  pvKw: number; // Installed PV capacity
  pvAnnualKwh: number; // Expected annual PV generation
  windKw: number;
  windAnnualKwh: number;
  otherAnnualKwh: number;
}

export interface EnergySources {
  electricityKwh: number;
  gasM3: number;
  oilL: number;
  woodM3: number;
}

export interface Offsets {
  recsKwh: number; // Renewable energy certificates
  greenGasM3: number;
  carbonCreditsKgCO2: number;
}

export interface MonthlyActual {
  month: number; // 1-12
  electricityKwh: number;
  gasM3: number;
}

export interface EmbodiedCarbon {
  totalKgCO2e: number; // Total embodied carbon
  perM2KgCO2e: number; // Per area
}

// ============================================
// Main Building interface
// ============================================

export interface Building {
  id: string;
  schemaVersion: number;
  meta: BuildingMeta;
  climate: ClimateData;
  geometry: Geometry;
  occupancy: Occupancy;
  envelope: Envelope;
  internalLoads: InternalLoads;
  ventilation: Ventilation;
  systems: Systems;
  renewables: Renewables;
  energySources: EnergySources;
  offsets: Offsets;
  actuals: MonthlyActual[];
  embodiedCarbon: EmbodiedCarbon | null;
}

// ============================================
// Summary type for project list
// ============================================

export interface BuildingSummary {
  id: string;
  name: string;
  address: string;
  updatedAt: string;
  conditionedAreaM2: number;
}

// ============================================
// Factory: create empty building with defaults
// ============================================

export function createEmptyBuilding(id: string): Building {
  const now = new Date().toISOString();
  return {
    id,
    schemaVersion: SCHEMA_VERSION,
    meta: {
      name: '',
      address: '',
      latitude: null,
      longitude: null,
      createdAt: now,
      updatedAt: now,
    },
    climate: {
      zone: '',
      hddC: 0,
      cddC: 0,
      designHeatTempC: -20,
      designCoolTempC: 33,
    },
    geometry: {
      floors: 1,
      conditionedAreaM2: 0,
      volumeM3: 0,
      orientation: 0,
    },
    occupancy: {
      type: 'residential',
      count: 0,
      scheduleHoursPerDay: 24,
    },
    envelope: {
      walls: [],
      roof: { areaM2: 0, uValue: 0.278 }, // ~R-20 default
      windows: [],
      doors: [],
      airtightnessACH: 3.0,
    },
    internalLoads: {
      lightingWPerM2: 5,
      equipmentWPerM2: 5,
      scheduleHoursPerDay: 16,
    },
    ventilation: {
      rateACH: 0.5,
      type: 'mechanical',
      hrvEfficiency: 0,
    },
    systems: {
      heating: { type: 'gas_furnace', cop: 0.92 },
      cooling: { type: 'central_ac', cop: 3.0 },
      dhw: { type: 'gas_tank', efficiency: 0.67 },
    },
    renewables: {
      pvKw: 0,
      pvAnnualKwh: 0,
      windKw: 0,
      windAnnualKwh: 0,
      otherAnnualKwh: 0,
    },
    energySources: {
      electricityKwh: 0,
      gasM3: 0,
      oilL: 0,
      woodM3: 0,
    },
    offsets: {
      recsKwh: 0,
      greenGasM3: 0,
      carbonCreditsKgCO2: 0,
    },
    actuals: [],
    embodiedCarbon: null,
  };
}

// ============================================
// Validation helpers per TEUI version
// ============================================

export function isValidForTEUI1(b: Building): boolean {
  return (
    b.geometry.conditionedAreaM2 > 0 &&
    (b.energySources.electricityKwh > 0 ||
      b.energySources.gasM3 > 0 ||
      b.energySources.oilL > 0 ||
      b.energySources.woodM3 > 0)
  );
}

export function isValidForTEUI2(b: Building): boolean {
  return isValidForTEUI1(b) && b.occupancy.type !== undefined;
}

export function isValidForTEUI3(b: Building): boolean {
  return (
    b.geometry.conditionedAreaM2 > 0 &&
    b.geometry.volumeM3 > 0 &&
    b.climate.hddC > 0 &&
    b.envelope.walls.length > 0
  );
}

export function isValidForTEUI4(b: Building): boolean {
  return isValidForTEUI3(b);
}
