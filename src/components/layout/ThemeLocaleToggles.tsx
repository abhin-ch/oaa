'use client';

import { useTranslations } from 'next-intl';
import { useUIStore } from '@/store/ui';
import { useRouter, usePathname } from '@/i18n/navigation';

function SunIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

interface ThemeLocaleTogglesProps {
  iconSize?: number;
  className?: string;
}

export function ThemeLocaleToggles({ iconSize = 16, className = '' }: ThemeLocaleTogglesProps) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme, locale, setLocale } = useUIStore();

  const isDark = theme === 'dark';

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
    if (next === 'dark') {
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

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        onClick={toggleLocale}
        className="px-2 py-1 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
        aria-label={t('a11y.languageSwitch')}
      >
        {locale === 'en' ? 'FR' : 'EN'}
      </button>
      <button
        onClick={toggleTheme}
        className="flex h-8 w-8 items-center justify-center text-text-secondary transition-colors hover:text-text-primary"
        aria-label={t('a11y.themeToggle')}
      >
        {isDark ? <SunIcon size={iconSize} /> : <MoonIcon size={iconSize} />}
      </button>
    </div>
  );
}
