# Optimization Audit Report

**Date:** 2026-03-05
**Codebase:** OAA TEUI Platform
**Scope:** Full codebase (77 source files, ~6,779 LOC)

## Executive Summary

- **Total findings:** 18
- **High impact:** 3 | **Medium impact:** 7 | **Low impact:** 8
- **Estimated lines removable/consolidatable:** ~150-200
- **Estimated dependencies removable:** 0 production (all used), 0 dev (all justified)
- **Key themes:** (1) Duplicated modal/input boilerplate, (2) Large components needing split, (3) Build config debt (`ignoreBuildErrors`)

The codebase is in good shape — prior optimization pass removed unused deps and dead code. Remaining opportunities are consolidation and structural refinements.

---

## Findings by Category

### Phase 1: Dependency & Import Analysis

**OPT-001 — `lucide-react` heavily under-utilized**
| Field | Value |
|-------|-------|
| Category | Heavy Dependency Used Lightly |
| Location | `src/components/ui/dialog.tsx`, `src/components/ui/sheet.tsx` |
| Problem | Only `XIcon` is imported from a 577+ icon library (~50KB). |
| Recommendation | Replace with inline SVG for the close icon, or keep if more icons are planned soon. |
| Impact | **Low** — tree-shaking mitigates most of it |
| Risk | None |

**OPT-002 — `tw-animate-css` minimal usage**
| Field | Value |
|-------|-------|
| Category | Dependency Optimization |
| Location | `src/app/globals.css:1` — `@import 'tw-animate-css'` |
| Problem | Only imported once for CSS animations. Could be replaced with native Tailwind or Framer Motion. |
| Recommendation | Audit which animation classes are actually used; consider removing if few. |
| Impact | **Low** |
| Risk | Need to verify which animation classes are consumed |

**OPT-003 — `immer` is indirect-only dependency**
| Field | Value |
|-------|-------|
| Category | Dependency Classification |
| Location | `package.json:41`, used via `zustand/middleware/immer` in `src/store/project.ts:2` |
| Problem | Listed as direct dependency but only consumed through Zustand middleware. It's a peer dep of zustand. |
| Recommendation | Verify if pnpm auto-resolves it as peer dep; if so, remove from explicit dependencies. |
| Impact | **Low** — no bundle change |
| Risk | Low. Test that zustand/middleware/immer still resolves. |

---

### Phase 2: Dead Code & Redundancy

**OPT-004 — Unused CSS class `.building-scene-sm`**
| Field | Value |
|-------|-------|
| Category | Dead Code |
| Location | `src/app/globals.css:342-350` |
| Problem | Defined but never referenced in any component. Planned compact variant never implemented. |
| Recommendation | Delete the 9-line block. |
| Impact | **Low** — 9 lines |
| Risk | None |

**OPT-005 — `isRunningAsStandalone()` unused utility**
| Field | Value |
|-------|-------|
| Category | Dead Code (needs verification) |
| Location | `src/hooks/usePWAInstall.ts` |
| Problem | Function defined but not called from any component. |
| Recommendation | Flag as "keep for now" — useful PWA infrastructure for planned install button. |
| Impact | **Low** |
| Risk | None — leave in place |

**OPT-006 — Naming collision: `Building` interface in EnergyFlowBg**
| Field | Value |
|-------|-------|
| Category | Redundancy / Confusion |
| Location | `src/components/landing/EnergyFlowBg.tsx:5-17` |
| Problem | Local `Building` interface shadows the schema `Building` type from `src/schema/building.ts`. Different shape, same name. |
| Recommendation | Rename to `CanvasBuilding` or `EnergyFlowBuilding`. |
| Impact | **Low** — clarity improvement |
| Risk | None |

---

### Phase 3: Consolidation Opportunities

**OPT-007 — Duplicated modal escape-key handler (2 instances)**
| Field | Value |
|-------|-------|
| Category | Extractable Pattern |
| Location | `src/components/calculator/SaveCalculationModal.tsx:28-34`, `src/components/landing/LoginModal.tsx:25-31` |
| Problem | Identical `useEffect` for escape-key-to-close in both modals (6 lines each). |
| Recommendation | Extract `useEscapeToClose(open, onClose)` hook. |
| Impact | **Medium** — eliminates 12 duplicate lines, prevents future drift |
| Risk | None |

**OPT-008 — Duplicated modal focus-on-open pattern (2 instances)**
| Field | Value |
|-------|-------|
| Category | Extractable Pattern |
| Location | `src/components/calculator/SaveCalculationModal.tsx:23`, `src/components/landing/LoginModal.tsx:20` |
| Problem | Identical `setTimeout(() => inputRef.current?.focus(), 100)` in both modals. |
| Recommendation | Extract `useFocusOnOpen(open, ref)` hook. Combine with OPT-007 into `useModalControls`. |
| Impact | **Low** |
| Risk | None |

**OPT-009 — Duplicated `setField` boilerplate in tab components (3 instances)**
| Field | Value |
|-------|-------|
| Category | Extractable Pattern |
| Location | `src/components/calculator/teui1/inputs/EnergyBillsTab.tsx:17-21`, `RenewablesTab.tsx:16-20`, `ProjectTab.tsx:20-24` |
| Problem | Identical field setter pattern in 3 tab components: `function setField(field, value) { onUpdate({ [section]: { ...state, [field]: value } }); }` |
| Recommendation | Extract `useFieldUpdater(section, state, onUpdate)` hook. |
| Impact | **Medium** — eliminates 12 lines of boilerplate |
| Risk | None |

**OPT-010 — Duplicated number input validation (2-3 instances)**
| Field | Value |
|-------|-------|
| Category | Extractable Pattern |
| Location | `src/components/calculator/teui1/inputs/AreaInput.tsx:21-28`, `EnergySourceInput.tsx:26-29` |
| Problem | Same `parseFloat` + `isNaN` + clamp-to-zero logic repeated. |
| Recommendation | Extract `parsePositiveNumber(raw: string): number` to `src/lib/validation.ts`. |
| Impact | **Low** |
| Risk | None |

**OPT-011 — Modal wrapper structure duplicated (2 instances)**
| Field | Value |
|-------|-------|
| Category | Mergeable Components |
| Location | `src/components/calculator/SaveCalculationModal.tsx:42-133`, `src/components/landing/LoginModal.tsx:33-165` |
| Problem | Both modals share: identical AnimatePresence wrapper, same backdrop, same OAA logo SVG (~20 lines), same close button pattern. ~60 lines of shared structure. |
| Recommendation | Extract `<ModalBase open onClose title>children</ModalBase>` component. |
| Impact | **Medium** — eliminates ~60 duplicate lines |
| Risk | Low. Internal refactor. |

**OPT-012 — `useMemo(createCardMaterial, [])` repeated across building-parts (6+ instances)**
| Field | Value |
|-------|-------|
| Category | Extractable Pattern |
| Location | `DashboardCard.tsx:7`, `FloorPlanCard.tsx:9`, `SankeyCard.tsx:7`, `EnergyMeter.tsx:9`, `InsulationLayer.tsx:8`, `BuildingCore.tsx:8` |
| Problem | Same memoized material creation calls repeated in 6+ components. |
| Recommendation | Create shared material instances or `useMaterial(factory)` hook in `materials.ts`. Materials are already centralized in factory functions — just pre-create and export instances. |
| Impact | **Medium** — reduces ~30 lines of boilerplate |
| Risk | Low. Verify materials aren't mutated by THREE.js. |

---

### Phase 4: Structural Simplification

**OPT-013 — `CalculatorCatalog.tsx` is ~499 lines**
| Field | Value |
|-------|-------|
| Category | File Granularity |
| Location | `src/components/project/CalculatorCatalog.tsx` |
| Problem | Single file handles: saved calculations table, calculator grid, search/filter, pagination, delete modal, tab navigation. |
| Recommendation | Extract `SavedCalculationsTable`, `CalculatorGrid`, and the delete confirmation into separate files. |
| Impact | **Medium** — readability, testability |
| Risk | Low. Internal refactor. |

**OPT-014 — `projects/page.tsx` is ~371 lines**
| Field | Value |
|-------|-------|
| Category | File Granularity |
| Location | `src/app/[locale]/projects/page.tsx` |
| Problem | Page handles project list, filtering, sorting, creation modal, and table rendering. Convention says pages should be thin orchestrators. |
| Recommendation | Extract `ProjectTable` and `CreateProjectModal` into `src/components/project/`. |
| Impact | **Low** |
| Risk | Low |

**OPT-015 — ResultsPanel nested conditionals (4+ levels deep)**
| Field | Value |
|-------|-------|
| Category | Complex Control Flow |
| Location | `src/components/calculator/teui1/results/ResultsPanel.tsx:42-180` |
| Problem | Deeply nested ternaries for tab content: `!hasAnything ? ... : activeTab === 'results' ? (hasEnergy ? ... : null)`. Hard to follow. |
| Recommendation | Extract `<ResultsTabContent>` and `<EnergyMixTabContent>` sub-components. |
| Impact | **Low** — readability improvement |
| Risk | None |

---

### Phase 5: Type & Validation

**OPT-016 — Occupancy type coercion duplicated**
| Field | Value |
|-------|-------|
| Category | Duplicated Validation |
| Location | `src/components/project/CalculatorCatalog.tsx:79`, `src/components/calculator/teui1/TEUI1Calculator.tsx:84` |
| Problem | Both files coerce occupancy with `typeof rawOccupancy === 'string' ? rawOccupancy : 'residential'`. Suggests weak typing upstream. |
| Recommendation | Ensure `building.occupancy` is always typed as `OccupancyType` in schema, removing need for runtime coercion. |
| Impact | **Low** |
| Risk | Low. Schema change. |

---

### Phase 6: Configuration & Build

**OPT-017 — `ignoreBuildErrors: true` in next.config.ts**
| Field | Value |
|-------|-------|
| Category | Build Config |
| Location | `next.config.ts:8-10` |
| Problem | TypeScript errors silently ignored during build. Masks real issues, allows type regressions. Root cause: `@types/react@19.x` EventTarget conflicts. |
| Recommendation | Fix root EventTarget type conflicts and remove `ignoreBuildErrors`. Most impactful quality improvement possible. |
| Impact | **High** — prevents silent type regressions |
| Risk | High effort. May require significant type fixes or `@ts-expect-error` annotations. |

**OPT-018 — No code splitting for heavy 3D components**
| Field | Value |
|-------|-------|
| Category | Build Optimization |
| Location | `src/components/landing/LandingHero.tsx`, building-parts components |
| Problem | Three.js + React Three Fiber (~800KB) loaded synchronously on landing page. Users on slow connections pay full cost upfront. |
| Recommendation | Lazy-load the 3D scene with `next/dynamic` + loading skeleton. The `IsometricBuilding` component is already dynamically imported — verify the full R3F chunk is actually deferred. |
| Impact | **High** — significant first-load improvement for non-cached visits |
| Risk | Medium. Need to verify SSR behavior and loading states. |

---

## Prioritized Action Plan

### Quick Wins (< 30 min each, low risk)

1. **OPT-004**: Delete `.building-scene-sm` CSS class (9 lines)
2. **OPT-006**: Rename `Building` to `CanvasBuilding` in EnergyFlowBg
3. **OPT-010**: Extract `parsePositiveNumber()` utility
4. **OPT-007+008**: Extract `useModalControls(open, onClose, ref)` hook

### Medium Effort (1-2 hours, moderate risk)

1. **OPT-011**: Create `<ModalBase>` wrapper component (~60 lines saved)
2. **OPT-009**: Extract `useFieldUpdater` hook for tab components
3. **OPT-012**: Pre-create shared THREE.js material instances in `materials.ts`
4. **OPT-013**: Split `CalculatorCatalog.tsx` into sub-components

### Larger Refactors (half-day+, needs careful testing)

1. **OPT-017**: Fix TypeScript build errors, remove `ignoreBuildErrors`
2. **OPT-018**: Verify/improve code splitting for Three.js bundle
3. **OPT-014+015**: Split large page/component files

---

## Risks & Verification Needed

- **OPT-003**: Test `immer` removal from explicit deps — zustand may need it as peer
- **OPT-012**: Verify THREE.js materials aren't mutated when shared across components
- **OPT-017**: Requires full type audit — significant effort, highest quality reward
- **OPT-018**: Verify dynamic import boundaries for R3F chunk with Next.js bundle analyzer

---

## Previous Report Status

The prior optimization report (pre-2026-03-05) identified items OPT-001 through OPT-005 (unused deps: d3, recharts, sonner, next-themes; dead files: haptics.ts, badge/toggle/tooltip/separator). **All have been actioned** — those deps are removed and files deleted in the current working tree.
