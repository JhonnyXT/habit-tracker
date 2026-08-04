# 04 — Core Infrastructure

> The foundational, cross-feature setup that must exist before any feature can be built.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Core Infrastructure |
| Version | 1.0 |
| Status | Draft |
| Audience | Engineering, AI Assistants |
| Depends On | 02-Architecture.md, Data-Flow.md |

---

# Purpose

Define the infrastructure that every feature depends on, so it is built once, correctly, and never duplicated per feature. This is the first engineering phase after Design System, per `docs/README.md`'s Development Workflow — no feature work begins before this exists.

---

# Scope of Core Infrastructure

Per `02-Architecture.md`'s `core/` folder, this phase establishes:

- Project scaffolding (Expo + Expo Router + TypeScript strict mode).
- The `core/ui` design-system primitives implementing `design/` tokens as real code.
- The database connection and migration runner (`Database.md`).
- The dependency injection composition root (`Dependency-Injection.md`).
- Shared navigation shell (tab/stack structure matching the Screen Inventory in `requirements/01-PRD.md`).
- Base error handling and logging utilities (`standards/Error-Handling.md`, `standards/Logging.md`).
- Theming plumbing (light/dark resolution feeding `design/Colors.md` tokens to components).

---

# Project Setup Requirements

- TypeScript strict mode enabled from the first commit — never loosened later to unblock a specific feature (NFR-6.2).
- Expo Router configured with the file-based routes needed for the Screen Inventory, even if screens are initially placeholders.
- ESLint/formatting configured per `standards/Coding-Standards.md` before any feature code is written.

---

# `core/ui` — Design System as Code

- Every token defined in `design/Colors.md`, `design/Typography.md`, `design/Spacing.md`, `design/Motion.md` is implemented as a typed constant or theme object here — features import from `core/ui`, never redefine a token locally.
- The components enumerated in `design/Components.md` (HabitRow, PrimaryButton, EmptyState, etc.) that are **not** feature-specific live here; feature-specific compositions of them live inside the owning feature's `presentation/` folder.

---

# Navigation Shell

- Implements the Screen Inventory from `requirements/01-PRD.md`: Onboarding, Today, Habit Detail, Add/Edit Habit, History, Settings.
- Deep link handling for notification taps (FR-6.3) is wired at this layer, resolving to the correct route — individual features register their own deep link targets, but the resolution mechanism itself is core infrastructure.

---

# Database Bootstrap

- Establishes the SQLite connection and runs migrations at app startup, before any feature's Data layer is used.
- Full schema and migration conventions: `Database.md`.

---

# Composition Root

- Wires concrete repository implementations (Data layer) to the use cases (Domain layer) that features consume, per `Dependency-Injection.md`.
- Exists as a single, small, explicit setup module — not scattered across features.

---

# Theming Runtime

- Resolves system light/dark preference (and the manual override from Settings, per FR-8.2) into the actual token values features render with.
- Features never branch on theme directly (per `design/03-Design-System.md`) — they consume already-resolved tokens from this runtime.

---

# Definition of Done for This Phase

Core Infrastructure is complete when:

- A new engineer (or AI assistant) can create a trivial new screen using only `core/ui` components, the navigation shell, and a stub use case, without writing any raw SQLite, theme-branching, or DI wiring by hand.
- TypeScript strict mode passes with zero errors.
- The database migrates cleanly from an empty install.

---

# Related Documents

- `02-Architecture.md`, `Data-Flow.md` — the architecture this infrastructure implements.
- `Database.md`, `Dependency-Injection.md`, `State-Management.md` — detailed specs for each infrastructure piece.
- `design/` — the system this infrastructure turns into code.
- `05-Feature-Development.md` — what gets built on top of this foundation.

---

**End of Document**
