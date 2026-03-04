import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { use } from 'react';

type Props = {
  params: Promise<{ locale: string }>;
};

export default function Home({ params }: Props) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">{t('meta.appName')}</h1>
        <p className="mt-2 text-lg text-text-secondary">{t('meta.appDescription')}</p>
        <p className="mt-4 text-sm text-text-tertiary">{t('meta.tagline')}</p>
      </div>
    </main>
  );
}
