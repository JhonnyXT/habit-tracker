# iOS Human Interface Guidelines — Applied Notes

> What this project borrows from Apple's Human Interface Guidelines, and why.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | iOS HIG — Applied Notes |
| Version | 1.0 |
| Status | Draft |
| Audience | Design, Engineering |
| Depends On | 00-Project-Charter.md, design/03-Design-System.md |

---

# Purpose

The Charter states the product should feel "closer to Apple's own applications than to traditional productivity apps" and commits to "Native First." This document extracts the HIG principles most relevant to that goal and ties each one to where it's applied elsewhere in `docs/`, so "native first" stays a concrete, checkable commitment rather than a vibe.

---

# Clarity

HIG's foremost principle: text is legible at every size, icons are precise, and functional elements invite interaction without competing for attention.

- Applied in `design/Typography.md` (system font, restrained type scale) and `design/Icons.md` (single consistent icon source, SF-Symbols-based via Expo Symbols).
- Applied in `design/UX-Principles.md`'s "No Tutorials Required" — clarity substitutes for onboarding.

---

# Deference

Content is primary; UI chrome recedes. HIG discourages heavy, decorative interface elements that compete with the user's own content.

- Applied in `design/03-Design-System.md`'s "Whitespace is a feature" and `design/Colors.md`'s restrained, desaturated palette — the habit list and its data are the content; the UI stays quiet around it.

---

# Depth

Visual layers and realistic motion convey hierarchy and facilitate understanding, without becoming decoration for its own sake.

- Applied in `design/Motion.md`'s "Guide" principle (screen transitions communicate navigational relationships) and the sheet-based presentation pattern for Add/Edit Habit (`design/Components.md`).

---

# Navigation Patterns

- Tab-based or stack-based navigation should map to a small number of clear top-level destinations. This project's Screen Inventory (`requirements/01-PRD.md`) is deliberately small (Today, History, Settings as likely top-level destinations; Habit Detail and Add/Edit Habit as pushed/presented screens) — consistent with HIG's guidance against deep or ambiguous navigation trees.
- Deep links (from notifications, per FR-6.3) resolve to the correct in-hierarchy destination rather than a disconnected standalone screen, per HIG's navigation-consistency guidance.

---

# Typography & Dynamic Type

- HIG's text style system (Large Title, Title, Headline, Body, Subheadline, Footnote, Caption) is used directly as the baseline for `design/Typography.md`'s type scale.
- Full Dynamic Type support (not partial) is a HIG expectation this project treats as a hard requirement (NFR-5.2, FR-10.2), not an enhancement.

---

# Touch Targets & Gestures

- HIG's 44×44pt minimum tap target is adopted directly in `design/Spacing.md` and `standards/Accessibility.md`.
- Per HIG guidance and this project's own `design/UX-Principles.md` "Predictability Over Surprise," gestures (swipe, long-press) always have a discoverable, tappable alternative — never the sole path to an action.

---

# Widgets (WidgetKit Conventions)

- iOS widget conventions (size classes, refresh timeline behavior, limited but clear interactivity) directly inform `engineering/Widgets.md`'s approach — the widget shows a calm, glanceable snapshot rather than attempting to replicate the full app experience.

---

# What This Project Deliberately Does Not Over-Apply

- HIG covers many controls and patterns (e.g. complex multi-column layouts, extensive toolbar customization) not relevant to this app's small, focused Screen Inventory — this document only extracts what's applicable, not the entire HIG surface.
- Android users still get a native-feeling experience per `android-material3.md` — HIG informs the overall calm/native philosophy, but Android screens follow Material 3 conventions where the two guidelines diverge (e.g. navigation chrome, elevation model).

---

# Related Documents

- `00-Project-Charter.md` — the "Native First" principle this document operationalizes for iOS.
- `design/03-Design-System.md`, `design/Typography.md`, `design/Spacing.md`, `design/Motion.md` — where these HIG-derived choices are formalized as tokens.
- `android-material3.md` — the Android-side counterpart, for where platform conventions diverge.
- `engineering/Widgets.md` — WidgetKit-informed widget architecture.

---

**End of Document**
