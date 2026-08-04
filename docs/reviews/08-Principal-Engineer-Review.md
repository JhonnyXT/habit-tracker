# 08 — Principal Engineer Review

> The final quality gate before release: does this codebase hold up to the standard a senior team would be proud to maintain for years?

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Principal Engineer Review |
| Version | 1.0 |
| Status | Draft |
| Audience | Engineering, AI Assistants |
| Depends On | 02-Architecture.md, 07-QA.md, standards/Definition-of-Done.md |

---

# Purpose

Provide a single, holistic review — after functional QA has already passed (`07-QA.md`) — that judges the codebase as a whole, not feature by feature: architecture integrity, maintainability, and whether the Charter's principles were actually honored in practice, not just on paper.

---

# When This Phase Runs

After `07-QA.md` passes and before `10-release.md`'s release process begins. This is a gate, not a formality — a failed review sends work back to the relevant earlier phase.

---

# Review Checklist

## Architecture Integrity

- [ ] No component imports the Data layer directly (`architecture/02-Architecture.md` Non-Negotiable Rules).
- [ ] No business logic (schedule interpretation, streak math, validation) lives outside the Domain layer.
- [ ] No feature reaches into another feature's `data/` layer directly.
- [ ] Every feature could be deleted by removing its folder plus its navigation/DI registration, without orphaned logic elsewhere.
- [ ] The Dependency Rule holds throughout — dependencies point inward, with no exceptions rationalized as "just this once."

## Code Quality

- [ ] TypeScript strict mode reports zero errors.
- [ ] Linting reports zero errors, per `standards/Coding-Standards.md`.
- [ ] No dead code, commented-out blocks, or unused exports left behind.
- [ ] Every dependency in `package.json` still has a clear, current justification (Charter: "every dependency must have a clear justification").

## Consistency With Design System

- [ ] No hardcoded color, spacing, or type value outside `core/ui` token definitions.
- [ ] Every screen matches the Screen Inventory and components inventory in `design/Components.md` — no undocumented one-off UI patterns.

## Data Integrity

- [ ] Migrations (`engineering/Database.md`) are additive and safe against realistic historical data.
- [ ] Streaks and history are always derived, never stored as independently mutable state (FR-4.4).
- [ ] Export/import round-trips losslessly (FR-9.3), re-verified here independent of the QA pass.

## Non-Functional Compliance

- [ ] Every NFR in `requirements/Non-Functional-Requirements.md` is satisfied, cross-checked against the `07-QA.md` results, not re-assumed.
- [ ] Optimization results from `06-Optimization.md` still hold after any late-stage fixes.

## Product Fidelity

- [ ] The shipped scope matches `requirements/01-PRD.md` exactly — nothing in "Out of Scope" crept in; nothing in "In Scope" was quietly dropped.
- [ ] No Charter Non-Goal was violated anywhere in the implementation (accounts, ads, social features, gamification beyond streaks).

## Documentation Hygiene

- [ ] Any architectural decision made or changed during implementation is captured as an ADR in `decisions/`, not left undocumented.
- [ ] Any deviation from a document in `docs/` was either reconciled (document updated) or reverted (code updated) — no silent drift between docs and code.

---

# Review Method

- This review is conducted by reading the actual codebase and running the app, not by reading feature descriptions or trusting the QA report alone.
- Any unchecked item blocks release until resolved or explicitly and consciously accepted with a documented reason (recorded as an ADR if it represents a real trade-off).

---

# Exit Criteria

Every checklist item above is checked, or has an explicit, documented exception. Once complete, the project proceeds to `Release-Checklist.md` and `10-release.md`.

---

# Related Documents

- `02-Architecture.md` — the integrity rules this review enforces.
- `07-QA.md` — the functional verification this review assumes already passed.
- `standards/Definition-of-Done.md` — the per-feature bar this review checks in aggregate.
- `Release-Checklist.md` — the next operational step.
- `decisions/` — where any exceptions or late architectural decisions are recorded.

---

**End of Document**
