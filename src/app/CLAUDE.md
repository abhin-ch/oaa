# src/app/

## Purpose

Next.js App Router pages and layouts. This is the routing and page-level orchestration layer — it connects UI components to state and renders pages.

## Structure

```
app/
├── layout.tsx          # Root layout (next-intl provider, theme, global shell)
├── page.tsx            # Landing page / project list
├── project/
│   └── [id]/
│       ├── page.tsx    # Wizard/dashboard for a single project
│       └── results/    # Results dashboard view
├── manifest.ts         # PWA web app manifest
└── sw.ts               # Service worker registration
```

## Conventions

- **Locale routing**: All routes are under `[locale]/` (e.g., `/en/project/123`). The root layout wraps with `NextIntlClientProvider`.
- **Page components are thin**: Pages fetch data (from Zustand/IndexedDB), pass to components. No business logic in pages.
- **Server vs Client**: Default to server components. Add `'use client'` only for interactive components (wizard steps, charts, inputs).
- **Metadata**: Each page exports `generateMetadata` for SEO and PWA. Titles use i18n keys.
- **Loading states**: Use `loading.tsx` files for Suspense boundaries with skeleton loaders.
- **Error boundaries**: Use `error.tsx` files with user-friendly recovery UI.

## PWA

- `manifest.ts` generates the web app manifest dynamically (name, icons, theme color)
- Service worker is registered in the root layout via `sw.ts`
- Offline fallback page should be a static shell with "You're offline" message

## i18n

- next-intl middleware handles locale detection and routing
- Layout provides `NextIntlClientProvider` with messages from `src/messages/{locale}.json`
- Pages/components use `useTranslations('namespace')` — never hardcode strings

## Status

- [ ] Root layout with i18n provider
- [ ] Landing page (project list)
- [ ] Project wizard page
- [ ] Results dashboard page
- [ ] PWA manifest and service worker
- [ ] Loading and error boundaries
