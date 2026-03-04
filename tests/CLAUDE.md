# tests/

## Purpose

All tests: unit tests for the calculation engine and E2E tests for user flows.

## Structure

```
tests/
├── engine/     # Vitest unit tests for src/engine/ modules
└── e2e/        # Playwright E2E tests for full user journeys
```

## Engine Tests (Vitest)

### Conventions

- One test file per engine module: `teui1.test.ts`, `teui2.test.ts`, `units.test.ts`, etc.
- Use known building scenarios with **hand-verified expected outputs** (from research.md examples or spreadsheet cross-checks)
- Test edge cases: zero area, missing optional fields, negative values, extreme climates
- Shared test fixtures in `tests/engine/fixtures/` — reusable Building objects for common scenarios

### What to Test

- Unit conversions (gas m³ → kWh, oil L → kWh) match documented constants
- TEUI1: simple division produces correct kWh/m²/yr
- TEUI2: renewable subtraction, benchmark comparison logic
- TEUI3: energy balance equations (losses − gains = net demand), COP scaling
- TEUI4: scenario comparison, Sankey data shape
- Carbon factors produce correct GHGI
- All modules handle partial/missing Building data gracefully (optional fields)

### Running

```bash
npm run test              # Run all Vitest tests
npm run test -- --watch   # Watch mode
npm run test -- teui1     # Run specific test file
```

## E2E Tests (Playwright)

### Conventions

- Test real user journeys, not implementation details
- One test file per major flow: `create-project.spec.ts`, `wizard-flow.spec.ts`, `results-dashboard.spec.ts`
- Test both EN and FR locales for critical flows
- Test mobile viewport (375px) and desktop (1280px)
- Test keyboard-only navigation for accessibility
- Test offline mode (simulate network disconnect, verify project persistence)

### What to Test

- Create a new project → complete wizard → see results
- Load an existing project from the project list
- Change a value → verify results update live
- Language switch mid-flow
- PWA: install prompt, offline fallback page
- Accessibility: tab through wizard, screen reader announcements

### Running

```bash
npm run test:e2e                  # Run all Playwright tests
npm run test:e2e -- --headed      # Run with visible browser
npm run test:e2e -- --project=mobile  # Mobile viewport only
```

## Status

- [ ] Vitest configured with TypeScript support
- [ ] Engine test fixtures (sample buildings)
- [ ] TEUI1 unit tests
- [ ] Playwright configured with mobile + desktop projects
- [ ] First E2E test (create project flow)
