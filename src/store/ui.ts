import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';
export type Locale = 'en' | 'fr';

interface UIState {
  // Active calculator within a project (null = browsing catalog)
  activeCalculator: string | null;
  setActiveCalculator: (id: string | null) => void;

  // Saved calculation being edited (null = new calculation)
  activeSavedCalcId: string | null;
  setActiveSavedCalcId: (id: string | null) => void;

  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Language
  locale: Locale;
  setLocale: (locale: Locale) => void;

  // Layout
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  activeCalculator: null,
  setActiveCalculator: (id: string | null) => set({ activeCalculator: id }),

  activeSavedCalcId: null,
  setActiveSavedCalcId: (id: string | null) => set({ activeSavedCalcId: id }),

  theme: 'system',
  setTheme: (theme: Theme) => set({ theme }),

  locale: 'en',
  setLocale: (locale: Locale) => set({ locale }),

  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
}));
