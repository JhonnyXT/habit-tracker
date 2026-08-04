# Icons (Brand & Store Assets)

> The app icon and store-facing iconography — distinct from `design/Icons.md`'s in-app UI icon system.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Icons (Brand & Store Assets) |
| Version | 1.0 |
| Status | Draft |
| Audience | Design |
| Depends On | assets/Brand-Guidelines.md, design/Colors.md |

---

# Purpose

Specify the app icon and any other brand-level iconography (store listing thumbnail, marketing assets) as distinct from the in-app symbol system covered in `design/Icons.md`. These two documents intentionally never redefine each other's scope.

---

# App Icon Requirements

- Must read clearly at the smallest rendered size (home screen icon on the smallest supported device), which means: a single, simple focal shape — not a busy scene or literal illustration with many small details.
- Uses a small number of colors drawn from `design/Colors.md`'s established palette — the icon should feel like it belongs to the same product as the in-app experience, not an unrelated logo bolted on top.
- Avoids text/wordmarks inside the icon itself (per both Apple and Google platform conventions, and per this product's calm, non-cluttered visual identity).
- Must be provided in every size/format required by each platform's current app icon submission requirements at build time — exact size manifests are a build-tooling concern (Expo's icon generation config), not enumerated here since they're platform-version-dependent.

---

# Design Direction

- Reflects the Charter's Design Values (calm, confident, simple, precise, quality) and avoids the "aggressive branding... heavy gradients" the Charter warns against.
- A concrete icon concept (e.g. an abstract mark referencing consistency/checkmarks/calendars) is a design exploration task, not decided by this document — this document specifies constraints the eventual icon must satisfy, not the icon itself.

---

# Store Listing Thumbnail

- The icon used in the app store listing is the same app icon — no separate "marketing version" that diverges from what users actually see installed on their device.

---

# Other Brand Iconography

- Any additional brand mark used in marketing materials (e.g. a website, social presence) should derive from the same visual language as the app icon — a single consistent mark, not a separate logo system.

---

# What This Document Is Not

- Not the in-app UI icon system (habit icons, navigation icons, action icons) — that is `design/Icons.md`, built on Expo Symbols.
- Not a finished, specific icon design — that is a design deliverable to be produced and reviewed against the constraints above, then referenced here once finalized.

---

# Related Documents

- `assets/Brand-Guidelines.md` — the brand personality this icon must express.
- `design/Colors.md` — the palette this icon draws from.
- `design/Icons.md` — the separate, in-app iconography system.

---

**End of Document**
