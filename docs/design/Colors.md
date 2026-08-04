# Colors

> Semantic color tokens for light and dark themes.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Colors |
| Version | 1.1 |
| Status | Approved (values derived from the Stitch designs, 2026-07-30) |
| Audience | Design, Engineering |
| Depends On | 03-Design-System.md |
| Implemented By | `src/core/theme/colors.ts` |

---

# Purpose

Define the semantic color tokens components consume, and the rules governing how color communicates meaning.

Values below match the approved designs and the shipped implementation in `src/core/theme/colors.ts`. **Token names and their meaning must not change** without updating every consumer; hex values may be tuned in place after visual QA.

---

# Principles

- Components consume **semantic tokens** (`surface.primary`), never raw values.
- Every token defines both a **light** and a **dark** value, tuned per-token — dark mode is not an algorithmic inversion of light.
- Color is never the only signal for state — always paired with an icon, shape or text change (NFR-5.4).
- The palette stays restrained: neutral surfaces, one accent, a small semantic set, and a fixed habit palette.

---

# Surfaces

The app uses the iOS grouped-list model: a light gray page with white cards sitting on it. This is why `surface.primary` is *not* pure white.

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `surface.primary` | `#F2F2F7` | `#000000` | Page background |
| `surface.secondary` | `#FFFFFF` | `#1C1C1F` | Grouped cards, list groups |
| `surface.elevated` | `#EFEFF1` | `#2A2A2E` | Inset rows and fields inside a card |

---

# Text

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `text.primary` | `#111113` | `#F2F2F4` | Main content |
| `text.secondary` | `#6E6E76` | `#9B9BA3` | Supporting/metadata text |
| `text.accent` | `#8B6F3F` | `#C4A265` | Dates and schedule subtitles (the warm amber of the designs) |

---

# Border

| Token | Light | Dark |
|-------|-------|------|
| `border.default` | `#E2E2E6` | `#2E2E33` |

---

# Accent

One accent color, used sparingly: primary buttons, active tab, toggles, progress fill, text links.

The accent is a **flame orange** — the product's streak metaphor made literal, and deliberately the only warm, saturated colour in an otherwise neutral palette. It reads as "lit" without making the interface loud.

| Token | Light | Dark |
|-------|-------|------|
| `accent.default` | `#E85D26` | `#FF884D` |
| `accent.subtle` | `#FDEDE5` | `#3A2016` |

> **Revision (2026-07-30):** originally specified as blue (`#2563EB`). Changed to flame orange so the accent reinforces the streak metaphor the app is built around. Blue remains available as `habit.blue` for habits that choose it.

---

# Habit Colors

Each habit carries a user-selected color (FR-1.3) from a **fixed, curated set** — not a free color picker — to preserve visual consistency.

Every habit color has two values:

- `solid` — the icon glyph, heat-map cells, the completion check fill.
- `tint` — the icon well's background circle.

| Token | Light `solid` | Light `tint` | Dark `solid` | Dark `tint` |
|-------|---------------|--------------|--------------|-------------|
| `habit.red` | `#E5484D` | `#FBE0E0` | `#F2555A` | `#3A1B1D` |
| `habit.orange` | `#E8802A` | `#FCE9DA` | `#F3924A` | `#3A2617` |
| `habit.yellow` | `#D8A400` | `#FAF0D2` | `#E8B92E` | `#372C10` |
| `habit.green` | `#2E9E5B` | `#DDF1E5` | `#3FBE72` | `#12301F` |
| `habit.teal` | `#1F9C8F` | `#D9F0ED` | `#33B8AA` | `#0F2F2C` |
| `habit.blue` | `#2563EB` | `#DEE8FD` | `#5C93FF` | `#16233D` |
| `habit.purple` | `#6D5AE0` | `#E5E1FB` | `#9A75EE` | `#241C3F` |
| `habit.pink` | `#E0568A` | `#FBE0EA` | `#F06FA0` | `#3A1826` |

---

# Semantic State Colors

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `state.success` | `#2FA84F` | `#3FBE72` | Completed accents, "Allowed" permission status |
| `state.warning` | `#D8A400` | `#E8B92E` | Non-blocking warnings |
| `state.danger` | `#E5484D` | `#F2555A` | Destructive actions, confirmations |
| `state.dangerSubtle` | `#FBE8E8` | `#3A1B1D` | Background of a destructive button |

---

# Usage Rules

- Never use `state.success` / `state.danger` decoratively — reserve them for their semantic meaning.
- Habit colors are for habit identity (icon well, heat-map cell, completion check) — not arbitrary decoration elsewhere.
- Stat-card tinted backgrounds reuse a habit color's `tint`; they do not introduce new one-off colors.
- All text/background combinations must meet WCAG AA contrast at minimum, verified in `reviews/07-QA.md`.

---

# Related Documents

- `03-Design-System.md` — token-first philosophy this document implements.
- `Components.md` — where these tokens are applied to concrete UI.
- `standards/Accessibility.md` — contrast and color-independence requirements.

---

**End of Document**
