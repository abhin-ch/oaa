'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useProjectStore } from '@/store/project';
import { useUIStore } from '@/store/ui';
import { useRouter } from '@/i18n/navigation';
import { Header } from '@/components/layout/Header';
import { DotGrid } from '@/components/layout/DotGrid';
import { CALCULATORS, CATEGORIES, type CalculatorCategory } from '@/engine/calculators';
import { formatDate } from '@/lib/formatDate';
import { Pagination } from './Pagination';

type CatalogTab = 'my-calculations' | 'search-calculations';

const CATEGORY_DOT_COLOR: Record<CalculatorCategory, string> = {
  energy: 'bg-amber-400',
  carbon: 'bg-emerald-400',
  compliance: 'bg-blue-400',
  water: 'bg-cyan-400',
};

export function CalculatorCatalog() {
  const t = useTranslations();
  const router = useRouter();
  const { building, savedCalculations, deleteSavedCalculation } = useProjectStore();
  const { setActiveSavedCalcId } = useUIStore();
  const [activeTab, setActiveTab] = useState<CatalogTab>('search-calculations');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<CalculatorCategory | 'all'>('all');
  const [page, setPage] = useState(1);
  const [savedPage, setSavedPage] = useState(1);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const pageSize = 6;

  const filtered = useMemo(() => {
    return CALCULATORS.filter((calc) => {
      const matchesCategory = activeCategory === 'all' || calc.category === activeCategory;
      if (!matchesCategory) return false;
      if (!search.trim()) return true;
      const name = t(`calculators.${calc.id}.name` as Parameters<typeof t>[0]).toLowerCase();
      const desc = t(`calculators.${calc.id}.description` as Parameters<typeof t>[0]).toLowerCase();
      const q = search.toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }, [search, activeCategory, t]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const savedTotalPages = Math.max(1, Math.ceil(savedCalculations.length / pageSize));
  const paginatedSaved = savedCalculations.slice((savedPage - 1) * pageSize, savedPage * pageSize);

  const handleCategoryChange = (cat: CalculatorCategory | 'all') => {
    setActiveCategory(cat);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSelect = (calcId: string, savedCalcId?: string) => {
    if (!building) return;
    setActiveSavedCalcId(savedCalcId ?? null);
    router.push(`/project/${building.id}/calculator/${calcId}`);
  };

  const handleDeleteSaved = async (id: string) => {
    await deleteSavedCalculation(id);
    setConfirmDeleteId(null);
  };

  if (!building) return null;

  const rawOccupancy = building.occupancy;
  const occupancyKey = typeof rawOccupancy === 'string' ? rawOccupancy : 'residential';

  const tabs: { key: CatalogTab; label: string; count: number }[] = [
    {
      key: 'search-calculations',
      label: t('catalog.tabSearchCalculations'),
      count: CALCULATORS.length,
    },
    {
      key: 'my-calculations',
      label: t('catalog.tabMyCalculations'),
      count: savedCalculations.length,
    },
  ];

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
                onClick={() => router.push('/projects')}
                className="mt-1.5 flex h-9 w-9 items-center justify-center border border-border-default bg-bg-base text-text-tertiary transition-all hover:border-text-primary hover:text-text-primary active:scale-95"
                aria-label={t('nav.projects')}
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
                  {t(`buildings.types.${occupancyKey}` as Parameters<typeof t>[0])}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <nav
            className="mt-10 flex gap-0 border-b border-border-default"
            aria-label="Calculator tabs"
          >
            {tabs.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`border-b-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === key
                    ? 'border-text-primary text-text-primary'
                    : 'border-transparent text-text-tertiary hover:text-text-secondary'
                }`}
                aria-current={activeTab === key ? 'page' : undefined}
              >
                {label}
                <span className="ml-1.5 text-text-tertiary">({count})</span>
              </button>
            ))}
          </nav>

          {/* Tab content */}
          {activeTab === 'my-calculations' ? (
            /* My Calculations tab */
            paginatedSaved.length === 0 ? (
              <div className="mt-1 flex-1 border border-t-0 border-border-default bg-bg-base">
                <div className="flex h-full flex-col items-center justify-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center border border-border-default">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-text-tertiary"
                    >
                      <path d="M9 7h6M9 11h6M9 15h4M4 3h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-text-secondary">
                    {t('catalog.noSavedCalculations')}
                  </p>
                  <p className="mt-1 text-sm text-text-tertiary">
                    {t('catalog.noSavedDescription')}
                  </p>
                  <button
                    onClick={() => setActiveTab('search-calculations')}
                    className="mt-6 bg-text-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-text-inverse transition-all hover:opacity-90 active:scale-[0.98]"
                  >
                    {t('catalog.tabSearchCalculations')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-1 flex flex-1 flex-col border border-t-0 border-border-default bg-bg-base">
                {/* Table header */}
                <div className="hidden bg-bg-raised px-6 py-3 sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_auto] sm:gap-4">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">
                    {t('catalog.colCalculator')}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">
                    {t('catalog.colDate')}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">
                    {t('catalog.colTeui')}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">
                    {t('catalog.colGhgi')}
                  </span>
                  <span className="w-10 text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">
                    {t('catalog.colAction')}
                  </span>
                </div>

                {/* Saved calculation rows */}
                <div className="flex-1">
                  {paginatedSaved.map((calc) => (
                    <div
                      key={calc.id}
                      className="group grid grid-cols-1 items-center gap-2 border-b border-border-default bg-bg-base px-6 py-6 transition-colors hover:bg-bg-raised sm:grid-cols-[2fr_1fr_1fr_1fr_auto] sm:gap-4"
                    >
                      {/* Calculation name */}
                      <button
                        onClick={() => handleSelect(calc.calculatorId, calc.id)}
                        className="flex flex-col text-left"
                      >
                        <span className="text-sm font-bold uppercase tracking-wide text-text-primary">
                          {calc.name}
                        </span>
                        <span className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-text-tertiary">
                          {t(`calculators.${calc.calculatorId}.name` as Parameters<typeof t>[0])}
                        </span>
                      </button>

                      {/* Date */}
                      <span className="font-mono text-xs tracking-wide text-text-secondary">
                        {formatDate(calc.savedAt)}
                      </span>

                      {/* TEUI metric */}
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-16 overflow-hidden bg-border-default">
                          <div
                            className="h-full bg-text-primary transition-all"
                            style={{ width: `${Math.min(100, (calc.teui / 400) * 100)}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-semibold text-text-primary">
                          {calc.teui.toFixed(1)}
                        </span>
                      </div>

                      {/* GHGI metric */}
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-16 overflow-hidden bg-border-default">
                          <div
                            className="h-full bg-text-primary transition-all"
                            style={{ width: `${Math.min(100, (calc.ghgi / 50) * 100)}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-semibold text-text-primary">
                          {calc.ghgi.toFixed(1)}
                        </span>
                      </div>

                      {/* Action menu */}
                      <div className="relative flex justify-end">
                        {confirmDeleteId === calc.id ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDeleteSaved(calc.id)}
                              className="bg-text-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-text-inverse transition-colors hover:opacity-80"
                            >
                              {t('common.delete')}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="border border-border-default px-2 py-1 text-[10px] font-medium text-text-secondary transition-colors hover:bg-bg-raised"
                            >
                              {t('common.cancel')}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(calc.id)}
                            className="flex h-7 w-7 items-center justify-center text-text-tertiary opacity-0 transition-all hover:text-text-primary group-hover:opacity-100"
                            aria-label={t('common.delete')}
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
                              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Pagination
                  page={savedPage}
                  totalPages={savedTotalPages}
                  onPageChange={setSavedPage}
                  label={t('catalog.showingSavedCount', {
                    count: paginatedSaved.length,
                    total: savedCalculations.length,
                  })}
                />
              </div>
            )
          ) : (
            /* Search Calculations tab — existing catalog widget */
            <div className="mt-1 flex flex-1 flex-col border border-t-0 border-border-default bg-bg-base md:flex-row">
              {/* Search + category filters — horizontal bar on mobile, sidebar on desktop */}
              <div className="flex flex-col border-b border-border-default md:w-72 md:shrink-0 md:border-b-0 md:border-r">
                {/* Search */}
                <div className="border-b border-border-default p-4">
                  <div className="relative">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder={t('catalog.searchPlaceholder')}
                      className="h-10 w-full border border-border-default bg-bg-base pl-9 pr-3 text-sm text-text-primary placeholder:text-text-tertiary transition-colors focus:border-text-primary focus:outline-none focus:ring-2 focus:ring-text-primary/10"
                    />
                  </div>
                </div>

                {/* Category filters — horizontal scroll on mobile, vertical list on desktop */}
                <div className="flex gap-2 overflow-x-auto p-3 md:flex-col md:gap-3 md:overflow-x-visible md:p-4">
                  <div className="hidden md:block">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">
                      {t('catalog.title')}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-text-tertiary">
                      {t('catalog.subtitle')}
                    </p>
                  </div>
                  <div className="flex gap-2 md:mt-2 md:flex-col md:gap-3">
                    <button
                      onClick={() => handleCategoryChange('all')}
                      className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors md:rounded-none md:border-0 md:px-0 md:py-0 ${
                        activeCategory === 'all'
                          ? 'border-text-primary bg-text-primary/5 text-text-primary md:bg-transparent'
                          : 'border-border-default text-text-tertiary hover:text-text-secondary md:border-0'
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full bg-text-tertiary" />
                      <span>{t('catalog.all')}</span>
                      <span className="font-mono text-[10px] text-text-tertiary">
                        {CALCULATORS.length}
                      </span>
                    </button>
                    {CATEGORIES.map(({ key, count }) => (
                      <button
                        key={key}
                        onClick={() => handleCategoryChange(key)}
                        className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors md:rounded-none md:border-0 md:px-0 md:py-0 ${
                          activeCategory === key
                            ? 'border-text-primary bg-text-primary/5 text-text-primary md:bg-transparent'
                            : 'border-border-default text-text-tertiary hover:text-text-secondary md:border-0'
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${CATEGORY_DOT_COLOR[key]}`} />
                        <span>{t(`catalog.categories.${key}` as Parameters<typeof t>[0])}</span>
                        <span className="font-mono text-[10px] text-text-tertiary">{count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Calculator list */}
              <div className="flex min-w-0 flex-1 flex-col">
                {/* Column header */}
                <div className="hidden bg-bg-raised px-6 py-3 sm:grid sm:grid-cols-[2fr_1fr_auto] sm:gap-4">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">
                    {t('catalog.title')}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">
                    {t('buildings.colDate')}
                  </span>
                  <span className="w-20 text-right text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">
                    {t('buildings.colAction')}
                  </span>
                </div>

                {/* Calculator rows */}
                <div className="flex-1 overflow-hidden">
                  {paginated.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-sm text-text-tertiary">{t('catalog.noResults')}</p>
                    </div>
                  ) : (
                    paginated.map((calc) => (
                      <button
                        key={calc.id}
                        onClick={() => calc.available && handleSelect(calc.id)}
                        disabled={!calc.available}
                        className={`group grid w-full grid-cols-1 items-center gap-2 border-b border-border-default px-6 py-5 text-left transition-colors last:border-b-0 sm:grid-cols-[2fr_1fr_auto] sm:gap-4 ${
                          calc.available ? 'hover:bg-bg-raised' : 'cursor-not-allowed'
                        }`}
                      >
                        {/* Name + description */}
                        <div className="flex items-center gap-3">
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${CATEGORY_DOT_COLOR[calc.category]} ${!calc.available ? 'opacity-30' : ''}`}
                          />
                          <div className="flex flex-col">
                            <span
                              className={`text-sm font-bold uppercase tracking-wide ${
                                calc.available ? 'text-text-primary' : 'text-text-tertiary/50'
                              }`}
                            >
                              {t(`calculators.${calc.id}.name` as Parameters<typeof t>[0])}
                            </span>
                            <span
                              className={`mt-0.5 text-[10px] font-medium uppercase tracking-widest ${
                                calc.available ? 'text-text-tertiary' : 'text-text-tertiary/30'
                              }`}
                            >
                              {t(`calculators.${calc.id}.description` as Parameters<typeof t>[0])}
                            </span>
                          </div>
                        </div>

                        {/* Category label */}
                        <span
                          className={`font-mono text-xs tracking-wide ${
                            calc.available ? 'text-text-secondary' : 'text-text-tertiary/30'
                          }`}
                        >
                          {t(`catalog.categories.${calc.category}` as Parameters<typeof t>[0])}
                        </span>

                        {/* Action */}
                        <div className="flex w-20 justify-end">
                          {calc.available ? (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-text-tertiary transition-transform group-hover:translate-x-1 group-hover:text-text-primary"
                            >
                              <path d="M5 12h14" />
                              <path d="m12 5 7 7-7 7" />
                            </svg>
                          ) : (
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary/40">
                              {t('catalog.comingSoon')}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  label={t('buildings.showingCount', {
                    count: paginated.length,
                    total: filtered.length,
                  })}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
