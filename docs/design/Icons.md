# Icons

> The iconography system used throughout the UI.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Icons |
| Version | 1.0 |
| Status | Draft |
| Audience | Design, Engineering |
| Depends On | 03-Design-System.md |

---

# Purpose

Define a single, consistent icon system so the app never mixes icon styles, weights or sources — a common source of visual inconsistency in cross-platform apps.

Note: this document covers **in-app UI iconography**. Brand and marketing iconography (app icon, store assets) is covered separately in `assets/Icons.md`.

---

# System Choice

- **iOS:** Expo Symbols (SF Symbols) — reinforces "Native First" with the platform's own icon language.
- **Android / other:** `@expo/vector-icons` (Ionicons, with Material Community Icons where Ionicons lacks an equivalent).
- A custom-drawn icon set is out of scope for V1.

## Semantic Vocabulary, Not Raw Names

Call sites never reference an SF Symbol name or a vector-icon name directly, and never branch on platform. A single `Icon` component (`core/ui/icon.tsx`) owns a semantic vocabulary that maps each name to both platforms:

```ts
today   → sf: 'flame.fill'          | fallback: ionicons 'flame'
streak  → sf: 'flame.fill'          | fallback: ionicons 'flame'
running → sf: 'figure.run'          | fallback: material 'run'
export  → sf: 'square.and.arrow.up' | fallback: ionicons 'share-outline'
```

This is what keeps the two platforms from drifting: adding an icon means adding one entry with both mappings, so an icon can never exist on iOS but silently render blank on Android.

Adding a genuinely new icon is a deliberate act — extend the vocabulary in `icon.tsx`, don't reach for a raw name at the call site.

---

# Icon Sizes

Icons use the same semantic scale as spacing, expressed as tokens:

| Token | Size (pt) | Use |
|-------|-----------|-----|
| `icon.size.sm` | 16 | Inline with `type.footnote`/`type.caption` text |
| `icon.size.md` | 20 | Inline with `type.body`/`type.subheadline` text, default list icons |
| `icon.size.lg` | 28 | Habit icon in list rows, section headers |
| `icon.size.xl` | 40 | Habit Detail hero icon, empty-state icons |

---

# Icon Weight & Style

- Use a single consistent symbol weight (e.g. Regular) across the app; avoid mixing weights arbitrarily — weight variation, if used at all, should map to a specific semantic meaning (e.g. filled = selected/active, outline = unselected), not decoration.
- Filled vs. outline variants follow platform convention for selected/unselected states (e.g. a filled star for an active state, outline for inactive).

---

# Habit Icons

- Users choose a habit's icon from a curated subset of Expo Symbols relevant to common habit categories (fitness, reading, sleep, water, mindfulness, etc.) — not the entire symbol library, to keep the picker simple and fast (reinforcing "create a habit in under a minute").
- The curated list is maintained as data, not hardcoded per screen, so it can grow without a UI rewrite.

---

# Icon Color

- Icons always use a token from `Colors.md` — either a semantic token (`color.text.secondary` for a neutral utility icon) or a habit color token (`color.habit.*`) when representing a specific habit.
- Icons never carry meaning through color alone without an accompanying shape/label difference (NFR-5.4), except where the icon itself is purely decorative (e.g. next to already-labeled text).

---

# Accessibility

- Every standalone icon button (no visible text label) MUST have an explicit accessible label describing its action, not its appearance (e.g. "Add habit," not "Plus icon") (FR-10.1).
- Purely decorative icons paired with text MUST be hidden from assistive technology to avoid duplicate announcements.

---

# Related Documents

- `03-Design-System.md` — token-first philosophy this document implements.
- `Colors.md` — color tokens icons consume.
- `Components.md` — components that embed icons (HabitRow, StreakBadge, buttons).
- `assets/Icons.md` — brand/app icon, distinct from this in-app system.

---

**End of Document**
