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
import { SaveCalculationModal } from '@/components/calculator/SaveCalculationModal';
import { DotGrid } from '@/components/layout/DotGrid';
import { InputPanel } from './InputPanel';
import { ResultsPanel } from './results/ResultsPanel';

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

  const [draft, setDraft] = useState<Building | null>(null);

  useEffect(() => {
    if (!building) return;

    if (activeSavedCalcId) {
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
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'var(--bg-base)',
        }}
      >
        {/* Dot grid background */}
        <DotGrid />

        {/* Header */}
        <Header />

        {/* Title bar — compact */}
        <div className="relative z-[1] shrink-0 px-4 py-2 md:px-6 md:py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setActiveSavedCalcId(null);
                  router.push(`/project/${building.id}`);
                }}
                className="flex h-7 w-7 shrink-0 items-center justify-center border border-border-default bg-bg-base text-text-tertiary transition-all hover:border-text-primary hover:text-text-primary active:scale-95"
                aria-label={t('common.back')}
              >
                <svg
                  width="14"
                  height="14"
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
                <h1 className="text-lg font-bold tracking-tight text-text-primary md:text-2xl">
                  {building.meta.name || t('buildings.namePlaceholder')}
                </h1>
                <p className="text-[10px] leading-tight text-text-tertiary md:text-xs">
                  {t(`buildings.types.${occupancyKey}` as Parameters<typeof t>[0])} &mdash;{' '}
                  {t('teui1.title')}
                </p>
              </div>
            </div>

            <button
              onClick={handleSaveClick}
              className="shrink-0 bg-text-primary px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-inverse transition-all hover:opacity-90 active:scale-[0.98] md:px-6 md:py-2 md:text-xs"
            >
              {t('common.saveChanges')}
            </button>
          </div>
        </div>

        {/* Workspace — fills ALL remaining height */}
        <main
          id="main-content"
          style={{
            flex: '1 1 0%',
            minHeight: 0,
            overflow: 'hidden',
            padding: '0 1rem 0.5rem',
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
          className="md:!px-6 md:!pb-3"
        >
          {/* Mobile: toggle between Build / Results */}
          <div className="mb-2 flex shrink-0 md:hidden">
            <button
              onClick={() => setShowResults(false)}
              className={`flex-1 py-2 text-center text-[10px] font-extrabold uppercase tracking-[0.15em] transition-colors ${
                !showResults
                  ? 'border-b-2 border-text-primary text-text-primary'
                  : 'border-b border-border-default text-text-tertiary'
              }`}
            >
              {t('teui1.tabs.building')}
            </button>
            <button
              onClick={() => setShowResults(true)}
              className={`flex-1 py-2 text-center text-[10px] font-extrabold uppercase tracking-[0.15em] transition-colors ${
                showResults
                  ? 'border-b-2 border-text-primary text-text-primary'
                  : 'border-b border-border-default text-text-tertiary'
              }`}
            >
              {t('teui1.results.title')}
              {result.teui > 0 && (
                <span className="ml-2 font-mono tabular-nums">{result.teui.toFixed(1)}</span>
              )}
            </button>
          </div>

          {/* Mobile: full-screen single panel */}
          <div className="flex min-h-0 flex-1 flex-col border border-border-default bg-bg-base md:hidden">
            {showResults ? (
              <div style={{ flex: '1 1 0%', overflow: 'hidden', minHeight: 0 }}>
                <ResultsPanel result={result} building={draft} />
              </div>
            ) : (
              <div
                style={{ flex: '1 1 0%', minHeight: 0, display: 'flex', flexDirection: 'column' }}
              >
                <InputPanel building={draft} onUpdate={updateDraft} />
              </div>
            )}
          </div>

          {/* Desktop: Two-panel grid — h-full forces it to fill the main exactly */}
          <div
            className="hidden min-h-0 flex-1 border border-border-default bg-bg-base md:grid"
            style={{
              gridTemplateColumns: 'minmax(340px, 45fr) 55fr',
              gridTemplateRows: 'minmax(0, 1fr)',
              overflow: 'hidden',
              minHeight: 0,
            }}
          >
            {/* Left panel — scrollable inputs */}
            <div
              style={{ overflowY: 'auto', minHeight: 0 }}
              className="border-r border-border-default"
            >
              <InputPanel building={draft} onUpdate={updateDraft} />
            </div>

            {/* Right panel */}
            <div style={{ minHeight: 0, overflow: 'hidden' }}>
              <div style={{ height: '100%', overflow: 'hidden' }}>
                <ResultsPanel result={result} building={draft} />
              </div>
            </div>
          </div>
        </main>
      </div>

      <SaveCalculationModal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveNew}
      />
    </>
  );
}
