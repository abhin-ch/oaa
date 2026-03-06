# src/engine/

## Purpose

Pure TypeScript calculation modules. **No React, no DOM, no side effects** — just functions that take building data in and return metrics out.

## Structure

```
engine/
├── teui1.ts          # V1: Energy bills / area calculation
└── calculators.ts    # Calculator registry (metadata for all calculator types)
```

## Design Rules

1. **Pure functions only** — `(BuildingData) => Metrics`. No state, no side effects.
2. **Reads from unified schema** — Consumes `Building` type from `src/schema/building.ts`.
3. **Testable in isolation** — Tests in `tests/engine/`.
4. **Web Worker ready** — Serialization-friendly (no classes, no closures over DOM).

## TEUI1 Calculation

- Input: energy sources (kWh, m3 gas, L oil, m3 wood) + floor area + renewables
- Convert all to kWhe -> sum -> subtract renewables -> divide by area
- Output: `{ teui, breakdown, ghgi }` (kWh/m2/yr, per-source breakdown, kgCO2e/m2/yr)

## Key Constants

```
Gas:  1 m3 = 10.3321 kWh
Oil:  1 L  = 10.6091 kWh
Wood: 1 m3 = 1000 kWh
CO2:  1 m3 gas -> 1.888 kgCO2
      1 kWh Ontario grid -> 0.04 kgCO2
```

## Future Engines (not yet implemented)

- `teui2.ts` — Extended: occupancy normalization, benchmarks
- `teui3.ts` — Full energy balance: envelope + systems + 3 parallel models
- `teui4.ts` — Real-time dual-model with Sankey + optimization
