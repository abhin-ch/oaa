# src/schema/

## Purpose

TypeScript interfaces for the unified Building data model. Single source of truth for what a "building project" looks like.

## Key File

- `building.ts` — Building interface, BuildingSummary, EnergySource, SavedCalculation types

## Current Schema (v3)

```typescript
Building {
  id, schemaVersion, name, address,
  area, floors, occupancy, occupancyType,
  energySources: EnergySource[],   // { type, amount, unit }
  renewables: { solarKwh, windKwh, otherKwh },
  evaluationPeriod: number,
  createdAt, updatedAt
}

BuildingSummary {
  id, name, address, updatedAt, archived,
  savedCalculations: SavedCalculation[]
}
```

## Design Rules

1. Optional fields for progressive input — only name + area required
2. Serialization-safe — plain objects, no Date objects, no classes
3. `schemaVersion` field enables IndexedDB migrations
