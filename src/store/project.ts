import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Building, BuildingSummary, SavedCalculation } from '@/schema/building';
import { createEmptyBuilding } from '@/schema/building';
import * as dbOps from '@/db';

interface ProjectState {
  // Current project
  building: Building | null;
  isLoading: boolean;

  // Project list
  projects: BuildingSummary[];

  // Saved calculations
  savedCalculations: SavedCalculation[];

  // Actions
  createProject: (name: string) => Promise<string>;
  loadProject: (id: string) => Promise<void>;
  updateBuilding: (changes: Partial<Building>) => void;
  deleteProject: (id: string) => Promise<void>;
  archiveProject: (id: string, archived: boolean) => Promise<void>;
  refreshProjectList: () => Promise<void>;

  // Saved calculation actions
  saveCalculation: (
    name: string,
    calculatorId: string,
    teui: number,
    ghgi: number,
  ) => Promise<void>;
  updateSavedCalculation: (
    savedCalcId: string,
    calculatorId: string,
    teui: number,
    ghgi: number,
  ) => Promise<void>;
  loadSavedCalculations: () => Promise<void>;
  deleteSavedCalculation: (id: string) => Promise<void>;

  // Persistence — flush current building to IndexedDB
  persist: () => Promise<void>;
}

export const useProjectStore = create<ProjectState>()(
  immer((set, get) => ({
    building: null,
    isLoading: false,
    projects: [],
    savedCalculations: [],

    createProject: async (name: string) => {
      const id = crypto.randomUUID();
      const building = createEmptyBuilding(id);
      building.meta.name = name;

      await dbOps.createProject(building);
      set((state) => {
        state.building = building;
      });
      await get().refreshProjectList();
      return id;
    },

    loadProject: async (id: string) => {
      set((state) => {
        state.isLoading = true;
      });
      const building = await dbOps.getProject(id);
      set((state) => {
        state.building = building ?? null;
        state.isLoading = false;
      });
    },

    updateBuilding: (changes: Partial<Building>) => {
      set((state) => {
        if (!state.building) return;
        Object.assign(state.building, changes);
        state.building.meta.updatedAt = new Date().toISOString();
      });

      // Auto-persist to IndexedDB (debounced in real usage)
      void get().persist();
    },

    archiveProject: async (id: string, archived: boolean) => {
      const project = await dbOps.getProject(id);
      if (!project) return;
      project.meta.archived = archived;
      await dbOps.updateProject(id, project);
      await get().refreshProjectList();
    },

    deleteProject: async (id: string) => {
      await dbOps.deleteProject(id);
      set((state) => {
        if (state.building?.id === id) {
          state.building = null;
        }
      });
      await get().refreshProjectList();
    },

    refreshProjectList: async () => {
      const projects = await dbOps.listProjects();
      set((state) => {
        state.projects = projects;
      });
    },

    saveCalculation: async (name: string, calculatorId: string, teui: number, ghgi: number) => {
      const { building } = get();
      if (!building) return;
      const calc: SavedCalculation = {
        id: crypto.randomUUID(),
        projectId: building.id,
        calculatorId,
        name,
        projectName: building.meta.name,
        savedAt: new Date().toISOString(),
        teui,
        ghgi,
        occupancy: building.occupancy,
        energySources: { ...building.energySources },
        renewables: { ...building.renewables },
        evaluationPeriod: { ...building.evaluationPeriod },
      };
      await dbOps.saveCalculation(calc);
      await get().loadSavedCalculations();
    },

    updateSavedCalculation: async (
      savedCalcId: string,
      calculatorId: string,
      teui: number,
      ghgi: number,
    ) => {
      const { building } = get();
      if (!building) return;
      await dbOps.updateSavedCalculation(savedCalcId, {
        calculatorId,
        savedAt: new Date().toISOString(),
        teui,
        ghgi,
        occupancy: building.occupancy,
        energySources: { ...building.energySources },
        renewables: { ...building.renewables },
        evaluationPeriod: { ...building.evaluationPeriod },
      });
      await get().loadSavedCalculations();
    },

    loadSavedCalculations: async () => {
      const { building } = get();
      if (!building) return;
      const calcs = await dbOps.listSavedCalculations(building.id);
      set((state) => {
        state.savedCalculations = calcs;
      });
    },

    deleteSavedCalculation: async (id: string) => {
      await dbOps.deleteSavedCalculation(id);
      await get().loadSavedCalculations();
    },

    persist: async () => {
      const { building } = get();
      if (!building) return;
      await dbOps.updateProject(building.id, building);
    },
  })),
);
