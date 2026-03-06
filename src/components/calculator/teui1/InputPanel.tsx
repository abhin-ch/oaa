'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { Building } from '@/schema/building';
import type { TEUI1Result } from '@/engine/teui1';
import { hapticTap } from '@/lib/haptics';
import { BuildingTab } from './inputs/BuildingTab';
import { EnergyBillsTab } from './inputs/EnergyBillsTab';
import { RenewablesTab } from './inputs/RenewablesTab';
import { ProjectTab } from './inputs/ProjectTab';
import { DownloadTab } from './inputs/DownloadTab';
import { ReportPreview } from './results/ReportPreview';

interface InputPanelProps {
  building: Building;
  result: TEUI1Result;
  onUpdate: (changes: Partial<Building>) => void;
  onTabChange?: (tab: string) => void;
  reportRef?: React.RefObject<HTMLDivElement | null>;
}

const TABS = ['building', 'energy', 'renewables', 'project', 'download'] as const;
type TabKey = (typeof TABS)[number];

const TAB_ICONS: Record<TabKey, React.ReactNode> = {
  building: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="2" width="16" height="20" rx="1" />
      <path d="M9 22V12h6v10" />
      <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01" />
    </svg>
  ),
  energy: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13 2 L3 14 h9 l-1 8 10-12 h-9 l1-8" />
    </svg>
  ),
  renewables: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  ),
  project: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  download: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
};

export function InputPanel({
  building,
  result,
  onUpdate,
  onTabChange,
  reportRef,
}: InputPanelProps) {
  const t = useTranslations('teui1.tabs');
  const [activeTab, setActiveTab] = useState<TabKey>('building');

  const handleTabChange = useCallback(
    (tab: TabKey) => {
      setActiveTab(tab);
      onTabChange?.(tab);
      hapticTap();
    },
    [onTabChange],
  );
  const formRef = useRef<HTMLFormElement>(null);

  const shouldFocusFirst = useRef(false);

  // Auto-focus the first input when tab switches via Enter key
  useEffect(() => {
    if (!shouldFocusFirst.current) return;
    shouldFocusFirst.current = false;
    // Small timeout to let React render the new tab content
    const timer = setTimeout(() => {
      const form = formRef.current;
      if (!form) return;
      const first = form.querySelector<HTMLElement>('input, select, textarea');
      if (first) first.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;
    const inputs = Array.from(form.querySelectorAll<HTMLElement>('input, select, textarea'));
    const target = e.target as HTMLElement;
    const idx = inputs.indexOf(target);
    if (idx >= 0 && idx < inputs.length - 1) {
      inputs[idx + 1].focus();
      hapticTap();
    } else if (idx === inputs.length - 1) {
      const tabIdx = TABS.indexOf(activeTab);
      const nextTab = TABS[tabIdx + 1];
      if (nextTab) {
        shouldFocusFirst.current = true;
        handleTabChange(nextTab);
      }
    }
  };

  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* Desktop: Vertical tab sidebar (hidden on mobile) */}
      <div className="hidden w-14 shrink-0 flex-col border-r border-border-default bg-bg-base md:flex">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`group relative flex h-14 w-full flex-col items-center justify-center gap-0.5 transition-all ${
              activeTab === tab
                ? 'bg-bg-surface text-text-primary'
                : 'text-text-tertiary hover:bg-bg-raised hover:text-text-secondary'
            }`}
            aria-selected={activeTab === tab}
            role="tab"
          >
            {/* Active indicator */}
            {activeTab === tab && (
              <div className="absolute left-0 top-0 h-full w-0.5 bg-text-primary" />
            )}
            {TAB_ICONS[tab]}
            <span className="text-[7px] font-bold uppercase tracking-widest">
              {t(tab).slice(0, 5)}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">
        {/* Tab header */}
        <div className="border-b border-border-default px-4 py-2.5 md:px-5">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary">
            {t(activeTab)}
          </span>
        </div>

        <form
          ref={formRef}
          className="px-4 pb-4 pt-4 md:px-5"
          onSubmit={(e) => e.preventDefault()}
          onKeyDown={handleKeyDown}
        >
          {activeTab === 'building' && <BuildingTab building={building} onUpdate={onUpdate} />}
          {activeTab === 'energy' && <EnergyBillsTab building={building} onUpdate={onUpdate} />}
          {activeTab === 'renewables' && <RenewablesTab building={building} onUpdate={onUpdate} />}
          {activeTab === 'project' && <ProjectTab building={building} onUpdate={onUpdate} />}
        </form>
        {activeTab === 'download' && (
          <div className="px-4 pb-4 pt-4 md:px-5">
            <DownloadTab building={building} result={result} />
            {/* Mobile: inline report preview below actions */}
            <div className="mt-5 md:hidden">
              <ReportPreview ref={reportRef} building={building} result={result} inline />
            </div>
          </div>
        )}
      </div>

      {/* Mobile: Bottom nav bar (hidden on desktop) */}
      <div className="order-last flex shrink-0 border-t border-border-default bg-bg-base md:hidden">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`group relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-all ${
              activeTab === tab ? 'text-text-primary' : 'text-text-tertiary'
            }`}
            aria-selected={activeTab === tab}
            role="tab"
          >
            {/* Active indicator */}
            {activeTab === tab && (
              <div className="absolute left-0 right-0 top-0 h-0.5 bg-text-primary" />
            )}
            {TAB_ICONS[tab]}
            <span className="text-[7px] font-bold uppercase tracking-widest">
              {t(tab).slice(0, 5)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
