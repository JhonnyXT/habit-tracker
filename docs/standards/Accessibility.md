# Accessibility

> Concrete implementation conventions satisfying the Charter's Accessibility Commitment.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Accessibility |
| Version | 1.0 |
| Status | Draft |
| Audience | Engineering, Design |
| Depends On | 00-Project-Charter.md, requirements/Non-Functional-Requirements.md |

---

# Purpose

Turn NFR-5 and FR-10 into concrete, per-component implementation rules, so accessibility is built in during `engineering/05-Feature-Development.md`, not retrofitted before `reviews/07-QA.md`.

---

# Screen Reader Support (VoiceOver / TalkBack)

- Every interactive element MUST have an explicit accessible label describing its action or content — never left to infer from visual appearance alone (FR-10.1).
- Labels describe purpose, not appearance: "Add habit," not "Plus icon."
- Grouped information (e.g. a HabitRow's icon + name + streak) is exposed as a single accessible element with a composed label ("Reading, 5 day streak, not completed today"), not as several separately-focusable fragments a screen reader user must piece together.
- Decorative icons paired with already-labeled text are hidden from assistive technology to avoid duplicate announcements (`design/Icons.md`).
- State changes (marking a habit done) are announced, so a screen reader user gets the same "what just happened" feedback a sighted user gets visually (`design/UX-Principles.md`'s Four Questions).

---

# Dynamic Type / Font Scaling

- All text uses the platform's scalable text primitives — never a fixed pixel size (FR-10.2).
- Layouts are tested at the largest commonly supported accessibility text size, not just the default.
- Prefer wrapping/reflow over truncation for essential content (habit names, streak counts); truncation is acceptable only for secondary metadata, and only with the full value still available via accessible label.

---

# Reduced Motion

- Every animation defined in `design/Motion.md` has a defined reduced-motion equivalent — implemented via a single shared check (e.g. a `useReducedMotion` hook in `core/ui`), not reimplemented per component (FR-10.3).
- Reduced motion changes *how* a state change is presented, never *whether* it happens — functionality is identical either way.

---

# Touch Targets

- Every interactive element meets or exceeds platform minimum touch target size (iOS 44×44pt, Android 48×48dp) regardless of its visual size (FR-10.4, `design/Spacing.md`).
- Adjacent interactive elements maintain sufficient spacing to prevent accidental mis-taps — verified by measuring actual hit areas, not just visual gaps.

---

# Color Independence

- No screen communicates state through color alone (NFR-5.4) — every color-coded state (completed/not completed, active/inactive streak) is paired with an icon, shape, or text difference.
- Contrast ratios meet WCAG AA at minimum for all text/background combinations defined in `design/Colors.md`.

---

# Focus & Navigation Order

- Focus order (for screen readers and any switch-control/keyboard navigation) follows the visual reading order of the screen — top to bottom, matching the visual hierarchy defined by `design/Typography.md` and `design/Spacing.md`.
- Modals and sheets trap focus appropriately while open and return focus sensibly on dismiss.

---

# Verification

- Accessibility is verified with real assistive technology (actual VoiceOver/TalkBack navigation), not solely by inspecting code for the presence of accessibility props — see `reviews/07-QA.md`'s dedicated Accessibility QA pass.
- Accessibility checks are part of Definition of Done for every feature (`Definition-of-Done.md`) — not a separate pass done only once, at the end, across the whole app.

---

# Related Documents

- `00-Project-Charter.md` — the Accessibility Commitment this document operationalizes.
- `requirements/Non-Functional-Requirements.md` (NFR-5), `requirements/Functional-Requirements.md` (FR-10) — the requirements this document implements.
- `design/Motion.md`, `design/Colors.md`, `design/Spacing.md` — design-system conventions accessibility depends on.
- `reviews/07-QA.md` — verification of this standard.

---

**End of Document**
