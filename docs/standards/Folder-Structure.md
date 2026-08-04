# Folder Structure

> File- and folder-level conventions implementing the shape defined in `architecture/02-Architecture.md`.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Folder Structure |
| Version | 1.0 |
| Status | Draft |
| Audience | Engineering, AI Assistants |
| Depends On | architecture/02-Architecture.md |

---

# Purpose

`architecture/02-Architecture.md` defines the layering and feature-first shape at a conceptual level. This document pins down the literal folder/file layout so any two contributors (human or AI) place a new file in the same location without guessing.

---

# Top-Level Layout

```
app/                     (Expo Router routes — thin, delegate to features/)
src/
  core/
    config/               (build variant, resolved from app.config.ts's extra)
    ui/                   (design-system primitives as code)
    di/                   (composition root)
    data/                 (db connection, migration runner)
    navigation/           (shared navigation helpers, deep-link resolution)
    theme/                (theming runtime)
  features/
    habits/
    tracking/
    streaks-history/
    reminders/
    widget/
    settings/
    onboarding/
widget/                   (native widget target, per platform tooling requirements)
```

---

# Inside a Feature

Per `engineering/05-Feature-Development.md`'s Anatomy of a Feature:

```
features/<name>/
  domain/
    entities/
      Habit.ts
    useCases/
      createHabit.ts
      toggleCompletion.ts
    repositories/
      HabitRepository.ts        (interface only)
  data/
    SqliteHabitRepository.ts
    mappers/
      habitMapper.ts
  presentation/
    screens/
      TodayScreen.tsx
    components/
      HabitRow.tsx
    store.ts
```

- A layer folder that has nothing to contain (e.g. a feature with no local UI state) is simply omitted — do not create empty placeholder folders.
- Test files live alongside the file they test (`toggleCompletion.test.ts` next to `toggleCompletion.ts`), not in a separate mirrored test tree.

---

# File Naming Within Folders

- One primary export per file, named to match the file (`HabitRow.tsx` exports `HabitRow`).
- Use case files are named as verbs (`toggleCompletion.ts`), matching their behavior.
- Entity files are named as nouns (`Habit.ts`), matching the concept they model.
- Full naming conventions (casing, etc.): `Naming-Conventions.md`.

---

# Where Shared Code Goes

- Truly cross-feature code (used by 2+ features with no natural owner) lives in `core/`, not duplicated per feature.
- Before adding something to `core/`, confirm it has no better home in a specific feature — `core/` should stay small; it is not a dumping ground for anything reusable "just in case" (YAGNI).

---

# Where the Widget Lives

- The native widget target lives at the top level (`widget/`), separate from `src/features/widget/`, which holds the Domain-layer-facing adapter code (`engineering/Widgets.md`) that the native target consumes.

---

# What Does Not Belong in `src/`

- Documentation (`docs/`), Claude workspace config (`.claude/`), and top-level project config remain outside `src/` — `src/` contains only application code.

---

# Related Documents

- `architecture/02-Architecture.md` — the layering this structure implements.
- `engineering/05-Feature-Development.md` — the process that populates this structure.
- `Naming-Conventions.md` — file and identifier naming within this structure.

---

**End of Document**
