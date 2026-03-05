'use client';

import { useTranslations } from 'next-intl';

export function SkipToContent() {
  const t = useTranslations();

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-energy-400 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-text-primary focus:shadow-lg"
    >
      {t('a11y.skipToContent')}
    </a>
  );
}
