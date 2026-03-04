import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';
export type Locale = 'en' | 'fr';

interface UIState {
  // Wizard navigation
  currentStep: number;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

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

  // Bottom sheet (mobile)
  bottomSheetSnap: 'collapsed' | 'half' | 'full';
  setBottomSheetSnap: (snap: 'collapsed' | 'half' | 'full') => void;
}

const TOTAL_STEPS = 7;

export const useUIStore = create<UIState>()((set) => ({
  currentStep: 1,
  setStep: (step: number) => set({ currentStep: Math.max(1, Math.min(TOTAL_STEPS, step)) }),
  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(TOTAL_STEPS, state.currentStep + 1),
    })),
  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(1, state.currentStep - 1),
    })),

  theme: 'system',
  setTheme: (theme: Theme) => set({ theme }),

  locale: 'en',
  setLocale: (locale: Locale) => set({ locale }),

  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),

  bottomSheetSnap: 'collapsed',
  setBottomSheetSnap: (snap) => set({ bottomSheetSnap: snap }),
}));
