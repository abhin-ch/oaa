# src/db/

## Purpose

IndexedDB persistence layer using Dexie.js. Offline-first storage for all project data.

## Key File

- `index.ts` — Dexie database definition, schema versions, and CRUD operations

## Schema (current: v4)

```
objective-db:
  projects:     id, name, address, updatedAt, archived
  calculations: id, projectId, name, calcType, teui, ghgi, createdAt
```

Migration history: v1 (initial) -> v2 (add occupancy) -> v3 (add evaluationPeriod) -> v4 (add calculations table + archived flag)

## Design Rules

1. UUIDs for all record IDs (sync-ready)
2. Timestamps on all records (createdAt, updatedAt)
3. Never delete user data during migrations — only add/restructure
4. CRUD operations exported as plain async functions used by Zustand store
