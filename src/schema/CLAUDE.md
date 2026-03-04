# src/schema/

## Purpose

TypeScript interfaces and types defining the unified Building data model. This is the **single source of truth** for what a "building project" looks like across the entire application.

## Key File

- `building.ts` — The complete Building interface and all sub-types

## Design Rules

1. **One schema, all versions** — TEUI1 through TEUI4 all read from this same `Building` type. Simpler versions just ignore fields they don't use.
2. **Optional fields for progressive input** — Only the absolute minimum is required (name, area). Everything else is optional so the wizard can work incrementally.
3. **Units are explicit** — Every numeric field's unit is documented in JSDoc or encoded in the type name (e.g., `areaM2`, `gasM3`). No ambiguity.
4. **Serialization-safe** — No classes, no methods, no Date objects. Plain objects that survive `JSON.parse(JSON.stringify())` and IndexedDB storage.
5. **Versioned** — Include a `schemaVersion` field so we can migrate stored projects when the schema evolves.

## Schema Outline

```typescript
Building
├── id: string (UUID)
├── schemaVersion: number
├── meta: { name, address, latLon, createdAt, updatedAt }
├── climate: { zone, hddC, cddC, designHeatTempC, designCoolTempC }
├── geometry: { floors, conditionedAreaM2, volumeM3, orientation }
├── occupancy: { type, count, scheduleHoursPerDay }
├── envelope: {
│     walls: { areaM2, uValue, orientation }[]
│     roof: { areaM2, uValue }
│     windows: { areaM2, uValue, shgc, orientation }[]
│     doors: { areaM2, uValue }[]
│     airtightnessACH: number
│   }
├── internalLoads: { lightingWPerM2, equipmentWPerM2, scheduleHours }
├── ventilation: { rateACH, type, hrvEfficiency }
├── systems: {
│     heating: { type, cop }
│     cooling: { type, cop }
│     dhw: { type, efficiency }
│   }
├── renewables: { pvKw, windKw, otherKwh }
├── energySources: { electricityKwh, gasM3, oilL, woodM3 }
├── offsets: { recsKwh, greenGasM3, carbonCreditsKg }
├── actuals: { month, electricityKwh, gasM3 }[] (optional)
└── embodiedCarbon: { ... } (optional, TBD)
```

## Migration Strategy

- `schemaVersion` starts at 1
- When schema changes, increment version and write a migration function in `src/db/`
- Migrations run on IndexedDB load if stored version < current version

## Status

- [ ] Building interface defined
- [ ] Sub-types for each section (envelope, systems, etc.)
- [ ] Validation helpers (required field checks per TEUI version)
- [ ] Default/empty building factory function
