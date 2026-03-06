'use client';

import { useEffect } from 'react';
import { use } from 'react';
import { useTranslations } from 'next-intl';
import { useProjectStore } from '@/store/project';
import { useRouter } from '@/i18n/navigation';
import { TEUI1Calculator } from '@/components/calculator/teui1/TEUI1Calculator';

type Props = {
  params: Promise<{ id: string; calcId: string }>;
};

export default function CalculatorPage({ params }: Props) {
  const { id, calcId } = use(params);
  const t = useTranslations();
  const router = useRouter();
  const { building, isLoading, loadProject } = useProjectStore();

  useEffect(() => {
    void loadProject(id);
  }, [id, loadProject]);

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

  if (calcId === 'teui-v1') {
    return <TEUI1Calculator />;
  }

  // Unsupported calculator — redirect back
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base">
      <div className="text-center">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">
          {building.meta.name}
        </p>
        <p className="mt-3 text-lg font-medium text-text-secondary">
          {calcId} — {t('catalog.comingSoon')}
        </p>
        <button
          onClick={() => router.push(`/project/${id}`)}
          className="mt-4 text-sm text-text-tertiary underline-offset-2 hover:text-text-primary hover:underline"
        >
          {t('common.back')}
        </button>
      </div>
    </div>
  );
}
