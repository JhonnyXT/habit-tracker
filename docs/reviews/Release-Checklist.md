# Release Checklist

> The operational checklist run immediately before publishing a release to app stores.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Release Checklist |
| Version | 1.0 |
| Status | Draft |
| Audience | Engineering |
| Depends On | 08-Principal-Engineer-Review.md, operations/Release-Process.md |

---

# Purpose

Provide a concrete, repeatable checklist for the moment of shipping — distinct from `08-Principal-Engineer-Review.md`'s code-quality gate and from `operations/Release-Process.md`'s general process description. This is the checklist actually run, item by item, for a specific release.

---

# Pre-Submission Checklist

- [ ] `08-Principal-Engineer-Review.md` fully passed for this release's scope.
- [ ] Version number bumped per `operations/Versioning.md`.
- [ ] Changelog/release notes written, in plain language matching the product's calm tone — no marketing hype.
- [ ] App icon and store assets confirmed current (`assets/Brand-Guidelines.md`, `assets/Icons.md`).
- [ ] Privacy-related store disclosures (e.g. App Store privacy labels, Play Data safety form) accurately reflect NFR-4 — truthfully declaring minimal/no data collection.
- [ ] Build produced from a clean checkout of the release branch/tag, not a developer's local working copy with uncommitted changes.

---

# Environment & Configuration

- [ ] Environment-specific configuration verified per `operations/Environment.md` (no debug flags, no development-only endpoints left enabled).
- [ ] Notification and widget entitlements/capabilities correctly configured for the release build (`engineering/Notifications.md`, `engineering/Widgets.md`).

---

# Final Device Verification

- [ ] Fresh install on a clean device/simulator: onboarding → first habit → daily check-in works end to end.
- [ ] Upgrade path from the previous released version verified: existing habits and history survive the update untouched (ties to `engineering/Database.md` migration safety).
- [ ] Widget functions correctly on a fresh install (not just an upgraded install).

---

# Submission

- [ ] Build submitted to the relevant store(s) following `operations/Deployment.md`.
- [ ] Store listing text/screenshots reviewed for accuracy against actual current functionality.

---

# Post-Submission

- [ ] Release tagged in version control per `operations/Versioning.md`.
- [ ] Team notified of submission and expected review timeline.
- [ ] Monitoring plan for the first hours/days after release confirmed — see `Production-Checklist.md`.

---

# Rollback Readiness

- [ ] A rollback or hotfix path is understood and documented before submitting — per `operations/Release-Process.md` — in case a critical issue emerges post-release.

---

# Related Documents

- `08-Principal-Engineer-Review.md` — the quality gate this checklist assumes already passed.
- `operations/Release-Process.md`, `operations/Deployment.md`, `operations/Versioning.md`, `operations/Environment.md` — the underlying processes this checklist operationalizes.
- `Production-Checklist.md` — what happens immediately after this checklist completes.

---

**End of Document**
