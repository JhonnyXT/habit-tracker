# State Management

> Conventions for Zustand usage within the Presentation layer.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | State Management |
| Version | 1.0 |
| Status | Draft |
| Audience | Engineering |
| Depends On | 02-Architecture.md |

---

# Purpose

Define exactly what belongs in a Zustand store and what does not, so state management stays a thin Presentation-layer concern rather than absorbing business logic that belongs in the Domain layer.

---

# What Zustand Is For

- UI state: whether a sheet is open, which tab is active, in-progress form field values before submission.
- Thin, reactive projections of use-case results: e.g. "today's habits with their completion state," refreshed by calling a use case and storing its output.

# What Zustand Is Not For

- Business rules: streak computation, schedule interpretation, validation logic. These live in the Domain layer (`useCases`) and are merely *called* by store actions, never reimplemented inside them.
- Persistence: a store is not a database. It holds a reactive snapshot; the actual source of truth is always SQLite via the Data layer.
- Cross-feature global state "for convenience." Each feature owns its own store(s); shared state that legitimately spans features is the exception, not the default, and must be justified the same way a new shared component would be.

---

# Store Shape Convention

A typical feature store:

```ts
type HabitsState = {
  habits: Habit[]
  isLoading: boolean
  loadToday: () => Promise<void>
  toggleCompletion: (habitId: string, date: string) => Promise<void>
}
```

- Actions call use cases (via the composition root, see `Dependency-Injection.md`) and update local state with the result.
- Actions do not contain conditional business logic beyond simple UI concerns (e.g. optimistic update ordering) — the use case is the single place a rule like "future dates are rejected" (FR-2.3) is enforced.

---

# Loading State

Per `design/Components.md`'s note that loading is not a required state for local data operations: stores may still expose an `isLoading` flag for initial screen mount (first read from SQLite), but not for individual write operations like toggling a completion, which must feel instant (NFR-1.3).

---

# Store Scope

- One store per feature, colocated at `features/<name>/presentation/store.ts`.
- A store must not import another feature's store directly; if two features need to react to the same event (e.g. Widget needs Habits' data), that dependency flows through the Domain layer's use cases, not through cross-store imports.

---

# Testing

- Store logic is tested by asserting it correctly calls the relevant use case and reflects the result — not by re-testing the use case's business rules, which are already covered at the Domain layer (`standards/Testing-Strategy.md`).

---

# Related Documents

- `02-Architecture.md` — where Zustand sits (Presentation layer only).
- `Dependency-Injection.md` — how stores obtain use case instances.
- `05-Feature-Development.md` — where store.ts fits in a feature's anatomy.

---

**End of Document**
