# Illustrations

> Conventions for illustration used in empty states and onboarding.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Illustrations |
| Version | 1.0 |
| Status | Draft |
| Audience | Design |
| Depends On | design/Components.md, assets/Brand-Guidelines.md |

---

# Purpose

Define where illustration is used at all in this product — deliberately a small surface area — and the style constraints it must follow so it reinforces the calm brand identity rather than becoming decoration.

---

# Where Illustration Appears

Illustration in this product is limited to:

- **Onboarding** (Journey 1, `requirements/User-Journeys.md`) — a small number of screens introducing the product's philosophy.
- **Empty states** (`design/Components.md`'s EmptyState component) — Today screen with no habits yet, History with no data yet.

Illustration does **not** appear in day-to-day core-loop screens (Today with habits present, Habit Detail, Add/Edit Habit) — per `design/UX-Principles.md`'s "Core Loop Is Sacred," nothing decorative should slow down or visually clutter the primary daily interaction.

---

# Style Direction

- Simple, restrained line/shape work consistent with the app icon's visual language (`assets/Icons.md`) and the in-app color palette (`design/Colors.md`) — not a separate, unrelated illustration style bolted onto the product.
- No literal mascots or characters — consistent with `assets/Brand-Guidelines.md`'s "not playful/whimsical" stance.
- Illustrations should feel quiet, not attention-grabbing — supporting the accompanying copy, never competing with it.

---

# Accessibility

- Every illustration used in a meaningful UI context (not purely decorative) has an appropriate accessible description, or is marked decorative and hidden from assistive technology if it adds no information beyond the accompanying text — consistent with `standards/Accessibility.md`.
- Illustrations must not be the sole carrier of information (e.g. an empty state's call-to-action must also exist as legible text, not only implied by imagery).

---

# Dark Mode

- Every illustration must have a version (or a sufficiently adaptable color treatment) that reads correctly in both light and dark themes, consistent with `design/Colors.md`'s theming requirements — no illustration should look wrong or low-contrast in dark mode.

---

# What This Document Is Not

- Not a specification of in-app functional iconography (habit icons, action icons) — that's `design/Icons.md`.
- Not the app icon itself — that's `assets/Icons.md`.

---

# Related Documents

- `design/Components.md` — the EmptyState component where illustration is used.
- `requirements/User-Journeys.md` — the onboarding journey where illustration also appears.
- `assets/Brand-Guidelines.md` — the brand personality illustration style must match.
- `standards/Accessibility.md` — accessibility requirements for any illustrated content.

---

**End of Document**
