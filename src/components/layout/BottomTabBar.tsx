'use client';

import { useUIStore } from '@/store/ui';

interface Tab {
  id: number;
  label: string;
  icon: string;
  steps: number[]; // which wizard steps this tab covers
}

const tabs: Tab[] = [
  { id: 0, label: 'Home', icon: '🏠', steps: [] },
  { id: 1, label: 'Building', icon: '📐', steps: [1, 2] },
  { id: 2, label: 'Energy', icon: '⚡', steps: [3, 4, 5, 6] },
  { id: 3, label: 'Results', icon: '📊', steps: [7] },
];

export function BottomTabBar() {
  const { currentStep, setStep } = useUIStore();

  // Determine active tab from current wizard step
  const activeTab = tabs.findIndex((tab) => tab.steps.includes(currentStep));

  const handleTabPress = (tab: Tab) => {
    // Navigate to first step of this tab
    if (tab.steps.length > 0 && tab.steps[0] !== undefined) {
      setStep(tab.steps[0]);
    }

    // Haptic feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-default bg-bg-surface/80 backdrop-blur-xl supports-[backdrop-filter]:bg-bg-surface/60 md:hidden"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="flex h-[52px] items-center justify-around">
        {tabs.map((tab, index) => {
          const isActive = index === activeTab || (index === 0 && activeTab === -1);

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label}
              onClick={() => handleTabPress(tab)}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition-colors"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-base transition-all duration-200 ${
                  isActive ? 'scale-110 bg-energy-50' : ''
                }`}
              >
                {tab.icon}
              </span>
              <span
                className={`text-[10px] font-medium ${
                  isActive ? 'text-energy-600' : 'text-text-tertiary'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
