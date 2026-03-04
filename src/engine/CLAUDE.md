# src/engine/

## Purpose

Pure TypeScript calculation modules for TEUI v1–v4. This is the math brain of the application. **No React, no DOM, no side effects** — just functions that take building data in and return metrics out.

## Structure

```
engine/
├── teui1.ts            # V1: Simple energy/area calculation
├── teui2.ts            # V2: Extended calculator (renewables, carbon, IAQ)
├── teui3.ts            # V3: Full energy balance model (Ref + Design + Actual)
├── teui4.ts            # V4: Real-time dual-model with optimization
├── shared/
│   ├── units.ts        # Unit conversion functions (m³→kWh, GJ→kWh, etc.)
│   ├── climate.ts      # Climate data fetching + HDD/CDD calculations
│   ├── carbon.ts       # Emission factors (grid, fuel, embodied)
│   └── benchmarks.ts   # Code/standard benchmark values (NECB, SB-10, SB-12)
└── __tests__/          # Unit tests for all modules
```

## Design Rules

1. **Pure functions only** — Every calculation is `(BuildingData) => Metrics`. No state, no side effects, no imports from React/Next.
2. **Reads from unified schema** — All modules consume `Building` type from `src/schema/building.ts`. Each version uses only the fields it needs.
3. **Common output format** — All modules return a `TEUIResult` type with at minimum: `{ teui, ghgi, breakdown }`. Higher versions add more fields.
4. **Shared services are utilities** — `units.ts`, `carbon.ts`, `benchmarks.ts` are pure helper functions. `climate.ts` is the one exception (it fetches from Environment Canada API) — it should be async and cacheable.
5. **Testable in isolation** — Every module has corresponding tests in `__tests__/`. Tests use known building scenarios with hand-verified expected outputs.
6. **Web Worker ready** — These modules may run in a Web Worker for v3/v4 heavy calculations. Keep them serialization-friendly (no classes with methods, no closures over DOM).

## Calculation Summary

### TEUI1 (simplest)

- Input: energy sources (kWh, m³ gas, L oil, m³ wood) + floor area
- Convert all to kWhₑ → sum → divide by area
- Output: TEUI (kWh/m²/yr), GHGI (kgCO₂e/m²/yr)

### TEUI2 (extended)

- Adds: renewables subtraction, occupancy normalization, embodied carbon
- Compares against code benchmarks (% of national average)
- Output: TEUI, GHGI, TEDI (simplified), benchmark comparison

### TEUI3 (energy balance)

- Full envelope heat loss: Σ(Uᵢ·Aᵢ)·ΔT + ventilation + infiltration
- Internal gains: occupants + lighting + equipment + solar
- Net heating demand = losses − gains → ÷ COP → heating energy
- Net cooling demand = gains − losses → ÷ COP → cooling energy
- Three parallel models: Reference (code min), Design (user), Actual (utility bills)
- Output: TEUI, TEDI, GHGI, energy balance breakdown, model comparison

### TEUI4 (real-time platform)

- Same as TEUI3 but with real-time recalculation on input change
- Adds: Sankey data generation, scenario diffing, optimization suggestions
- Actual model calibration against utility readings
- Output: everything in TEUI3 + Sankey flow data + scenario comparisons

## Key Constants (from research.md)

```
Gas:  1 m³ = 0.0373 GJ = 10.3321 kWh
Oil:  1 L = 0.0383 GJ = 10.6091 kWh
Wood: ~1000 kWh/m³ (approximate)
CO₂:  1 m³ gas → 2.63 kgCO₂
       1 kWh Ontario grid → 0.04 kgCO₂ (0.00004 MTCO₂)
```

## Status

- [ ] Shared unit conversion module + tests
- [ ] Shared carbon factors module + tests
- [ ] TEUI1 engine + tests
- [ ] TEUI2 engine + tests
- [ ] TEUI3 energy balance engine + tests
- [ ] TEUI4 real-time engine + tests
- [ ] Climate data service (Environment Canada API integration)
- [ ] Benchmark data module
