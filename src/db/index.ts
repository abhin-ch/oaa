import Dexie, { type EntityTable } from 'dexie';
import type { Building, BuildingSummary } from '@/schema/building';

// ============================================
// Climate cache entry
// ============================================

export interface ClimateCache {
  locationKey: string; // lat,lon rounded or city name
  hddC: number;
  cddC: number;
  designHeatTempC: number;
  designCoolTempC: number;
  zone: string;
  fetchedAt: string; // ISO 8601
}

// ============================================
// Database definition
// ============================================

class ObjectiveDB extends Dexie {
  projects!: EntityTable<Building, 'id'>;
  climateCache!: EntityTable<ClimateCache, 'locationKey'>;

  constructor() {
    super('objective-db');

    this.version(1).stores({
      projects: 'id, meta.name, meta.updatedAt',
      climateCache: 'locationKey, fetchedAt',
    });
  }
}

export const db = new ObjectiveDB();

// ============================================
// Project CRUD helpers
// ============================================

export async function createProject(building: Building): Promise<string> {
  await db.projects.add(building);
  return building.id;
}

export async function getProject(id: string): Promise<Building | undefined> {
  return db.projects.get(id);
}

export async function listProjects(): Promise<BuildingSummary[]> {
  const all = await db.projects.orderBy('meta.updatedAt').reverse().toArray();
  return all.map((b) => ({
    id: b.id,
    name: b.meta.name,
    address: b.meta.address,
    updatedAt: b.meta.updatedAt,
    conditionedAreaM2: b.geometry.conditionedAreaM2,
  }));
}

export async function updateProject(id: string, changes: Partial<Building>): Promise<void> {
  await db.projects.update(id, {
    ...changes,
    meta: {
      ...(changes.meta ?? {}),
      updatedAt: new Date().toISOString(),
    },
  } as Partial<Building>);
}

export async function deleteProject(id: string): Promise<void> {
  await db.projects.delete(id);
}

// ============================================
// Climate cache helpers
// ============================================

const CACHE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function getCachedClimate(locationKey: string): Promise<ClimateCache | undefined> {
  const entry = await db.climateCache.get(locationKey);
  if (!entry) return undefined;

  const age = Date.now() - new Date(entry.fetchedAt).getTime();
  if (age > CACHE_MAX_AGE_MS) {
    await db.climateCache.delete(locationKey);
    return undefined;
  }

  return entry;
}

export async function setCachedClimate(data: ClimateCache): Promise<void> {
  await db.climateCache.put(data);
}
