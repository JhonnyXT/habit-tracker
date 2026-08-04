# Motion

> Animation principles, spring parameters, and Reduced Motion behavior.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Motion |
| Version | 1.1 |
| Status | Approved |
| Audience | Design, Engineering |
| Depends On | 03-Design-System.md |
| Implemented By | `src/core/theme/motion.ts` |

---

# Purpose

Define how and when the application moves, so animation always communicates, reinforces or guides — per the Charter's Motion Principles — and never distracts or delays.

---

# Motion Principles (from the Charter, applied concretely)

- **Explain** — an animation should make a state change legible (the completion check filling confirms the tap registered).
- **Reinforce** — motion follows the user's own input, starting the instant they press, not when they release.
- **Guide** — transitions communicate navigational relationships.
- **Delight, sparingly** — two moments carry a little overshoot: marking a habit done, and the last habit of the day landing (the daily-goal card switches to "Día completo" with a success haptic). Everything else is critically damped. The second one is deliberately quiet — a colour change, a small flame and one haptic, no confetti — because the Charter rules out gamification overload, and it fires only on the transition the user just caused, never when a finished day is merely re-opened.

Motion must never delay a user's ability to act. If an animation and an interaction compete, the interaction wins.

---

# Springs, Not Durations

Anything a user can touch animates with a **spring**, not a fixed-duration curve. A spring animates from the value currently on screen, which is what makes motion interruptible and redirectable mid-flight — a fixed curve replays from a fixed start and visibly jumps when interrupted.

Spring parameters follow Apple's designer-facing model, which maps directly onto Reanimated's `withSpring({ dampingRatio, duration })`:

- **`dampingRatio`** — overshoot. `1.0` = critically damped, no bounce. `< 1.0` = overshoots.
- **`duration`** — how quickly the value reaches the target. Not a hard runtime; the spring settles naturally.

| Token | dampingRatio | duration | Use |
|-------|--------------|----------|-----|
| `spring.default` | `1.0` | 400ms | Default UI motion — progress bar, layout changes |
| `spring.snappy` | `1.0` | 250ms | Small, frequent state changes — press feedback, segmented control pill |
| `spring.momentum` | `0.8` | 400ms | After a flick or drag; the completion check |
| `spring.sheet` | `0.8` | 300ms | Sheets and drawers |

**Rule:** overshoot (`dampingRatio < 1`) is only allowed when the interaction carried momentum or commits a meaningful action. A menu that merely appeared must not bounce.

---

# Fixed Durations

Reserved for non-interactive cross-fades and Reduced Motion fallbacks:

| Token | Duration |
|-------|----------|
| `duration.instant` | 100ms |
| `duration.fast` | 150ms |
| `duration.default` | 250ms |
| `duration.slow` | 350ms |

---

# Press Feedback

Press feedback fires on **press-in**, never on release — waiting for touch-up to show feedback reads as dead. Implemented once in `core/ui/pressable-scale.tsx`; components use it rather than re-implementing press states.

`pressScale` = `0.97`.

---

# Where Motion Is Used

| Moment | Motion |
|--------|--------|
| Marking a habit done | `spring.momentum` — the check scales from `0.5` and fades in (the primary "delight" moment) |
| Completing the day | `spring.momentum` on the daily-goal flame + success haptic, once, on the transition |
| Undoing a completion | Same spring, reversed — undo is never punished with slower motion |
| Any press | `spring.snappy` scale-down on press-in |
| Progress bar change | `spring.default` on `scaleX` (never `width` — that would relayout every frame) |
| Revealing a form section | `FadeIn` 150ms in, `FadeOut` 100ms out — the response is always faster than the request |
| Entering a screen | `<Enter>` staggers its children 45ms apart, **once**, on the screen's first focus. Returning to a tab renders instantly: an entrance the user sees dozens of times a day is no longer an entrance |
| Today's heat-map cell | `duration.default` colour cross-fade when the day is marked |
| Segmented control selection | `spring.snappy` pill translation |
| Sheet presentation | `spring.sheet` |

---

# What Motion Must Never Do

- Block interaction — a user must be able to act again before a non-essential animation finishes.
- Loop indefinitely to draw attention (no idle "nudge" animations).
- Substitute for a valid static end state.

---

# Reduced Motion

Per NFR-5.3 / FR-10.3, when the OS Reduced Motion setting is enabled:

- Springs are replaced with a short `duration.instant`/`duration.fast` timing curve, or an instant state change.
- Press-scale feedback is disabled entirely (the visual state change still occurs).
- No functionality is lost — only the motion styling changes.

Implemented via Reanimated's `useReducedMotion()` at each animation site, reading one platform-level signal rather than each component deciding independently.

---

# Related Documents

- `00-Project-Charter.md` — Motion Principles this document implements.
- `03-Design-System.md` — token-first philosophy this document implements.
- `standards/Accessibility.md`, `standards/Performance.md` — Reduced Motion and 60 FPS requirements.

---

**End of Document**
