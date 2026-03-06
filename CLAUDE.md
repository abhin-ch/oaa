# OAA TEUI Platform

Building energy modeling PWA for architects. TEUI v1 calculator is live; v2-v4 planned.

## Tech Stack

- Next.js 16 (App Router) + TypeScript 5.8 + Tailwind CSS v4 + shadcn/ui
- Zustand (state) + Dexie.js (IndexedDB, offline-first) + next-intl v4 (EN/FR)
- React Three Fiber (3D) + Framer Motion (animation)
- Serwist (PWA service worker) — build requires `--webpack` flag
- Vitest (unit) + Playwright (E2E)

## Commands

- `pnpm dev` — dev server (Turbopack, port 3050)
- `pnpm build` — production build (webpack, required for Serwist)
- `pnpm test` — Vitest unit tests
- `pnpm lint` — ESLint + Prettier

## Architecture

- **UI**: `src/app/[locale]/` pages -> `src/components/` -> Zustand stores
- **Engine**: Pure TS in `src/engine/` — no React, no DOM, no side effects
- **Data**: `src/schema/building.ts` (unified model) -> `src/db/` (Dexie/IndexedDB)
- **Flow**: User Input -> Zustand Store -> Engine -> Results (one direction)

## Shared Modules

- `src/lib/formatDate.ts` — date formatting utility
- `src/lib/animations.ts` — framer-motion modal animation presets (`MODAL_BACKDROP`, `MODAL_CONTENT`)
- `src/components/landing/building-parts/materials.ts` — THREE.js color palette + material factories

## Conventions

- All text via `useTranslations()` — zero hardcoded strings
- Check `src/components/ui/` before building custom components
- Engine modules are pure functions: `(Building) => Metrics`
- Use shared `COLOR` constants from `materials.ts` for 3D scene colors
- Use `MODAL_BACKDROP`/`MODAL_CONTENT` from `animations.ts` for modal animations
- `aria-live` regions for announcing calculation updates
- Respect `prefers-reduced-motion` in all animations

## Gotchas

- `ignoreBuildErrors: true` in next.config.ts — `@types/react@19.x` EventTarget conflicts
- No `middleware.ts` — if i18n locale detection breaks, create one at project root
- `public/icons/` is empty — PWA works but shows default icons
- `usePWAInstall` hook exists but no install button UI yet

## Design

- B&W monochrome palette — see `docs/design-system.md`
- Akkurat font (brand) + Geist Mono (numbers)
- Calculator layout: 40/60 split (inputs left, results right)
