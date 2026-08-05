# Habit Tracker

Local-first habit tracking app. React Native + Expo + TypeScript. Android dev build running on a physical device.

---

## Non-negotiable rules

1. **No comments in source code.** Not JSDoc, not `//` explanations. Only functional directives (`eslint-disable`, `@ts-expect-error`). Rationale belongs in `docs/`. If code needs a comment, rename or restructure instead.
2. **UI text in Spanish, code in English.** All user-facing copy lives in `src/core/i18n/strings.ts` — never hardcode a string in a screen.
3. **No design tokens inline.** Colors, spacing, radius, type and motion come from `src/core/theme/`. A raw hex or magic number in a component is a bug.
4. **Business logic only in the domain layer.** Components and Zustand stores call use cases; they never contain schedule/streak/validation rules and never touch SQLite.
5. **Docs and code must not drift.** If an implementation decision contradicts `docs/`, update the doc in the same change.

---

## Required reading before changing code

1. `docs/README.md`
2. `docs/requirements/00-Project-Charter.md`
3. The document for the area you are touching (see map below)

---

## Architecture

Clean Architecture + Feature-First. Dependencies point inward.

```
src/
  app/                    Expo Router routes (thin, delegate to features)
  core/
    config/               build variant, read from app.config.ts's extra
    theme/                design tokens (colors, typography, spacing, motion) + appearance-store (Zustand)
    ui/                   design-system primitives
    i18n/                 all user-facing strings
    domain/               cross-feature use cases + ports (backup, spreadsheet export, delete-all, onboarding, appearance)
    data/                 SQLite connection + migrations + platform adapters
    di/                   composition root
  features/habits/
    domain/               entities, use cases, repository interfaces (pure TS)
    data/                 SQLite repository implementations + mappers
    presentation/         screens' components, Zustand store, formatters
  features/reminders/
    domain/               Reminder entity, use cases, ReminderRepository + NotificationScheduler ports
    data/                 SQLite repository + the expo-notifications adapter
    presentation/         deep-link hook for notification taps
  features/onboarding/
    presentation/         first-launch store (the route guard reads it)
```

- `domain/` imports nothing from React, React Native or SQLite.
- Platform services (notifications) enter the domain as **ports** — an interface in `domain/`, its Expo implementation in `data/`, bound in `core/di`.
- Components never import `data/` directly — everything goes through `core/di`'s `getUseCases()`.
- Streaks are **always derived** from completion history, never stored (FR-4.4).

---

## Current state

**Working end to end (persisted in SQLite):**
- Today: habit list, tap to toggle (strikethrough + check), long-press drag to reorder, progress bar. **Swipe a row** right for Editar, left for Eliminar (which confirms via `ConfirmDialog` — deleting destroys the whole history). Only one row opens at a time. The three gestures compose as `Gesture.Race(swipe, Gesture.Exclusive(drag, tap))`, with the swipe declaring `activeOffsetX`/`failOffsetY` so vertical scrolling and the long-press drag still win
- Completing every habit transforms the `DailyGoal` card in place — progress cross-fades out, flame and message spring in. The card has a fixed content height so the swap never animates height
- Habits: list with heat maps, navigation to detail
- Habit Detail: streaks, plus a Historial card with an **Año | Mes** switch. Año is the 12-month grid, now pinned to weekdays with day initials and month labels; Mes is a real month calendar where **tapping any past day marks or unmarks it** (Journey 5, FR-5.2/5.3). Future days are dimmed and inert, and the forward chevron is disabled in the current month. The date maths lives in `src/features/habits/domain/calendar.ts` and is unit-tested
- Add/Edit Habit: live preview, icon/color/schedule pickers, real time picker, delete
- Reminders: one per habit, persisted and scheduled as local notifications (daily, or one weekly trigger per selected weekday); permission is requested when the switch is turned on, never at launch; tapping a notification deep-links to that habit; `syncReminders` re-schedules from SQLite on every launch. The app declares `SCHEDULE_EXACT_ALARM` so `expo-notifications` takes its exact-alarm path — without it Android batches reminders and they arrive minutes late (measured: 11:54 → 11:56). See `docs/decisions/ADR-005.md`
- Archive: archive/unarchive from the edit form; archived habits leave Today and appear muted under "Archivados" in the Habits tab, history intact (US-05)
- Onboarding: one screen on first launch — three principles, then straight into creating the first habit. The flag lives in the `preferences` table (migration 2); routing is declarative via `Stack.Protected`, never an imperative redirect. See `docs/decisions/ADR-006.md`
- Settings: notification permission, appearance, both backup rows, Excel export, and "delete all data" are all live
- Appearance: Sistema / Claro / Oscuro segmented control in Settings. `core/theme/appearance-store.ts` is a Zustand store `useAppTheme()` reads reactively (replaced a dead module-level variable that never re-rendered anything); persisted via `core/domain/appearance.ts` in the `preferences` table and hydrated at launch alongside the onboarding check. Changing it recolors the whole app instantly and survives a full app restart
- Export / import (FR-9): export serializes the domain entities to `habit-tracker-YYYY-MM-DD.json` in the cache dir and opens the OS share sheet; import picks a file, validates it **completely before any write** (`parseBackup` in `src/core/domain/backup.ts`), then **replaces** all content and re-schedules reminders. Streaks are never exported — they recompute from the restored history. `backup.test.ts` covers the round trip and every rejection path
- Excel export: a second, **additive** export (`core/domain/spreadsheet.ts` + `core/data/expo-spreadsheet-file-store.ts`, using the `xlsx` package) that shares a read-only `habit-tracker-YYYY-MM-DD.xlsx` with three sheets — Hábitos, Completados, Recordatorios. It is explicitly **not** a restore format; "Restaurar copia" only ever reads the JSON backup. `xlsx`'s only known vulnerabilities are in its *parser*; this app only ever calls the writer (`XLSX.write`), never `XLSX.read`, so they don't apply here. Covered by `spreadsheet.test.ts`
- Confirmations use `ConfirmDialog` (`src/core/ui/`), never the platform `Alert`. Omit `cancelLabel` for a single-button notice
- Build variants: `dev` / `test` / `prod` via `app.config.ts` + `APP_VARIANT`, installable side by side. See `docs/decisions/ADR-007.md`

**Not built yet (V1 scope):**
- Home screen widget (FR-7)

---

## Commands

```bash
npm run typecheck         # tsc --noEmit
npm run lint              # eslint
npm test                  # domain tests
npm start                 # metro, dev variant (device connects via adb reverse tcp:8081 tcp:8081)
```

Native rebuild (only needed after adding a native module or changing `app.config.ts`):

```bash
npm run build:dev         # prebuild --clean + assembleDebug + adb install
npm run build:test        # prebuild --clean + assembleRelease + adb install
npm run eas:prod          # signed AAB via EAS; refuses to build locally on purpose
```

JS-only changes just need a reload — no rebuild.

## Build variants

Three variants, defined by the table at the top of `app.config.ts` and picked with `APP_VARIANT`. Each has its own `applicationId`, so all three install side by side and each gets its own SQLite sandbox. See `docs/decisions/ADR-007.md`.

| Variant | Application ID | Reason to exist |
|---------|----------------|-----------------|
| `dev` | `com.habittracker.app` | Iterating. Debug build, Metro, Fast Refresh. |
| `test` | `com.habittracker.app.test` | QA before publishing. Release APK, no Metro, empty database. |
| `prod` | `com.habittracker` | Publishing. Signed AAB, EAS only. |

- **Switching variants forces a full native rebuild** — the `applicationId` is baked into the generated native project, so `scripts/build-android.sh` always runs `prebuild --clean`. Budget minutes, not seconds.
- Application code reads the variant from `src/core/config/` (`appVariant`, `isDev`, `isTest`, `isProd`), never from `process.env`.
- An unknown `APP_VARIANT` throws at config resolution rather than defaulting.

---

## Verifying on the device

Screenshots and system dumps are how a change gets confirmed here; `tsc` and `eslint` cannot see a Reanimated worklet crash or a notification that never fires.

```bash
adb reverse tcp:8081 tcp:8081      # re-run after EVERY cable reconnect, or the dev client
                                    # hangs on its blue splash and never reaches Metro
adb shell am force-stop com.habittracker.app
adb shell monkey -p com.habittracker.app -c android.intent.category.LAUNCHER 1
adb exec-out screencap -p > shot.png

adb shell dumpsys alarm | grep -A3 habittracker              # is the reminder scheduled? exact or windowed?
adb shell dumpsys notification --noredact | grep habittracker # did it post?
adb shell "run-as com.habittracker.app cat files/SQLite/habit-tracker.db" > local.db  # inspect real rows
```

- Allow ~20-30s after launch before tapping: the dev client has to fetch the bundle first, and taps sent early land on the splash.
- A `ReferenceError: Property 'X' doesn't exist` in the Metro log right after an edit is usually stale Fast Refresh, not a real bug — force-stop and relaunch before chasing it.
- Restore whatever the test touched (completions, archived habits, enabled reminders). The device holds the user's real data.

---

## Design

The app follows Apple's fluid-interface principles (the `apple-design` skill). Concretely:

- **Springs, not fixed curves,** for anything the user touches. Tokens in `src/core/theme/motion.ts` map to Apple's damping/response model.
- **Press feedback on press-in,** never on release (`PressableScale`).
- **Overshoot only where a gesture carried momentum** — two moments earn it: the completion check, and the day turning complete (`DailyGoal`). Nothing else.
- **Haptics fire on the same frame as the visual.** This is why `toggle` in the store updates optimistically and reconciles afterwards: waiting for the SQLite write put the haptic ahead of the check.
- **Animate `transform` and `opacity` only.** A width/height/margin animation is a bug — `ProgressBar` uses `scaleX` with `transformOrigin: 'left'`, `ColorSwatch` uses `scale`.
- **Never call a plain function inside a worklet.** `useAnimatedStyle` runs on the UI thread; calling a normal helper from it throws `[Worklets] Tried to synchronously call a non-worklet function` at runtime and shows a red screen — with `tsc` and eslint both green. Compute the value on the JS side and let the worklet capture it.
- **Entrance animations use `<Enter>`**, which animates on a screen's **first** focus and renders instantly on every focus after that. Reanimated's `entering` prop only runs on mount, which would skip the animation entirely for a lazily-mounted tab; replaying it on *every* focus was worse — a stagger you see dozens of times a day stops being an entrance and becomes a delay.
- Accent is flame orange — the streak metaphor, and the only warm saturated colour in a neutral palette. The app icon is the same flame; sources live in `assets/brand/` and everything in `assets/images/` is generated from them, never hand-edited. The notification icon is a **second, simpler flame**, because Android flattens it to a 24 dp white silhouette and the launcher mark is illegible at that size (`docs/assets/Brand-Guidelines.md`).

---

## Documentation map

| Area | Document |
|------|----------|
| Principles, non-goals | `docs/requirements/00-Project-Charter.md` |
| Scope, screens | `docs/requirements/01-PRD.md` |
| Requirements (FR/NFR) | `docs/requirements/Functional-Requirements.md`, `Non-Functional-Requirements.md` |
| Layers, dependency rule | `docs/architecture/02-Architecture.md`, `Data-Flow.md` |
| Tokens, components, motion | `docs/design/` |
| Schema, contracts | `docs/api/Data-Models.md`, `API-Contracts.md` |
| Conventions | `docs/standards/` |
| Decisions | `docs/decisions/ADR-00*.md` |
| Future work | `docs/requirements/Roadmap.md` |
