# User Stories

> The V1 scope expressed as individual, testable stories with acceptance criteria.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | User Stories |
| Version | 1.0 |
| Status | Draft |
| Audience | Product, Engineering, QA |
| Depends On | 01-PRD.md, User-Journeys.md |

---

# Purpose

Break the scope defined in `01-PRD.md` into discrete stories that can be implemented and verified independently. Each story maps to one or more items in `Functional-Requirements.md` and is used directly by QA (`reviews/07-QA.md`) to write test cases.

---

# Format

Each story follows: **As a** [persona], **I want to** [action], **so that** [benefit] — followed by acceptance criteria.

---

# Habit Management

**US-01** — As a user, I want to create a habit with just a name, so that I can start tracking something in seconds.
- Acceptance: saving succeeds with only a name provided; all other fields default sensibly.

**US-02** — As a user, I want to set an icon and color for a habit, so that I can visually distinguish it at a glance.
- Acceptance: icon and color are optional; a sensible default is applied if skipped.

**US-03** — As a user, I want to define how often a habit repeats, so that it only appears on relevant days.
- Acceptance: supports every day, specific weekdays, and X-times-per-week schedules.

**US-04** — As a user, I want to edit an existing habit, so that I can correct or evolve it over time.
- Acceptance: editing any field does not erase existing completion history.

**US-05** — As a user, I want to archive a habit instead of deleting it, so that I keep its history without seeing it daily.
- Acceptance: archived habits disappear from Today but remain viewable and unarchivable, with history intact.

**US-06** — As a user, I want to permanently delete a habit, so that I can remove something I no longer want tracked at all.
- Acceptance: deletion requires explicit confirmation and removes the habit and its history.

**US-07** — As a user, I want to reorder my habits, so that the list matches my own priorities.
- Acceptance: manual reordering persists across app restarts.

---

# Daily Tracking

**US-08** — As a user, I want to mark a habit done with one tap, so that logging takes no effort.
- Acceptance: a single tap toggles the state with immediate visual feedback and no network delay.

**US-09** — As a user, I want to undo a completion, so that I can correct an accidental tap.
- Acceptance: tapping a completed habit again reverts it to not-done.

**US-10** — As a user, I want to mark past days as done or not done, so that I can backfill an accurate record.
- Acceptance: any past date is editable; today and past dates are editable; future dates are not.

---

# Consistency & History

**US-11** — As a user, I want to see my current and longest streak per habit, so that I understand my consistency without calculating it myself.
- Acceptance: streak values update immediately after any completion change and match the underlying data exactly.

**US-12** — As a user, I want to see a calendar/heatmap of my completions, so that I can visually spot patterns.
- Acceptance: the heatmap accurately reflects every stored completion and supports navigating to previous months.

**US-13** — As a user, I want an aggregate view of consistency across all habits, so that I get a single overall sense of how I'm doing.
- Acceptance: the aggregate view is derived from the same completion data as individual habit views, with no discrepancy.

---

# Reminders

**US-14** — As a user, I want to schedule a reminder for a habit, so that I don't forget it without being tracked by an external service.
- Acceptance: reminders are local notifications only; no data leaves the device to schedule them.

**US-15** — As a user, I want tapping a reminder to take me straight to the relevant habit, so that I can act immediately.
- Acceptance: notification tap deep-links directly to the habit's context.

---

# Widget

**US-16** — As a user, I want a home screen widget showing today's habits, so that I don't need to open the app to check status.
- Acceptance: widget reflects the same data as the app and supports the platform's refresh behavior.

**US-17** — As a user, I want to mark a habit done from the widget where possible, so that logging is even faster.
- Acceptance: widget interaction updates the underlying data immediately and is reflected next time the app opens.

---

# Appearance

**US-18** — As a user, I want the app to follow my system's light/dark setting, so that it feels consistent with the rest of my device.
- Acceptance: default behavior follows system appearance; a manual override is available in Settings.

---

# Data Ownership

**US-19** — As a user, I want to export my data to a file, so that I have a backup I control.
- Acceptance: export produces a complete, self-contained file usable for a full restore.

**US-20** — As a user, I want to import a previously exported file, so that I can restore my data on a new device or after reinstalling.
- Acceptance: import correctly restores all habits and completion history from a valid export file.

---

# Accessibility

**US-21** — As a user relying on a screen reader, I want every screen to be fully navigable with VoiceOver/TalkBack, so that I can use the app independently.
- Acceptance: every interactive element has a correct accessible label and role; navigation order is logical.

**US-22** — As a user with larger system font settings, I want the app's text to scale accordingly, so that I can read it comfortably.
- Acceptance: layouts adapt without truncation or overlap at supported Dynamic Type sizes.

**US-23** — As a user sensitive to motion, I want animations to respect Reduced Motion, so that the app doesn't cause discomfort.
- Acceptance: when Reduced Motion is enabled at the OS level, non-essential animations are disabled or simplified.

---

# Related Documents

- `01-PRD.md` — scope these stories implement.
- `Functional-Requirements.md` — detailed functional specification per story.
- `reviews/07-QA.md` — test plans derived from these acceptance criteria.

---

**End of Document**
