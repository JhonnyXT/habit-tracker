# User Journeys

> Step-by-step walkthroughs of how the personas actually move through the application.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | User Journeys |
| Version | 1.0 |
| Status | Draft |
| Audience | Product, Design, Engineering |
| Depends On | 01-PRD.md, User-Personas.md |

---

# Purpose

Expand the "Key User Flows" summarized in `01-PRD.md` into concrete, screen-by-screen journeys. These journeys are the reference used when designing screens (`design/`) and implementing features (`engineering/05-Feature-Development.md`) — every step here must map to a real, testable interaction.

---

# Journey 1 — First Launch

**Persona:** The Quiet Optimizer

1. User installs and opens the app for the first time.
2. A brief onboarding communicates the philosophy — calm, private, effortless — in a small number of screens (no account creation, no permission requests yet).
3. User is prompted to create their first habit directly from onboarding.
4. User names the habit, optionally sets an icon/color, chooses a schedule, optionally enables a reminder.
5. Reminder step triggers the OS notification permission prompt only if the user opts in.
6. User lands on the **Today** screen with their first habit visible and ready to be marked done.

**Success condition:** user reaches a usable Today screen with at least one habit in under a minute, without being forced through screens irrelevant to that goal.

---

# Journey 2 — Daily Check-in

**Persona:** Both personas, every day.

1. User opens the app (or taps the home screen widget).
2. **Today** screen shows all habits scheduled for today, each with a clear done/not-done affordance.
3. User taps a habit to mark it done; the UI confirms instantly (no loading state — this is local data).
4. Streak count updates immediately if visible on that screen.
5. User taps again to undo, if marked by mistake.
6. User closes the app.

**Success condition:** the entire loop from opening the app to closing it again takes seconds and requires no navigation beyond the Today screen for a normal day.

---

# Journey 3 — Creating a New Habit

**Persona:** Both personas.

1. From the Today screen, user taps the add-habit action.
2. User enters a name (required).
3. User optionally picks an icon and a color.
4. User chooses a schedule: every day, specific weekdays, or X times per week.
5. User optionally enables a reminder and picks a time.
6. User saves; the new habit appears immediately on the Today screen if scheduled for today.

**Success condition:** every field except the name is optional, and the flow can be completed with a single screen or a minimal number of steps.

---

# Journey 4 — Reviewing Consistency

**Persona:** The Recovering Over-Tracker, checking their own discipline.

1. From the Today screen, user taps a specific habit to open its **Habit Detail** screen.
2. User sees current streak and longest streak prominently.
3. User sees a calendar/heatmap of past completions.
4. User can navigate to previous months to review longer-term history.
5. Optionally, user opens the aggregate **History** screen to see consistency across all habits at once.

**Success condition:** the user can answer "how am I actually doing?" without doing any mental math themselves.

---

# Journey 5 — Backfilling a Missed Day

**Persona:** The Recovering Over-Tracker, correcting an oversight.

1. User opens a habit's detail view.
2. User navigates to a past date in the calendar.
3. User marks that past date as done (or not done, if correcting a mistake).
4. Streak and history recalculate to reflect the correction.
5. Future dates remain locked from being marked — only today and the past are editable.

**Success condition:** the user trusts that correcting the past is possible and that it doesn't corrupt the rest of their history.

---

# Journey 6 — Reminder to Action

**Persona:** The Quiet Optimizer, mid-day.

1. A local notification fires at the time configured for a habit.
2. Notification copy is calm and specific (references the habit by name, not generic "don't forget!" language).
3. User taps the notification.
4. App opens directly to that habit's context (ideally the Today screen with that habit highlighted, or its Detail screen).
5. User marks it done from there.

**Success condition:** the notification-to-completion path requires no extra navigation to find the relevant habit.

---

# Journey 7 — Backup and Restore

**Persona:** The Recovering Over-Tracker, being cautious.

1. From **Settings**, user selects export/backup.
2. App generates a local file containing all habits and completion history.
3. User saves or shares that file using the OS share sheet (their choice of destination — no company server involved).
4. On a new device or after reinstalling, user selects import/restore from Settings.
5. User selects a previously exported file; the app validates and restores the data.

**Success condition:** the user never has to trust a third-party server with their data to move it between devices.

---

# Journey 8 — Archiving a Habit

**Persona:** Both personas, evolving their routine.

1. From a habit's detail view or edit screen, user selects archive.
2. App confirms the action explains that history is preserved, not deleted.
3. Habit disappears from the Today screen but remains accessible from a "view archived habits" entry point.
4. User can unarchive it later, restoring it to the Today screen with its full prior history intact.

**Success condition:** users feel safe evolving their habit list over time without fear of losing historical data.

---

# Related Documents

- `01-PRD.md` — the scope these journeys implement.
- `User-Personas.md` — who is walking through these journeys.
- `User-Stories.md` — the same flows expressed as individual, testable stories.
- `design/UX-Principles.md` — the interaction principles these journeys must follow.

---

**End of Document**
