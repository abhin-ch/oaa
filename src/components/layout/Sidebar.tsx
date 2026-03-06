'use client';

// Sidebar will be rebuilt when wizard steps are implemented per TEUI version
export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-border-default bg-bg-surface lg:block">
      <nav className="flex flex-col gap-1 p-4" aria-label="Navigation">
        {/* Wizard step nav will go here */}
      </nav>
    </aside>
  );
}
