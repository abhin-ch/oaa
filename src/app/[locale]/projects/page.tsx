'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useProjectStore } from '@/store/project';
import { useRouter } from '@/i18n/navigation';
import type { BuildingSummary } from '@/schema/building';
import { Header } from '@/components/layout/Header';
import { DotGrid } from '@/components/layout/DotGrid';
import { formatDate } from '@/lib/formatDate';

type Filter = 'all' | 'archived';

export default function ProjectsPage() {
  const t = useTranslations();
  const router = useRouter();
  const { projects, createProject, deleteProject, archiveProject, refreshProjectList } =
    useProjectStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    void refreshProjectList();
  }, [refreshProjectList]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const id = await createProject(newName.trim());
    setNewName('');
    setIsCreating(false);
    router.push(`/project/${id}`);
  };

  const handleDelete = async (id: string) => {
    await deleteProject(id);
    setConfirmDeleteId(null);
  };

  const handleOpen = (id: string) => {
    router.push(`/project/${id}`);
  };

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: t('buildings.filterAll') },
    { key: 'archived', label: t('buildings.filterArchived') },
  ];

  const filteredProjects =
    filter === 'archived'
      ? projects.filter((p) => p.archived)
      : projects.filter((p) => !p.archived);
  const totalCount = projects.length;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />

      <main id="main-content" className="relative flex-1 overflow-hidden bg-bg-base">
        <DotGrid />
        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col px-6 py-12 md:py-16">
          {/* Page header */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
                {t('landing.yourProjects')}
              </h1>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-text-tertiary">
                {t('landing.yourProjectsSubtitle')}
              </p>
            </div>

            {!isCreating && (
              <button
                onClick={() => setIsCreating(true)}
                className="flex h-12 items-center gap-2 bg-text-primary px-7 text-sm font-semibold uppercase tracking-wider text-text-inverse transition-all hover:opacity-90 active:scale-[0.98]"
              >
                <span className="text-lg leading-none">+</span>
                {t('buildings.createNew')}
              </button>
            )}
          </div>

          {/* Inline create form */}
          {isCreating && (
            <div className="mt-6 flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                  if (e.key === 'Escape') {
                    setIsCreating(false);
                    setNewName('');
                  }
                }}
                placeholder={t('buildings.namePlaceholder')}
                className="h-12 flex-1 border border-border-default bg-bg-base px-4 text-base text-text-primary placeholder:text-text-tertiary transition-colors focus:border-text-primary focus:outline-none focus:ring-3 focus:ring-text-primary/10"
                autoFocus
              />
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="h-12 bg-text-primary px-6 text-sm font-semibold uppercase tracking-wider text-text-inverse transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t('common.create')}
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewName('');
                }}
                className="h-12 border border-border-default px-5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-raised"
              >
                {t('common.cancel')}
              </button>
            </div>
          )}

          {/* Filter tabs */}
          <nav
            className="mt-10 flex gap-0 border-b border-border-default"
            aria-label="Project filters"
          >
            {filters.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`border-b-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  filter === key
                    ? 'border-text-primary text-text-primary'
                    : 'border-transparent text-text-tertiary hover:text-text-secondary'
                }`}
                aria-current={filter === key ? 'page' : undefined}
              >
                {label}
                {key === 'all' && (
                  <span className="ml-1.5 text-text-tertiary">
                    ({projects.filter((p) => !p.archived).length})
                  </span>
                )}
                {key === 'archived' && (
                  <span className="ml-1.5 text-text-tertiary">
                    ({projects.filter((p) => p.archived).length})
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Project table */}
          {filteredProjects.length === 0 ? (
            <div className="mt-1 flex-1 border border-t-0 border-border-default bg-bg-base">
              <div className="flex h-full flex-col items-center justify-center">
                {/* Empty state icon */}
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
                    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-text-secondary">
                  {t('buildings.noProjects')}
                </p>
                <p className="mt-1 text-sm text-text-tertiary">{t('buildings.emptyState')}</p>
                {!isCreating && (
                  <button
                    onClick={() => setIsCreating(true)}
                    className="mt-6 bg-text-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-text-inverse transition-all hover:opacity-90 active:scale-[0.98]"
                  >
                    <span className="mr-1.5 text-lg leading-none">+</span>
                    {t('buildings.createNew')}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-1 flex flex-1 flex-col border border-t-0 border-border-default bg-bg-base">
              {/* Table header */}
              <div className="hidden bg-bg-raised px-6 py-3 sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_auto] sm:gap-4">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">
                  {t('buildings.colProject')}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">
                  {t('buildings.colDate')}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">
                  {t('buildings.colTeui')}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">
                  {t('buildings.colTedi')}
                </span>
                <span className="w-10 text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">
                  {t('buildings.colAction')}
                </span>
              </div>

              {/* Project rows */}
              <div className="flex-1">
                {filteredProjects.map((project: BuildingSummary) => (
                  <div
                    key={project.id}
                    className="group grid grid-cols-1 items-center gap-2 border-b border-border-default bg-bg-base px-6 py-6 transition-colors hover:bg-bg-raised sm:grid-cols-[2fr_1fr_1fr_1fr_auto] sm:gap-4"
                  >
                    {/* Project name + type */}
                    <button
                      onClick={() => handleOpen(project.id)}
                      className="flex flex-col text-left"
                    >
                      <span className="text-sm font-bold uppercase tracking-wide text-text-primary">
                        {project.name || t('buildings.namePlaceholder')}
                      </span>
                      <span className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-text-tertiary">
                        {project.address || t('buildings.noType')}
                      </span>
                    </button>

                    {/* Date */}
                    <span className="font-mono text-xs tracking-wide text-text-secondary">
                      {formatDate(project.updatedAt)}
                    </span>

                    {/* TEUI metric bar */}
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-16 overflow-hidden bg-border-default">
                        <div
                          className="h-full bg-text-primary transition-all"
                          style={{ width: `${Math.min(100, 0)}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-semibold text-text-primary">
                        {'--'}
                      </span>
                    </div>

                    {/* TEDI metric bar */}
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-16 overflow-hidden bg-border-default">
                        <div
                          className="h-full bg-text-primary transition-all"
                          style={{ width: `${Math.min(100, 0)}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-semibold text-text-primary">
                        {'--'}
                      </span>
                    </div>

                    {/* Action menu */}
                    <div className="relative flex justify-end">
                      {confirmDeleteId === project.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDelete(project.id)}
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
                        <>
                          <button
                            onClick={() =>
                              setOpenMenuId(openMenuId === project.id ? null : project.id)
                            }
                            className="flex h-7 w-7 items-center justify-center text-text-tertiary opacity-0 transition-all hover:text-text-primary group-hover:opacity-100"
                            aria-label={`Actions for ${project.name}`}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <circle cx="12" cy="5" r="2" />
                              <circle cx="12" cy="12" r="2" />
                              <circle cx="12" cy="19" r="2" />
                            </svg>
                          </button>
                          {openMenuId === project.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenMenuId(null)}
                              />
                              <div className="absolute right-0 top-8 z-20 min-w-[140px] border border-border-default bg-bg-base py-1 shadow-elevated">
                                <button
                                  onClick={() => {
                                    handleOpen(project.id);
                                    setOpenMenuId(null);
                                  }}
                                  className="flex w-full px-4 py-2 text-left text-xs font-medium text-text-primary transition-colors hover:bg-bg-raised"
                                >
                                  {t('common.edit')}
                                </button>
                                <button
                                  onClick={() => {
                                    archiveProject(project.id, !project.archived);
                                    setOpenMenuId(null);
                                  }}
                                  className="flex w-full px-4 py-2 text-left text-xs font-medium text-text-primary transition-colors hover:bg-bg-raised"
                                >
                                  {project.archived
                                    ? t('buildings.unarchive')
                                    : t('buildings.archive')}
                                </button>
                                <div className="my-1 h-px bg-border-default" />
                                <button
                                  onClick={() => {
                                    setConfirmDeleteId(project.id);
                                    setOpenMenuId(null);
                                  }}
                                  className="flex w-full px-4 py-2 text-left text-xs font-medium text-red-600 transition-colors hover:bg-bg-raised dark:text-red-400"
                                >
                                  {t('common.delete')}
                                </button>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination footer pinned to bottom */}
              <div className="flex items-center justify-between border-t border-border-default px-6 py-3">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">
                  {t('buildings.showingCount', {
                    count: filteredProjects.length,
                    total: totalCount,
                  })}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled
                    className="flex h-7 w-7 items-center justify-center border border-border-default text-xs text-text-tertiary disabled:opacity-40"
                  >
                    &lt;
                  </button>
                  <button className="flex h-7 w-7 items-center justify-center border border-text-primary bg-text-primary text-xs font-semibold text-text-inverse">
                    1
                  </button>
                  <button
                    disabled
                    className="flex h-7 w-7 items-center justify-center border border-border-default text-xs text-text-tertiary disabled:opacity-40"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
