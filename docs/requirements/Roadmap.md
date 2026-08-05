# Roadmap

> Scheduled, prioritized future work — the concrete counterpart to Vision.md.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Roadmap |
| Version | 1.0 |
| Status | Draft |
| Audience | Product, Engineering |
| Depends On | 01-PRD.md, Vision.md |

---

# Purpose

While `Vision.md` describes direction without commitment, this document tracks what is actually planned, in what order, and why — so the team (human or AI) always knows what "next" means without re-litigating scope.

This is a living document. Update it as priorities shift; do not treat it as immutable the way the Charter is.

---

# Status Legend

- **Planned** — committed, not yet started.
- **Candidate** — likely, not yet committed.
- **Deferred** — explicitly considered and pushed out.
- **Rejected** — considered and declined; kept here so it isn't re-proposed without new information.

---

# V1 — Current Release

Full scope defined in `01-PRD.md`. Tracked to completion via `reviews/` phase gates (Optimization → QA → Principal Engineer Review → Release).

---

# V1.1 — Near-Term Follow-Up

| Item | Status | Why |
|------|--------|-----|
| Performance pass on large historical datasets | Planned | Real usage after months of data will expose query cost issues a fresh install won't. |
| Expanded accessibility audit with real assistive-tech users | Planned | API compliance in QA is necessary but not sufficient. |
| Weekly/monthly consistency trend view | Candidate | Requested implicitly by the Recovering Over-Tracker persona; must stay calm, not chart-heavy. |
| Language switcher in Settings | Planned | The UI ships in Spanish, with all copy already centralised in `src/core/i18n/strings.ts`. Adding a switcher means introducing a locale-keyed lookup and a persisted preference — deliberately deferred until the approach is researched, rather than guessed at now. |
| Multi-alert reminders (pre-reminder + a single follow-up, daily-schedule habits only) | Planned | Extends the existing "one or more local notifications per habit" PRD scope with a bounded, opt-in pre-alert and one follow-up — capped deliberately (not the open-ended chains some reminder apps offer) to stay inside the Charter's Calm Technology guidance and iOS's ~64 pending local notification ceiling. Restricted to daily-schedule habits because weekday-schedule habits already consume up to 7 notification slots each; multiplying that by pre/follow-up risked silently exceeding the OS limit. |
| Tasks per habit (motivational checklist, fully independent of streaks) | Planned | Lets a habit be broken into repeatable daily steps (inspired by reviewing the Reminderos app) with a completion percentage shown in Habit Detail and on the Today/Habits rows. Deliberately does not gate the streak on task completion — that would punish an incomplete checklist by breaking a streak, contradicting "reduce friction instead of increasing motivation." Not gamification (no points/levels/badges) and not the rejected "notes or journaling" scope — it's a structural breakdown of the habit itself. |

---

# V2 — Optional Expansion (Horizon 2 from Vision.md)

| Item | Status | Why |
|------|--------|-----|
| Backup & Restore to user-controlled cloud storage (e.g. iCloud Drive) | Candidate | Extends existing manual export/import without introducing a company-run backend. |
| Habit Categories / Groups | Candidate | Only valuable once users commonly track enough habits for grouping to matter. |
| Per-day notes on a completion | Candidate | Must not turn the Today screen into a journaling app by default — opt-in only. |
| Apple Watch / Wear OS companion | Candidate | High native-feel value, meaningful engineering cost — sequenced after core polish. |

---

# V3+ — Long-Term, Uncertain (Horizon 3 from Vision.md)

| Item | Status | Why |
|------|--------|-----|
| End-to-end encrypted multi-device sync | Deferred | Valuable but directly in tension with "no backend" simplicity; needs a dedicated ADR before any implementation work begins. |
| Apple Health / Google Fit integration | Deferred | Only pursued if a specific habit type clearly benefits (e.g. sleep, steps) without forcing permission requests on everyone. |
| Shared habits between trusted people | Deferred | Must be designed carefully to avoid becoming a social feature; needs explicit product definition first. |

---

# Explicitly Rejected

| Item | Status | Why |
|------|--------|-----|
| Public profiles / social feed | Rejected | Directly conflicts with Charter Non-Goals. |
| Points, badges, levels | Rejected | Conflicts with Calm Technology principle; streaks remain the only progress signal. |
| Ads or paywalled subscriptions | Rejected | Conflicts with Charter Non-Goals and Privacy by Default. |
| AI-generated habit suggestions | Rejected | Conflicts with Charter Non-Goals for V1 and adds complexity without clear user demand. |

---

# How This Roadmap Is Maintained

- New candidates enter as **Candidate**, referencing which Vision horizon they belong to.
- Nothing moves to **Planned** without a corresponding update to `01-PRD.md` scope for the release it targets.
- Anything that would require violating an Immutable Rule in `00-Project-Charter.md` is rejected outright, not deferred.

---

# Related Documents

- `Vision.md` — the horizons this roadmap schedules against.
- `01-PRD.md` — current committed scope.
- `decisions/` — ADRs required before any Deferred item can move to Planned.

---

**End of Document**
