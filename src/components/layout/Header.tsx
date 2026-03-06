'use client';

import { useRouter } from '@/i18n/navigation';
import { ThemeLocaleToggles } from './ThemeLocaleToggles';

export function Header() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-bg-surface">
      <div
        className="flex h-14 items-center justify-between px-4 md:px-6"
        style={{ paddingTop: 'var(--safe-top)' }}
      >
        {/* Logo + branding */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="flex items-center gap-3">
            <svg
              viewBox="-1 -1 110 110"
              fill="currentColor"
              className="h-6 w-6 text-text-primary"
              aria-hidden="true"
            >
              <path
                d="M102.69,12.11v18.4a54.9,54.9,0,0,0-25.3-25.3h18.4V-.19H-.11v95.9h5.4V77.31a54.9,54.9,0,0,0,25.3,25.3H12.19V108h95.9V12.11ZM5.29,5.21h25.3a54.9,54.9,0,0,0-25.3,25.3Zm0,48.7A48.7,48.7,0,1,1,54,102.61,48.76,48.76,0,0,1,5.29,53.91Zm72.2,48.7a54.9,54.9,0,0,0,25.3-25.3v25.3Z"
                transform="translate(0.11 0.19)"
              />
            </svg>
            <span className="text-sm font-medium tracking-wide text-text-primary">OAA</span>
          </button>
        </div>

        {/* Right actions */}
        <ThemeLocaleToggles />
      </div>
    </header>
  );
}
