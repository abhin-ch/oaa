import Dexie, { type EntityTable } from 'dexie';
import type { Building, BuildingSummary, SavedCalculation } from '@/schema/building';

// ============================================
// Database definition
// ============================================

class ObjectiveDB extends Dexie {
  projects!: EntityTable<Building, 'id'>;
  savedCalculations!: EntityTable<SavedCalculation, 'id'>;

  constructor() {
    super('objective-db');

    this.version(2).stores({
      projects: 'id, meta.name, meta.updatedAt',
      // Drop climate cache — will rebuild when needed
      climateCache: null,
    });

    this.version(3)
      .stores({
        projects: 'id, meta.name, meta.updatedAt',
      })
      .upgrade((tx) =>
        tx
          .table('projects')
          .toCollection()
          .modify((project) => {
            if (!project.energySources) project.energySources = {};
            if (!project.renewables) project.renewables = {};
            if (!project.evaluationPeriod) project.evaluationPeriod = {};
            project.schemaVersion = 3;
          }),
      );

    this.version(4).stores({
      projects: 'id, meta.name, meta.updatedAt',
      savedCalculations: 'id, projectId, calculatorId, savedAt',
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
    archived: b.meta.archived ?? false,
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
// Saved Calculations CRUD helpers
// ============================================

export async function saveCalculation(calc: SavedCalculation): Promise<string> {
  await db.savedCalculations.add(calc);
  return calc.id;
}

export async function listSavedCalculations(projectId: string): Promise<SavedCalculation[]> {
  const calcs = await db.savedCalculations.where('projectId').equals(projectId).toArray();
  return calcs.sort((a, b) => (b.savedAt ?? '').localeCompare(a.savedAt ?? ''));
}

export async function updateSavedCalculation(
  id: string,
  changes: Partial<SavedCalculation>,
): Promise<void> {
  await db.savedCalculations.update(id, changes);
}

export async function deleteSavedCalculation(id: string): Promise<void> {
  await db.savedCalculations.delete(id);
}
