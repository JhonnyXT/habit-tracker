# Naming Conventions

> Consistent naming for files, types, functions, and design tokens.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Naming Conventions |
| Version | 1.0 |
| Status | Draft |
| Audience | Engineering, Design |
| Depends On | standards/Folder-Structure.md, design/03-Design-System.md |

---

# Purpose

Remove naming as a source of bikeshedding or inconsistency by fixing conventions per category, once, here.

---

# Files

| Type | Convention | Example |
|------|-----------|---------|
| Component (`.tsx`) | PascalCase, matches exported component | `HabitRow.tsx` |
| Screen (`.tsx`) | PascalCase + `Screen` suffix | `TodayScreen.tsx` |
| Hook | camelCase + `use` prefix | `useReducedMotion.ts` |
| Use case | camelCase verb phrase | `toggleCompletion.ts` |
| Entity | PascalCase noun | `Habit.ts` |
| Repository interface | PascalCase noun + `Repository` | `HabitRepository.ts` |
| Repository implementation | Technology prefix + interface name | `SqliteHabitRepository.ts` |
| Store | camelCase + `store` (or colocated as `store.ts` per feature) | `store.ts` |
| Test file | Same name as file under test + `.test` | `toggleCompletion.test.ts` |

---

# TypeScript Identifiers

- **Types/Interfaces:** PascalCase (`Habit`, `HabitRepository`, `Schedule`).
- **Functions/variables:** camelCase (`createHabit`, `currentStreak`).
- **Constants that are truly fixed values:** SCREAMING_SNAKE_CASE only for module-level, never-changing primitives (e.g. `MAX_HABIT_NAME_LENGTH`); prefer camelCase for anything that's a configuration object rather than a single primitive.
- **Boolean variables/props:** prefixed for clarity (`isArchived`, `hasReminder`), matching the schema field naming in `api/Data-Models.md`.

---

# Design Tokens

Per `design/03-Design-System.md`'s token-first approach, tokens follow a consistent dot-namespaced pattern:

```
<category>.<subcategory>.<variant>
```

Examples already established across the Design System:

- `color.surface.primary`, `color.text.secondary`, `color.habit.blue` (`design/Colors.md`)
- `type.largeTitle`, `type.body` (`design/Typography.md`)
- `spacing.md`, `spacing.xl` (`design/Spacing.md`)
- `motion.duration.fast`, `motion.easing.standard` (`design/Motion.md`)
- `icon.size.md` (`design/Icons.md`)

New tokens must follow this same `<category>.<subcategory>.<variant>` shape — never a flat, uncategorized name.

---

# Database Columns

- `snake_case`, per SQL convention (`habit_id`, `completed_at`), even though the surrounding TypeScript code uses camelCase — the mapping between the two happens explicitly in each repository's `mappers/` (`Folder-Structure.md`), never left implicit.

---

# Routes (Expo Router)

- File-based route names are lowercase, kebab-case where multi-word (`habit-detail.tsx`), matching Expo Router's filesystem convention directly.

---

# Feature Folder Names

- Lowercase, kebab-case, plural where the feature represents a collection of things (`habits`, `reminders`), singular where it represents a concept (`widget`, `onboarding`) — matching the existing `src/features/` layout in `Folder-Structure.md`.

---

# Related Documents

- `Folder-Structure.md` — where these naming rules apply within the directory layout.
- `design/03-Design-System.md` — the token-first approach this document's token naming section supports.
- `api/Data-Models.md` — the schema whose column names this document's Database Columns section governs.

---

**End of Document**
