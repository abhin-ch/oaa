'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useProjectStore } from '@/store/project';
import { useRouter } from '@/i18n/navigation';
import type { BuildingSummary } from '@/schema/building';

export default function ProjectListPage() {
  const t = useTranslations();
  const router = useRouter();
  const { projects, createProject, deleteProject, refreshProjectList } = useProjectStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-12 md:px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-text-primary">{t('meta.appName')}</h1>
        <p className="mt-2 text-lg text-text-secondary">{t('meta.appDescription')}</p>
        <p className="mt-1 text-sm text-text-tertiary">{t('meta.tagline')}</p>
      </div>

      {/* Create button */}
      <div className="mb-6">
        {isCreating ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder={t('wizard.step1.namePlaceholder')}
              className="h-11 flex-1 rounded-lg border border-border-default bg-bg-surface px-3.5 text-base text-text-primary placeholder:text-text-tertiary transition-colors focus:border-energy-400 focus:outline-none focus:ring-3 focus:ring-energy-100"
              autoFocus
            />
            <button
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="rounded-lg bg-energy-400 px-5 py-2.5 text-sm font-medium text-text-primary transition-all hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t('common.create')}
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewName('');
              }}
              className="rounded-lg border border-border-default px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-raised"
            >
              {t('common.cancel')}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full rounded-lg bg-energy-400 px-5 py-3 text-sm font-medium text-text-primary transition-all hover:brightness-105 active:scale-[0.98]"
          >
            + {t('buildings.createNew')}
          </button>
        )}
      </div>

      {/* Project list */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border-default bg-bg-surface py-16">
          <p className="text-lg font-medium text-text-secondary">{t('buildings.noProjects')}</p>
          <p className="mt-1 text-sm text-text-tertiary">{t('buildings.emptyState')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {projects.map((project: BuildingSummary) => (
            <div
              key={project.id}
              className="group relative flex items-center justify-between rounded-xl border border-border-default bg-bg-surface p-4 transition-colors hover:bg-bg-raised"
            >
              <button
                onClick={() => handleOpen(project.id)}
                className="flex flex-1 flex-col text-left"
              >
                <span className="text-sm font-medium text-text-primary">
                  {project.name || t('wizard.step1.namePlaceholder')}
                </span>
                {project.address && (
                  <span className="mt-0.5 text-xs text-text-tertiary">{project.address}</span>
                )}
                <span className="mt-1 text-xs text-text-tertiary">
                  {t('buildings.lastEdited', { date: formatDate(project.updatedAt) })}
                  {project.conditionedAreaM2 > 0 && ` · ${project.conditionedAreaM2} m²`}
                </span>
              </button>

              {/* Delete */}
              {confirmDeleteId === project.id ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="rounded-md bg-warning-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-warning-600"
                  >
                    {t('common.delete')}
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="rounded-md border border-border-default px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-raised"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDeleteId(project.id)}
                  className="rounded-md px-2 py-1 text-xs text-text-tertiary opacity-0 transition-all hover:bg-warning-50 hover:text-warning-500 group-hover:opacity-100"
                  aria-label={`${t('common.delete')} ${project.name}`}
                >
                  {t('common.delete')}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
