# Dependency Injection

> How repositories and use cases are constructed and wired, keeping the Domain layer testable and framework-agnostic.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Dependency Injection |
| Version | 1.0 |
| Status | Draft |
| Audience | Engineering |
| Depends On | 02-Architecture.md |

---

# Purpose

Define a single, explicit mechanism for constructing use cases with their repository dependencies, so:

- Use cases never import a concrete SQLite implementation directly.
- Tests can supply in-memory fakes without touching real infrastructure.
- Wiring lives in one place instead of being scattered ad hoc across features.

---

# Approach

The application uses a lightweight, explicit **composition root** — a single module (part of Core Infrastructure, `04-Core-Infrastructure.md`) that constructs concrete repository implementations and injects them into use case factories. This is deliberately not a heavyweight DI framework/container — the app's scale does not justify one, per the Charter's "avoid unnecessary abstractions."

---

# Pattern

```ts
// core/di/composition-root.ts
const habitRepository = new SqliteHabitRepository(db)
const completionRepository = new SqliteCompletionRepository(db)

export const useCases = {
  createHabit: createHabitUseCase(habitRepository),
  toggleCompletion: toggleCompletionUseCase(completionRepository),
  getTodayHabits: getTodayHabitsUseCase(habitRepository, completionRepository),
  // ...
}
```

- Use case factories (`createHabitUseCase`, etc.) live in each feature's `domain/useCases/` and accept repository **interfaces** as parameters — never a concrete class.
- The composition root is the only place concrete repository classes and use case factories are imported together.
- Presentation-layer stores (`State-Management.md`) import `useCases` from the composition root — never construct a repository or use case themselves.

---

# Testing With This Pattern

- Domain-layer tests construct a use case directly with a hand-written or lightweight fake repository — no composition root involved.
- Presentation-layer tests can swap in a test composition root providing fakes, without changing any component or store code.

---

# Rules

- A use case constructor/factory MUST accept repository interfaces, never concrete implementations.
- A component or store MUST NOT construct a repository or use case directly — it always goes through the composition root.
- The composition root MUST be the only file that imports both a concrete Data-layer class and the Domain-layer factory that consumes it.
- Adding a new feature means adding its wiring to the composition root once — not inventing a new DI pattern per feature.

---

# Related Documents

- `02-Architecture.md` — the Dependency Rule this mechanism enforces.
- `04-Core-Infrastructure.md` — where the composition root is bootstrapped.
- `State-Management.md` — how Presentation-layer code consumes wired use cases.
- `standards/Testing-Strategy.md` — how fakes are used in tests via this pattern.

---

**End of Document**
