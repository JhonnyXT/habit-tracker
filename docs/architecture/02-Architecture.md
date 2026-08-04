# 02 — Architecture

> This document defines how the system is built: its layers, boundaries, dependency rules and technology mapping.
>
> It implements the scope defined in `01-PRD.md` under the principles defined in `00-Project-Charter.md`. It does not redefine scope or philosophy — it defines structure.
>
> Every engineering document that follows (`04-Core-Infrastructure.md`, `05-Feature-Development.md`) must conform to the boundaries defined here.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Architecture |
| Version | 1.0 |
| Status | Draft |
| Audience | Engineering, AI Assistants |
| Depends On | 00-Project-Charter.md, 01-PRD.md |

---

# Purpose

Define a Clean Architecture, Feature-First structure that:

- Keeps business logic independent of React Native, Expo, and any specific UI library.
- Lets features be added, changed or removed in isolation.
- Makes the codebase understandable by a new contributor without a walkthrough.
- Remains stable even as the technology stack (navigation library, state library) evolves.

---

# Architectural Style

The application follows **Clean Architecture** combined with **Feature-First organization**, per the Charter's Architectural Principles.

Two orthogonal ideas govern the codebase:

1. **Layering (Clean Architecture)** — code is grouped by its distance from business rules, and dependencies point inward, toward the domain.
2. **Feature-First organization** — within the outer layers, code is grouped by feature (e.g. `habits`, `reminders`, `widget`), not by technical type (e.g. not one giant `components/` or `screens/` folder for the whole app).

These combine: each feature has its own presentation, domain and data slices; shared, feature-agnostic code lives in a core/shared layer.

---

# Layers

## 1. Domain Layer (innermost)

- Pure TypeScript. No React, no React Native, no Expo imports.
- Contains: entities (Habit, Completion), value objects (Schedule, Streak calculation), use cases (CreateHabit, ToggleCompletion, ComputeStreak), and repository interfaces.
- Has zero knowledge of how data is persisted or how the UI is rendered.
- This is the layer that encodes the Functional Requirements from `requirements/Functional-Requirements.md`.

## 2. Data Layer

- Implements the repository interfaces defined in the Domain layer.
- Owns all interaction with Expo SQLite: schema, queries, migrations.
- Owns mapping between database rows and domain entities.
- Nothing outside this layer writes raw SQL or touches the database directly.

## 3. Presentation Layer (outermost)

- React Native components, screens, navigation (Expo Router), and state bound to the UI (Zustand stores/hooks).
- Calls use cases from the Domain layer; never talks to the Data layer directly.
- Contains no business rules — no streak math, no schedule interpretation logic. If a screen needs to decide something non-trivial, that decision belongs in a use case, not the component.

## 4. Platform / Infrastructure Layer

- Expo Notifications integration, the home screen widget target, file export/import (backup), and any other OS-level integration.
- Talks to the Domain layer through the same use cases and repository interfaces as the Presentation layer — the widget is a second presentation surface, not a special case with its own business logic.

---

# The Dependency Rule

Dependencies only point inward:

```
Presentation  ─┐
                ├──▶  Domain  ◀──┐
Platform      ─┘                 │
                                  │
Data  ────────────────────────────┘
(implements Domain interfaces)
```

- Domain depends on nothing.
- Data depends on Domain (implements its interfaces) — never the reverse.
- Presentation and Platform depend on Domain (use cases, entities) — never on Data directly.
- No layer depends on Presentation.

Violating this rule (e.g. a component importing a SQLite query directly) is treated as a bug, not a style preference.

---

# Feature-First Organization

Within Presentation, Data, and Platform, code is grouped by feature, not by technical type:

```
src/
  features/
    habits/
      domain/
      data/
      presentation/
    reminders/
      domain/
      data/
      presentation/
    widget/
      presentation/
    history/
      domain/
      presentation/
  core/
    domain/          (shared entities/types used across features, if any)
    data/            (database connection setup, shared infra)
    ui/               (design-system primitives, not feature logic)
    navigation/
```

Exact file-level conventions live in `standards/Folder-Structure.md` — this document defines the shape, not every filename.

A feature should be understandable, testable and removable by touching only its own folder plus, at most, its registration point in navigation/DI.

---

# Technology Stack Mapping

| Layer | Technology |
|-------|-----------|
| Presentation — UI | React Native, Expo, Expo Router (navigation), Expo Symbols (iconography) |
| Presentation — State | Zustand (UI-facing state only — not a replacement for the Domain layer) |
| Presentation — Motion | React Native Reanimated, React Native Gesture Handler |
| Domain | Plain TypeScript, no framework dependency |
| Data | Expo SQLite |
| Platform | Expo Notifications, Expo Widgets |
| Language | TypeScript (strict mode) across all layers |

Zustand stores are part of the Presentation layer: they hold UI state (e.g. "is this sheet open") and expose data fetched via use cases. They must not contain business rules such as streak computation — that belongs in the Domain layer, called by a use case, and merely exposed through the store.

---

# Dependency Injection

- Repository implementations (Data layer) are constructed once and provided to use cases via a lightweight composition root — no global singletons reached into ad hoc from components.
- Use cases receive their repository dependencies through their constructor/factory, not by importing a concrete SQLite implementation directly.
- This keeps use cases testable in isolation with in-memory fakes, without touching SQLite.
- Full conventions live in `engineering/Dependency-Injection.md`.

---

# State Management Principles

- Server/network state does not exist in this application — there is no server. "Remote state" concerns from typical apps do not apply.
- Local persisted state (habits, completions) is owned by the Data layer and surfaced through use cases.
- Zustand holds derived/UI state and thin projections of use-case results for the Presentation layer to consume reactively.
- Full conventions live in `engineering/State-Management.md`.

---

# Navigation

- Expo Router provides file-based routing for screens listed in `01-PRD.md`'s Screen Inventory (Today, Habit Detail, Add/Edit Habit, History, Settings, Onboarding).
- Deep links from notifications (FR-6.3) resolve through the same router, not a parallel navigation mechanism.

---

# Widget Architecture

- The widget is a separate rendering surface sharing the same Domain layer and, where the platform requires a separate data mechanism (e.g. an app group / shared container), a Data-layer adapter reads the same underlying data — it does not duplicate business rules.
- Widget interactivity (marking a habit done) invokes the same use case the main app uses, ensuring both surfaces can never disagree about state.

---

# Error Handling & Logging (Pointers)

- Error handling conventions: `standards/Error-Handling.md`.
- Logging conventions: `standards/Logging.md`.
- Both apply uniformly across all layers; this document does not restate them.

---

# Testing Implications of This Architecture

- Domain layer: unit-testable with no mocks beyond simple fakes for repository interfaces.
- Data layer: tested against a real (in-memory or temp-file) SQLite instance, not mocked away, so migrations and queries are verified for real.
- Presentation layer: tested through component/integration tests exercising use cases via fakes.
- Full strategy: `standards/Testing-Strategy.md`.

---

# Non-Negotiable Rules

- Business logic (schedule interpretation, streak computation, validation) MUST live in the Domain layer only.
- Components MUST NOT import the Data layer directly.
- Every feature MUST be structured so it can be deleted by removing its folder plus its navigation/DI registration, without leaving orphaned logic in shared code.
- No feature MAY reach into another feature's Data layer directly; cross-feature interaction happens through Domain-layer interfaces exposed intentionally, not through convenience imports.

---

# Related Documents

- `00-Project-Charter.md` — Architectural Principles this document implements.
- `01-PRD.md` — scope this architecture must support.
- `Data-Flow.md` — concrete data flow through these layers.
- `engineering/04-Core-Infrastructure.md`, `engineering/05-Feature-Development.md` — applying this architecture to real work.
- `standards/Folder-Structure.md`, `engineering/Dependency-Injection.md`, `engineering/State-Management.md` — implementation-level conventions.

---

**End of Document**
