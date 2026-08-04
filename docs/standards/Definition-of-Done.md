# Definition of Done

> The single, consolidated bar every feature must clear before it is considered complete.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Definition of Done |
| Version | 1.0 |
| Status | Draft |
| Audience | Engineering, AI Assistants |
| Depends On | Every standards/ document, requirements/User-Stories.md |

---

# Purpose

Consolidate the Charter's Definition of Done into a concrete, per-feature checklist, referencing the specific standards documents that define each bar in detail. This document does not restate those standards — it confirms they were all actually applied.

---

# Definition of Done — Per Feature

A feature (per `engineering/05-Feature-Development.md`) is done only when:

- [ ] Every relevant User Story's acceptance criteria (`requirements/User-Stories.md`) is demonstrably true.
- [ ] Every relevant Functional Requirement (`requirements/Functional-Requirements.md`) is satisfied.
- [ ] The implementation follows `architecture/02-Architecture.md`'s layering — no business logic outside Domain, no direct Data-layer access from Presentation.
- [ ] Code follows `Coding-Standards.md` and `Naming-Conventions.md`; TypeScript strict mode and linting report zero errors.
- [ ] Files are placed per `Folder-Structure.md`.
- [ ] Errors are handled per `Error-Handling.md`; nothing crashes on an expected failure path.
- [ ] The feature is fully accessible per `Accessibility.md` — screen reader labels, Dynamic Type, Reduced Motion, touch targets — verified with real assistive technology, not assumed.
- [ ] The feature performs acceptably per `Performance.md` — no janky interactions, no obviously slow queries introduced.
- [ ] The feature works fully offline (NFR-2) and introduces no unapproved network calls.
- [ ] Dark mode and light mode both work correctly (Charter Definition of Done).
- [ ] Animations feel polished and respect Reduced Motion (`design/Motion.md`).
- [ ] Tests exist per `Testing-Strategy.md`'s expectations for the relevant layer(s).
- [ ] The relevant documentation is updated if the feature revealed a gap or necessary deviation — no silent drift between docs and code (per `reviews/08-Principal-Engineer-Review.md`'s Documentation Hygiene check).
- [ ] The change was made via the process in `Git-Workflow.md` (proper branch, PR, review).

---

# Definition of Done — Per Release

Beyond individual features, a release is done only when it has passed, in order:

1. `reviews/06-Optimization.md`
2. `reviews/07-QA.md`
3. `reviews/08-Principal-Engineer-Review.md`
4. `reviews/Release-Checklist.md`

A release is not done because every feature individually met its Definition of Done — the phase gates above verify the *system* as a whole, which is a distinct, necessary check (per the Charter: "no technical debt was introduced," evaluated holistically, not just feature-by-feature).

---

# What "Done" Explicitly Excludes

- "Done" does not mean "merged and forgotten" — a feature can be re-opened if a later phase (`06-Optimization.md`, `07-QA.md`, `08-Principal-Engineer-Review.md`) finds it doesn't actually hold up.
- "Done" is never satisfied by "it works on my device" alone — the platform/device matrix in `reviews/07-QA.md` is part of the bar.

---

# Related Documents

This document is intentionally an index — see each linked standard for the actual detail behind each checklist item:

- `requirements/User-Stories.md`, `requirements/Functional-Requirements.md`
- `architecture/02-Architecture.md`
- `Coding-Standards.md`, `Naming-Conventions.md`, `Folder-Structure.md`
- `Error-Handling.md`, `Accessibility.md`, `Performance.md`, `Testing-Strategy.md`, `Git-Workflow.md`
- `reviews/06-Optimization.md`, `reviews/07-QA.md`, `reviews/08-Principal-Engineer-Review.md`, `reviews/Release-Checklist.md`

---

**End of Document**
