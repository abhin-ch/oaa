# src/components/

## Purpose

All React UI components. Organized by function: base UI primitives, wizard steps, charts/visualizations, and layout shell.

## Design System Reference

See `docs/design-system.md` for the complete visual language: colors, typography, spacing, component specs, animation rules, responsive layouts, and accessibility requirements. All components must follow that spec.

## Structure

```
components/
├── ui/          # shadcn/ui base components (Button, Input, Slider, Dialog, Tooltip, etc.)
├── wizard/      # Wizard step components (one per step in the user journey)
├── charts/      # Data visualizations (Sankey, bar charts, gauges, benchmark comparisons)
└── layout/      # App shell (header, nav, sidebar, footer, language switcher)
```

## Conventions

### General

- All components are TypeScript (`.tsx`) with explicit prop types
- All user-facing text uses `useTranslations()` — zero hardcoded strings
- Prefer composition over prop drilling — use Zustand hooks for shared state
- Keep components focused: if it does two things, split it

### ui/ (shadcn/ui)

- Generated via `npx shadcn-ui@latest add <component>`
- These are **owned code**, not a dependency — customize freely
- Follow Radix UI patterns: composable, accessible by default
- Do NOT modify the base API unless necessary — extend via wrapper components instead
- Before building a custom component, check if shadcn/ui has one

### wizard/

- One component per wizard step: `ProjectSetup`, `BuildingBasics`, `EnergyBills`, `Envelope`, `SystemsLoads`, `Renewables`, `Results`
- Each step receives project data from Zustand store and dispatches updates
- Steps show a mini-result summary reflecting the impact of inputs in that step
- Steps validate required fields before allowing "Next" navigation
- Wizard state (current step, completion) lives in the UI store

### charts/

- Sankey diagram: D3.js-based, shows energy flows (sources → uses → losses)
- Bar/line charts: Recharts-based, for benchmarks, monthly data, scenarios
- All charts must have text alternatives (`aria-label` or adjacent data table) for accessibility
- Charts animate on data change but respect `prefers-reduced-motion`
- Responsive: charts resize with container, touch-friendly tooltips on mobile

### layout/

- App shell is consistent across all pages
- Header includes: logo, project name (if in project), language switcher (EN/FR), theme toggle
- Mobile: bottom navigation bar for wizard steps; hamburger menu for settings
- Desktop: sidebar navigation for wizard steps when inside a project

## Accessibility Requirements

- All interactive elements: visible focus rings, keyboard operable
- Form inputs: visible `<label>`, not just placeholder text
- Tooltips/popovers: accessible via keyboard (Radix handles this)
- Color: never the sole indicator — use icons, patterns, or labels alongside
- Dynamic content: `aria-live="polite"` for calculation result updates

## Status

- [ ] shadcn/ui base components installed
- [ ] App shell layout (header, nav, language switcher)
- [ ] Wizard step components (Steps 1–7)
- [ ] Sankey diagram component
- [ ] Benchmark comparison charts
- [ ] Mobile-responsive layout
