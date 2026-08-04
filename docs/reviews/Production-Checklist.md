# Production Checklist

> What to monitor and verify once a release is live, respecting the product's no-telemetry, privacy-first constraints.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Production Checklist |
| Version | 1.0 |
| Status | Draft |
| Audience | Engineering |
| Depends On | Release-Checklist.md, requirements/Non-Functional-Requirements.md |

---

# Purpose

Define how release health is monitored after publication, given a deliberate constraint from `requirements/Non-Functional-Requirements.md` (NFR-8.1): no remote analytics or crash-reporting SDK is used without a separate, explicit ADR. This checklist works within that constraint rather than assuming a typical third-party observability stack.

---

# Available Signals (No Custom Telemetry)

Because the app does not integrate a remote analytics/crash SDK by default, production health relies on:

- **Store-provided crash and stability reports** — Apple App Store Connect and Google Play Console both surface crash reports for published apps natively, without the app itself sending any custom telemetry.
- **Store reviews and ratings** — a direct, if informal, signal of user-perceived quality.
- **Support channel reports** — however the team receives user-reported issues (e.g. an email address or store review responses).
- **Store adoption metrics** — install counts, update adoption rate, provided by the stores themselves.

If deeper, real-time observability is ever deemed necessary, that is a product/architecture decision requiring its own ADR (per NFR-8.1) — this checklist does not assume it exists.

---

# First 24–48 Hours After Release

- [ ] Check App Store Connect / Play Console crash reports for any spike tied to the new version.
- [ ] Check store reviews for reports of data loss, crashes, or broken core flows (habit creation, daily check-in, streaks).
- [ ] Confirm the update is rolling out / adopted as expected (no store-side rejection or halted rollout).
- [ ] Spot-check the live, published build on a real device (not just the pre-submission build) to confirm the shipped artifact behaves as reviewed.

---

# Ongoing Health Checks

- [ ] Periodically review crash reports even outside the immediate post-release window — new OS versions can surface latent issues in an otherwise stable release.
- [ ] Revisit `06-Optimization.md` benchmarks periodically as real-world usage (years of accumulated habit history for long-time users) may reveal performance characteristics that internal testing didn't fully anticipate.
- [ ] Confirm widget behavior remains correct across OS updates, since widget APIs are a common source of platform-level breakage between OS versions (`engineering/Widgets.md`).

---

# Data Integrity in Production

- [ ] Treat any user report of lost habits or completion history as a top-severity issue — per the Charter, accumulated history is the product's core trust asset (`requirements/Vision.md`'s "Long-Term Bet").
- [ ] Any confirmed data-loss bug triggers an immediate hotfix path per `operations/Release-Process.md`, not a routine backlog item.

---

# What This Checklist Deliberately Does Not Include

- Remote error/log aggregation dashboards — not present in V1 by design (NFR-8.1).
- Usage/behavioral analytics (feature usage funnels, retention cohorts) — would require user data collection decisions explicitly out of scope without a dedicated ADR and product discussion first.

---

# Related Documents

- `Release-Checklist.md` — the checklist immediately preceding this one.
- `requirements/Non-Functional-Requirements.md` (NFR-8) — the privacy-respecting observability constraint this checklist works within.
- `operations/Release-Process.md` — the hotfix/rollback path referenced above.
- `decisions/` — where any future decision to add telemetry must be recorded before implementation.

---

**End of Document**
