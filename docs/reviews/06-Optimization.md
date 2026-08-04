# 06 — Optimization

> The phase where the application is made fast, lean and durable under realistic long-term usage, before QA and review.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Optimization |
| Version | 1.0 |
| Status | Draft |
| Audience | Engineering, AI Assistants |
| Depends On | requirements/Non-Functional-Requirements.md, engineering/Database.md |

---

# Purpose

Verify and enforce the performance commitments defined in `00-Project-Charter.md` and `requirements/Non-Functional-Requirements.md` (NFR-1) once features are functionally complete — this phase assumes correctness already exists (`05-Feature-Development.md`) and focuses purely on speed, memory and startup behavior.

---

# When This Phase Runs

After all V1 features (`engineering/05-Feature-Development.md`) are functionally complete and before `07-QA.md`. Optimization on an incomplete feature set produces numbers that don't reflect the shipped product.

---

# Optimization Targets

## Startup

- Cold start to an interactive Today screen must feel instant (NFR-1.2).
- Audit: bundle size, unnecessary eager imports, synchronous work blocking first render.

## Runtime Interaction Performance

- 60 FPS sustained during list scrolling, screen transitions, and marking a habit done (NFR-1.1).
- Audit: unnecessary re-renders in Presentation-layer components and Zustand stores (`engineering/State-Management.md`), animation work running on the JS thread instead of via Reanimated's UI thread (`design/Motion.md`).

## Database Performance at Realistic Scale

- Queries must remain fast after years of daily use, not just against an empty database (NFR-1.4).
- Required test: seed the database with several years of realistic multi-habit completion history and re-measure:
  - Today screen load time.
  - Streak calculation time per habit.
  - Calendar/heatmap and aggregate History screen render time.
- Add or adjust indexes (`engineering/Database.md`) if any of the above degrades noticeably at scale.

## Memory

- No unbounded growth from repeated navigation between screens (e.g. Today ↔ Habit Detail repeatedly).
- Widget refresh cycles (`engineering/Widgets.md`) must not leak native resources over repeated OS-triggered refreshes.

## Bundle Size

- Audit dependencies for unused or oversized libraries; every dependency must still meet the Charter's "clear justification" bar at this stage, not just at the time it was first added.

---

# Method

1. Establish a baseline measurement for each target above on a representative real device (not only a simulator).
2. Identify the largest offenders first — do not micro-optimize before addressing the biggest cost.
3. Re-measure after each change to confirm actual improvement, not assumed improvement.
4. Record before/after numbers so regressions are detectable in future optimization passes.

---

# Non-Goals of This Phase

- This phase does not add features or change UX — any change here must be behavior-preserving from the user's perspective (same functionality, faster/leaner execution).
- Speculative optimization for scale the product will never reach (e.g. thousands of habits) is not pursued — optimize for the realistic multi-year, multi-habit usage described in `requirements/User-Personas.md`, not an extreme edge case.

---

# Exit Criteria

Optimization is complete when every target above meets its stated requirement on a representative device, verified with a realistic multi-year seeded dataset, and the results are documented for the next phase (`07-QA.md`) to verify no functional regression was introduced.

---

# Related Documents

- `00-Project-Charter.md`, `requirements/Non-Functional-Requirements.md` — the performance commitments this phase verifies.
- `engineering/Database.md` — query and indexing conventions this phase audits.
- `design/Motion.md` — animation performance conventions this phase audits.
- `07-QA.md` — the next phase, verifying no regression was introduced.
- `standards/Performance.md` — ongoing performance conventions beyond this one-time phase.

---

**End of Document**
