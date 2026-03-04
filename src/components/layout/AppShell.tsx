'use client';

import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomTabBar } from './BottomTabBar';

interface AppShellProps {
  children: React.ReactNode;
  results?: React.ReactNode;
}

export function AppShell({ children, results }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-bg-base">
      <Header />

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Main content area */}
        <main className="flex flex-1 flex-col overflow-hidden lg:flex-row">
          {/* Input panel (40% on desktop) */}
          <div className="flex-1 overflow-y-auto p-4 pb-32 md:p-6 lg:max-w-[45%] lg:pb-6">
            {children}
          </div>

          {/* Results panel (60% on desktop) — sticky */}
          {results && (
            <div className="hidden border-l border-border-default bg-bg-surface lg:block lg:flex-1 lg:overflow-y-auto lg:p-6">
              {results}
            </div>
          )}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <BottomTabBar />
    </div>
  );
}
