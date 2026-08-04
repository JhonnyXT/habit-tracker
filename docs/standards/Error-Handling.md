# Error Handling

> How failures are caught, represented, and surfaced across layers.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Error Handling |
| Version | 1.0 |
| Status | Draft |
| Audience | Engineering |
| Depends On | architecture/02-Architecture.md |

---

# Purpose

Define where errors are caught and how they're represented at each architectural layer, so failures degrade gracefully (NFR-3) instead of crashing or silently corrupting state.

---

# Principle

Only handle errors that can actually occur at a given boundary — don't add defensive handling for scenarios the type system or architecture already rules out (per the Charter's "don't add error handling for scenarios that can't happen"). The boundaries that matter here are: the Data layer (SQLite can fail), the Platform layer (OS permissions/APIs can fail or be denied), and file I/O (import/export can encounter invalid files).

---

# Domain Layer

- Use cases express expected failure as part of their return type (e.g. a discriminated result), not by throwing for conditions that are a normal part of business rules — e.g. "future date rejected" (FR-2.3) is a normal, expected outcome, not an exceptional crash.
- Truly exceptional, programmer-error conditions (a violated invariant that should be structurally impossible) may throw — these represent bugs to fix, not conditions the UI needs to gracefully message around.

---

# Data Layer

- SQLite operation failures are caught at the repository boundary and translated into a Domain-layer-friendly result — callers above never see a raw native database exception.
- Transactions (`engineering/Database.md`) roll back completely on failure — a repository method must never leave partial writes visible to callers.

---

# Platform Layer

- Notification permission denial (FR-6.4) is treated as a normal, expected state — not an error to log loudly, but a UI state to reflect accurately.
- Widget data adapter failures (`engineering/Widgets.md`) degrade to showing the widget's last-known-good state rather than crashing the widget surface.

---

# File Import / Export

- Import validates the file's structure fully before writing anything (FR-9.2) — validation failure produces a clear, specific user-facing message ("This file isn't a valid backup"), not a generic crash or a silent no-op.
- Export failures (e.g. unable to write/share the file) are surfaced to the user directly — there is no silent failure mode for an action the user explicitly initiated.

---

# Presentation Layer

- Components/screens handle the result of a use case call explicitly — a failed operation always has a defined UI state (e.g. an inline message), never an unhandled promise rejection left to crash the app.
- Errors are never presented to the user in raw technical form (stack traces, native exception messages) — always translated into calm, plain-language copy consistent with `design/UX-Principles.md`.

---

# What Is Explicitly Not Handled

- Network errors — the application has no network dependency for its core functionality (NFR-2.2), so there is no general-purpose network error handling layer to build.
- Recovering from a corrupted SQLite file beyond what the platform itself provides — this is treated as a rare, catastrophic case; the mitigation is the export/backup feature (FR-9), not defensive in-app database repair logic.

---

# Related Documents

- `architecture/02-Architecture.md` — the layers this document assigns error-handling responsibility to.
- `requirements/Non-Functional-Requirements.md` (NFR-3) — the reliability commitment this document implements.
- `Logging.md` — how handled errors are recorded, distinct from how they're surfaced to the user.
- `standards/Coding-Standards.md` — general code style this document assumes.

---

**End of Document**
