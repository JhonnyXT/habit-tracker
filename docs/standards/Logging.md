# Logging

> On-device-only logging conventions, respecting the product's no-remote-telemetry constraint.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Logging |
| Version | 1.0 |
| Status | Draft |
| Audience | Engineering |
| Depends On | requirements/Non-Functional-Requirements.md, Error-Handling.md |

---

# Purpose

Define logging conventions that aid local debugging without violating NFR-8.1 — no data leaves the device via logging, ever, without a separate explicit ADR.

---

# Principle

Logging in this application exists to help a developer debug a local build during development — it is not a production observability pipeline. There is no remote log aggregation service in V1.

---

# Log Levels

| Level | Use |
|-------|-----|
| `debug` | Verbose, development-only detail (e.g. a use case's intermediate steps) — stripped from release builds. |
| `info` | Notable but expected events (e.g. "database migrated to version 3") — present in development builds, minimal/absent in release. |
| `warn` | Recoverable but noteworthy conditions (e.g. notification permission denied) — helps diagnose degraded-but-functioning states. |
| `error` | A caught failure that was handled per `Error-Handling.md` but is still worth recording locally for debugging. |

---

# What Gets Logged

- Errors caught at the Data, Platform, and file import/export boundaries (`Error-Handling.md`), with enough context to reproduce the issue (which operation, not raw user data where avoidable).
- Migration execution (`engineering/Database.md`) — start, success, failure — since a failed migration is a critical, must-diagnose event.
- Notification scheduling outcomes (success, permission denied) for local debugging of reminder issues.

---

# What Never Gets Logged

- Habit names, notes, or any user-entered content, beyond what's strictly necessary to diagnose a bug during active development — and never in release builds.
- Anything that would leave the device — this application has no remote logging sink in V1. If one is ever introduced, it requires an ADR (`decisions/`) and an update to `requirements/Non-Functional-Requirements.md` NFR-8, not a quiet addition.

---

# Implementation

- A single, small logging utility in `core/` wraps whatever underlying mechanism is used (e.g. `console` in development), so call sites use one consistent API (`logger.warn(...)`) rather than raw `console.log` scattered throughout the codebase.
- Release builds strip `debug`-level logs entirely; `info`/`warn`/`error` may remain for on-device debugging (e.g. viewable via a development menu) but still never transmit anywhere.

---

# Related Documents

- `requirements/Non-Functional-Requirements.md` (NFR-8) — the constraint this document implements.
- `Error-Handling.md` — what gets caught, and therefore what becomes loggable.
- `reviews/Production-Checklist.md` — how production health is monitored without remote logging.

---

**End of Document**
