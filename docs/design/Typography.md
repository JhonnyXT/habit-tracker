# Typography

> The type scale, hierarchy and platform-native font behavior.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Typography |
| Version | 1.0 |
| Status | Draft |
| Audience | Design, Engineering |
| Depends On | 03-Design-System.md |

---

# Purpose

Define a small, restrained type scale that establishes clear hierarchy without decoration, and that scales correctly with the user's system font size (NFR-5.2 / FR-10.2).

---

# Typeface

- **iOS:** the system font (San Francisco), via the platform default — reinforces "Native First."
- **Android:** the system font (Roboto or the device's configured system font), via the platform default.
- No custom/downloaded font is used in V1. A bespoke typeface is a candidate for later consideration only if it demonstrably improves the native feel, not before.

---

# Type Scale

All sizes are semantic tokens; components request a role (`variant="title"`), never a raw size.

**Tracking is size-specific — never one value for all sizes.** Large display text needs *negative* tracking (letters read too far apart as they grow); small text needs slightly *positive* tracking for legibility. Leading tracks size inversely: tight on headings, looser on body.

| Token | Role | Size | Weight | Tracking | Leading |
|-------|------|------|--------|----------|---------|
| `largeTitle` | Screen-level titles ("Today") | 34 | 700 | `-0.7` | 40 |
| `title` | Habit name in detail view | 28 | 700 | `-0.4` | 34 |
| `headline` | List item primary text (habit name) | 17 | 600 | `-0.2` | 22 |
| `body` | Standard body text | 17 | 400 | `0` | 24 |
| `subheadline` | Secondary supporting text | 15 | 400 | `0` | 20 |
| `footnote` | Metadata, streak counts, captions | 13 | 400 | `+0.1` | 18 |
| `caption` | Smallest supporting labels | 11 | 400 | `+0.2` | 14 |
| `sectionHeader` | Small-caps group labels ("ACTIVE HABITS") | 13 | 600 | `+0.5` | 18 |
| `statValue` | Large numerics in stat cards | 22 | 700 | `-0.3` | 26 |

Values follow the iOS Human Interface Guidelines text style scale as a baseline, since the product's tone is closest to native Apple apps; Android rendering uses equivalent relative proportions via the platform's own scaling.

Implemented in `src/core/theme/typography.ts`.

---

# Hierarchy Rules

- Each screen should use no more than 3 type roles for primary content — restraint over variety.
- `type.largeTitle` appears once per screen, at the top level only.
- Never use weight or size purely for decoration — every step in the scale must correspond to an actual difference in information importance.

---

# Dynamic Type / Font Scaling

- All text MUST use the platform's scalable text APIs — never a fixed pixel size that ignores system font scale settings (FR-10.2).
- Layouts MUST be tested at the largest commonly supported accessibility text sizes, not just the default size.
- When text grows, layouts should reflow (wrap, stack) rather than truncate wherever the content is essential (e.g. a habit name) — truncation is acceptable only for secondary metadata, and only with an accessible full-text alternative available (e.g. via accessibility label).

---

# Color & Contrast

Text color always comes from `Colors.md` semantic tokens (`color.text.primary`, `color.text.secondary`) — never a typography-specific color value. Contrast requirements are defined in `Colors.md` and verified in `reviews/07-QA.md`.

---

# Related Documents

- `03-Design-System.md` — token-first philosophy this document implements.
- `Spacing.md` — vertical rhythm between type roles.
- `standards/Accessibility.md` — Dynamic Type testing requirements.

---

**End of Document**
