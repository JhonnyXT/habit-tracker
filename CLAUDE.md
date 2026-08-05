# Habit Tracker

Local-first habit tracking app. React Native + Expo + TypeScript. Android dev build running on a physical device.

---

## Active initiative: Reminderos-inspired redesign (branch `reminderos-redesign`, off `main`)

The NativeWind design-system work below (previously branch `nativewind-obytes`) is **merged into `main`** — Settings runs on it; every other screen is still `core/theme`. That initiative is paused, not abandoned; the section is kept for context on `core/ui-nw/`.

The current branch adopts specific interaction and visual patterns from a reviewed reference app ("Reminderos," an iOS reminders app) **without adopting its product scope** — this app stays a habit tracker with streaks, not a task manager. Per-feature detail lives in ADRs/Roadmap; the load-bearing decisions and bugs found:

1. **`habit-form.tsx` is now a native form sheet**, not a full-screen push. `src/app/_layout.tsx`'s `Stack.Screen` for it uses `presentation: 'formSheet'` + `sheetAllowedDetents`/`sheetGrabberVisible`/`sheetCornerRadius` — all native to `react-native-screens` ~4.16 / `expo-router` ~6, no library added. iOS gets the real drag-handle/detent behaviour; Android's support is more limited and unverified on hardware (no iPhone/Mac access, same standing limitation as the rest of this app's iOS work).
2. **The form's Icon/Color/Horario/Recordatorio sections became chips** (`core/ui/chip.tsx`) that expand inline on tap instead of always-visible blocks — an accordion (`activeReveal` state), not real nested sheets, to avoid the risk of stacking `formSheet`s untested on this device.
3. **The "+" on Today/Habits is now a dual entry point.** A `SegmentedControl` at the top of the sheet (Hábito/Tarea, "Hábito" preselected) switches the form's content; choosing "Tarea" swaps in a name field + a habit picker (disabled with a note if no habits exist yet — a task can never be created without a parent habit).
4. **Habit Tasks** (`FR-11`, `Roadmap.md`): a habit may have repeatable daily tasks, tracked as a *motivational percentage only* — deliberately **never gates the streak**. New tables `tasks`/`task_completions` (migration v3), new domain files under `features/habits/domain/` (`entities/task.ts`, `task-progress.ts`, `use-cases/*-task*.ts`), a `getHabitTasks` use case, and a checklist section in Habit Detail plus a small progress bar on Today/Habits rows. `task-progress.ts`'s `groupTaskProgress` is pure and unit-tested — the actual guarantee that toggling a task can't touch `computeStreaks` is structural (no import, not just a passing test).
5. **Multi-alert reminders, restricted to daily habits only** (`ADR-008.md`, `FR-6.5`): `Reminder` gained a `kind: 'main' | 'pre' | 'followup'` column. A pre-reminder (-15 min, fixed) and a follow-up (+30 min, fixed) can be enabled **only** when `habit.schedule.type === 'daily'`, enforced in `set-habit-reminder.ts` itself, not just in the UI — a weekday-scheduled habit already reserves up to 7 OS notification slots (one `WEEKLY` trigger per day per `ADR-005.md`), and iOS caps an app at ~64 pending local notifications total; letting multi-alert multiply that would risk silently exceeding the ceiling. `editHabitUseCase` was fixed to drop any `pre`/`followup` rows if a habit's schedule changes away from `daily`, closing the one path that could have reintroduced the multiplier. `getHabitReminder`/`archiveHabitUseCase`/`editHabitUseCase` also had a latent `reminders[0]` bug (silently ignored every reminder past the first) fixed as part of this — pre-existing, not introduced here.
6. **Today's empty state got a full visual pass**: a "+" FAB (plain light circle, soft neutral shadow, no colored border/halo) fixed bottom-right, aligned with the tab bar; a search field (filters the visible list by name, disabled/dimmed when the list is empty) and a "..." menu (Ver archivados, Exportar copia) replacing the old inline add button; and a mocked "card deck" illustration (`empty-today-preview.tsx`) shown **only** when the user has zero habits ever — a separate, plainer message covers "habits exist, none due today" so the illustration never lies about there being nothing to see.
7. **Real Reanimated bug found while building the card-deck illustration**: `Animated.View style={[{transform: [...]}, animatedStyle]}` does not merge the two `transform` arrays — React Native replaces the whole `transform` property with whichever style object in the array defines it last, so the animated style silently discarded the static `rotate`/`translateX`. Fix: bake every transform (static and animated) into the *same* `useAnimatedStyle` return value. Same root cause independently documented in `my-wallet-app`'s `useFloat` hook.
8. **`TabBar` reserves width for the FAB on screens that have one** (`screensWithFab` set, checked against `state.routeNames[state.index]`), instead of centering itself across the full screen width regardless — otherwise the tab pill centers alone and the [pill + FAB] group reads as off-center once the FAB's footprint is added next to it.

---

## Design system: NativeWind (background — see initiative above for current branch)

Branch `nativewind-obytes`, off `main` (**not** off `expo-sdk-57-upgrade` — that branch's SDK 54→57 bump and its `@expo/ui`/Material 3 Android pilot are `git stash`ed there, untouched, waiting to be resumed separately). This branch is still on the pre-upgrade SDK (`expo` `^54`, `react-native` 0.81.5) — nothing here builds on top of the other branch's work, they're two independent explorations of the same underlying goal (Platform Fidelity: iOS and Android should look native to their own platform, not identical).

Where the two branches diverge on *how* to get platform fidelity: `expo-sdk-57-upgrade` renders actual native SwiftUI/Compose views via `@expo/ui`. This branch instead keeps everything as regular React Native views, styled with **NativeWind** (Tailwind for RN) instead of the hand-rolled `core/theme` token system, and expresses per-platform differences explicitly via `Platform.select()` rather than a different rendering engine per platform. Chosen after `@expo/ui`'s Android bugs (see that branch's `docs/research/expo-ui.md`) cost real time to work around — NativeWind trades "the OS literally draws the control" for "fast, predictable, zero native-bridge bugs," which the user weighed and preferred for how this app should feel day to day.

**Setup:** `tailwind.config.js` (custom `primary`/`neutral`/`danger` palette derived from the app's flame-orange brand, `rounded-3xl` in the radius scale), `global.css`, `babel.config.js` (`babel-preset-expo` with `jsxImportSource: 'nativewind'` *and* the separate `nativewind/babel` preset — both are required, they do different things: the first sets the JSX runtime import, the second is the actual className-to-style transform; not redundant), `metro.config.js` (`withNativeWind`), `nativewind-env.d.ts`. `babel-preset-expo` had to be added as an explicit dependency — it's normally just a transitive/nested dep that a zero-config project never resolves directly, but a custom `babel.config.js` needs it resolvable from the root.

**`src/core/ui-nw/`** is the new component folder, parallel to (not replacing) `src/core/ui/` — Today, Habits, and Habit Detail still run on the original hand-rolled `core/theme` system; only Settings has moved over so far. Contents: `SettingsContainer`, `SettingsItem`, `SegmentedControl`, and `platform-tokens.ts` (centralizes every `Platform.select()` difference in one file instead of scattering them per component — corner radius, icon shape, shadow, and critically **press feedback**: iOS gets `active:opacity-70`, Android gets a *real* native ripple via `Pressable`'s `android_ripple` prop, no `@expo/ui` needed for that).

**Two real bugs found and fixed while building this, not cosmetic tweaks:**
1. NativeWind ships its own theme controller (`colorScheme` from the `nativewind` package) that is **completely independent** from this app's own `useAppearanceStore`. Changing Sistema/Claro/Oscuro updated the Zustand store correctly but NativeWind never found out, so nothing visually changed. Fixed with a `useEffect` in `src/app/_layout.tsx` that bridges `useAppearanceStore`'s scheme into `colorScheme.set()` (imported from `nativewind`) on every change.
2. `habit-form.tsx` felt laggy entering edit mode. It was calling `getHabitDetail` (built for the Habit Detail screen: fetches the *entire* completion history and runs `computeStreaks`/`last30Percent`) just to read a habit's name/icon/color/schedule — none of which needs streaks. Added a lightweight `getHabitUseCase` (`src/features/habits/domain/use-cases/get-habit.ts` → `habits.getById(id)` only, wired into `core/di/composition-root.ts` as `getHabit`), and parallelized it with `getHabitReminder` via `Promise.all` instead of two sequential awaits. Confirmed via a release build (`npm run build:test`) that remaining perceived slowness was normal dev-mode JS overhead, not a further bug.

**Today's swipe-to-edit/delete row** (`draggable-habit-list.tsx`) was also redesigned here: the old solid full-color reveal (an accent/danger block filling the whole action area) is now the app's own `IconWell`-style pattern instead — the row's normal background stays, and a small circular tinted badge shows just the icon in its semantic color. A "flick past the reveal point to commit immediately" gesture (with Apple-design-skill rubber-banding) was built and tested, then **reverted at the user's explicit request** after hands-on testing — it felt unpredictable (an emphatic swipe could fire the action without meaning to). Swipe now only ever reveals the button; tapping it is the only way to trigger edit/delete. Don't re-add auto-commit-on-swipe without asking first — this was a deliberate UX call, not an oversight.

**`scripts/build-android.sh` was always doing a clean prebuild**, on every single local build regardless of variant — wiping `android/.gradle` and `android/app/.cxx` (Gradle/CMake's incremental caches) every time, which is why every native rebuild this session took 10-15 minutes even for trivial changes. Per `ADR-007`, a `--clean` prebuild is only actually required when the `applicationId` changes (switching `dev`/`test`/`prod`). Fixed: the script records the last-built variant in `android/.last-variant` and only forces `--clean` when the variant differs from the last build (or `android/` doesn't exist yet) — same-variant rebuilds now run a plain incremental `prebuild`, so Gradle/CMake's caches survive between builds. (`my-wallet-app`, a sibling project, gets the same speed by keeping `android/` persistent across ordinary `expo run:android` calls — same underlying idea.)

**Settings' cards were restyled to an "elevated surface, no border" look** (reference: dark travel-app UIs where every component gets its own background tint instead of a hairline border) — `SettingsContainer`/`SegmentedControl` dropped the dark-mode border and moved from `bg-neutral-900` to `bg-neutral-800`, and `SettingsItem`'s icon badges switched from a solid-fill circle to a tinted "icon well" (`iconWellClassName`/`iconWellColor` in `platform-tokens.ts`: ~15%-opacity tint of the semantic color behind a solid-color icon). Checking `core/theme/colors.ts` afterwards showed **Today/Habits/Habit Detail already had this exact pattern** — `Card`/`HabitCard` were already borderless with `surface.secondary` (`#1C1C1F` dark) which is the same hex as the new NativeWind `neutral-800`, and `IconWell` already does the tint-background/solid-icon split. Settings had been the outlier, not the other way around. The one genuine gap: those screens' card radius was a flat `radius.lg` (16px) on every platform, while Settings gets a bigger radius on iOS. Fixed by making `radius.lg` itself `Platform.select({ ios: 24, default: 16 })` in `core/theme/spacing.ts` — propagates to every `radius.lg` consumer app-wide, no component changes needed.

**Not yet done on this branch:** Add/Edit Habit's and Habit Detail's screens are still on the original `core/theme` system, not NativeWind — Settings is the only screen migrated so far. iOS hasn't been verified on real hardware for any of this (no Mac/iPhone access currently) — only Android has been confirmed on the physical device.

---

## Non-negotiable rules

1. **No comments in source code.** Not JSDoc, not `//` explanations. Only functional directives (`eslint-disable`, `@ts-expect-error`). Rationale belongs in `docs/`. If code needs a comment, rename or restructure instead.
2. **UI text in Spanish, code in English.** All user-facing copy lives in `src/core/i18n/strings.ts` — never hardcode a string in a screen.
3. **No design tokens inline.** Colors, spacing, radius, type and motion come from `src/core/theme/`. A raw hex or magic number in a component is a bug. **On `nativewind-obytes`:** NativeWind screens (`core/ui-nw/`) use `tailwind.config.js`'s custom `primary`/`neutral`/`danger` scale instead — the same principle, a different token source. A raw hex/px value inside a `className` string is still a bug there; extend `tailwind.config.js`'s theme instead.
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
    ui/                   design-system primitives (hand-rolled, theme-token based — Today/Habits/Habit Detail)
    ui-nw/                NativeWind-styled primitives (this branch's active initiative — Settings only so far)
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
- Today: habit list, tap to toggle (strikethrough + check), long-press drag to reorder, progress bar. **Swipe a row** right for Editar, left for Eliminar (which confirms via `ConfirmDialog` — deleting destroys the whole history). Only one row opens at a time. The three gestures compose as `Gesture.Race(swipe, Gesture.Exclusive(drag, tap))`, with the swipe declaring `activeOffsetX`/`failOffsetY` so vertical scrolling and the long-press drag still win. Header has a search field (filters by name, disabled when the list is empty) and a "..." menu (Ver archivados, Exportar copia); the "+" is a fixed FAB bottom-right, aligned with the tab bar, not an inline header button
- Completing every habit transforms the `DailyGoal` card in place — progress cross-fades out, flame and message spring in. The card has a fixed content height so the swap never animates height
- Habits: list with heat maps, navigation to detail
- Habit Detail: streaks, plus a Historial card with an **Año | Mes** switch. Año is the 12-month grid, now pinned to weekdays with day initials and month labels; Mes is a real month calendar where **tapping any past day marks or unmarks it** (Journey 5, FR-5.2/5.3). Future days are dimmed and inert, and the forward chevron is disabled in the current month. The date maths lives in `src/features/habits/domain/calendar.ts` and is unit-tested
- Add/Edit Habit: a **form sheet** (not full-screen), chip-driven (Icono/Color/Horario/Recordatorio expand on tap), live preview, real time picker, delete. The same "+" also creates a **Tarea** via a top segmented control, with a habit picker (see Habit Tasks below)
- Reminders: up to **3 per habit** — main, optional pre-reminder (-15 min), optional follow-up (+30 min); the latter two only for `daily`-schedule habits (`ADR-008.md`). Persisted and scheduled as local notifications (daily, or one weekly trigger per selected weekday); permission is requested when the switch is turned on, never at launch; tapping a notification deep-links to that habit; `syncReminders` re-schedules from SQLite on every launch. The app declares `SCHEDULE_EXACT_ALARM` so `expo-notifications` takes its exact-alarm path — without it Android batches reminders and they arrive minutes late (measured: 11:54 → 11:56). See `docs/decisions/ADR-005.md`
- Habit Tasks (FR-11): optional repeatable daily checklist per habit, created from Habit Detail or from the "+" entry point. Tracked as a completion percentage shown in Habit Detail and as a mini progress bar on Today/Habits rows — **never** affects the habit's streak, by construction (separate tables, separate use cases, no shared code path with `computeStreaks`)
- Archive: archive/unarchive from the edit form; archived habits leave Today and appear muted under "Archivados" in the Habits tab, history intact (US-05)
- Onboarding: one screen on first launch — three principles, then straight into creating the first habit. The flag lives in the `preferences` table (migration 2); routing is declarative via `Stack.Protected`, never an imperative redirect. See `docs/decisions/ADR-006.md`
- Settings: notification permission, appearance, both backup rows, Excel export, and "delete all data" are all live. Rebuilt on NativeWind (`src/core/ui-nw/`) as this branch's active initiative — see above; every other screen is still on the original `core/theme` system
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

- **Switching variants forces a full native rebuild** — the `applicationId` is baked into the generated native project. `scripts/build-android.sh` tracks the last-built variant in `android/.last-variant` and only runs `prebuild --clean` when the variant actually changed (or `android/` doesn't exist yet); rebuilding the *same* variant runs a plain, incremental `prebuild` so Gradle/CMake's caches survive between builds. Budget minutes only when switching variants — same-variant rebuilds should be much faster.
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
