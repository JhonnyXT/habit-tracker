# Widgets

> Home screen widget architecture, data sharing, and refresh behavior.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Widgets |
| Version | 1.0 |
| Status | Draft |
| Audience | Engineering |
| Depends On | 02-Architecture.md, Data-Flow.md |

---

# Purpose

Define how the home screen widget (FR-7) reads and writes the same data as the main app without ever becoming a second source of truth, implementing Flow 5 of `architecture/Data-Flow.md`.

---

# Technology

- **Expo Widgets** (native widget support via Expo config plugins — WidgetKit on iOS, App Widgets on Android).
- The widget is a separate native rendering surface from the React Native app; it does not run the app's JS bundle or React component tree.

---

# Architectural Position

Per `02-Architecture.md`, the widget is a **Platform layer** concern:

- It consumes the same Domain-layer use cases (`GetTodayHabits`, `ToggleCompletion`) as the main app's Presentation layer.
- It does not implement its own business logic — schedule interpretation, streak calculation, and validation all remain in the Domain layer, invoked identically regardless of which surface calls them.

---

# Data Sharing Mechanism

- Because the widget runs outside the main app's JS runtime, data must be readable from native widget code. This is implemented via whatever shared-storage mechanism the platform requires (e.g. an iOS App Group container, an Android equivalent shared preference/file mechanism) as a thin Data-layer adapter.
- This adapter is a **read (and where supported, write) path to the exact same underlying data** — not a copy, cache, or separately synced dataset. There is one source of truth (the SQLite database); the adapter's job is only to make it reachable from the native widget context.

---

# Read Path (Widget Render)

1. OS triggers a widget refresh (per platform-specific timeline/refresh policy).
2. The widget's native code reads today's habits and completions through the shared-storage adapter.
3. The widget renders using the same visual tokens as `design/Colors.md`, `design/Typography.md` and `design/Spacing.md` — translated into the native widget UI framework, since component code itself isn't shared (per `design/Components.md`).

---

# Write Path (Interactive Widget, Where Supported)

1. User taps a habit inside the widget.
2. The interaction invokes the same `ToggleCompletion` use case the main app uses (via the platform's interactive widget mechanism, e.g. `AppIntents`/similar on the platforms that support it).
3. The write goes to the same SQLite database the main app reads.
4. No reconciliation step exists or is needed — the next time the main app opens, it reads current data directly.

If a given OS version does not support interactive widgets, the widget degrades to read-only (tap opens the app instead), per NFR-7.3 — this is a graceful platform limitation, not an error state.

---

# Refresh Behavior

- The widget refreshes on the OS's own timeline/refresh policy plus explicit invalidation triggered by the app after any write that could affect it (e.g. after `ToggleCompletion` or after editing a habit's schedule).
- No widget-specific polling or background fetch is introduced — this stays within NFR-2.2's no-unnecessary-network / no-unnecessary-background-work constraint.

---

# Visual Consistency

Per `design/UX-Principles.md`'s "Consistency Across Surfaces" principle: the widget must show the same habit colors, icons, and completion state as the app at all times — a user should never see the widget and the app disagree.

---

# Testing Considerations

- The underlying use cases (`GetTodayHabits`, `ToggleCompletion`) are already unit-tested at the Domain layer via the main app's test suite — the widget reuses, not reimplements, that logic.
- The native shared-storage adapter and widget rendering are verified manually on-device per platform, since native widget timelines cannot be fully simulated in a JS test environment (see `standards/Testing-Strategy.md`).

---

# Related Documents

- `architecture/Data-Flow.md` (Flow 5) — the end-to-end trace this document details.
- `requirements/Functional-Requirements.md` (FR-7) — the requirements this implements.
- `design/UX-Principles.md` — cross-surface consistency principle.
- `standards/Testing-Strategy.md` — verification approach.

---

**End of Document**
