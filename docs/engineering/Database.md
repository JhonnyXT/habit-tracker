# Database

> Schema, migrations, and data access conventions for the local SQLite database.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Database |
| Version | 1.0 |
| Status | Draft |
| Audience | Engineering |
| Depends On | 02-Architecture.md, api/Data-Models.md |

---

# Purpose

Define how the application's only data store — a local Expo SQLite database — is structured, migrated and accessed, so the Data layer defined in `02-Architecture.md` has a single, consistent implementation.

---

# Technology

- **Expo SQLite** is the sole persistence mechanism for V1 (per `01-PRD.md`'s Data Ownership scope — no server, no cloud database).
- All access goes through the Data layer's repository implementations — no feature, component, or store queries SQLite directly (per `02-Architecture.md`'s Non-Negotiable Rules).

---

# Schema Overview

Full column-level schema lives in `api/Data-Models.md`. At a structural level:

- **habits** — one row per habit (id, name, icon, color, schedule fields, archived flag, sort order, timestamps).
- **completions** — one row per (habit_id, date) pair marking that day complete, with a unique constraint enforcing FR-2.2.
- **reminders** — one or more rows per habit, each representing a scheduled local notification time.

Streaks and aggregate consistency are never stored as columns — they are always computed from `completions` (per FR-4.4 and `architecture/Data-Flow.md` Flow 3).

---

# Migrations

- Every schema change ships as an explicit, numbered migration — never a manual ALTER run ad hoc against a developer's device.
- Migrations run automatically at app startup, before any repository is used, as part of `04-Core-Infrastructure.md`'s database bootstrap.
- Migrations MUST be additive and backward-compatible with existing user data wherever possible — this app has no server-side data to fall back on, so a broken migration on a real user's device is data loss, not an inconvenience.
- Every migration is tested against a database seeded with realistic historical data (many habits, months of completions), not only an empty database (NFR-1.4, NFR-3.1).

---

# Data Access Conventions

- Repository implementations live in each feature's `data/` folder (e.g. `features/habits/data/HabitRepository.ts`) and implement the interface defined in that feature's `domain/repositories/`.
- Raw SQL lives only inside these repository implementations — never in a use case, a component, or a store.
- Repositories return domain entities, never raw database rows — mapping happens inside the repository (`mappers/`), keeping the row shape an implementation detail.

---

# Transactions

- Any operation that writes to more than one table (e.g. import restoring both `habits` and `completions`, per FR-9.2) MUST run inside a single database transaction, satisfying NFR-3.2 — partial writes are not an acceptable failure mode.
- A failed transaction MUST leave the database exactly as it was before the operation began.

---

# Query Performance

- Queries backing streak calculation and calendar/history views must remain fast as history grows across years of daily use (NFR-1.4) — this is verified with a seeded multi-year dataset in `reviews/06-Optimization.md`, not just an empty-database benchmark.
- Appropriate indexes (e.g. on `completions(habit_id, date)`) are part of the schema definition, not an afterthought added only when a slowdown is noticed.

---

# Backup / Export Format

- The export file described in `requirements/Functional-Requirements.md` (FR-9) is a serialization of the same entities described here — it is not a raw database file copy, so that the format remains stable even if the underlying SQLite schema changes across app versions.

---

# Related Documents

- `02-Architecture.md`, `Data-Flow.md` — where the Data layer sits and how it's used.
- `api/Data-Models.md` — full column-level schema.
- `requirements/Functional-Requirements.md`, `requirements/Non-Functional-Requirements.md` — the FR/NFR this document implements.
- `standards/Testing-Strategy.md` — how migrations and queries are tested.

---

**End of Document**
