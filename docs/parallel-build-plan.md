# Parallel Build Plan

> All 4 phases built concurrently across 6 independent work streams.

---

## Why This Works

Most of the codebase has **no cross-dependencies**:

- TEUI1–4 engines are pure TS functions — they don't know about React
- UI components don't know about calculation logic — they just render data
- The schema is just TypeScript interfaces — zero runtime code
- Shared services (units, carbon, climate) are standalone utilities
- Charts, wizard steps, and layout are independent component trees

The only real constraint: **everything reads from the Building schema**, so that's defined first (30 minutes of work), then everything else fans out.

---

## Dependency Graph

```
                        ┌─────────────┐
                        │  GATE 0     │
                        │  Scaffolding│  ← Project init, configs, tooling
                        │  (1 task)   │
                        └──────┬──────┘
                               │
                        ┌──────▼──────┐
                        │  GATE 1     │
                        │  Schema +   │  ← Building types, DB setup, store shell
                        │  Data Layer │
                        │  (1 task)   │
                        └──────┬──────┘
                               │
          ┌────────────┬───────┼───────┬────────────┐
          ▼            ▼       ▼       ▼            ▼
    ┌──────────┐ ┌─────────┐ ┌────┐ ┌─────────┐ ┌──────────┐
    │ Stream A │ │Stream B │ │ C  │ │Stream D │ │ Stream E │
    │ Engines  │ │Shared   │ │i18n│ │UI Comps │ │ PWA +    │
    │ T1,2,3,4 │ │Services │ │    │ │ + Pages │ │ Mobile   │
    └────┬─────┘ └────┬────┘ └─┬──┘ └────┬────┘ └────┬─────┘
         │            │        │         │            │
         └────────────┴────────┴────┬────┴────────────┘
                                    │
                             ┌──────▼──────┐
                             │  GATE 2     │
                             │  Integration│  ← Wire engines to UI, end-to-end
                             │  + Polish   │
                             └─────────────┘
```

Everything between Gate 1 and Gate 2 runs **simultaneously**.

---

## Gate 0 — Scaffolding (Do First, ~30 min)

One sequential setup task. Nothing else can start until this is done.

```
0.1  pnpm create next-app (App Router, TypeScript, Tailwind, ESLint)
0.2  Install core deps:
       shadcn/ui init + base components (button, input, slider, dialog, tooltip, tabs, sheet)
       zustand, dexie, next-intl, d3, recharts, geist font
       vitest, @testing-library/react, playwright
       husky, lint-staged, prettier
0.3  Configure:
       tsconfig.json (strict: true, paths)
       tailwind.config.ts (custom colors, fonts, shadows from design-system.md)
       .prettierrc, .eslintrc (import sorting, strict rules)
       husky pre-commit hook (lint-staged → prettier + eslint)
0.4  CSS custom properties (light + dark mode tokens from design-system.md)
0.5  Geist Sans + Geist Mono font setup in root layout
0.6  Folder structure created (all dirs from plan.md, empty CLAUDE.md files already exist)
0.7  Verify: pnpm dev runs, pnpm build succeeds, pnpm test runs (0 tests)
```

**Output**: Empty but fully configured project. Every stream can start.

---

## Gate 1 — Schema + Data Layer (Do Second, ~1 hr)

Must complete before streams fan out, because every stream imports these types.

```
1.1  src/schema/building.ts
       Full Building interface + all sub-types (EnvelopeWall, HVACSystem, etc.)
       Default factory: createEmptyBuilding() → Building with all defaults
       Schema version constant: SCHEMA_VERSION = 1
       Validation helpers: isValidForTEUI1(b), isValidForTEUI2(b), etc.

1.2  src/db/index.ts
       Dexie database class: ObjectiveDB
       Tables: projects (id, meta.name, meta.updatedAt), climateCache
       CRUD helpers: createProject, getProject, listProjects, updateProject, deleteProject

1.3  src/store/project.ts
       Zustand store shell: building state, CRUD actions
       Persist middleware → Dexie adapter (or localStorage for now, Dexie later)
       updateBuilding(partial) with Immer

1.4  src/store/ui.ts
       Zustand store: currentStep, theme, locale, sidebarOpen
       Actions: setStep, nextStep, prevStep, setTheme, setLocale
```

**Output**: Types, persistence, and state management ready. All streams can import from `@/schema`, `@/store`, `@/db`.

---

## Stream A — Calculation Engines (Pure TS, No UI)

All 4 engines built in parallel. Each is a standalone module with tests.

### A.1: TEUI1 Engine

```
src/engine/teui1.ts
  calculateTEUI1(building: Building) → TEUI1Result
    - Sum energy sources (electricity kWh + gas→kWh + oil→kWh + wood→kWh)
    - Subtract renewables
    - Divide by area
    - Calculate GHGI (apply emission factors per source)
    - Return { teui, ghgi, breakdown: { electricity, gas, oil, wood, renewables } }

tests/engine/teui1.test.ts
    - Known scenario from research.md (20,000 kWh + 10,000 m³ gas / 1,000 m²)
    - Zero area → error
    - No gas → electricity only
    - Renewables exceed consumption → net-zero/negative
    - All fuel types combined
```

### A.2: TEUI2 Engine

```
src/engine/teui2.ts
  calculateTEUI2(building: Building) → TEUI2Result
    - Everything in TEUI1
    - Add renewable offsets (PV, wind, geo, RECs, green gas)
    - Add occupancy normalization (per-capita metrics)
    - Add embodied carbon (if provided)
    - Add benchmark comparison (% of code max, % of national average)
    - Return { ...teui1, tediSimplified, embodiedCarbon, benchmarkComparison }

tests/engine/teui2.test.ts
    - Renewables fully offset → net zero TEUI
    - Benchmark comparison: building at exactly code max → 100%
    - Embodied carbon adds to total lifecycle
    - Missing optional fields → graceful defaults
```

### A.3: TEUI3 Engine

```
src/engine/teui3.ts
  calculateTEUI3(building: Building) → TEUI3Result
    Full energy balance:
    - Transmission losses: Σ(U × A) × HDD × 24 / 1000
    - Ventilation losses: ρ × Cp × ACH × V × HDD × 24 / 1000
    - Infiltration losses: same formula with infiltration ACH
    - Internal gains: (lighting + equipment + occupants) × hours × area
    - Solar gains: Σ(window A × SHGC × solar irradiance by orientation)
    - Net heating demand = losses - gains (clamped ≥ 0)
    - Net cooling demand = gains - losses for cooling season (clamped ≥ 0)
    - Heating energy = heating demand / heating COP
    - Cooling energy = cooling demand / cooling COP
    - Total = heating + cooling + electrical base loads
    - TEUI = total / area
    - TEDI = heating demand / area (before COP)

  Three models computed in parallel:
    - Reference: override building with code-minimum values
    - Design: use building as-is
    - Actual: if actuals provided, use those instead of calculated

  Return { teui, tedi, ghgi, energyBalance, referenceModel, designModel, actualModel }

tests/engine/teui3.test.ts
    - Known energy balance: manually computed envelope loss matches
    - HDD=0 → zero heating demand
    - Perfect insulation (U=0) → only ventilation/infiltration losses
    - COP=1 vs COP=3 → 3x energy reduction
    - Reference vs design model: design with better envelope → lower TEUI
    - Actual model uses real data, ignores calculated
```

### A.4: TEUI4 Engine

```
src/engine/teui4.ts
  calculateTEUI4(building: Building) → TEUI4Result
    - Wraps TEUI3 for all three models
    - Adds: generateSankeyData() → nodes[] + links[] for D3
    - Adds: compareScenarios(buildingA, buildingB) → diff of all metrics
    - Adds: calibrateActual(building, monthlyBills) → adjusted model
    - Adds: optimizationHints(building) → suggestions with estimated impact

  Return { ...teui3, sankeyData, scenarioComparison?, optimizationHints }

tests/engine/teui4.test.ts
    - Sankey data: nodes + links sum correctly (energy in = energy out + losses)
    - Scenario comparison: changing R-value produces correct delta
    - Calibration: actual bills adjust model proportionally
    - Optimization hints: worst-performing component flagged first
```

### A.5: Shared Service Modules (Can parallel with A.1–A.4)

```
src/engine/shared/units.ts
  - gasM3ToKwh(m3) → kWh    (× 0.0373 × 277)
  - oilLToKwh(l) → kWh      (× 0.0383 × 277)
  - woodM3ToKwh(m3) → kWh   (× ~1000)
  - gjToKwh(gj) → kWh       (× 277)
  - All with inverse functions
  - Tests: round-trip conversions, known values from research.md

src/engine/shared/carbon.ts
  - getEmissionFactor(source, province) → kgCO2/kWh
  - Ontario grid: 0.04 kgCO2/kWh
  - Gas: 2.63 kgCO2/m³ (→ convert to per-kWh)
  - Oil, wood factors
  - calculateGHGI(energyBreakdown, area, province) → kgCO2e/m²
  - Tests: known building → known GHGI

src/engine/shared/benchmarks.ts
  - Code benchmark values by standard (NECB, SB-10, SB-12, NBC tiers)
  - National/provincial averages by building type
  - getBenchmark(standard, buildingType) → { teui, tedi, ghgi }
  - compareToBaseline(result, benchmark) → { percentOfCode, percentOfAverage, rating }

src/engine/shared/climate.ts
  - fetchClimateData(lat, lon) → { hdd, cdd, designHeatTemp, designCoolTemp }
  - Calls Environment Canada GeoMet-OGC-API (no key needed)
  - Caches responses in climateCache table (Dexie)
  - Offline: returns cached data or throws with clear message
  - Tests: mock API, verify caching, verify offline fallback
```

---

## Stream B — i18n Setup

```
B.1  next-intl configuration
       src/middleware.ts — locale detection, routing
       src/i18n.ts — config (locales: ['en', 'fr'], default: 'en')
       next.config.ts — next-intl plugin integration

B.2  src/messages/en.json — full initial string set:
       common.*      (save, cancel, next, back, delete, loading, offline, etc.)
       nav.*         (home, building, energy, results, settings)
       wizard.*      (step titles, descriptions, field labels for all 7 steps)
       results.*     (teui, tedi, ghgi labels, benchmark descriptions)
       a11y.*        (screen reader announcements, aria-labels)
       errors.*      (validation messages, network errors)
       onboarding.*  (welcome, tour prompts)

B.3  src/messages/fr.json — French translations of everything in B.2

B.4  Language switcher component (EN | FR toggle in header)
```

---

## Stream C — UI Components + Pages

### C.1: Base Layer (shadcn/ui customization)

```
Customize installed shadcn components to match design-system.md:
  - Button: amber primary, ghost, destructive variants
  - Input: amber focus ring, visible labels, error states
  - Slider: custom thumb (20px, white, amber border), value tooltip
  - Dialog/Sheet: 12px radius, correct shadows
  - Tooltip: stone background, correct font size
  - Tabs: for wizard navigation on desktop
  - Card: surface/hover/elevated variants
  - Toast: slide-up from bottom, auto-dismiss

New custom components:
  - TEUIHeroNumber: animated count, color-coded (teal/amber/rose), unit display
  - SkeletonLoader: matching content shapes for each page section
  - ProgressBar: thin (4px), amber fill, used for benchmark comparison
```

### C.2: Layout Shell

```
src/components/layout/
  AppShell.tsx        — Responsive wrapper (mobile/tablet/desktop detection)
  DesktopLayout.tsx   — Sidebar + main + results panel (3-col)
  TabletLayout.tsx    — Side steps + main content (2-col)
  MobileLayout.tsx    — Full-width + bottom sheet + bottom tabs
  Header.tsx          — Logo, lang toggle, theme toggle, overflow menu
                        Desktop: full header
                        Mobile: frosted glass, scroll hide/show (headroom pattern)
  BottomTabBar.tsx    — 4 tabs (Home/Building/Energy/Results), haptics, frosted glass
  BottomSheet.tsx     — 3 snap points, spring physics, drag handle
  Sidebar.tsx         — Desktop wizard step navigation (240px)
```

### C.3: Wizard Step Components

```
src/components/wizard/
  WizardContainer.tsx     — Manages step state, swipe gestures, transition animations
  Step1_ProjectSetup.tsx  — Name, address (geocode → auto climate), building type cards
  Step2_BuildingBasics.tsx — Area, floors, occupancy, visual massing selector
  Step3_EnergyBills.tsx   — Utility bill entry (electricity, gas, oil, wood) → instant TEUI1
  Step4_Envelope.tsx      — Walls, roof, windows with presets + sliders + live TEUI impact
  Step5_SystemsLoads.tsx  — HVAC, DHW, lighting, equipment, preset packages
  Step6_Renewables.tsx    — PV, wind, RECs, green gas, offset summary
  Step7_Results.tsx       — Full dashboard (hero number, Sankey, benchmarks, export)

Each step component:
  - Reads building data from Zustand store
  - Dispatches updateBuilding(partial) on input change
  - Shows mini-result summary (TEUI impact of this step's inputs)
  - Validates required fields, controls "Next" button state
  - Uses i18n keys for all text
```

### C.4: Chart Components

```
src/components/charts/
  SankeyDiagram.tsx       — D3-based energy flow (sources → uses → losses)
                            Responsive, animated path morphing, hover highlights
                            Accessible: hidden data table + aria-label
  BenchmarkBars.tsx       — Horizontal bars (your building vs code vs average vs passive)
                            Recharts-based, animated width transitions
  EnergyBreakdownDonut.tsx — Donut chart of energy by source/use
  MonthlyChart.tsx         — Bar chart of monthly energy (for actual data in TEUI4)
  MiniSparkline.tsx        — Tiny inline chart (50×20px) for wizard step impact indicators
```

### C.5: Pages

```
src/app/[locale]/
  layout.tsx              — Root layout: NextIntlClientProvider, Geist fonts, theme
  page.tsx                — Home: project list (cards), empty state, "Create project" CTA
  project/[id]/
    layout.tsx            — Project layout: loads project from DB, provides to children
    page.tsx              — Wizard/dashboard (renders AppShell + wizard steps)
```

---

## Stream D — PWA + Mobile Native

```
D.1  PWA Manifest
       src/app/manifest.ts — dynamic manifest generation
       Icons: 192×192, 512×512 (regular + maskable for Android)
       display: standalone, theme_color, background_color
       Apple touch icons + splash screen images

D.2  Service Worker
       next-pwa or Serwist configuration in next.config.ts
       Precache: app shell, fonts, CSS, base JS chunks
       Runtime cache: API responses (climate data), images
       Offline fallback page: friendly "You're offline" with cached project access

D.3  src/lib/haptics.ts
       Full haptic utility from design-system.md
       7 patterns: light, medium, heavy, selection, success, warning, error
       Respects prefers-reduced-motion
       No-op on unsupported browsers

D.4  Mobile gestures
       Swipe left/right between sections (within tabs)
       Pull-to-refresh on project list
       Long-press context menu on project cards
       Pinch-to-zoom on charts (opt-in per component)
       iOS overscroll bounce preserved
       Passive touch listeners throughout

D.5  iOS meta tags
       apple-mobile-web-app-capable
       apple-mobile-web-app-status-bar-style (light/dark aware)
       apple-touch-startup-image (all device sizes)

D.6  Offline state management
       useOnlineStatus() hook
       OfflineBanner.tsx — slides down, dismissable, "Back online ✓" auto-dismiss
       Cached climate data badges ("Toronto (cached)")

D.7  Install prompt
       Custom install banner (Android beforeinstallprompt)
       "Add to Home Screen" prompt in settings/overflow menu
```

---

## Gate 2 — Integration + Polish

Once all streams deliver, wire everything together and polish.

```
Integration:
  I.1  Wire engines to wizard steps:
         Step 3 (bills) → calls calculateTEUI1 → shows hero number
         Steps 4-6 → calls calculateTEUI2/3 progressively → live updates
         Step 7 → calls calculateTEUI4 → full dashboard with Sankey

  I.2  Wire Sankey to TEUI4 engine:
         teui4.generateSankeyData() → SankeyDiagram component

  I.3  Wire climate API to Step 1:
         Address input → geocode → fetchClimateData → auto-fill HDD/CDD
         Cache in Dexie climateCache table

  I.4  Wire persistence end-to-end:
         Every updateBuilding() → auto-save to IndexedDB
         Project list page → listProjects() from Dexie
         Load project → getProject(id) → hydrate Zustand store

  I.5  Wire i18n to every component:
         Verify no hardcoded strings remain
         Test full flow in FR locale

Polish:
  P.1  Animation pass: verify all animations from design-system.md are implemented
  P.2  Accessibility audit: keyboard nav, screen reader, contrast, focus rings
  P.3  Performance audit: Lighthouse, bundle size (<200KB JS), LCP <2.5s
  P.4  Mobile QA: test on real iOS + Android devices, haptics, gestures, safe areas
  P.5  Dark mode QA: every screen, every component, every chart
  P.6  Offline QA: disconnect network, verify full flow works with cached data
  P.7  Export: PDF report generation, CSV data export from results
  P.8  Undo/redo: wire Zustand temporal middleware, verify Ctrl+Z works
```

---

## Execution Order (What Happens When)

```
Hour 0     │ Gate 0: Scaffold project
           │
Hour 0.5   │ Gate 1: Schema + data layer
           │
           │ ═══════ ALL STREAMS FAN OUT ═══════
           │
           │  Stream A        Stream B     Stream C       Stream D
           │  ─────────       ────────     ─────────      ─────────
           │  A.5 shared      B.1 config   C.1 base       D.1 manifest
           │  services        B.2 en.json  components     D.2 SW
           │  (units,         B.3 fr.json  C.2 layout     D.3 haptics
           │  carbon,         B.4 lang     shell          D.5 iOS meta
           │  benchmarks)     switcher                    D.6 offline
           │                                              hooks
           │  A.1 TEUI1                    C.3 wizard
           │  A.2 TEUI2                    steps 1-7
           │  A.3 TEUI3
           │  A.4 TEUI4                    C.4 charts
           │                               (Sankey, bars,
           │  A.5 climate                  sparklines)
           │  service
           │                               C.5 pages      D.4 gestures
           │                                              D.7 install
           │
           │ ═══════ ALL STREAMS CONVERGE ═══════
           │
           │ Gate 2: Integration (I.1–I.5) + Polish (P.1–P.8)
```

---

## Task Dependencies (Critical Path)

The **longest chain** (critical path) determines minimum build time:

```
Gate 0 → Gate 1 → Stream A.3 (TEUI3 is most complex engine)
                 → Stream C.3 + C.4 (wizard + charts are most UI work)
                 → Gate 2 Integration

Everything else finishes earlier and waits at Gate 2.
```

Streams with **zero cross-dependencies** (can be built by separate agents/sessions):

- Stream A (engines) needs only `src/schema/building.ts`
- Stream B (i18n) needs nothing except the folder structure
- Stream C (UI) needs schema types + shadcn components
- Stream D (PWA) needs only the app shell from C.2

---

## File Ownership (No Conflicts)

Each stream touches **different files** — no merge conflicts:

| Stream | Files Owned                                                                |
| ------ | -------------------------------------------------------------------------- |
| Gate 0 | Config files, package.json, tailwind, tsconfig                             |
| Gate 1 | `src/schema/*`, `src/db/*`, `src/store/*`                                  |
| A      | `src/engine/*`, `tests/engine/*`                                           |
| B      | `src/messages/*`, `src/middleware.ts`, `src/i18n.ts`                       |
| C      | `src/components/*`, `src/app/[locale]/*`                                   |
| D      | `src/lib/haptics.ts`, `src/app/manifest.ts`, PWA configs, `public/icons/*` |
| Gate 2 | Wiring in page components (C.5 files) + polish across all                  |
