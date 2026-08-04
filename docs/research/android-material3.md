# Android Material Design 3 — Applied Notes

> What this project borrows from Material Design 3, and where it deliberately diverges to stay calm rather than expressive.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Material Design 3 — Applied Notes |
| Version | 1.0 |
| Status | Draft |
| Audience | Design, Engineering |
| Depends On | 00-Project-Charter.md, design/03-Design-System.md |

---

# Purpose

The Charter commits to feeling native on both iOS and Android without fighting either operating system. This document extracts the Material 3 (M3) conventions this project adopts for Android, and flags where M3's more expressive defaults are intentionally dialed back to match the Charter's Calm Technology and minimalism principles.

---

# Dynamic Color / Theming

- M3's dynamic color (deriving a theme from the user's wallpaper) is **not** adopted — this project uses its own fixed, restrained palette (`design/Colors.md`) on both platforms for visual consistency and calmness, rather than letting the accent shift per-device. This is a deliberate divergence from a default M3 pattern, not an oversight.
- M3's light/dark tonal palette structure (distinct surface elevations, tonal variations) does inform how `design/Colors.md`'s neutral scale is organized for Android rendering.

---

# Elevation & Surfaces

- M3 favors tonal elevation (surface color shifts) over heavy drop shadows. This project's `color.surface.secondary` / `color.surface.elevated` tokens (`design/Colors.md`) follow that model on Android rather than iOS-style shadow-based elevation.

---

# Typography

- M3's type scale (Display, Headline, Title, Body, Label) maps conceptually to `design/Typography.md`'s roles (`type.largeTitle` → Display/Headline-class, `type.body` → Body, `type.caption` → Label), rendered via the Android system font per `design/Typography.md`'s "system font" rule.

---

# Components

- Where M3 provides a native-feeling equivalent to a component in `design/Components.md` (e.g. a bottom sheet for `ConfirmationSheet`, a switch for reminder toggles), the Android build uses that native-feeling pattern rather than a cross-platform-identical custom control — consistent with "Platform Fidelity" in `design/03-Design-System.md`.
- M3's more expressive component variants (e.g. heavily rounded, high-contrast "expressive" button styles from later M3 revisions) are intentionally not adopted wholesale — this project's restrained visual language (Charter: "avoid heavy gradients... decorative animations") takes precedence over following every M3 expressive default.

---

# Motion

- M3's emphasized easing curves are a reasonable basis for `design/Motion.md`'s `motion.easing.emphasized` token on Android, reserved — per this project's own Motion principles — for the one "delight" moment (habit completion), not general-purpose use.

---

# Navigation

- M3's navigation bar / navigation rail conventions inform the Android tab bar implementation for this project's small set of top-level destinations (`requirements/01-PRD.md`'s Screen Inventory), kept consistent in structure with the iOS tab bar so the app's information architecture doesn't diverge by platform, even though the visual chrome does.

---

# Widgets (App Widgets)

- Android App Widget conventions (resizable widget classes, `RemoteViews`/Jetpack Glance-based interactivity depending on tooling) inform `engineering/Widgets.md`'s Android-side implementation and its graceful-degradation behavior on OS versions with more limited widget interactivity (NFR-7.3).

---

# What This Project Deliberately Does Not Over-Apply

- M3's more visually expressive, high-personality styling directions are dialed back in favor of the Charter's calmer, more restrained aesthetic — Android should feel native in structure and interaction patterns, not necessarily in maximal M3 visual expressiveness.
- Component-level parity with iOS (`ios-hig.md`) is prioritized for information architecture; visual chrome (elevation model, navigation bar style) follows each platform's own convention.

---

# Related Documents

- `00-Project-Charter.md` — the "Native First" and Calm Technology principles this document balances against M3's defaults.
- `design/03-Design-System.md`, `design/Colors.md`, `design/Typography.md`, `design/Motion.md` — where these M3-informed choices are formalized as tokens.
- `ios-hig.md` — the iOS-side counterpart.
- `engineering/Widgets.md` — Android App Widget-informed widget architecture.

---

**End of Document**
