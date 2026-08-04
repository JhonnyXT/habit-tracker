# 03 — Design System

> This document defines the visual and interaction language of the application, and indexes the detailed design documents that implement it.
>
> It translates the Charter's Design, UX and Motion Principles and the Architecture's technology mapping into concrete, reusable design decisions.
>
> Every screen and component built in `engineering/05-Feature-Development.md` must be composed from this system — not from one-off styles.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Design System |
| Version | 1.0 |
| Status | Draft |
| Audience | Design, Engineering, AI Assistants |
| Depends On | 00-Project-Charter.md, 02-Architecture.md |

---

# Purpose

Establish a single, consistent visual and interaction language so that:

- Every screen feels like it belongs to the same product.
- New screens can be assembled from existing tokens and components instead of inventing new ones.
- The interface stays "quiet" per the Charter — consistency is prioritized over novelty.

This document is the index and philosophy. Token values and detailed specs live in the sibling documents listed below.

---

# Design Philosophy

Directly inherited from `00-Project-Charter.md` — restated here because every design decision must be traceable to it:

- **Whitespace is a feature.** Never fill space just because it's available.
- **Consistency over creativity.** A new pattern must justify itself against reusing an existing one.
- **Minimalism removes complexity, not functionality.** A simpler-looking screen must still do everything it needs to.
- **The interface should feel quiet.** Visual weight is a scarce resource, spent only on what the user needs to notice.
- **Native first.** Components should feel at home on iOS and Android respectively, not like a cross-platform compromise.

---

# System Structure

The Design System is organized into the following documents. Each is authoritative for its domain — do not redefine spacing values inside `Components.md`, for example; reference `Spacing.md` instead.

| Document | Domain |
|----------|--------|
| `Colors.md` | Semantic color tokens, light/dark themes |
| `Typography.md` | Type scale, weights, hierarchy, Dynamic Type behavior |
| `Spacing.md` | Spacing scale, layout grid, screen margins |
| `Motion.md` | Animation durations, easing, Reduced Motion behavior |
| `Components.md` | Component inventory, states, composition rules |
| `Icons.md` | Iconography system (Expo Symbols) and usage conventions |
| `UX-Principles.md` | Interaction principles applied to concrete screens |

---

# Token-First Approach

All visual values (color, spacing, type size, motion duration) are defined as **semantic tokens**, never as raw hardcoded values inside components.

- A component asks for `color.surface.primary`, not `#FFFFFF`.
- A component asks for `spacing.md`, not `16`.
- This is what allows light/dark mode, accessibility scaling, and future re-theming to work without touching component code.

Enforcing this is part of Definition of Done (`standards/Definition-of-Done.md`).

---

# Platform Fidelity

The system favors platform-native feel over strict pixel-parity between iOS and Android:

- Navigation transitions, haptics, and system controls follow each platform's own conventions where Expo/React Native exposes them.
- Shared components (buttons, lists, cards) use one set of tokens, but may render with platform-appropriate details (e.g. native-feeling press states).

---

# Theming

- The system MUST support light and dark themes as first-class, not as an afterthought (per `01-PRD.md` Appearance scope).
- Every color token in `Colors.md` MUST define both a light and dark value.
- Components MUST NOT branch on theme directly — they consume tokens that already resolve to the correct theme.

---

# Accessibility as a Design Constraint

Per the Charter's Accessibility Commitment and `requirements/Non-Functional-Requirements.md` (NFR-5):

- Type scale must remain legible and layouts must not break at any supported Dynamic Type size (`Typography.md`).
- Color alone must never carry meaning (`Colors.md`).
- Motion must have a reduced-motion equivalent for every meaningful animation (`Motion.md`).
- Touch targets must meet platform minimums regardless of visual size (`Components.md`).

---

# How This System Is Used

1. A new screen or feature starts by identifying which existing components (`Components.md`) satisfy its needs.
2. If no existing component fits, a new one is designed using existing tokens (`Colors.md`, `Typography.md`, `Spacing.md`, `Motion.md`) before considering new token values.
3. New token values are only introduced when an existing token genuinely cannot serve the need, and the addition is documented in the relevant sibling file.

---

# Related Documents

- `00-Project-Charter.md` — Design, Motion and Accessibility Principles this system implements.
- `02-Architecture.md` — where UI primitives live (`core/ui`) and how they're consumed by features.
- `Colors.md`, `Typography.md`, `Spacing.md`, `Motion.md`, `Components.md`, `Icons.md`, `UX-Principles.md` — detailed specifications.
- `standards/Accessibility.md` — accessibility implementation conventions.

---

**End of Document**
