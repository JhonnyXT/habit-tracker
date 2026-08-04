# UX Principles

> Interaction principles from the Charter, applied concretely to this application's screens and flows.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | UX Principles |
| Version | 1.0 |
| Status | Draft |
| Audience | Design, Engineering |
| Depends On | 00-Project-Charter.md, requirements/User-Journeys.md |

---

# Purpose

Translate the Charter's User Experience Principles into concrete rules for this specific application, so design and engineering decisions during `engineering/05-Feature-Development.md` have a shared reference beyond "it should feel good."

---

# The Four Questions

Per the Charter, a user should always know:

1. Where they are.
2. What they can do.
3. What just happened.
4. What will happen next.

Applied here:

| Question | Application |
|----------|-------------|
| Where am I? | Screen titles are always present and unambiguous (Today, Habit Detail with the habit's name, Settings). Navigation state is never ambiguous — no unlabeled tabs or screens. |
| What can I do? | Primary actions are always visually obvious without requiring exploration (add habit, mark done) — never hidden behind an undiscoverable gesture as the *only* way to do something important. |
| What just happened? | Every state-changing action (marking done, saving a habit, deleting) gives immediate, clear feedback — visual and, where appropriate, haptic. |
| What will happen next? | Destructive actions (delete) always confirm their consequence in plain language before acting; navigational elements make their destination predictable (no surprise screens). |

---

# The Core Loop Is Sacred

The single most important interaction in this product is: **open app → mark habit(s) done → close app.**

Every UX decision is evaluated against whether it protects or degrades this loop:

- The Today screen must never require scrolling past irrelevant content before reaching today's habits.
- Marking a habit done must never require more than one tap plus, at most, one confirmation for irreversible actions only (marking done is never one of those).
- No screen in the core loop should introduce a modal, ad, upsell, or unrelated prompt.

---

# No Tutorials Required

Per "Clarity Over Complexity," every screen must communicate its purpose through its own layout and copy:

- Empty states explain what to do next in plain language (`Components.md` → EmptyState), replacing the need for a tutorial overlay.
- Icons are never used alone to convey an unfamiliar action without a label the first few times it matters (e.g. onboarding), though the daily-use UI can lean on learned iconography afterward.

---

# Predictability Over Surprise

- Gestures (swipe, long-press) are only used for actions that also have a discoverable, tappable alternative — never as the sole path to an important action.
- Navigation transitions are consistent: the same gesture (e.g. tapping a row) always produces the same kind of transition (per `Motion.md`) across the app.
- The app never re-orders or changes the Today list on its own — only explicit user action (manual reorder, archiving) changes it.

---

# Backfilling and Correction Are First-Class

Per Journey 5 (`requirements/User-Journeys.md`), users must be able to correct the past without friction or judgment:

- Editing a past date uses the same interaction model as editing today — no separate, more complex "edit mode."
- The UI never implies a missed day is a failure state requiring justification — it's simply an editable cell.

---

# Calm Notifications

Per the Charter's Calm Technology principle and FR-6:

- Reminder copy references the specific habit, not generic urgency language ("Time for Reading," not "Don't break your streak!!").
- The app never sends more than the reminders the user explicitly configured — no re-engagement or "come back" notifications invented by the product.

---

# Consistency Across Surfaces

The Today screen, Habit Detail, and the home screen widget must present the same information the same way (colors, icons, state) — a user should never have to reconcile two different visual representations of the same habit's status (reinforced by `architecture/Data-Flow.md` Flow 5's single source of truth).

---

# Applying This Document

When a proposed interaction is ambiguous, resolve it by asking, in order:

1. Does it protect the core daily loop (open → mark done → close)?
2. Does it keep the user oriented (the Four Questions)?
3. Does it avoid requiring a tutorial to understand?
4. Is it consistent with how a similar interaction already works elsewhere in the app?

If an interaction fails any of these, redesign it before implementation.

---

# Related Documents

- `00-Project-Charter.md` — User Experience and Calm Technology principles this document applies.
- `requirements/User-Journeys.md` — the concrete flows these principles govern.
- `Motion.md`, `Components.md` — the visual/interaction building blocks these principles constrain.

---

**End of Document**
