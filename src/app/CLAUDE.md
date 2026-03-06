# src/app/

## Purpose

Next.js App Router pages and layouts. Routing and page-level orchestration layer.

## Structure

```
app/
├── layout.tsx                    # Root layout (html/body wrapper)
├── page.tsx                      # Root redirect
├── manifest.ts                   # PWA web app manifest (dynamic)
├── sw.ts                         # Serwist service worker source
├── serwist.ts                    # Client re-export of SerwistProvider
├── globals.css                   # Global styles + CSS variables + safe area insets
└── [locale]/
    ├── layout.tsx                # Locale layout (NextIntlClientProvider + SerwistProvider)
    ├── page.tsx                  # Landing page
    ├── ~offline/page.tsx         # PWA offline fallback page
    ├── projects/page.tsx         # Project list page
    └── project/[id]/
        ├── page.tsx              # Single project dashboard + calculator catalog
        └── calculator/[calcId]/page.tsx  # Calculator workspace (TEUI1)
```

## Conventions

- **Locale routing**: All user routes under `[locale]/` via next-intl middleware
- **Thin pages**: Pages fetch from Zustand/IndexedDB and delegate to components
- **`'use client'`**: All pages use client components (Zustand, IndexedDB, interactivity)
- **i18n**: `useTranslations()` for all text; never hardcode strings

## PWA

- `manifest.ts` — Dynamic web app manifest (name, icons, theme, display: standalone)
- `sw.ts` — Serwist service worker (precaching, runtime caching, offline fallback)
- `serwist.ts` — Client-side `SerwistProvider` re-export for layout
- `~offline/page.tsx` — Static offline fallback with OAA branding
- Build requires `--webpack` flag (Serwist incompatible with Turbopack)
