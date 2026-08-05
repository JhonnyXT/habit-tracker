# Functional Requirements

> Precise, testable specification of what the system must do.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Functional Requirements |
| Version | 1.0 |
| Status | Draft |
| Audience | Engineering, QA |
| Depends On | 01-PRD.md, User-Stories.md |

---

# Purpose

Translate `User-Stories.md` into unambiguous functional rules that engineering implements and QA verifies. Where a rule here conflicts with a story, this document wins for implementation purposes, but the conflict should be resolved by updating both.

---

# FR-1 — Habit Entity

- FR-1.1 A habit MUST have a non-empty name, maximum 60 characters.
- FR-1.2 A habit MAY have an icon; if none is selected, a default icon is assigned.
- FR-1.3 A habit MAY have a color; if none is selected, a default color is assigned.
- FR-1.4 A habit MUST have a schedule of exactly one type: daily, specific weekdays (one or more selected), or N-times-per-week (N between 1 and 7).
- FR-1.5 A habit MUST have an explicit sort order, distinct from creation order, editable by the user.
- FR-1.6 A habit MUST have an archived boolean flag, default false.

---

# FR-2 — Completion Entity

- FR-2.1 A completion MUST reference exactly one habit and exactly one calendar date.
- FR-2.2 A given (habit, date) pair MUST be unique — no duplicate completion records for the same day.
- FR-2.3 A completion date MUST NOT be later than the current device date.
- FR-2.4 Toggling a completion MUST be reversible without leaving orphaned records (undo removes or flips the record cleanly).

---

# FR-3 — Today Screen

- FR-3.1 The Today screen MUST list only non-archived habits scheduled for the current date, per their schedule rule.
- FR-3.2 Marking a habit done on this screen MUST update state with no perceptible delay (local write only).
- FR-3.3 The screen MUST reflect the user's manual sort order.

---

# FR-4 — Streaks

- FR-4.1 Current streak MUST be defined as the number of consecutive scheduled days, ending today or yesterday, that are marked complete.
- FR-4.2 A scheduled day that has not yet occurred or is still "today and incomplete" MUST NOT break a streak in progress.
- FR-4.3 Longest streak MUST be the maximum current-streak value ever achieved by that habit, recalculated whenever historical data changes.
- FR-4.4 Streak values MUST be derived from completion data at read time or via a consistently invalidated cache — never stored as independent, manually-updated state that can drift from the underlying data.

---

# FR-5 — History & Calendar Views

- FR-5.1 The per-habit calendar view MUST accurately reflect every stored completion for that habit.
- FR-5.2 Users MUST be able to navigate to any past month.
- FR-5.3 Future dates MUST be visually distinct and non-interactive.
- FR-5.4 The aggregate history view MUST be computed from the same completion records as individual habit views — never a separately maintained dataset.

---

# FR-6 — Reminders / Notifications

- FR-6.1 A habit MAY have zero or more scheduled local notifications.
- FR-6.2 Enabling a reminder MUST request OS notification permission only at that point, not at first launch.
- FR-6.3 Tapping a notification MUST deep-link into the app directly to the associated habit's context.
- FR-6.4 If notification permission is denied or revoked, the app MUST degrade gracefully — reminder settings remain visible but clearly indicate they are inactive, without crashing or silently failing.

---

# FR-7 — Widget

- FR-7.1 The widget MUST display today's scheduled habits and their completion state, sourced from the same data as the app.
- FR-7.2 Where the platform allows direct interaction, marking a habit done from the widget MUST persist immediately to the same data store the app reads.
- FR-7.3 The widget MUST refresh within platform-appropriate constraints when data changes via the app.

---

# FR-8 — Settings & Appearance

- FR-8.1 Appearance MUST default to following the OS-level light/dark setting.
- FR-8.2 Users MUST be able to override appearance manually, and the override MUST persist across restarts.

---

# FR-9 — Data Export / Import

- FR-9.1 Export MUST produce a single self-contained file containing all habits (including archived) and all completions.
- FR-9.2 Import MUST validate the file's structure before applying changes, and MUST fail safely (no partial or corrupted state) if validation fails.
- FR-9.3 Import MUST fully restore habits and completions such that streaks and history recompute identically to the original data.
- FR-9.4 The app MAY offer additional, read-only export formats (e.g. a spreadsheet) for viewing or analysis. These are supplementary to, never a replacement for, the FR-9.1 backup file — import (FR-9.2/9.3) only ever accepts that format.

---

# FR-10 — Accessibility

- FR-10.1 Every interactive element MUST expose a correct accessible name and role to the platform's accessibility APIs.
- FR-10.2 Text MUST scale correctly at all Dynamic Type / font-scale sizes the target platforms support, without truncation or overlapping layout.
- FR-10.3 When the OS Reduced Motion setting is enabled, non-essential animations MUST be disabled or replaced with a simplified equivalent.
- FR-10.4 All touch targets MUST meet or exceed platform minimum size guidelines.

---

# Out of Scope for This Document

Non-functional characteristics (performance targets, offline behavior, reliability) are specified in `Non-Functional-Requirements.md`, not here.

---

# Related Documents

- `User-Stories.md` — the stories these requirements formalize.
- `Non-Functional-Requirements.md` — quality attributes, not behavior.
- `api/Data-Models.md` — schema implementing the entities defined here.
- `reviews/07-QA.md` — verification of these requirements.

---

**End of Document**
