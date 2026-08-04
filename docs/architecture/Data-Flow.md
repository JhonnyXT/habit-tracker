# Data Flow

> Concrete, end-to-end traces of data moving through the layers defined in `02-Architecture.md`.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Data Flow |
| Version | 1.0 |
| Status | Draft |
| Audience | Engineering, AI Assistants |
| Depends On | 02-Architecture.md |

---

# Purpose

`02-Architecture.md` defines the layers and the dependency rule. This document traces the most important flows through those layers concretely, so implementers can see exactly which layer is responsible for which step — and so no flow ever skips a layer (e.g. a component querying SQLite directly).

---

# Flow 1 — Marking a Habit Done (Today Screen)

```
User taps habit row
  → Presentation: Today screen handler calls ToggleCompletion use case
    → Domain: ToggleCompletion validates the date is not in the future (FR-2.3)
      → Domain: calls CompletionRepository.upsert() (interface)
        → Data: SQLite implementation writes/updates the row, enforcing FR-2.2 uniqueness
      ← Domain: returns updated Completion + recalculated streak (via StreakCalculator)
  ← Presentation: Zustand store updates; Today screen and any open Habit Detail re-render
```

No network call exists in this flow. The only latency is a local SQLite write, which is why NFR-1.3 (no perceptible delay) is achievable by construction.

---

# Flow 2 — Loading the Today Screen

```
Today screen mounts
  → Presentation: calls GetTodayHabits use case
    → Domain: filters non-archived habits whose Schedule matches today's date (FR-1.4, FR-3.1)
      → Domain: calls HabitRepository.getAll() and CompletionRepository.getForDate(today)
        → Data: two SQLite reads
      ← Domain: combines habits + today's completions + computed streak per habit
  ← Presentation: Zustand store hydrates; screen renders in the user's manual sort order (FR-1.5)
```

---

# Flow 3 — Streak Calculation

```
Any caller (Today screen, Habit Detail, aggregate History) needs a streak
  → Domain: StreakCalculator.compute(habitId)
    → Domain: calls CompletionRepository.getHistory(habitId) via the repository interface
      → Data: SQLite read of all completions for that habit
    ← Domain: derives current streak and longest streak per FR-4.1–FR-4.3, entirely from completion rows
  ← Caller receives a value — never a value that was separately stored and could drift (FR-4.4)
```

Streaks are always a pure function of completion history. There is intentionally no "streak" column anywhere in the schema.

---

# Flow 4 — Reminder Notification to Completion

```
Scheduled time arrives (OS-owned, set when reminder was created)
  → Platform: Expo Notifications fires local notification (FR-6.1)
User taps notification
  → Platform: deep link payload identifies habitId
    → Presentation: Expo Router navigates to that habit's context (FR-6.3)
      → (same as Flow 1 from here once the user marks it done)
```

No data flows to or from a server at any point — the entire loop is scheduled and resolved on-device.

---

# Flow 5 — Widget Read and Write

```
Widget render triggered by OS refresh policy
  → Platform: widget data adapter reads today's habits + completions
    (same Domain use case as Flow 2, via whatever shared-data mechanism the platform requires,
     e.g. an app group container — see engineering/Widgets.md)
  ← Widget renders today's habits and their state

User taps a habit inside the widget (where platform allows)
  → Platform: widget invokes the same ToggleCompletion use case as Flow 1
    → Data: same SQLite write
  ← Next time the main app is opened, it reads the same underlying data — no reconciliation step needed,
    because there was only ever one source of truth
```

---

# Flow 6 — Backfilling a Past Date

```
User selects a past date in Habit Detail and marks it done/not done
  → Presentation: calls ToggleCompletion use case with an explicit past date
    → Domain: validates date ≤ today (FR-2.3); future dates are rejected before reaching Data
      → Data: SQLite upsert for that (habitId, date) pair
  ← Domain: recalculates streak from the full, now-corrected history (Flow 3)
  ← Presentation: calendar view and streak values update to reflect the correction
```

---

# Flow 7 — Export / Import

```
Export:
  Settings → Presentation calls ExportData use case
    → Domain: reads all habits (including archived) + all completions via repositories
      → Data: SQLite reads
    ← Domain: serializes into a single self-contained file format
  ← Platform: OS share sheet lets the user save/share the file (FR-9.1)

Import:
  Settings → user selects a file → Presentation calls ImportData use case
    → Domain: validates file structure (FR-9.2) before touching the database
      → Data: if valid, writes habits + completions inside a single transaction (NFR-3.2)
      → Data: if invalid, no writes occur — the import fails safely
  ← Presentation: on success, all screens re-read from the Domain layer and reflect restored data (FR-9.3)
```

---

# Cross-Cutting Rule

Every flow above passes through the Domain layer's use cases — none of them go Presentation/Platform → Data directly. This is the Dependency Rule from `02-Architecture.md` made concrete: if a new flow is added and it doesn't fit this pattern, the flow's design is wrong, not this document.

---

# Related Documents

- `02-Architecture.md` — the layers and dependency rule these flows implement.
- `requirements/Functional-Requirements.md` — the FR references cited above.
- `requirements/Non-Functional-Requirements.md` — the NFR references cited above.
- `engineering/Database.md`, `engineering/Notifications.md`, `engineering/Widgets.md` — implementation detail per flow.

---

**End of Document**
