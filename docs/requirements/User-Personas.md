# User Personas

> Who we are building for, and who we are explicitly not building for.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | User Personas |
| Version | 1.0 |
| Status | Draft |
| Audience | Product, Design, Engineering |
| Depends On | 01-PRD.md |

---

# Purpose

Give every decision-maker a concrete picture of the person on the other end of the screen, so debates about a feature or a pixel can be resolved by asking "would this persona want this?" instead of by opinion alone.

---

# Primary Persona — "The Quiet Optimizer"

**Who they are**

A person who already exercises some self-discipline in one area of life (fitness, reading, sleep, work) and wants a small set of tools that reinforce it rather than manage it for them.

**Context**

- Owns a modern iPhone or Android phone; comfortable with technology but not a power user.
- Has tried at least one habit or productivity app before and abandoned it within a few weeks.
- Checks their phone throughout the day; wants the habit check-in to take seconds.

**Goals**

- Build 3–8 habits at a time, not 30.
- See at a glance whether they are "still on track" without doing math.
- Never feel nagged or judged by the app.

**Frustrations with existing tools**

- Too many onboarding screens and setup steps before they can do anything.
- Gamification (points, badges, streak-shaming) that feels manipulative.
- Accounts and logins required just to track a personal checklist.
- Notifications that arrive too often or at the wrong time.

**What success looks like for them**

Opening the app becomes a two-second, almost unconscious action — check habits, close app — repeated daily for months without friction or fatigue.

---

# Secondary Persona — "The Recovering Over-Tracker"

**Who they are**

Someone who has previously over-engineered their own habit tracking (spreadsheets, multiple apps, manual journals) and is looking to simplify without losing the data discipline they value.

**Context**

- Detail-oriented; will notice inconsistencies in streak math or missing history immediately.
- Values data ownership — wants to be able to get their data out, not locked into a vendor.
- Comfortable adjusting settings if it means a cleaner daily experience.

**Goals**

- Migrate from a more complex system without losing historical continuity.
- Trust the app's numbers (streaks, completion rates) are always correct.
- Retain control of their data through export/backup.

**Frustrations with existing tools**

- Apps that lock data behind a subscription or account.
- Inconsistent or unclear streak logic.
- No way to correct a mistakenly missed day after the fact.

**What success looks like for them**

They fully replace their previous system, trust the app's numbers without double-checking, and periodically export a backup out of habit, not fear.

---

# Explicitly Not a Persona

To keep the product calm and focused, the following are deliberately not designed for in V1:

- Teams or families wanting shared/collaborative habit tracking.
- Coaches or professionals managing habits on behalf of clients.
- Users seeking social accountability, public commitment or competition.
- Enterprise or productivity-suite buyers looking for task/project management.

Designing for these would pull the product toward the Non-Goals defined in the [Project Charter](00-Project-Charter.md).

---

# How to Use This Document

When a feature request or design decision is ambiguous, evaluate it against the Primary and Secondary personas above:

- If it clearly serves both, it likely belongs in scope.
- If it only serves a persona listed under "Explicitly Not a Persona," it does not belong in V1 regardless of how good the idea is in isolation.

---

# Related Documents

- `01-PRD.md` — Target Users summary and product scope.
- `User-Journeys.md` — concrete flows these personas walk through.
- `00-Project-Charter.md` — Non-Goals these personas help enforce.

---

**End of Document**
