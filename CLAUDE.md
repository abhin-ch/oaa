# OBJECTIVE (OAA TEUI Platform)

## What This Is

A modern, accessible, PWA-ready web app for building energy modeling (TEUI v1–v4). Built for architects to make complex building science feel simple.

## Tech Stack

- **Framework**: Next.js (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui (Radix primitives)
- **State**: Zustand with IndexedDB persistence (Dexie.js)
- **Charts**: D3.js (Sankey) + Recharts (standard charts)
- **i18n**: next-intl (EN + FR), URL-based locale routing
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Deployment**: Vercel (preview deploys per PR)

## Architecture (3 Layers)

1. **UI Layer** — Pages → Components → Hooks → Zustand stores
2. **Calculation Layer** — Pure TS modules (teui1–4) + shared services (units, climate, carbon, benchmarks)
3. **Data Layer** — Unified Building schema → IndexedDB (Dexie) for offline-first storage

## Design System

See `docs/design-system.md` for the complete visual spec. Key choices:

- **Colors**: Stone neutrals (OAA black/white/grey DNA) + Amber (energy), Teal (success), Rose (warning)
- **Font**: Geist Sans (free Akkurat alternative) + Geist Mono for numbers
- **Layout**: 40/60 split — inputs left, live results right. Results are the hero, not forms.
- **Motion**: 150ms micro, 300ms layout, 500ms charts. Respects `prefers-reduced-motion`.

## Key Principles

- Progressive disclosure: simple first, complexity on demand
- Immediate feedback: every input change updates results live
- Accessibility: WCAG 2.2 AA, keyboard nav, screen readers, color-blind safe
- Offline-capable PWA: works without network, projects save locally
- Transparent calculations: users can inspect any derived number
- Bilingual: EN/FR from day one, no hardcoded strings

## Project Structure

See `docs/plan.md` Section 10 for full folder tree. Key areas:

- `src/engine/` — Pure calculation logic (no UI imports)
- `src/schema/` — TypeScript interfaces for the unified Building model
- `src/components/` — UI components (shadcn/ui base + wizard + charts)
- `src/store/` — Zustand state management
- `src/db/` — IndexedDB persistence layer
- `src/messages/` — i18n string files (en.json, fr.json)

## Commands

- `pnpm dev` — Start dev server
- `pnpm build` — Production build
- `pnpm test` — Run Vitest unit tests
- `pnpm test:e2e` — Run Playwright E2E tests
- `pnpm lint` — ESLint + Prettier check
- `pnpm dlx` — Use instead of `npx` for one-off commands

## Conventions

- All user-facing text must use i18n keys (`useTranslations`), never hardcoded strings
- Calculation engine modules are pure TS — no React, no DOM, no side effects
- Components use shadcn/ui patterns — check `src/components/ui/` before building custom
- Each TEUI version module reads from the unified Building schema
- State flows one direction: User Input → Zustand Store → Engine → Results
- Prefer `aria-live` regions for announcing calculation updates to screen readers

## Phase Status

- [ ] Phase 1: Foundation (scaffolding, TEUI1, wizard, PWA shell, i18n)
- [ ] Phase 2: Core Experience (TEUI2, envelope/systems UI, charts, export)
- [ ] Phase 3: Advanced Modeling (TEUI3, Sankey, climate API, scenarios)
- [ ] Phase 4: Full Platform (TEUI4, actuals calibration, embodied carbon, sharing)
