'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { ThemeLocaleToggles } from '@/components/layout/ThemeLocaleToggles';

interface LandingNavProps {
  onLogin: () => void;
}

export function LandingNav({ onLogin }: LandingNavProps) {
  const t = useTranslations();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-bg-base/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* OAA mark */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-3"
          aria-label="Home"
        >
          <svg
            viewBox="-1 -1 110 110"
            fill="currentColor"
            className="h-7 w-7 text-text-primary"
            aria-hidden="true"
          >
            <path
              d="M102.69,12.11v18.4a54.9,54.9,0,0,0-25.3-25.3h18.4V-.19H-.11v95.9h5.4V77.31a54.9,54.9,0,0,0,25.3,25.3H12.19V108h95.9V12.11ZM5.29,5.21h25.3a54.9,54.9,0,0,0-25.3,25.3Zm0,48.7A48.7,48.7,0,1,1,54,102.61,48.76,48.76,0,0,1,5.29,53.91Zm72.2,48.7a54.9,54.9,0,0,0,25.3-25.3v25.3Z"
              transform="translate(0.11 0.19)"
            />
          </svg>
          <span className="text-sm font-medium tracking-wide text-text-primary">OAA</span>
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <ThemeLocaleToggles iconSize={18} />
          <button
            onClick={onLogin}
            className="bg-text-primary px-5 py-2 text-sm font-medium text-text-inverse transition-all hover:opacity-90 active:scale-[0.98]"
          >
            {t('landing.cta')}
          </button>
        </div>
      </div>
    </header>
  );
}
