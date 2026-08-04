# Notifications

> Local reminder scheduling via Expo Notifications.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Notifications |
| Version | 1.0 |
| Status | Draft |
| Audience | Engineering |
| Depends On | 02-Architecture.md, Data-Flow.md |

---

# Purpose

Define how habit reminders are scheduled, permissioned, and resolved back into the app, implementing FR-6 and Flow 4 of `architecture/Data-Flow.md` entirely with on-device, local notifications — no push infrastructure, no server involved.

---

# Technology

- **Expo Notifications**, using local (not remote/push) notifications exclusively — there is no server in this product to send a push from (per `01-PRD.md` Technical Constraints).

---

# Where This Lives Architecturally

Per `02-Architecture.md`, notification scheduling is a **Platform layer** concern:

- The `reminders` domain (entities, use cases like `ScheduleReminder`, `CancelReminder`) is pure and framework-agnostic.
- A Platform-layer adapter implements the actual Expo Notifications calls, invoked by the reminders use cases — components never call Expo Notifications APIs directly.

---

# Permission Handling

- Notification permission is requested **only** when the user enables a reminder for the first time (FR-6.2) — never at app launch, never speculatively.
- If permission is denied:
  - The reminder toggle reflects the actual OS state (off/inactive), not an optimistic UI state that silently fails.
  - No crash, no silent failure — the user sees clearly that the reminder is not active and can revisit OS settings (FR-6.4).
- If permission is later revoked at the OS level, the app detects this the next time it's foregrounded and updates affected reminder UI accordingly.

---

# Scheduling Model

- Each habit may have zero or more scheduled reminder times (FR-6.1), stored via the `reminders` table (`Database.md`).
- Reminders are scheduled to match the habit's active schedule (e.g. a weekday-only habit does not fire reminders on non-scheduled days).
- Rescheduling on edit: changing a habit's schedule or reminder time cancels and re-schedules the underlying Expo Notification requests so the OS never holds stale schedules.
- Archiving or deleting a habit cancels all of its associated scheduled notifications.

---

# Notification Content

- Copy references the specific habit by name (per `design/UX-Principles.md`'s Calm Notifications principle) — never generic urgency language.
- No notification is ever sent that the user did not explicitly configure — no re-engagement, no "you're falling behind" messaging invented by the product.

---

# Deep Linking

- Every scheduled notification carries a payload identifying the target habit.
- Tapping a notification resolves through the navigation shell (`04-Core-Infrastructure.md`) directly to that habit's context (FR-6.3) — no intermediate generic screen.
- This is the same deep-link resolution mechanism used elsewhere in the app, not a notification-specific special case.

---

# Testing Considerations

- Scheduling logic (which times, for which days) is tested at the Domain layer with fakes — no real OS scheduling needed to verify the business rule.
- The Platform-layer adapter's actual Expo Notifications integration is verified manually on-device per platform, since OS-level scheduling behavior cannot be fully unit-tested (see `standards/Testing-Strategy.md`).

---

# Related Documents

- `architecture/Data-Flow.md` (Flow 4) — the end-to-end trace this document details.
- `requirements/Functional-Requirements.md` (FR-6) — the requirements this implements.
- `design/UX-Principles.md` — Calm Notifications principle.
- `standards/Testing-Strategy.md` — verification approach.

---

**End of Document**
