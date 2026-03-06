# src/store/

## Purpose

Zustand state management stores. Reactive layer between UI and data.

## Files

- `project.ts` — Project CRUD, building data, saved calculations, IndexedDB persistence (via Dexie)
- `ui.ts` — UI state: theme, locale, active calculator, active saved calculation

## Key Patterns

- **Zustand + Immer** — Immutable state updates via Immer middleware in project store
- **No persist middleware** — Manual IndexedDB sync via Dexie (not Zustand persist)
- **Derived calculations outside** — Stores hold raw data; TEUI calculations run in hooks/engine
- **Saved calculations** — `project.ts` manages per-project saved calculation snapshots with timestamps

## Data Flow

```
User Input -> Component -> store.updateBuilding(partial)
                               | (auto-saves to IndexedDB)
                          Zustand notifies subscribers
                               |
                          Component re-renders -> useTEUI1(building) -> engine
                               |
                          Results displayed
```

## Store: project.ts

- `building: Building | null` — Currently loaded project
- `projects: BuildingSummary[]` — All project summaries
- Actions: `createProject`, `loadProject`, `updateBuilding`, `deleteProject`, `archiveProject`
- Saved calculations: `saveCalculation`, `updateSavedCalculation`, `deleteSavedCalculation`

## Store: ui.ts

- `theme`, `locale`, `activeCalculator`, `activeSavedCalcId`
- Actions: `setTheme`, `setLocale`, `setActiveCalculator`, `setActiveSavedCalcId`
