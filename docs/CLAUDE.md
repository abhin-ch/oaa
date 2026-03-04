# docs/

## Purpose

Project documentation, research, and planning materials. This is the single source of truth for architectural decisions, requirements, and domain knowledge.

## Key Files

- `research.md` — TEUI framework deep-dive: version history (v1–v4), calculation models, energy balance equations, input schemas, existing tool analysis, proposed architecture, and UI principles. **Read this first** to understand the domain.
- `plan.md` — Implementation plan: tech stack, architecture, data model, user journey, PWA strategy, accessibility checklist, build phases, folder structure, and all resolved key decisions.

## Domain Knowledge

### TEUI Versions

| Version | Scope                                | Key Difference                             |
| ------- | ------------------------------------ | ------------------------------------------ |
| TEUI1   | Energy bills ÷ area                  | Simplest — just kWh and m²                 |
| TEUI2   | + occupancy, renewables, carbon, IAQ | Expanded calculator for larger buildings   |
| TEUI3   | Full energy balance model            | Reference + Design + Actual models, static |
| TEUI4   | Real-time dual-model + Sankey        | Full BEM platform, live optimization       |

### Core Formula

`TEUI = Total Annual Energy Use (kWhₑ) / Conditioned Floor Area (m²)`

### Key Metrics

- **TEUI** — Total Energy Use Intensity (kWh/m²/yr)
- **TEDI** — Thermal Energy Demand Intensity (heating only)
- **GHGI** — GHG Intensity (kgCO₂e/m²/yr)

### Unit Conversions (Constants)

- Gas: 1 m³ = 0.0373 GJ, 1 GJ = 277 kWh
- CO₂: 1 m³ gas → 2.63 kgCO₂; 1 kWh Ontario grid → 0.00004 MTCO₂

## Updating These Docs

- When a key decision is made or changed, update `plan.md` Section "Key Decisions"
- When new domain knowledge is discovered, add to `research.md`
- Keep this CLAUDE.md current as docs evolve
