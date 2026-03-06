# src/components/

## Purpose

All React UI components. Organized by function: base UI primitives, calculator workspace, landing page, layout shell, and project management.

## Structure

```
components/
├── ui/               # shadcn/ui base components (Button, Input, Dialog, etc.)
├── calculator/       # Calculator workspace
│   ├── SaveCalculationModal.tsx
│   └── teui1/        # TEUI v1 calculator
│       ├── TEUI1Calculator.tsx    # Main calculator orchestrator
│       ├── InputPanel.tsx         # Tab container for input forms
│       ├── inputs/                # Input tab components
│       │   ├── ProjectTab.tsx
│       │   ├── BuildingTab.tsx
│       │   ├── EnergyBillsTab.tsx
│       │   ├── AreaInput.tsx
│       │   ├── EnergySourceInput.tsx
│       │   └── RenewablesTab.tsx
│       └── results/               # Live results visualizations
│           ├── ResultsPanel.tsx    # Main results orchestrator
│           ├── EnergyBars.tsx      # Energy breakdown bars + inline donut
│           ├── AnimatedNumber.tsx  # Animated numeric display
│           └── Building3D.tsx     # Three.js 3D building model
├── landing/          # Landing/marketing page
│   ├── LandingHero.tsx
│   ├── LandingNav.tsx
│   ├── LoginModal.tsx
│   ├── IsometricBuilding.tsx      # React Three Fiber building
│   ├── IsometricScene.tsx
│   ├── EnergyFlowBg.tsx
│   └── building-parts/            # Isometric scene sub-components
├── layout/           # App shell
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── BottomTabBar.tsx
│   ├── OfflineBanner.tsx
│   ├── SkipToContent.tsx
│   └── DotGrid.tsx
└── project/
    └── CalculatorCatalog.tsx      # Calculator selection grid
```

## Conventions

- All user-facing text uses `useTranslations()` — zero hardcoded strings
- Prefer Zustand hooks for shared state over prop drilling
- Check `src/components/ui/` before building custom components
- Calculator layout: 40/60 split (inputs left, live results right)
- All charts/animations respect `prefers-reduced-motion`

## Deleted Components (cleanup)

These were removed as dead code — do not re-create:

- `results/EnergyDonut.tsx` — replaced by inline donut in EnergyBars
- `results/GHGICard.tsx` — inlined in ResultsPanel
- `results/GradientBar.tsx` — inlined in ResultsPanel
- `results/TEUIHeroNumber.tsx` — inlined in ResultsPanel
- `results/WidgetCard.tsx` — never imported
- `results/BuildingSchematic.tsx` — replaced by Building3D
- `layout/AppShell.tsx` — each page has own Header + layout
