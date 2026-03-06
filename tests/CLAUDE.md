# tests/

## Purpose

Unit tests for the calculation engine. E2E tests (Playwright) to be added later.

## Structure

```
tests/
├── setup.ts              # Vitest setup (jsdom environment config)
└── engine/
    └── teui1.test.ts     # TEUI v1 engine tests (15 tests)
```

## Conventions

- One test file per engine module
- Use known building scenarios with hand-verified expected outputs
- Test edge cases: zero area, missing fields, negative values
- Run: `pnpm test` (all), `pnpm test:watch` (watch mode)

## Deleted Test Files (cleanup)

Removed alongside deleted engine modules:

- `teui2.test.ts`, `teui3.test.ts`, `teui4.test.ts`
- `units.test.ts`, `carbon.test.ts`, `climate.test.ts`, `benchmarks.test.ts`
- `fixtures/buildings.ts`

These will be recreated when their corresponding engines are implemented.
