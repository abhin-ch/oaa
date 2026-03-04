'use client';

import { useEffect, useMemo } from 'react';
import { use } from 'react';
import { useTranslations } from 'next-intl';
import { useProjectStore } from '@/store/project';
import { useUIStore } from '@/store/ui';
import { AppShell } from '@/components/layout/AppShell';
import { WizardContainer } from '@/components/wizard/WizardContainer';
import { LiveResultsPanel } from '@/components/charts/LiveResultsPanel';

type Props = {
  params: Promise<{ id: string }>;
};

export default function ProjectWizardPage({ params }: Props) {
  const { id } = use(params);
  const t = useTranslations();
  const { building, isLoading, loadProject } = useProjectStore();
  const { setStep } = useUIStore();

  useEffect(() => {
    void loadProject(id);
    setStep(1);
  }, [id, loadProject, setStep]);

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

  return (
    <AppShell results={<LiveResultsPanel />}>
      <WizardContainer />
    </AppShell>
  );
}
