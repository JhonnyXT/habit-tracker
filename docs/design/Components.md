# Components

> The inventory of reusable UI components, their states, and composition rules.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Components |
| Version | 1.1 |
| Status | Approved |
| Audience | Design, Engineering |
| Depends On | 03-Design-System.md, Colors.md, Typography.md, Spacing.md, Motion.md |
| Implemented By | `src/core/ui/` |

---

# Purpose

Enumerate the components needed to build every screen in `requirements/01-PRD.md`'s Screen Inventory, so features are assembled from a shared vocabulary instead of one-off implementations per screen.

---

# Composition Principle

Every component here is built exclusively from tokens in `Colors.md`, `Typography.md`, `Spacing.md` and `Motion.md`. A component MUST NOT hardcode a color, radius, size, or duration that already has a token.

**Placement rule** (`architecture/02-Architecture.md`): components with no feature knowledge live in `core/ui`; components that know about a domain entity live in that feature's `presentation/components/`.

---

# Core Primitives (`core/ui`)

## ThemedText

Base text primitive. Takes `variant` (a `Typography.md` role) and `color` (`primary` | `secondary`). Never accepts a raw font size.

> Note: the prop is `variant`, not `role` — React Native's `TextProps` already defines `role` for ARIA, and shadowing it breaks typing.

## ThemedView

Base view primitive resolving `surface` (`primary` | `secondary` | `elevated`) to a background color.

## Icon

The single icon vocabulary for the app. Maps a semantic name (`today`, `streak`, `running`) to an SF Symbol on iOS and an equivalent vector icon elsewhere. Call sites never branch on platform. See `Icons.md`.

## IconWell

A habit's icon on its tinted circular background — the core identity element. Takes an `IconName` and a `HabitColorToken`; resolves `solid` for the glyph and `tint` for the circle.

## PressableScale

Press feedback wrapper. Scales down on **press-in** (never on release) using `spring.snappy`, and disables itself under Reduced Motion. All pressable components compose this rather than implementing their own press state.

## Button

Variants: `primary` (filled accent), `secondary` (elevated surface), `destructive` (danger text on `state.dangerSubtle`). Optional leading icon. Enforces the platform minimum touch target regardless of visual size.

## Card / SectionHeader / Divider

- **Card** — rounded grouped container. `variant`: `card` (white, sits on the page) or `inset` (elevated, sits inside another card).
- **SectionHeader** — small-caps gray group label ("ACTIVE HABITS", "NOTIFICATIONS").
- **Divider** — hairline between rows, with an `inset` matching the row's content indent.

## ListRow

A single row in a grouped list: optional colored icon square, label, optional right-hand detail text, optional chevron, optional destructive styling.

## CompletionCheck

The completion affordance: an empty ring that fills with the habit's color and reveals a checkmark. Animated with `spring.momentum` — this is the one component allowed overshoot. The fill grows from `0.5` scale, never from zero: things do not appear out of nothing. **Purely visual**: the surrounding row owns the press and the accessibility state, so screen readers announce one element, not two.

## ProgressBar

Thin rounded track with an accent fill, animated with `spring.default` on `scaleX` from the left edge — never on `width`, which would relayout on every frame.

## StatCard

Compact metric tile: optional icon, large `statValue` number, small gray label — all centered on the tile's axis so a row of tiles reads as one balanced group. Optional tinted background (reusing a habit color's `tint`).

## HeatMap

Consistency heat map. Takes an array of per-day intensities and a habit color; `rows` controls whether it renders as a compact strip (list rows) or a full grid (Habit Detail). Empty cells use `surface.elevated`. Callers supply an accessible label describing the period — color never carries meaning alone.

Only the **last** cell is animated: it is the only one that can change while the map is on screen, so it cross-fades when the day is marked while the other 363 stay plain views. Animating every cell would cost hundreds of animated nodes to express one transition.

## SearchField

Rounded search input with a leading magnifier icon.

## SegmentedControl

iOS-style segmented control with a sliding selection pill animated via `spring.snappy`, so rapid taps stay continuous. Exposes `tablist`/`tab` accessibility roles.

## EmptyState

Calm, minimal title + supporting copy. Never uses guilt-based or motivational-poster language.

## ConfirmDialog

The app's only confirmation surface, replacing the platform `Alert`. A centred card over a
`surface.scrim`, entering with `spring.sheet` on scale and opacity only. Optional `IconWell`,
title, message, a confirm `Button` (`destructive` for anything irreversible) and a quiet
cancel below it.

Omitting `cancelLabel` turns it into a single-button notice — the same component reports the
result of a restore or the reason a backup file was rejected, so success and failure never
arrive through two different visual languages.

Used for every irreversible action: deleting a habit, deleting all data, and replacing the
database from a backup. The message states the consequence in plain language and, where the
app knows them, the actual counts (`docs/design/UX-Principles.md`, "What will happen next?").

---

# Feature Components

## HabitRow (`features/habits/presentation/components/`)

A habit on the Today screen: `IconWell`, name, schedule subtitle, `CompletionCheck`. Exposed to assistive technology as **one** actionable element with a composed label and a `checked` state.

Rows sit flush inside the grouped card with no gap between them, separated by a hairline inset to the text column (aligned with the name, not the icon), so the card reads as one list rather than a stack of floating tiles.

The separators belong to the **list**, not to the row: they are painted at fixed slot boundaries, so a row being dragged for reorder travels over them instead of carrying one with it — the slots stay put while the row moves, which is the physical model the gesture implies.

Pressing a row scales it to `motion.pressScale` on touch-down (not on release), and a long press hands off to the reorder lift. Press feedback and drag lift share one scale so they can never fight.

## DailyGoal (`features/habits/presentation/components/`)

The Today header card: label, count, `ProgressBar`. When the last habit of the day is checked it switches to "Día completo" in the accent colour with a small flame and one success haptic — see `design/Motion.md` for why this moment is allowed overshoot and why it never fires on a re-opened finished day.

## ColorSwatch (`features/habits/presentation/components/`)

The colour picker's dot. Selection shrinks it inside its ring with `spring.snappy` on `scale` — not by changing `width`/`height`, which would be a layout animation for a purely visual state.

---

# Component States Checklist

Every interactive component must define and visually differentiate:

- Default
- Pressed / active
- Disabled
- Focused (for keyboard/switch-control navigation)

Loading is explicitly **not** a required state for data operations, since all core data operations are local and effectively instant (NFR-1.3) — a spinner on a local SQLite write would itself be a design smell.

---

# Widget Components

The home screen widget (`engineering/Widgets.md`) reuses the same visual tokens but implements its own native rendering, since widget frameworks don't run the React Native component tree. Visual parity is mandatory; component-code reuse is not.

---

# Related Documents

- `03-Design-System.md` — the philosophy this inventory implements.
- `Colors.md`, `Typography.md`, `Spacing.md`, `Motion.md`, `Icons.md` — the tokens these components consume.
- `requirements/01-PRD.md` — the Screen Inventory these components assemble.
- `standards/Accessibility.md` — the accessibility contract each component must satisfy.

---

**End of Document**
