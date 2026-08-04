# Brand Guidelines

> Identity, tone, and asset conventions for the product's public-facing brand.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Brand Guidelines |
| Version | 1.0 |
| Status | Draft |
| Audience | Design, Product, Engineering |
| Depends On | 00-Project-Charter.md, design/03-Design-System.md |

---

# Purpose

Define how the product presents itself outside the app itself — app icon, store listing, marketing copy tone — so the brand feels as calm and intentional as the in-app experience defined in `design/03-Design-System.md`.

---

# Product Name

**Status: not yet finalized.** A working name ("Habit Tracker") is used throughout `docs/` as a placeholder. The final product/brand name is a product decision to be made deliberately — this document should be updated with the chosen name, and this placeholder note removed, once decided. Do not treat "Habit Tracker" as the final shipped name.

---

# Brand Personality

Directly inherited from `00-Project-Charter.md`'s Design Values — the brand should communicate:

- Calm
- Confidence
- Simplicity
- Precision
- Quality

And explicitly avoid:

- Visual clutter
- Aggressive branding
- Excessive colors
- Heavy gradients
- Hype-driven marketing language

---

# Voice & Tone

- Plain, direct, calm language everywhere the product speaks to a user — app copy, store listing, release notes (`reviews/Release-Checklist.md`), support responses.
- No urgency language, no guilt-based motivational copy, no exclamation-point enthusiasm — consistent with `design/UX-Principles.md`'s Calm Notifications principle, extended to all brand communication.
- Never overpromises ("the only habit app you'll ever need") — describes what the product actually does.

---

# App Icon

- Full specification lives in `assets/Icons.md` (distinct from `design/Icons.md`'s in-app iconography system).
- The app icon should read clearly at the smallest home-screen size, use the product's core palette restrained to a very small number of colors, and avoid literal, cluttered illustration in favor of a simple, memorable mark.

## The mark

A flame in `accent.default` (`#E85D26`). It is not decoration: `design/Colors.md` records that
the accent was changed from blue to flame orange so the palette would carry the streak
metaphor the product is built around, and the same flame is already the Today tab and the
streak statistic. The icon says what the app is about with the shape it already uses inside.

## Source files

Both live in `assets/brand/` and are **the source of truth**; everything in `assets/images/`
is generated from them and should never be edited by hand.

| File | Used for |
|---|---|
| `flame.svg` | Launcher icon, adaptive foreground, monochrome layer, splash |
| `flame-glyph.svg` | Notification icon only — a simplified flame that survives 24 px (see `engineering/Notifications.md`) |

Two marks exist because one shape cannot do both jobs: the launcher renders at 48–192 dp and
can carry detail, while the status bar flattens to a white silhouette at 24 dp and cannot.

## Adaptive icon

The foreground sits inside Android's guaranteed 66% safe circle; the background is a flat
warm colour that differs per build variant (`decisions/ADR-007.md`), so the three installs are
distinguishable in the launcher at a glance without shipping three sets of artwork.

---

# Store Presence

- Store listing screenshots should show the actual product UI, truthfully representing the calm, minimal experience — never a mocked-up "busier" version implying more features than the app has.
- Store description copy follows the Voice & Tone rules above; avoid competitive comparisons or aggressive calls to action.
- Privacy-related store disclosures must accurately reflect `requirements/Non-Functional-Requirements.md` (NFR-4) — truthfully stating minimal/no data collection, consistent with `reviews/Release-Checklist.md`.

---

# What the Brand Is Not

- Not playful/whimsical in a way that undercuts the "precision and quality" personality (contrast with a cartoonish mascot-driven brand).
- Not built around gamified rewards or streak-shaming imagery, consistent with the Charter's stance against gamification beyond simple streaks.

---

# Related Documents

- `00-Project-Charter.md` — Design Values this document operationalizes for external-facing brand.
- `design/03-Design-System.md` — the in-app design language this brand identity must feel continuous with.
- `assets/Icons.md` — app icon specification.
- `assets/Illustrations.md` — illustration style used in store/marketing contexts as well as in-app empty states.
- `reviews/Release-Checklist.md` — where brand assets are checked before each release.

---

**End of Document**
