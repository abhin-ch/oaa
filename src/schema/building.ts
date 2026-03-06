/**
 * Building Schema — project identity and metadata.
 *
 * The calculation-specific fields (energy sources, envelope, systems, etc.)
 * will be added back per TEUI version as we rebuild each calculator.
 * For now this holds just what the project list and creation flow need.
 */

export const SCHEMA_VERSION = 3;

export interface BuildingMeta {
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  archived?: boolean;
}

export type OccupancyType =
  | 'residential'
  | 'office'
  | 'retail'
  | 'assembly'
  | 'institutional'
  | 'industrial'
  | 'mixed';

export interface EnergySourcesV1 {
  conditionedAreaM2?: number;
  electricityKwh?: number;
  naturalGasM3?: number;
  propaneLbs?: number;
  heatingOilL?: number;
  biofuelM3?: number;
}

export interface RenewablesV1 {
  onSiteKwh?: number;
  offSiteElectricityKwh?: number;
  offSiteGasKwh?: number;
}

export interface EvaluationPeriod {
  beginDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
}

export interface Building {
  id: string;
  schemaVersion: number;
  meta: BuildingMeta;
  occupancy: OccupancyType;
  energySources?: EnergySourcesV1;
  renewables?: RenewablesV1;
  evaluationPeriod?: EvaluationPeriod;
}

export interface BuildingSummary {
  id: string;
  name: string;
  address: string;
  updatedAt: string;
  archived: boolean;
}

export interface SavedCalculation {
  id: string;
  projectId: string;
  calculatorId: string;
  name: string; // user-given name for this calculation
  projectName: string;
  savedAt: string; // ISO 8601
  teui: number;
  ghgi: number;
  // Input snapshot — restores calculator state when reopened
  occupancy: OccupancyType;
  energySources: EnergySourcesV1;
  renewables: RenewablesV1;
  evaluationPeriod: EvaluationPeriod;
}

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
    occupancy: 'residential',
    energySources: {},
    renewables: {},
    evaluationPeriod: {},
  };
}
