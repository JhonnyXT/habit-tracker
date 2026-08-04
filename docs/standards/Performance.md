# Performance

> Ongoing performance conventions followed during everyday feature development — distinct from the one-time `reviews/06-Optimization.md` phase.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Performance |
| Version | 1.0 |
| Status | Draft |
| Audience | Engineering |
| Depends On | requirements/Non-Functional-Requirements.md, reviews/06-Optimization.md |

---

# Purpose

Bake performance-conscious habits into daily feature development, so `06-Optimization.md` is a verification and tuning pass, not the first time performance is considered.

---

# Rendering

- Avoid unnecessary re-renders: memoize expensive derived values in Presentation-layer code, and keep Zustand store selectors narrow (subscribe to only the slice a component needs), per `engineering/State-Management.md`.
- List rendering (Today screen, calendar/heatmap) uses virtualization or platform-appropriate list primitives for any list that could realistically grow large, even if V1 usage is small.

---

# Animation

- All meaningful motion runs via React Native Reanimated on the UI thread, not JS-thread `setState`-driven animation, per `design/Motion.md` — this is what makes 60 FPS achievable by construction rather than by luck.
- Gesture-driven interactions (swipe-to-archive, drag-to-reorder) are driven directly by Gesture Handler + Reanimated shared values, not bridged through React state on every frame.

---

# Data Access

- Domain-layer use cases should request only the data a screen actually needs — avoid over-fetching (e.g. don't load full multi-year history to render the Today screen).
- Streak and history queries (`engineering/Database.md`) should be written with the expectation of years of accumulated data from day one, not optimized only after `06-Optimization.md` finds a problem.
- Appropriate indexes are added at the time a query is written, not deferred.

---

# Startup

- Avoid synchronous, blocking work on the JS thread during app launch — database migrations and initial reads should not visibly delay the first interactive frame beyond what's unavoidable.
- Avoid importing large, rarely-used dependencies eagerly at the app's entry point; prefer lazy loading for anything not needed for the initial Today screen render.

---

# Bundle Size

- Every new dependency is evaluated against its size/value trade-off before being added, per the Charter's "clear justification" rule — this is a standing practice, not only an `06-Optimization.md` audit item.

---

# Measuring, Not Guessing

- Performance claims during feature development are validated with actual measurement on a representative device when there's genuine uncertainty — not settled by assumption.
- `06-Optimization.md` exists to catch what individual feature work might miss at the system level (e.g. cumulative effects across many features) — it is not a substitute for performance-conscious implementation in the first place.

---

# Related Documents

- `requirements/Non-Functional-Requirements.md` (NFR-1) — the performance commitments this document operationalizes day to day.
- `reviews/06-Optimization.md` — the dedicated verification and tuning phase.
- `design/Motion.md` — animation implementation conventions.
- `engineering/Database.md`, `engineering/State-Management.md` — data and state performance conventions.

---

**End of Document**
