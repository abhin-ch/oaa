'use client';

import { useTranslations } from 'next-intl';
import { useUIStore } from '@/store/ui';
import { useRouter, usePathname } from '@/i18n/navigation';

export function Header() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme, locale, setLocale } = useUIStore();

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);

    if (
      next === 'dark' ||
      (next === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleLocale = () => {
    const nextLocale = locale === 'en' ? 'fr' : 'en';
    setLocale(nextLocale);
    router.replace(pathname, { locale: nextLocale });
  };

  const themeIcon = theme === 'dark' ? '☀️' : theme === 'light' ? '🌙' : '💻';

  return (
    <header className="sticky top-0 z-50 border-b border-border-default bg-bg-surface/80 backdrop-blur-xl supports-[backdrop-filter]:bg-bg-surface/60">
      <div
        className="flex h-14 items-center justify-between px-4 md:px-6"
        style={{ paddingTop: 'var(--safe-top)' }}
      >
        {/* Logo */}
        <button onClick={() => router.push('/')} className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight text-text-primary">
            {t('meta.appName')}
          </span>
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={toggleLocale}
            className="rounded-md px-2 py-1 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-raised hover:text-text-primary"
            aria-label={t('a11y.languageSwitch')}
          >
            {locale === 'en' ? 'FR' : 'EN'}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-bg-raised hover:text-text-primary"
            aria-label={t('a11y.themeToggle')}
          >
            <span className="text-sm">{themeIcon}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
