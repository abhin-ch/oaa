import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Building, BuildingSummary } from '@/schema/building';
import { createEmptyBuilding } from '@/schema/building';
import * as dbOps from '@/db';

interface ProjectState {
  // Current project
  building: Building | null;
  isLoading: boolean;

  // Project list
  projects: BuildingSummary[];

  // Actions
  createProject: (name: string) => Promise<string>;
  loadProject: (id: string) => Promise<void>;
  updateBuilding: (changes: Partial<Building>) => void;
  deleteProject: (id: string) => Promise<void>;
  refreshProjectList: () => Promise<void>;

  // Persistence — flush current building to IndexedDB
  persist: () => Promise<void>;
}

export const useProjectStore = create<ProjectState>()(
  immer((set, get) => ({
    building: null,
    isLoading: false,
    projects: [],

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

    persist: async () => {
      const { building } = get();
      if (!building) return;
      await dbOps.updateProject(building.id, building);
    },
  })),
);
