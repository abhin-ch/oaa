# src/store/

## Purpose

Zustand state management stores. These are the reactive layer between UI and data — components read from stores, dispatch updates, and the stores handle persistence.

## Structure

```
store/
├── project.ts    # Current project's Building data + CRUD operations
└── ui.ts         # UI state (wizard step, theme, sidebar, modals)
```

## Design Rules

1. **Zustand with slices** — Each store is a standalone Zustand store. No monolithic global store.
2. **Persistence middleware** — `project.ts` uses Zustand's `persist` middleware backed by IndexedDB (via Dexie adapter). Every change auto-saves.
3. **Derived calculations live outside** — Stores hold raw Building data. TEUI calculations happen in `src/engine/` modules called from hooks or components, not inside the store.
4. **Undo/redo** — `project.ts` maintains a state history stack for undo/redo of building data changes. Use Zustand's `temporal` middleware or a custom implementation.
5. **Immutable updates** — Use Immer (via Zustand middleware) or spread patterns. Never mutate state directly.

## Store: `project.ts`

- `building: Building` — The current project data
- `projects: BuildingSummary[]` — List of all saved projects (id, name, updatedAt)
- Actions: `createProject()`, `loadProject(id)`, `updateBuilding(partial)`, `deleteProject(id)`
- `undo()` / `redo()` — State history navigation
- Auto-persists to IndexedDB on every change

## Store: `ui.ts`

- `currentStep: number` — Active wizard step (1–7)
- `theme: 'light' | 'dark' | 'system'`
- `sidebarOpen: boolean`
- `locale: 'en' | 'fr'` — Current language (synced with next-intl)
- Actions: `setStep()`, `nextStep()`, `prevStep()`, `setTheme()`, `toggleSidebar()`

## Data Flow

```
User Input → Component → store.updateBuilding({ envelope: ... })
                              ↓ (auto-persist to IndexedDB)
                         Zustand notifies subscribers
                              ↓
                         Component re-renders → calls engine.calculateTEUI(building)
                              ↓
                         Results displayed
```

## Status

- [ ] Project store with CRUD + persistence
- [ ] UI store (wizard navigation, theme)
- [ ] Undo/redo middleware
- [ ] IndexedDB persistence adapter
