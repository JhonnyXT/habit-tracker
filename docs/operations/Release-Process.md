# Release Process

> The overall process for shipping a release, including cadence, hotfixes, and rollback.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Release Process |
| Version | 1.0 |
| Status | Draft |
| Audience | Engineering |
| Depends On | reviews/Release-Checklist.md, operations/Versioning.md, operations/Deployment.md |

---

# Purpose

Describe the general process a release follows, end to end — distinct from `reviews/Release-Checklist.md`'s concrete, item-by-item checklist for a specific release, and distinct from `operations/Deployment.md`'s technical build/submit mechanics.

---

# Release Cadence

- Releases follow the Charter's phase-gated Development Workflow (`docs/README.md`): a release is cut only after `reviews/06-Optimization.md` → `07-QA.md` → `08-Principal-Engineer-Review.md` all pass for its scope.
- Given the small, focused nature of V1 (`requirements/01-PRD.md`), releases are feature-batched rather than continuous — a release bundles a coherent set of completed features/fixes rather than shipping on a fixed calendar cadence disconnected from actual readiness.

---

# Standard Release Flow

1. Feature work completes on `main` per `standards/Git-Workflow.md`.
2. `reviews/06-Optimization.md` runs against the accumulated changes.
3. `reviews/07-QA.md` verifies functional and non-functional correctness.
4. `reviews/08-Principal-Engineer-Review.md` gives the holistic go/no-go.
5. `operations/Versioning.md`'s version bump is applied.
6. `reviews/Release-Checklist.md` is executed item by item.
7. Build produced and submitted per `operations/Deployment.md`.
8. Post-submission monitoring per `reviews/Production-Checklist.md`.

---

# Hotfix Process

For a critical issue found in production (especially any data-loss bug, per `reviews/Production-Checklist.md`'s top-severity treatment):

1. Branch from the released version's tag (`operations/Versioning.md`), not from an in-progress `main` that may contain unrelated, unreleased work.
2. Fix is scoped as narrowly as possible to the specific defect — a hotfix is not an opportunity to bundle unrelated changes (`standards/Git-Workflow.md`).
3. The fix still passes a scoped version of `reviews/07-QA.md` covering the affected area and any area it touches, even under time pressure — a hotfix that introduces a new regression is worse than a delayed fix.
4. `08-Principal-Engineer-Review.md`'s architecture-integrity checks still apply, scoped to the change.
5. Ship as a patch version bump (`operations/Versioning.md`) through the normal `operations/Deployment.md` submission path — there is no separate "emergency" submission mechanism, since both app stores have their own review processes regardless of urgency.
6. Merge the hotfix back into `main` immediately after release so `main` never diverges silently from what's actually shipped.

---

# Rollback

- Because this application has no backend to roll back (ADR-002) and no server-side feature flags, "rollback" means either:
  - Halting a staged/phased store rollout before it reaches all users (where the store supports staged rollout), or
  - Shipping a corrective hotfix version forward, since app stores generally do not support reverting a published binary to a prior version.
- Given there is no backend, a broken release cannot corrupt server-side state — the blast radius of a bad release is confined to the client behavior itself, which is a meaningful mitigation already provided by ADR-002's architecture.
- Database migrations (`engineering/Database.md`) must remain forward-only and safe — the mitigation for a bad migration is prevention (thorough testing against realistic seeded data) rather than a rollback mechanism, since there is no practical way to "un-migrate" a user's already-upgraded local database.

---

# Related Documents

- `reviews/06-Optimization.md`, `07-QA.md`, `08-Principal-Engineer-Review.md`, `Release-Checklist.md` — the phase gates this process sequences.
- `operations/Versioning.md`, `operations/Deployment.md` — the mechanics this process relies on.
- `reviews/Production-Checklist.md` — post-release monitoring and the data-loss severity policy referenced above.
- `decisions/ADR-002.md` — why there is no backend to roll back.

---

**End of Document**
