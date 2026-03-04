# OBJECTIVE (TEUI Platform) — Project Plan

## Vision

A modern, accessible, PWA-ready web application for building energy modeling (TEUI v1–v4) that makes complex building science feel simple and approachable.

---

## 1. Core Principles

| Principle                    | What It Means                                                                                         |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Progressive Disclosure**   | Start simple, reveal complexity on demand. Never overwhelm.                                           |
| **Immediate Feedback**       | Every input change shows its effect instantly — sliders, live charts, animated transitions.           |
| **Accessibility First**      | WCAG 2.2 AA minimum. Keyboard nav, screen readers, color-blind safe palettes, reduced motion support. |
| **Offline-Capable PWA**      | Service worker, installable, works on flaky connections. Projects save locally and sync when online.  |
| **Mobile-First Design**      | Touch-friendly, responsive from 320px up. Not a shrunken desktop — a real mobile experience.          |
| **Transparent Calculations** | Users can inspect any number. "Where did this come from?" is always one click away.                   |

---

## 2. Tech Stack (Recommended)

| Layer           | Choice                                     | Why                                                                                   |
| --------------- | ------------------------------------------ | ------------------------------------------------------------------------------------- |
| **Framework**   | Next.js (App Router)                       | SSR/SSG, file routing, API routes, good PWA ecosystem                                 |
| **Language**    | TypeScript                                 | Type safety across the entire calculation engine + UI                                 |
| **Styling**     | Tailwind CSS + Radix UI primitives         | Utility-first + unstyled accessible components (focus traps, ARIA, keyboard built-in) |
| **State**       | Zustand                                    | Lightweight, works with persistence middleware (localStorage/IndexedDB)               |
| **Charts/Viz**  | D3.js (Sankey) + Recharts (bar/line/gauge) | D3 for custom energy flow diagrams, Recharts for standard charts                      |
| **Calc Engine** | Pure TS modules (no UI dependency)         | Testable, portable, can run in Web Worker for heavy v3/v4 calcs                       |
| **PWA**         | next-pwa / Serwist                         | Service worker generation, precaching, offline support                                |
| **Storage**     | IndexedDB (Dexie.js)                       | Offline project storage with sync-ready structure                                     |
| **Testing**     | Vitest + Playwright                        | Unit tests for calc engine, E2E for user flows                                        |
| **CI/CD**       | GitHub Actions → Vercel                    | Preview deploys on PR, production on main                                             |

---

## 3. Application Architecture

```
┌─────────────────────────────────────────────────────┐
│                    UI Layer                          │
│  Pages → Components → Hooks → State (Zustand)       │
├─────────────────────────────────────────────────────┤
│                 Calculation Layer                    │
│  TEUI1 │ TEUI2 │ TEUI3 │ TEUI4  (pure TS modules)  │
│         ↕ Shared Services ↕                         │
│  UnitConvert │ Climate │ Benchmarks │ CarbonFactors  │
├─────────────────────────────────────────────────────┤
│                  Data Layer                          │
│  Unified Building Schema (TypeScript interfaces)     │
│  IndexedDB (Dexie) — offline-first project storage   │
│  Optional: API sync layer for cloud backup           │
└─────────────────────────────────────────────────────┘
```

---

## 4. Data Model (Unified Building Schema)

One schema, all calculator versions read from it:

```
Building
├── meta (name, address, lat/lon, created, updated)
├── climate (zone, HDD, CDD, design temps — auto from location)
├── geometry (floors, area, volume, orientation)
├── occupancy (type, count, schedule)
├── envelope
│   ├── walls[] (area, U-value, orientation)
│   ├── roof (area, U-value)
│   ├── windows[] (area, U-value, SHGC, orientation)
│   ├── doors[] (area, U-value)
│   └── airtightness (ACH)
├── internalLoads (lighting W/m², equipment W/m², schedules)
├── ventilation (rate, type, HRV efficiency)
├── systems
│   ├── heating (type, COP/efficiency)
│   ├── cooling (type, COP)
│   └── dhw (type, efficiency)
├── renewables (PV kW, wind kW, other)
├── energySources (electricity kWh, gas m³, oil L, wood m³)
├── offsets (RECs, green gas, carbon credits)
├── actuals (monthly utility readings — optional)
└── embodiedCarbon (optional material inputs)
```

TEUI1 uses: `energySources` + `geometry.area`
TEUI2 uses: above + `occupancy` + `renewables` + `offsets` + `climate`
TEUI3 uses: everything except some optional fields
TEUI4 uses: everything, plus `actuals` for calibration

---

## 5. User Journey (Wizard Flow)

The app guides users through a **step-by-step wizard**, not a giant form.

```
Step 1: Project Setup
  → Name, address (auto-fill climate from geocode)
  → Building type selector (visual cards, not a dropdown)
  → "Which TEUI version?" or auto-detect from what they fill in

Step 2: Building Basics
  → Area, floors, occupancy
  → Visual building shape selector (simple massing)

Step 3: Energy Bills (optional shortcut)
  → Upload or type utility bills
  → If provided → instant TEUI1 result shown immediately
  → "Want to go deeper?" → continue to Steps 4+

Step 4: Envelope
  → Wall/roof/window inputs with presets ("Code minimum", "High performance", "Passive House")
  → Interactive sliders with live TEUI impact shown

Step 5: Systems & Loads
  → HVAC, DHW, lighting, equipment
  → Preset packages ("Gas furnace + AC", "Heat pump", "Passive House bundle")

Step 6: Renewables & Offsets
  → PV, wind, RECs, green gas

Step 7: Results Dashboard
  → TEUI, TEDI, GHGI — big numbers with context
  → Sankey diagram (energy flows)
  → Benchmark comparison (vs code, vs average, vs best-in-class)
  → "What if?" sliders for instant scenario testing
  → Export: PDF report, CSV data, share link
```

Key UX details:

- **Each step shows a mini-result** — users see impact as they go, not just at the end
- **Skip-ahead allowed** — power users can jump to any step
- **Auto-save** — every change persists to IndexedDB immediately
- **Undo/redo** — state history for all inputs

---

## 6. PWA & Mobile Strategy

| Feature                | Implementation                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| **Installable**        | Web app manifest, install prompt                                                         |
| **Offline mode**       | Service worker caches app shell + static assets; IndexedDB stores projects               |
| **Push notifications** | Optional — notify when shared project is updated                                         |
| **Touch interactions** | Large tap targets (48px+), swipe between wizard steps, pull-to-refresh                   |
| **Responsive layout**  | Mobile: stacked wizard + bottom nav. Tablet: side panel results. Desktop: full dashboard |
| **Performance budget** | < 200KB JS initial load, LCP < 2.5s, TTI < 3.5s                                          |

---

## 7. Accessibility Checklist

- [ ] All interactive elements keyboard-accessible (tab order, focus rings)
- [ ] ARIA labels on all charts and visualizations
- [ ] Screen reader announcements for live calculation updates (`aria-live`)
- [ ] Color contrast ≥ 4.5:1 (text), ≥ 3:1 (UI components)
- [ ] No information conveyed by color alone (patterns, labels, icons)
- [ ] Reduced-motion media query respected (no forced animations)
- [ ] Form inputs with visible labels (not just placeholders)
- [ ] Error messages linked to inputs via `aria-describedby`
- [ ] Skip-to-content link
- [ ] Charts have text alternatives or data tables

---

## 8. User Feedback & Delight

| Pattern                      | Where                                                             |
| ---------------------------- | ----------------------------------------------------------------- |
| **Skeleton loaders**         | While calculating or loading projects                             |
| **Toast notifications**      | "Project saved", "Exported PDF", errors                           |
| **Micro-animations**         | Sankey flows animate on data change, numbers count up/down        |
| **Progress indicators**      | Wizard step bar, calculation spinner                              |
| **Empty states**             | Friendly illustrations + clear CTAs ("Create your first project") |
| **Error recovery**           | Inline validation, suggested fixes, never lose data               |
| **Tooltips & info popovers** | "What is U-value?" with diagrams                                  |
| **Onboarding tour**          | Optional first-run walkthrough highlighting key features          |
| **Haptic feedback**          | On mobile, subtle vibration on key actions (save, calculate)      |

---

## 9. Build Phases

### Phase 1 — Foundation

- Project scaffolding (Next.js, TS, Tailwind, shadcn/ui)
- `next-intl` setup with EN/FR string files and locale routing
- Unified building schema (TypeScript types)
- TEUI1 calculation engine + tests
- Basic wizard UI (Steps 1–3 + TEUI1 results)
- IndexedDB project persistence (Dexie.js)
- PWA shell (manifest, service worker, offline page)
- Accessibility baseline (Radix primitives, focus management)

### Phase 2 — Core Experience

- TEUI2 calculation engine + tests
- Wizard Steps 4–6 (envelope, systems, renewables)
- Live result updates as inputs change
- Benchmark comparison charts
- PDF/CSV export
- Mobile-responsive layout polish

### Phase 3 — Advanced Modeling

- TEUI3 energy balance engine + tests
- Sankey diagram (D3-based energy flow visualization)
- Reference vs Design model comparison
- Climate data service (Environment Canada API + caching layer)
- "What-if" scenario sliders

### Phase 4 — Full Platform

- TEUI4 engine (Reference + Target + Actual models)
- Utility bill import + Actual model calibration
- Embodied carbon module
- Project sharing (URL-based or cloud sync)
- Onboarding tour
- Performance optimization + audit

---

## 10. Folder Structure (Proposed)

```
oaa/
├── CLAUDE.md                # Root knowledge base (project overview, stack, conventions)
├── docs/
│   ├── CLAUDE.md            # Docs KB (domain knowledge, TEUI versions, formulas)
│   ├── research.md
│   └── plan.md
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── CLAUDE.md        # App KB (routing, i18n, PWA, page conventions)
│   │   ├── layout.tsx
│   │   ├── page.tsx         # Landing / project list
│   │   ├── project/
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx # Wizard/dashboard
│   │   │   │   └── results/
│   │   ├── manifest.ts      # PWA manifest
│   │   └── sw.ts            # Service worker
│   ├── components/
│   │   ├── CLAUDE.md        # Components KB (shadcn/ui, wizard, charts, a11y rules)
│   │   ├── ui/              # Base components (Button, Input, Slider, etc.)
│   │   ├── wizard/          # Wizard step components
│   │   ├── charts/          # Sankey, bar charts, gauges
│   │   └── layout/          # Shell, nav, sidebar
│   ├── engine/
│   │   ├── CLAUDE.md        # Engine KB (calc logic, formulas, constants, purity rules)
│   │   ├── teui1.ts
│   │   ├── teui2.ts
│   │   ├── teui3.ts
│   │   ├── teui4.ts
│   │   ├── shared/
│   │   │   ├── units.ts     # Unit conversions
│   │   │   ├── climate.ts   # HDD/CDD, weather
│   │   │   ├── carbon.ts    # Emission factors
│   │   │   └── benchmarks.ts
│   │   └── __tests__/
│   ├── schema/
│   │   ├── CLAUDE.md        # Schema KB (Building model, versioning, migration rules)
│   │   └── building.ts
│   ├── store/
│   │   ├── CLAUDE.md        # Store KB (Zustand patterns, persistence, data flow)
│   │   ├── project.ts
│   │   └── ui.ts
│   ├── db/
│   │   ├── CLAUDE.md        # DB KB (Dexie setup, tables, cache, migrations)
│   │   └── index.ts
│   ├── messages/
│   │   ├── CLAUDE.md        # i18n KB (key conventions, namespaces, translation rules)
│   │   ├── en.json
│   │   └── fr.json
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities
│   └── styles/              # Global styles, Tailwind config
├── public/
│   ├── icons/               # PWA icons
│   └── images/
├── tests/
│   ├── CLAUDE.md            # Tests KB (Vitest + Playwright conventions, fixtures)
│   ├── engine/              # Calc engine unit tests
│   └── e2e/                 # Playwright E2E
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Key Decisions (Resolved)

### 1. Auth & Cloud Sync → **Local-only for v1**

- Projects stored in browser via IndexedDB (Dexie.js)
- No user accounts, no server, no database
- The IndexedDB schema will be designed to support future cloud sync (unique project IDs, timestamps, conflict-resolution-friendly structure) so migration is non-breaking
- Cloud sync (OAuth + remote DB) deferred to a later phase

### 2. Climate Data Source → **Environment Canada MSC GeoMet-OGC-API**

- **No API key required** — open access, open standards (OGC WMS/WCS/WFS)
- Docs: https://eccc-msc.github.io/open-data/msc-geomet/readme_en/
- Fetch HDD, CDD, and design temperatures from climate normals datasets
- **Caching layer**: Cache API responses in IndexedDB keyed by location — most users will query the same few cities repeatedly
- **Offline fallback**: Serve cached locations when offline; show clear "offline — using cached data" indicator
- **Rate limiting**: Debounce lookups on address input, batch requests where possible
- May still need a thin Next.js API route proxy if CORS is an issue from client-side requests

### 3. Design System → **shadcn/ui**

- Copy-paste components built on Radix UI primitives + Tailwind CSS
- Components live in `src/components/ui/` — we own them, full customization freedom
- Accessible by default (ARIA, focus management, keyboard navigation from Radix)
- Consistent with the Tailwind styling approach across the app
- Will customize the default theme (colors, radii, fonts) to match OBJECTIVE branding

### 4. Deployment → **Vercel**

- Native Next.js hosting with zero-config deploys
- Preview deployment on every PR for design review
- Edge functions available if we need API routes (e.g., climate data proxy)
- Free tier sufficient for this project's scale
- GitHub Actions for CI (tests, linting) → Vercel for CD

### 5. Internationalization → **English + French from day one**

- Use `next-intl` for i18n (integrates natively with Next.js App Router)
- String files: `src/messages/en.json` and `src/messages/fr.json`
- All user-facing text externalized from components — no hardcoded strings
- Language switcher in the app header (EN / FR toggle)
- URL-based locale routing: `/en/project/...` and `/fr/project/...`
- Technical/calculation terms (TEUI, GHGI, HDD) stay untranslated — they're domain-standard
- Dates, numbers, and units formatted per locale (`Intl.NumberFormat`)

### 6. Package Manager → **pnpm**

- Fast, disk-efficient, strict dependency resolution
- `pnpm-lock.yaml` committed to repo
- Use `pnpm dlx` instead of `npx` for one-off commands

### 7. Code Quality → **ESLint + Prettier + Strict TypeScript**

- `strict: true` in tsconfig — no `any`, no implicit returns
- Prettier for formatting (consistent, no debates)
- `eslint-plugin-import` for import sorting
- Pre-commit hook via `lint-staged` + `husky` (format + lint on commit)

### 8. License → **Private (for now)**

- No license file yet — decide later whether to open-source
- Keep code clean and documented as if it will be open-sourced
