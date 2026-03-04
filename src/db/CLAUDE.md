# src/db/

## Purpose

IndexedDB persistence layer using Dexie.js. This is the offline-first storage for all project data.

## Key File

- `index.ts` — Dexie database definition, schema, and migration logic

## Design Rules

1. **Dexie.js wraps IndexedDB** — Provides a clean Promise-based API and handles schema versioning/migrations.
2. **One database, versioned schema** — Database name: `objective-db`. Schema version increments when tables or indexes change.
3. **Tables mirror the data model** — Primary table: `projects` (stores full `Building` objects keyed by `id`).
4. **Sync-ready IDs** — Use UUIDs (not auto-increment) so projects can be synced to a server later without ID conflicts.
5. **Timestamps on everything** — `createdAt` and `updatedAt` on all records for future sync conflict resolution.

## Schema

```
objective-db v1:
  projects: id, meta.name, meta.updatedAt  (indexed fields)
  climateCache: locationKey, data, fetchedAt  (cached Environment Canada responses)
```

## Climate Cache

- Environment Canada API responses are cached in a `climateCache` table
- Keyed by location identifier (lat/lon rounded or city name)
- `fetchedAt` timestamp for cache invalidation (e.g., refresh if > 30 days old)
- Enables offline access to previously looked-up climate data

## Migration Strategy

- Dexie handles schema migrations via version numbers
- Each version bump includes an upgrade function that transforms existing data
- Never delete user data during migrations — only add fields or restructure

## Status

- [ ] Dexie database setup with projects table
- [ ] Climate cache table
- [ ] CRUD helpers (createProject, getProject, listProjects, updateProject, deleteProject)
- [ ] Schema migration framework
