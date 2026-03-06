'use client';

import { useEffect } from 'react';
import { use } from 'react';
import { useTranslations } from 'next-intl';
import { useProjectStore } from '@/store/project';
import { CalculatorCatalog } from '@/components/project/CalculatorCatalog';

type Props = {
  params: Promise<{ id: string }>;
};

export default function ProjectPage({ params }: Props) {
  const { id } = use(params);
  const t = useTranslations();
  const { building, isLoading, loadProject, loadSavedCalculations } = useProjectStore();

  useEffect(() => {
    void loadProject(id).then(() => loadSavedCalculations());
  }, [id, loadProject, loadSavedCalculations]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-base">
        <p className="text-sm text-text-tertiary">{t('common.loading')}</p>
      </div>
    );
  }

  if (!building) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-base">
        <div className="text-center">
          <p className="text-lg font-medium text-text-secondary">{t('errors.projectNotFound')}</p>
        </div>
      </div>
    );
  }

  return <CalculatorCatalog />;
}
