'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { useProjectStore } from '@/store/project';
import { useUIStore } from '@/store/ui';
import { useRouter } from '@/i18n/navigation';
import { useTEUI1 } from '@/hooks/useTEUI1';
import type { Building } from '@/schema/building';
import { Header } from '@/components/layout/Header';
import { DotGrid } from '@/components/layout/DotGrid';
import { SaveCalculationModal } from '@/components/calculator/SaveCalculationModal';
import { InputPanel } from './InputPanel';
import { ResultsPanel } from './results/ResultsPanel';

/**
 * Create a clean draft Building for a new calculator session.
 * Keeps project identity (id, meta) but clears calculator inputs.
 */
function createFreshDraft(building: Building): Building {
  return {
    ...building,
    occupancy: 'residential',
    energySources: {},
    renewables: {},
    evaluationPeriod: {},
  };
}

export function TEUI1Calculator() {
  const t = useTranslations();
  const router = useRouter();
  const { building, saveCalculation, updateSavedCalculation, loadSavedCalculations } =
    useProjectStore();
  const { activeSavedCalcId, setActiveSavedCalcId } = useUIStore();
  const [showResults, setShowResults] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Local draft — never auto-persisted to IndexedDB
  const [draft, setDraft] = useState<Building | null>(null);

  // Initialize draft on mount
  useEffect(() => {
    if (!building) return;

    if (activeSavedCalcId) {
      // Load saved calculations then restore from snapshot
      void loadSavedCalculations().then(() => {
        const saved = useProjectStore
          .getState()
          .savedCalculations.find((c) => c.id === activeSavedCalcId);
        if (saved) {
          setDraft({
            ...building,
            occupancy: saved.occupancy,
            energySources: { ...saved.energySources },
            renewables: { ...saved.renewables },
            evaluationPeriod: { ...saved.evaluationPeriod },
          });
        } else {
          setDraft(createFreshDraft(building));
        }
      });
    } else {
      setDraft(createFreshDraft(building));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [building?.id, activeSavedCalcId]);

  // Local updater — merges changes into draft without touching the store
  const updateDraft = useCallback((changes: Partial<Building>) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return { ...prev, ...changes };
    });
  }, []);

  const result = useTEUI1(draft);

  if (!building || !draft) return null;

  const occupancyKey = typeof draft.occupancy === 'string' ? draft.occupancy : 'residential';
  const isEditing = !!activeSavedCalcId;

  // Temporarily swap draft inputs onto the store for save, then restore
  const withDraftOnStore = async (fn: () => Promise<void>) => {
    const original = useProjectStore.getState().building;
    if (original) {
      useProjectStore.setState({
        building: {
          ...original,
          occupancy: draft.occupancy,
          energySources: draft.energySources,
          renewables: draft.renewables,
          evaluationPeriod: draft.evaluationPeriod,
        },
      });
    }
    await fn();
    if (original) {
      useProjectStore.setState({ building: original });
    }
  };

  const handleSaveNew = async (name: string) => {
    await withDraftOnStore(() =>
      saveCalculation(name, 'teui-v1', result.teui, result.ghgi.kgCo2PerM2),
    );
    setShowSaveModal(false);
    setActiveSavedCalcId(null);
    router.push(`/project/${building.id}`);
  };

  const handleSaveExisting = async () => {
    if (!activeSavedCalcId) return;
    await withDraftOnStore(() =>
      updateSavedCalculation(activeSavedCalcId, 'teui-v1', result.teui, result.ghgi.kgCo2PerM2),
    );
    setActiveSavedCalcId(null);
    router.push(`/project/${building.id}`);
  };

  const handleSaveClick = () => {
    if (isEditing) {
      void handleSaveExisting();
    } else {
      setShowSaveModal(true);
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />

      <main id="main-content" className="relative flex-1 overflow-hidden bg-bg-base">
        <DotGrid />
        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col px-6 py-12 md:py-16">
          {/* Page header */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-start gap-4">
              <button
                onClick={() => {
                  setActiveSavedCalcId(null);
                  router.push(`/project/${building.id}`);
                }}
                className="mt-1.5 flex h-9 w-9 items-center justify-center border border-border-default bg-bg-base text-text-tertiary transition-all hover:border-text-primary hover:text-text-primary active:scale-95"
                aria-label={t('common.back')}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5" />
                  <path d="m12 19-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
                  {building.meta.name || t('buildings.namePlaceholder')}
                </h1>
                <p className="mt-1 text-sm leading-relaxed text-text-tertiary">
                  {t(`buildings.types.${occupancyKey}` as Parameters<typeof t>[0])} &mdash;{' '}
                  {t('teui1.title')}
                </p>
              </div>
            </div>

            <button
              onClick={handleSaveClick}
              className="flex h-12 items-center gap-2 bg-text-primary px-7 text-sm font-semibold uppercase tracking-wider text-text-inverse transition-all hover:opacity-90 active:scale-[0.98]"
            >
              {t('common.saveChanges')}
            </button>
          </div>

          {/* Mobile: collapsible TEUI summary */}
          <div className="mt-6 border border-border-default bg-bg-base md:hidden">
            <button
              onClick={() => setShowResults((v) => !v)}
              className="flex w-full items-center justify-between px-6 py-3"
            >
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold font-mono tabular-nums text-text-primary">
                  {result.teui.toFixed(1)}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">
                  {t('teui1.results.teuiUnit')}
                </span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">
                {showResults ? t('teui1.hideResults') : t('teui1.showResults')}
              </span>
            </button>
            {showResults && (
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-t border-border-default bg-bg-raised"
              >
                <ResultsPanel result={result} building={draft} />
              </motion.div>
            )}
          </div>

          {/* Two-panel bordered box */}
          <div className="mt-10 flex flex-1 overflow-hidden border border-border-default bg-bg-base">
            {/* Left panel — inputs */}
            <div className="flex w-full shrink-0 flex-col overflow-y-auto border-r border-border-default md:w-[45%]">
              <InputPanel building={draft} onUpdate={updateDraft} />
            </div>

            {/* Right panel — fixed canvas, no scroll */}
            <div className="hidden flex-1 md:block">
              <div className="h-full">
                <ResultsPanel result={result} building={draft} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Save modal — only for new calculations */}
      <SaveCalculationModal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveNew}
      />
    </div>
  );
}
