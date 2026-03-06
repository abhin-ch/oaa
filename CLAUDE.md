# OBJECTIVE (OAA TEUI Platform)

## What This Is

A modern, accessible, PWA-ready web app for building energy modeling (TEUI v1-v4). Built for architects to make complex building science feel simple.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript 5.8
- **Styling**: Tailwind CSS v4 + shadcn/ui (Radix primitives)
- **State**: Zustand with Immer middleware + IndexedDB persistence (Dexie.js)
- **Charts**: D3.js (Sankey) + Recharts (standard charts)
- **3D**: React Three Fiber + Drei (building visualization)
- **i18n**: next-intl v4 (EN + FR), URL-based locale routing
- **PWA**: Serwist (@serwist/next) for service worker + offline support
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Deployment**: Vercel (preview deploys per PR)

## Architecture (3 Layers)

1. **UI Layer** -- Pages -> Components -> Hooks -> Zustand stores
2. **Calculation Layer** -- Pure TS modules (`teui1.ts`) + calculator registry (`calculators.ts`)
3. **Data Layer** -- Unified Building schema -> IndexedDB (Dexie) for offline-first storage

## PWA Architecture

- **Manifest**: `src/app/manifest.ts` (dynamic, Next.js metadata API)
- **Service Worker**: `src/app/sw.ts` -> built to `public/sw.js` by Serwist
- **Registration**: `SerwistProvider` in `src/app/[locale]/layout.tsx`
- **Offline fallback**: `/~offline` page at `src/app/[locale]/~offline/page.tsx`
- **Caching strategy**: Serwist's `defaultCache` (NetworkFirst for navigation, CacheFirst for static assets)
- **Install prompt**: `src/hooks/usePWAInstall.ts` (captures `beforeinstallprompt`)
- **Standalone detection**: `src/lib/pwa.ts` (`isRunningAsStandalone()`)
- **Network status**: `src/hooks/useOnlineStatus.ts` (with transient `wasOffline` flag)
- **Safe areas**: CSS vars `--safe-area-top/bottom/left/right` in `globals.css`

### How to update the PWA

- **New routes**: Add to `additionalPrecacheEntries` in `next.config.ts` if they need offline access
- **Brand colors**: Update `theme_color` in `src/app/manifest.ts` and `themeColor` in layout viewport
- **Icons**: Place in `public/icons/` -- see Icon Requirements below
- **Build**: `pnpm build` uses `--webpack` flag (required for Serwist SW compilation)

### Icon Requirements (TODO)

The manifest references icons that do not yet exist. Generate and place these files:

| File                                | Size    | Format | Purpose                   |
| ----------------------------------- | ------- | ------ | ------------------------- |
| `public/icons/icon-192.png`         | 192x192 | PNG    | Android install icon      |
| `public/icons/icon-512.png`         | 512x512 | PNG    | Android splash + maskable |
| `public/icons/apple-touch-icon.png` | 180x180 | PNG    | iOS home screen           |

Use https://realfavicongenerator.net with the OAA logo (`assets/oaa-logo.svg`) to generate all sizes.

## Design System

See `docs/design-system.md` for the complete visual spec. Key choices:

- **Colors**: B&W monochrome (OAA brand: #000000, #4b4b4b, #9b9b9b, #e6e6e6, #ffffff)
- **Font**: Akkurat (OAA brand typeface, loaded locally) + Geist Mono for numbers
- **Layout**: 40/60 split -- inputs left, live results right. Results are the hero, not forms.
- **Motion**: 150ms micro, 300ms layout, 500ms charts. Respects `prefers-reduced-motion`.

## Project Structure

```
src/
  app/                    # Next.js App Router pages and layouts
    [locale]/             # i18n locale routes (en, fr)
      layout.tsx          # Root locale layout (fonts, i18n, PWA provider)
      page.tsx            # Landing page
      projects/page.tsx   # Project list
      project/[id]/       # Single project
        page.tsx          # Calculator catalog
        calculator/[calcId]/page.tsx  # Calculator view
      ~offline/page.tsx   # PWA offline fallback
    manifest.ts           # PWA web manifest
    sw.ts                 # Serwist service worker source
    serwist.ts            # SerwistProvider re-export
    globals.css           # Global styles, CSS variables, safe areas
  components/
    calculator/teui1/     # TEUI v1 calculator (inputs + results)
    landing/              # Landing page components
    layout/               # App shell (Header, OfflineBanner, etc.)
    project/              # Project-level components (CalculatorCatalog)
    ui/                   # shadcn/ui base components
  engine/                 # Pure TS calculation modules
    teui1.ts              # TEUI v1 energy intensity calculator
    calculators.ts        # Calculator registry (all available calculators)
  hooks/                  # React hooks
  lib/                    # Utilities (cn, haptics, pwa)
  store/                  # Zustand stores (project, ui)
  schema/                 # TypeScript interfaces (Building model)
  db/                     # IndexedDB (Dexie) persistence
  i18n/                   # next-intl config (routing, navigation)
  messages/               # i18n strings (en.json, fr.json)
```

## Hooks

| Hook               | File                        | Purpose                                                   |
| ------------------ | --------------------------- | --------------------------------------------------------- |
| `useTEUI1`         | `hooks/useTEUI1.ts`         | Memoized TEUI v1 calculation from Building data           |
| `useOnlineStatus`  | `hooks/useOnlineStatus.ts`  | Online/offline detection with transient `wasOffline` flag |
| `usePWAInstall`    | `hooks/usePWAInstall.ts`    | Captures install prompt, provides `promptInstall()`       |
| `useMediaQuery`    | `hooks/useMediaQuery.ts`    | Reactive CSS media query subscription                     |
| `useReducedMotion` | `hooks/useReducedMotion.ts` | `prefers-reduced-motion` detection                        |
| `useBottomSheet`   | `hooks/useBottomSheet.ts`   | Snap-point bottom sheet with velocity-aware dragging      |
| `useSwipeGesture`  | `hooks/useSwipeGesture.ts`  | Left/right swipe detection with angle filtering           |

## Utilities

| Utility                   | File             | Purpose                                        |
| ------------------------- | ---------------- | ---------------------------------------------- |
| `cn()`                    | `lib/utils.ts`   | Tailwind class merging (clsx + tailwind-merge) |
| `haptic()`                | `lib/haptics.ts` | Vibration feedback with style presets          |
| `isRunningAsStandalone()` | `lib/pwa.ts`     | Detect installed PWA vs browser tab            |

## Commands

- `pnpm dev` -- Start dev server (Turbopack)
- `pnpm build` -- Production build (webpack, required for Serwist SW)
- `pnpm test` -- Run Vitest unit tests
- `pnpm test:e2e` -- Run Playwright E2E tests
- `pnpm lint` -- ESLint + Prettier check

## Conventions

- All user-facing text must use i18n keys (`useTranslations`), never hardcoded strings
- Calculation engine modules are pure TS -- no React, no DOM, no side effects
- Components use shadcn/ui patterns -- check `src/components/ui/` before building custom
- Each TEUI version module reads from the unified Building schema
- State flows one direction: User Input -> Zustand Store -> Engine -> Results
- Prefer `aria-live` regions for announcing calculation updates to screen readers
- Build uses `--webpack` flag because Serwist does not support Turbopack

## Known Issues / Tech Debt

- **TypeScript build errors**: `ignoreBuildErrors: true` in next.config.ts due to pre-existing EventTarget type conflicts across many components. Root cause: `@types/react@19.x` ChangeEvent types don't resolve `HTMLInputElement.value` correctly. Needs investigation.
- **Missing middleware**: `src/proxy.ts` was an orphaned file containing next-intl middleware code at the wrong path (deleted). If i18n locale detection breaks, a proper `middleware.ts` at project root may be needed.
- **Empty icons**: `public/icons/` directory exists but contains no icon files. PWA install will work but show default icons.
- **Unused layout stubs**: `BottomTabBar.tsx` (returns null) and `Sidebar.tsx` (empty nav) exist as placeholders for future wizard navigation.
- **No install button UI**: `usePWAInstall` hook is wired up but no visible install button exists yet. Add one to the Header or landing page when ready.

## Phase Status

- [x] Phase 1: Foundation (scaffolding, TEUI1, PWA shell, i18n)
- [ ] Phase 2: Core Experience (TEUI2, envelope/systems UI, charts, export)
- [ ] Phase 3: Advanced Modeling (TEUI3, Sankey, climate API, scenarios)
- [ ] Phase 4: Full Platform (TEUI4, actuals calibration, embodied carbon, sharing)
