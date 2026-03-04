'use client';

import { useUIStore } from '@/store/ui';

export function Header() {
  const { theme, setTheme } = useUIStore();

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);

    // Apply to document
    if (
      next === 'dark' ||
      (next === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const themeIcon = theme === 'dark' ? '☀️' : theme === 'light' ? '🌙' : '💻';

  return (
    <header className="sticky top-0 z-50 border-b border-border-default bg-bg-surface/80 backdrop-blur-xl supports-[backdrop-filter]:bg-bg-surface/60">
      <div
        className="flex h-14 items-center justify-between px-4 md:px-6"
        style={{ paddingTop: 'var(--safe-top)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight text-text-primary">OBJECTIVE</span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            className="rounded-md px-2 py-1 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-raised hover:text-text-primary"
            aria-label="Switch language"
          >
            EN
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-bg-raised hover:text-text-primary"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            <span className="text-sm">{themeIcon}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
