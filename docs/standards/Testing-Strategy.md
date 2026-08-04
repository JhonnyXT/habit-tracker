# Testing Strategy

> What gets tested, how, and at which layer — implementing the testing implications of `architecture/02-Architecture.md`.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Testing Strategy |
| Version | 1.0 |
| Status | Draft |
| Audience | Engineering |
| Depends On | architecture/02-Architecture.md, engineering/Dependency-Injection.md |

---

# Purpose

Define a testing approach that matches each architectural layer's nature — the Domain layer is pure and cheap to test exhaustively; native platform integrations (notifications, widgets) are expensive to automate and are verified manually instead. Testing effort is spent where automation is cheap and valuable, not spread evenly regardless of cost.

---

# Domain Layer — Unit Tests (Primary Coverage)

- Every use case is unit tested with fake repositories (`engineering/Dependency-Injection.md`) — no real SQLite involved.
- Streak calculation (FR-4) is tested against explicit, hand-constructed completion histories, including edge cases: a habit created today, a habit with a gap, a habit with a corrected past date.
- Schedule interpretation (FR-1.4) is tested for all three schedule types across relevant date boundaries (e.g. week rollover).
- This layer has the highest coverage expectation in the codebase, since it holds all business logic and is the cheapest layer to test exhaustively.

---

# Data Layer — Integration Tests

- Repository implementations are tested against a real (in-memory or temp-file) SQLite instance — not mocked, since the goal is to verify actual queries and migrations work, not just that a mock was called correctly.
- Migrations (`engineering/Database.md`) are tested against a seeded, realistic multi-year dataset, not only an empty database.
- Uniqueness constraints (FR-2.2) and transaction atomicity (NFR-3.2) are verified directly against the real database engine.

---

# Presentation Layer — Component / Integration Tests

- Screens and components are tested through their interaction with use cases (via fakes), verifying the correct use case is called with correct arguments and the UI reflects the result — not re-testing Domain-layer business rules already covered above.
- Zustand stores (`engineering/State-Management.md`) are tested for correct delegation to use cases and correct state shape after a call resolves.

---

# Platform Layer — Manual Verification

- Expo Notifications scheduling/permission behavior and the home screen widget's native rendering and interactivity are verified manually, on real devices, per platform (`engineering/Notifications.md`, `engineering/Widgets.md`) — OS-level scheduling and native widget timelines are not reliably simulated in a JS test runner.
- Manual verification steps for these are checklist-driven, tracked as part of `reviews/07-QA.md`, not left informal.

---

# Accessibility Testing

- Automated checks (e.g. presence of accessible labels) catch obvious omissions but are not sufficient alone.
- Manual verification with real VoiceOver/TalkBack navigation is required per `standards/Accessibility.md` and `reviews/07-QA.md` — this is deliberately a manual testing category, not something delegated entirely to snapshot/unit tests.

---

# What Is Not Separately Tested

- Network resilience/retry logic — does not exist, since the app has no network dependency for core functionality (NFR-2.2).
- Cross-device sync conflict resolution — does not exist in V1 (no sync feature).

---

# Test Placement

Per `Folder-Structure.md`, test files live alongside the code they test, not in a separate mirrored tree — keeping a use case and its test visually adjacent during review and maintenance.

---

# Related Documents

- `architecture/02-Architecture.md` — the layers this strategy is organized around.
- `engineering/Dependency-Injection.md` — how fakes are supplied to Domain-layer tests.
- `standards/Accessibility.md` — the manual verification this strategy defers to.
- `reviews/07-QA.md`, `reviews/06-Optimization.md` — where manual and at-scale verification actually happens.

---

**End of Document**
