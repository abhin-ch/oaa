'use client';

import { useTranslations } from 'next-intl';
import { useUIStore } from '@/store/ui';

interface Tab {
  id: number;
  labelKey: string;
  icon: string;
  steps: number[];
}

const tabs: Tab[] = [
  { id: 0, labelKey: 'nav.home', icon: '🏠', steps: [] },
  { id: 1, labelKey: 'nav.building', icon: '📐', steps: [1, 2] },
  { id: 2, labelKey: 'nav.energy', icon: '⚡', steps: [3, 4, 5, 6] },
  { id: 3, labelKey: 'nav.results', icon: '📊', steps: [7] },
];

export function BottomTabBar() {
  const t = useTranslations();
  const { currentStep, setStep } = useUIStore();

  const activeTab = tabs.findIndex((tab) => tab.steps.includes(currentStep));

  const handleTabPress = (tab: Tab) => {
    if (tab.steps.length > 0 && tab.steps[0] !== undefined) {
      setStep(tab.steps[0]);
    }

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-default bg-bg-surface/80 backdrop-blur-xl supports-[backdrop-filter]:bg-bg-surface/60 md:hidden"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
      role="tablist"
      aria-label={t('nav.home')}
    >
      <div className="flex h-[52px] items-center justify-around">
        {tabs.map((tab, index) => {
          const isActive = index === activeTab || (index === 0 && activeTab === -1);
          const label = t(tab.labelKey as Parameters<typeof t>[0]);

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-label={label}
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
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
