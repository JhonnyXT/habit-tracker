# 01 — Product Requirements Document (PRD)

> This document defines what the application does, for whom, and why.
>
> It translates the principles defined in the [Project Charter](00-Project-Charter.md) into concrete product scope.
>
> Every subsequent document (Architecture, Design System, Feature Development) must implement the scope defined here without expanding it silently.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Product Requirements Document |
| Version | 1.0 |
| Status | Draft |
| Audience | Product, Design, Engineering, AI Assistants |
| Depends On | 00-Project-Charter.md |

---

# Purpose

Define the complete functional scope of Version 1 of the Habit Tracker application.

This document answers three questions:

- What does the product do?
- Who is it for?
- What is explicitly excluded from this version?

It does not define architecture, visual design or implementation details. Those belong to `02-Architecture.md`, `03-Design-System.md` and the engineering documents.

---

# Product Summary

The Habit Tracker is a local-first, privacy-respecting mobile application that helps a single user build and sustain daily habits.

The application has one job: make it effortless to mark a habit as done today, and make consistency visible over time.

There is no account, no server, and no social layer. All data lives on the device.

---

# Target Users

Detailed personas live in `User-Personas.md`. At a summary level, the application is designed for:

- People who already want to build better habits and need a calm tool, not motivation.
- People who have tried heavier habit/productivity apps and found them overwhelming.
- People who value privacy and dislike accounts, ads and subscriptions.
- People who own an iPhone or Android device and expect the app to feel native.

---

# Core Value Proposition

- Create a habit in under a minute.
- Complete today's habits in a few taps, from the home screen or a widget.
- See consistency at a glance without interpreting complex charts.
- Trust that the data never leaves the device.

---

# Scope — Version 1

## In Scope

### Habit Management

- Create a habit with a name, an icon/emoji, and a color.
- Edit an existing habit's name, icon, color, schedule and reminder.
- Archive a habit (soft delete — preserves history).
- Permanently delete a habit and its history, with confirmation.
- Reorder habits manually on the home list.
- Define a habit's schedule: every day, specific weekdays, or X times per week.

### Daily Tracking

- Mark a habit as done/not done for the current day with a single tap.
- Undo a completion with a single tap.
- View and edit completions for past days (backfilling).
- Prevent marking completions for future days.

### Consistency & History

- Display current streak and longest streak per habit.
- Display a calendar/heatmap view of completions per habit.
- Display an aggregate view of overall consistency across all habits.

### Reminders

- Schedule one or more local notifications per habit.
- For daily-schedule habits only: an optional pre-reminder (fixed offset before the main time) and a single optional follow-up (fixed offset after), per `Roadmap.md`'s multi-alert reminders item — capped and schedule-restricted to stay within the Charter's Calm Technology guidance and the OS's pending-notification ceiling.
- Notification deep-links into the relevant habit.
- Respect device-level notification permissions and Do Not Disturb settings.

### Habit Tasks (checklist)

- A habit may optionally have a small set of repeatable daily tasks (steps), created either from the habit's detail screen or from the main "+" entry point.
- Task completion is tracked per day and shown as a percentage in Habit Detail and as a lightweight indicator on the Today/Habits rows.
- Task completion is **fully independent of the habit's streak** — it is a motivational indicator, never a gate. This is distinct from the rejected "notes or journaling attached to habits" scope below: tasks are structured, actionable checklist items, not freeform reflection.

### Home Screen Widget

- iOS and Android home screen widget showing today's habits and completion state.
- Support marking a habit as done directly from the widget where the platform allows it.

### Appearance

- Light mode and dark mode, following system appearance by default.
- Manual override of appearance in settings.

### Data Ownership

- All data stored locally via SQLite.
- Manual export of data to a file (backup).
- Manual import of data from a previously exported file.

### Accessibility

- Full support for screen readers (VoiceOver, TalkBack).
- Support for Dynamic Type / font scaling.
- Support for Reduced Motion.
- Minimum touch target sizes per platform guidelines.

---

## Out of Scope (Version 1)

These follow directly from the Charter's Non-Goals and are explicitly deferred:

- User accounts or authentication.
- Cloud sync or any backend service.
- Social features: sharing, following, leaderboards, community feed.
- Gamification systems beyond streaks (points, badges, levels, rewards).
- Advertisements or paywalled subscriptions.
- Habit categories or grouping.
- Notes or journaling attached to habits. (Habit Tasks, added per `Roadmap.md`, are structured checklist steps, not freeform notes — this exclusion still stands for free-text journaling.)
- Apple Health / Google Fit / wearable integrations.
- AI-generated habit suggestions or coaching.

These may be reconsidered in future versions per `Roadmap.md`, but must not influence V1 implementation.

---

# Key User Flows

High-level flows; step-by-step screen flows are detailed in `User-Journeys.md`.

1. **First Launch** → onboarding explains the philosophy in a few screens → user creates their first habit.
2. **Daily Check-in** → user opens the app or taps the widget → marks habits done → sees updated streaks.
3. **Habit Creation** → user taps add → names habit, picks icon/color/schedule/reminder → saves.
4. **Reviewing Consistency** → user opens a habit → sees streak and calendar heatmap.
5. **Backfilling** → user navigates to a past date → marks a missed habit as done → streak recalculates.
6. **Reminder → Action** → notification fires → user taps it → app opens directly to that habit.
7. **Backup** → user exports data from settings → stores the file wherever they choose.

---

# Screen Inventory

Three top-level tab destinations, plus pushed/presented screens:

**Tabs**

- Today (list of today's habits — the core daily loop)
- Habits (full habit list: manage, reorder, archive; aggregate consistency summary)
- Settings (appearance, notifications, export/import, about)

**Pushed / presented**

- Habit Detail (streak stats, calendar heat map, edit entry point)
- Add / Edit Habit (modal)
- Onboarding (first launch only)

**Other surfaces**

- Home Screen Widget (iOS + Android)

Detailed layout, hierarchy and interaction spec for each screen belongs to the Design System and per-feature documentation, not this PRD.

> **Revision (2026-08-03):** onboarding was specified as "a few screens". It ships as **one** screen — the three principles as a short list, then straight into creating the first habit. The Charter's "users should never need tutorials" and Journey 1's under-a-minute success condition both argue against a carousel; see `decisions/ADR-006.md`.

> **Revision (2026-07-30):** the second tab was originally specified as "History (aggregate consistency view)". The approved designs make it **Habits** — a management list that also carries the aggregate consistency summary — and move per-habit history into Habit Detail, where the user is already looking at that habit. This reduces the tab count needed for the same scope; no In-Scope item was dropped.

---

# Data Model (Overview)

Full schema lives in `Data-Models.md`. At a conceptual level, V1 requires:

- **Habit** — identity, name, icon, color, schedule, reminder configuration, archived flag, order.
- **Completion** — reference to a habit, a date, and a done/not-done state.
- **Task** — reference to a habit, a name, order, archived flag; repeats daily alongside its habit.
- **Task Completion** — reference to a task, a date, and a done/not-done state. Never contributes to streak calculation.

Streaks and aggregate consistency are derived from Completions only; they are not stored as independent mutable state, and Task Completions never feed into them.

---

# Non-Functional Expectations (Summary)

Full detail lives in `Non-Functional-Requirements.md`. Summary:

- 60 FPS interactions on supported devices.
- App launches to an interactive "Today" screen quickly.
- Works fully offline, always.
- No network calls in V1 beyond OS-level services (notifications, widget refresh).

---

# Release Criteria

Version 1 is releasable when:

- Every "In Scope" item above is implemented and passes QA (`07-QA.md`).
- Accessibility commitments from the Charter are verified, not assumed.
- Definition of Done (`Definition-of-Done.md`) is satisfied for every feature.
- Principal Engineer Review (`08-Principal-Engineer-Review.md`) has approved the release.

---

# Open Questions

_To be resolved before Architecture is finalized:_

- Exact schedule model for "X times per week" habits — fixed days chosen by the user, or floating count with no fixed days?
- Whether missed-day handling should ever break a streak silently or always require explicit user acknowledgement.
- Widget interactivity ceiling on Android OS versions the app intends to support.

---

# Related Documents

- `00-Project-Charter.md` — principles this PRD must respect.
- `User-Personas.md`, `User-Journeys.md`, `User-Stories.md` — supporting detail.
- `Functional-Requirements.md`, `Non-Functional-Requirements.md` — detailed requirements derived from this PRD.
- `Roadmap.md` — where Out of Scope items may resurface.
- `02-Architecture.md` — technical design implementing this scope.

---

**End of Document**
