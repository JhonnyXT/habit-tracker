# 05 — Feature Development

> How a feature is built, end to end, once Core Infrastructure exists.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Feature Development |
| Version | 1.0 |
| Status | Draft |
| Audience | Engineering, AI Assistants |
| Depends On | 02-Architecture.md, 04-Core-Infrastructure.md |

---

# Purpose

Define a repeatable process for building a feature that stays consistent with `02-Architecture.md`'s layering and `03-Design-System.md`'s components — so every feature looks like it was built by the same team, regardless of who (or what) built it.

---

# The V1 Feature List

Per `requirements/01-PRD.md`, the V1 features to build, in a sensible dependency order:

1. **Habits** — create/edit/archive/delete/reorder (foundation for everything else).
2. **Tracking** — daily completion toggling, backfilling.
3. **Streaks & History** — derived views over Habits + Tracking data.
4. **Reminders** — local notifications per habit.
5. **Widget** — home screen surface over Habits + Tracking.
6. **Settings** — appearance, export/import.
7. **Onboarding** — thin wrapper guiding first-time creation of a Habit.

Later features must not be started before their dependencies are functionally complete — e.g. Reminders needs a real Habit entity to attach to, not a stub.

---

# Anatomy of a Feature

Every feature under `src/features/<name>/` follows the same internal shape from `02-Architecture.md`:

```
features/<name>/
  domain/
    entities/
    useCases/
    repositories/        (interfaces only)
  data/
    <name>Repository.ts   (implements the domain interface)
    mappers/
  presentation/
    screens/
    components/
    store.ts              (Zustand, if the feature needs local UI state)
```

A feature that has no meaningful UI state of its own (e.g. a purely derived view) may omit `store.ts`.

---

# Step-by-Step Process

1. **Confirm scope** — re-read the relevant User Stories (`requirements/User-Stories.md`) and Functional Requirements (`requirements/Functional-Requirements.md`) for this feature. Do not add anything not listed there.
2. **Domain first** — define entities and use cases with no UI in mind. Write them so they could theoretically run in a plain Node script.
3. **Data second** — implement the repository interface against SQLite (`Database.md`), satisfying the Domain layer's contract exactly.
4. **Presentation third** — build screens/components from `core/ui` and `design/Components.md`, calling use cases through the composition root (`Dependency-Injection.md`).
5. **Wire navigation** — register routes/deep links in the navigation shell established in `04-Core-Infrastructure.md`.
6. **Verify against acceptance criteria** — every User Story's acceptance criteria for this feature must be demonstrably true before moving on.

---

# Rules While Building a Feature

- Never import another feature's `data/` layer directly — if cross-feature data is needed, expose it through a Domain-layer interface intentionally (per `02-Architecture.md`'s Non-Negotiable Rules).
- Never put schedule/streak/validation logic in a component or a Zustand store — it belongs in `domain/useCases`.
- Never hardcode a color, spacing or duration value — use `core/ui` tokens.
- Every new interactive component must satisfy `standards/Accessibility.md` before being considered done, not as a follow-up pass.

---

# Templates

Use the templates in `.claude/templates/` as starting points for new files within a feature:

- `feature-template.md` — scaffolding a new feature folder.
- `screen-template.md`, `component-template.md` — Presentation layer.
- `use-case-template.md`, `repository-template.md` — Domain layer.
- `hook-template.md`, `service-template.md` — supporting Presentation/Platform code.

---

# Definition of Done

A feature is done only when it satisfies `standards/Definition-of-Done.md` in full — this document defines *how* to build it; that document defines *when it counts as finished*.

---

# Related Documents

- `02-Architecture.md` — the layering this process enforces.
- `04-Core-Infrastructure.md` — the foundation every feature builds on.
- `requirements/User-Stories.md`, `requirements/Functional-Requirements.md` — the scope each feature must satisfy exactly.
- `standards/Definition-of-Done.md`, `standards/Testing-Strategy.md` — completion and verification criteria.

---

**End of Document**
