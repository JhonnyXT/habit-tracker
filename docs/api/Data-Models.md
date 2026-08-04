# Data Models

> The complete, column-level schema for the local SQLite database, and the domain entities it maps to.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Data Models |
| Version | 1.0 |
| Status | Draft |
| Audience | Engineering |
| Depends On | architecture/02-Architecture.md, engineering/Database.md, requirements/Functional-Requirements.md |

---

# Purpose

Define the authoritative schema implementing the entities described conceptually in `engineering/Database.md` and the rules in `requirements/Functional-Requirements.md` (FR-1, FR-2). This is the single source of truth for column names, types and constraints — repository implementations and mappers (`standards/Folder-Structure.md`) must match this exactly.

---

# Entity: Habit

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | TEXT (UUID) | PRIMARY KEY | Generated client-side at creation. |
| `name` | TEXT | NOT NULL, max 60 chars | FR-1.1. |
| `icon` | TEXT | NOT NULL | Identifier from the curated Expo Symbols set (`design/Icons.md`); defaults if not chosen. |
| `color` | TEXT | NOT NULL | One of the fixed `color.habit.*` token keys (`design/Colors.md`); defaults if not chosen. |
| `schedule_type` | TEXT | NOT NULL, one of `daily` \| `weekdays` \| `times_per_week` | FR-1.4. |
| `schedule_weekdays` | TEXT (JSON array) | NULL unless `schedule_type = 'weekdays'` | e.g. `["mon","wed","fri"]`. |
| `schedule_times_per_week` | INTEGER | NULL unless `schedule_type = 'times_per_week'`, range 1–7 | FR-1.4. |
| `sort_order` | INTEGER | NOT NULL | Explicit, user-editable order (FR-1.5); distinct from `created_at`. |
| `archived` | BOOLEAN | NOT NULL, default `false` | FR-1.6 / US-05. |
| `created_at` | TEXT (ISO 8601) | NOT NULL | |
| `updated_at` | TEXT (ISO 8601) | NOT NULL | |

---

# Entity: Completion

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | TEXT (UUID) | PRIMARY KEY | |
| `habit_id` | TEXT | NOT NULL, FOREIGN KEY → `habits.id` | |
| `date` | TEXT (ISO 8601 date, no time) | NOT NULL | FR-2.1; must be ≤ current device date at write time (FR-2.3). |
| `created_at` | TEXT (ISO 8601) | NOT NULL | |

**Constraint:** `UNIQUE(habit_id, date)` — enforces FR-2.2 at the database level, not only in application code.

**Index:** `(habit_id, date)` — supports fast streak and calendar queries at scale (NFR-1.4).

Note: there is deliberately no `streak` column anywhere in this schema — streaks are always derived from `Completion` rows (FR-4.4, `architecture/Data-Flow.md` Flow 3).

---

# Entity: Reminder

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | TEXT (UUID) | PRIMARY KEY | |
| `habit_id` | TEXT | NOT NULL, FOREIGN KEY → `habits.id` | A habit may have zero or more reminders (FR-6.1). |
| `time` | TEXT (`HH:mm`, 24h) | NOT NULL | |
| `enabled` | BOOLEAN | NOT NULL, default `true` | |
| `created_at` | TEXT (ISO 8601) | NOT NULL | |

---

# Domain Entity Mapping

Per `architecture/02-Architecture.md`, database rows are never exposed directly outside the Data layer. Each row maps to a Domain entity via a mapper (`<entity>Mapper.ts`, per `standards/Folder-Structure.md`):

```ts
// Domain layer — no database concerns
type Habit = {
  id: string
  name: string
  icon: string
  color: HabitColorToken
  schedule: Schedule            // union type, not raw schedule_* columns
  sortOrder: number
  archived: boolean
  createdAt: Date
  updatedAt: Date
}

type Schedule =
  | { type: 'daily' }
  | { type: 'weekdays'; days: Weekday[] }
  | { type: 'timesPerWeek'; count: number }

type Completion = {
  id: string
  habitId: string
  date: string    // ISO date, no time component
}

type Reminder = {
  id: string
  habitId: string
  time: string    // HH:mm
  enabled: boolean
}
```

The `schedule_type` + `schedule_weekdays` + `schedule_times_per_week` columns collapse into a single, type-safe `Schedule` union at the mapping boundary — the Domain layer never handles the three raw nullable columns directly.

---

# Export File Format

Per FR-9.1, the export file is a serialization of these Domain entities — not a raw copy of the SQLite file — so the format stays stable even if the underlying schema evolves:

```json
{
  "formatVersion": 1,
  "exportedAt": "2026-07-30T12:00:00Z",
  "habits": [ /* Habit[] */ ],
  "completions": [ /* Completion[] */ ],
  "reminders": [ /* Reminder[] */ ]
}
```

- `formatVersion` allows future import logic to handle older export files without guessing.
- Import validation (FR-9.2) checks `formatVersion` and the shape of each array before any database write occurs.

---

# Related Documents

- `architecture/02-Architecture.md`, `architecture/Data-Flow.md` — how these entities flow through the layers.
- `engineering/Database.md` — migration and query conventions applied to this schema.
- `requirements/Functional-Requirements.md` (FR-1, FR-2, FR-6, FR-9) — the requirements this schema implements.
- `api/API-Contracts.md` — the internal use case / repository contracts operating over these entities.

---

**End of Document**
