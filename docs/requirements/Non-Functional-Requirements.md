# Non-Functional Requirements

> Quality attributes the system must exhibit, independent of any single feature.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Non-Functional Requirements |
| Version | 1.0 |
| Status | Draft |
| Audience | Engineering, QA |
| Depends On | 00-Project-Charter.md, 01-PRD.md |

---

# Purpose

Define measurable quality bars that apply across the entire application, derived from the Charter's Performance, Accessibility and Privacy commitments. These requirements are verified in `reviews/06-Optimization.md`, `reviews/07-QA.md` and `standards/Performance.md`.

---

# NFR-1 — Performance

- NFR-1.1 UI interactions MUST sustain 60 FPS on supported devices during normal use (list scrolling, screen transitions, marking a habit done).
- NFR-1.2 Cold start MUST reach an interactive Today screen quickly enough that the app feels instant, not loading.
- NFR-1.3 Marking a habit done MUST reflect in the UI with no perceptible delay — this is a local write, not a network round trip.
- NFR-1.4 Database queries (streak calculation, history rendering) MUST remain fast as the dataset grows across years of daily use, not just in an empty-database demo state.

---

# NFR-2 — Offline-First

- NFR-2.1 The application MUST be fully functional with the device in airplane mode, at all times, for every V1 feature.
- NFR-2.2 The application MUST NOT make network calls in V1 beyond OS-level services (notification scheduling, widget refresh) that do not involve a company-run server.

---

# NFR-3 — Reliability

- NFR-3.1 The application MUST NOT lose completion history due to a crash, force-quit, or backgrounding at any point.
- NFR-3.2 Writes to the local database MUST be atomic — a habit or completion is either fully saved or not saved at all, never partially.
- NFR-3.3 Core flows (mark habit done, view streak, view history) MUST have zero known crash paths at release.

---

# NFR-4 — Privacy & Data Ownership

- NFR-4.1 No user data MAY leave the device without an explicit user action (e.g. manual export, sharing a file).
- NFR-4.2 The application MUST NOT require an account, login, or any personally identifying registration to be fully functional.
- NFR-4.3 The application MUST request only the OS permissions strictly necessary for enabled features (e.g. notifications only once a reminder is configured).

---

# NFR-5 — Accessibility

- NFR-5.1 The application MUST be fully operable using VoiceOver (iOS) and TalkBack (Android).
- NFR-5.2 The application MUST support the full range of Dynamic Type / font scaling offered by each platform without breaking layout.
- NFR-5.3 The application MUST respect the OS-level Reduced Motion setting across all animations.
- NFR-5.4 Color MUST NOT be the only signal used to communicate state (e.g. completed vs. not completed) — shape, icon or text must reinforce it.

---

# NFR-6 — Maintainability

- NFR-6.1 The codebase MUST follow the architecture defined in `architecture/02-Architecture.md` without ad-hoc deviations.
- NFR-6.2 TypeScript strict mode MUST report zero errors at all times on the main branch.
- NFR-6.3 New features MUST be isolated per `engineering/05-Feature-Development.md` so they can be added or removed with minimal impact on unrelated features.

---

# NFR-7 — Compatibility

- NFR-7.1 The application MUST support the current and immediately prior major OS versions of iOS and Android at time of release.
- NFR-7.2 The application MUST adapt to both phone and tablet-class screen sizes without broken layouts.
- NFR-7.3 The widget MUST degrade gracefully (or be omitted) on OS versions where the required widget APIs are unavailable.

---

# NFR-8 — Observability (Local, Privacy-Respecting)

- NFR-8.1 Diagnostic logging MUST stay on-device and MUST NOT transmit data to a remote analytics or crash-reporting service without a separate, explicit, future decision documented as an ADR.
- NFR-8.2 Logging MUST follow the levels and conventions defined in `standards/Logging.md`.

---

# Related Documents

- `00-Project-Charter.md` — Performance, Privacy and Accessibility Commitments this document formalizes.
- `Functional-Requirements.md` — behavioral requirements this document complements.
- `standards/Performance.md`, `standards/Accessibility.md`, `standards/Security.md` — implementation-level guidance.
- `reviews/06-Optimization.md`, `reviews/07-QA.md` — verification of these requirements.

---

**End of Document**
