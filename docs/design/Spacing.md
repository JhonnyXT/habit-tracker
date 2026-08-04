# Spacing

> The spacing scale, layout grid, and screen margin conventions.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Spacing |
| Version | 1.0 |
| Status | Draft |
| Audience | Design, Engineering |
| Depends On | 03-Design-System.md |

---

# Purpose

Give whitespace — a stated Charter feature, not an afterthought — a consistent, predictable scale so every screen feels like it belongs to the same system.

---

# Spacing Scale

A 4pt base unit, exposed as semantic tokens. Components request a token, never a raw number.

| Token | Value (pt) | Typical Use |
|-------|-----------|-------------|
| `spacing.xxs` | 2 | Icon-to-label micro gaps |
| `spacing.xs` | 4 | Tight internal padding |
| `spacing.sm` | 8 | Compact internal padding, small gaps between related elements |
| `spacing.md` | 16 | Default padding/margin — the most common value in the system |
| `spacing.lg` | 24 | Section separation |
| `spacing.xl` | 32 | Screen-level vertical rhythm between major sections |
| `spacing.xxl` | 48 | Empty-state illustrations, onboarding breathing room |

---

# Corner Radius

The designs are consistently soft-cornered. Radii are tokens too — never a raw number in a component.

| Token | Value | Use |
|-------|-------|-----|
| `radius.sm` | 8 | Small wells, settings-row icon squares |
| `radius.md` | 12 | Search field, segmented control track |
| `radius.lg` | 16 | Cards, grouped list containers, habit rows, buttons |
| `radius.xl` | 24 | Sheets and large surfaces |
| `radius.full` | 999 | Pills, floating tab bar, circular icon wells |

Implemented in `src/core/theme/spacing.ts`.

---

# Screen Margins

- Default horizontal screen margin: `spacing.md` (16pt) on standard phone widths.
- Tablet/wide layouts scale the margin up (e.g. `spacing.xl`) rather than stretching content edge-to-edge, preserving readable line lengths.

---

# Layout Grid

- Lists (habits on Today, history rows) use a single-column layout — no multi-column grid in V1, keeping scanning effortless per "Clarity Over Complexity."
- Card/row internal padding defaults to `spacing.md` on all sides unless a specific component spec in `Components.md` states otherwise.
- Vertical rhythm between stacked sections on a screen defaults to `spacing.xl`.

---

# Touch Targets

- Independent of visual spacing, every interactive element MUST maintain a minimum hit area per platform guideline (iOS: 44×44pt, Android: 48×48dp), even if the visible element is smaller (FR-10.4 / NFR-5).
- Spacing between adjacent interactive elements MUST be sufficient to prevent accidental mis-taps — never rely purely on visual padding for this; verify actual hit-area separation.

---

# Principles

- When in doubt, use more whitespace, not less — density is not a goal of this product.
- A new spacing value is introduced only when the existing scale genuinely cannot express the needed relationship, and it must be added to this document, not invented ad hoc in a component.

---

# Related Documents

- `03-Design-System.md` — token-first philosophy this document implements.
- `Typography.md` — vertical rhythm between type roles.
- `Components.md` — concrete component padding/margins built from this scale.

---

**End of Document**
