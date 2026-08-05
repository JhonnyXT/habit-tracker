# Expo UI (`@expo/ui`) — Applied Notes

> What `@expo/ui` is, whether it fits this project today, and the one concrete place it's worth a scoped pilot if we ever adopt it.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Expo UI — Applied Notes |
| Version | 1.0 |
| Status | Draft |
| Audience | Design, Engineering |
| Depends On | `03-Design-System.md`, `Components.md`, `android-material3.md`, `ios-hig.md` |
| Sources | https://docs.expo.dev/versions/latest/sdk/ui/, https://github.com/SchroederNathan/expo-ui-examples, `expo/expo` monorepo (`packages/expo-ui`) |

---

# Purpose

Evaluate `@expo/ui` — Expo's package of real SwiftUI / Jetpack Compose bindings — against this app's current hand-rolled design system, and give a concrete adopt/reject call per area rather than a generic "it's neat" summary.

---

# What it is

`@expo/ui` renders **actual native views** — SwiftUI on iOS, Jetpack Compose on Android — instead of React Native's usual JS-styled `View`/`Text`. Under the hood it's a Fabric native-component library (`RNHostView` mounts inside a recycled Fabric component view, per its changelog), so it requires the New Architecture. This project already runs New Arch by default (Expo SDK 53+ default, and `app.json` doesn't override it), so that part is a non-issue.

It ships three ways to use it:

1. **Platform-specific, near-1:1 bindings** — `@expo/ui/swift-ui` (~40 components: `VStack`/`HStack`/`ZStack`, `Form`, `List`, `NavigationBar` via `TabView`, `Alert`, `ConfirmationDialog`, `Popover`, `DatePicker`, `ColorPicker`, `Gauge`, `DisclosureGroup`, `SwipeActions`…) and `@expo/ui/jetpack-compose` (~50 components: `Surface`, `Card`, `LazyColumn`/`LazyRow`, `SegmentedButton`, `NavigationBar`, `Snackbar`, `AlertDialog`, `DropdownMenu`, `Carousel`, `LoadingIndicator`…). These mirror the native frameworks closely, including their modifier systems (`@expo/ui/swift-ui/modifiers`, `@expo/ui/jetpack-compose/modifiers`).
2. **Universal components** — a smaller shared set (`Host`, `Column`, `Row`, `Spacer`, `Text`, `Button`, `Checkbox`, `Switch`, `Slider`, `Picker`, `TextInput`, `Icon`, `List`, `ScrollView`, `BottomSheet`, `FieldGroup`, `Collapsible`, `RNHostView`) that renders as SwiftUI on iOS and Compose on Android from **one** import, no `Platform.OS` branch and no `.ios.tsx`/`.android.tsx` split.
3. **Drop-in replacements** for popular community packages, API-compatible so a swap is close to a search-and-replace: `BottomSheet` (vs. `@gorhom/bottom-sheet`), `DateTimePicker` (vs. `@react-native-community/datetimepicker` — **the exact package this app already uses** for the reminder time picker), `Menu`, `MaskedView`, `PagerView`, `Picker`, `SegmentedControl`, `Slider`.

Everything renders as a subtree under a `<Host>` component, which is the mount point for the native tree (and, on Android, can seed a full Material You palette via `seedColor`/`useMaterialColors`).

---

# Compatibility — the blocker to resolve first

**`@expo/ui` has no release for Expo SDK 54.** The npm history jumps straight from the `55.0.x` line (the package version tracks the SDK number) to `56.x`/`57.x` — there is no `54.x`. This app is pinned to `"expo": "^54"` (`package.json`). Adopting `@expo/ui` at all means upgrading the Expo SDK by at least one major version first — a project-wide migration (expo-router, Reanimated, Gesture Handler, and the three build variants in `ADR-007` all need to be re-verified against the new SDK), not something to fold into an unrelated feature change. Budget it as its own task, the same way `docs/decisions/ADR-007.md` treats a variant rebuild — not as a side effect of a design tweak.

Separately: the examples repo's own README says plainly *"`@expo/ui` renders real SwiftUI and Jetpack Compose views, so Expo Go isn't enough"* — every example is run via `expo run:ios` / `expo run:android`, a native dev-client build. This project already builds its own dev client (`npm run build:dev`), so that part costs nothing extra.

---

# Where it would genuinely help this app

## Settings screen — the one clear win

The examples repo's **Universal Settings** demo (`FieldGroup` + `FieldGroup.Section` + `FieldGroup.SectionHeader` + `FieldGroup.SectionFooter`) renders one component tree as a real SwiftUI `Form` on iOS and a Material 3 grouped list on Android — pixel- and interaction-perfect on both, for free:

```tsx
import { Button, Checkbox, Host, FieldGroup, Switch, Text } from '@expo/ui';

<Host style={{ flex: 1 }} colorScheme={dark ? 'dark' : 'light'}>
  <FieldGroup>
    <FieldGroup.Section title="Notificaciones">
      <Switch label="Permiso" value={granted} onValueChange={onToggle} />
    </FieldGroup.Section>
  </FieldGroup>
</Host>
```

Our `settings.tsx` currently *hand-fakes* this exact look with `Card` + `SectionHeader` + `Divider` + `ListRow` (`docs/design/Components.md`'s "Card / SectionHeader / Divider" and "ListRow" entries). A settings screen is one of the few places where looking like the *platform's own* settings UI is a bigger win than looking like our own brand — unlike Today or Habit Detail, which are core-loop screens this app owns visually end to end. If this project ever adopts `@expo/ui`, **Settings is the one screen worth a scoped pilot**, after the SDK upgrade above, as its own task — not bundled into a feature change.

## Reminder time picker — lateral, not worth it alone

`@expo/ui`'s `DateTimePicker` is an explicit drop-in replacement for `@react-native-community/datetimepicker`, which `habit-form.tsx` already uses. Swapping gets nothing new on its own (same native picker either way) — only worth doing as part of a broader Settings-style pilot, not standalone.

## Bottom sheet — no current use, future option

We don't have any bottom sheets today (`habit-form` is a full modal presentation). If a future feature wants one (quick-add, a swipe-action menu), `@expo/ui`'s `BottomSheet` is a real option worth remembering, since it's a drop-in for `@gorhom/bottom-sheet` and already renders natively.

---

# Where it does not fit this app

## It splits one design system into two

This app's whole design premise (`03-Design-System.md`) is **one** custom visual and motion language — the same colors, spacing, and spring-based motion on iOS and Android alike (`docs/design/Motion.md`, `CLAUDE.md`'s Design section). `@expo/ui`'s platform-specific bindings do the opposite on purpose: a SwiftUI `Form` looks like iOS Settings, a Compose grouped list looks like Android Settings — genuinely different per platform. Adopting it anywhere beyond a deliberately-chosen "should look like the OS" screen (Settings) means accepting visual divergence between platforms everywhere it's used. That's a product decision for the user to make explicitly, not something to slip in one component at a time.

## Our hand-rolled components already do the job, with our own motion

- **`SegmentedControl`** (schedule type in Add/Edit Habit, Año/Mes in Habit Detail, Apariencia in Settings) already has a spring-animated sliding pill matching `theme.motion.spring.snappy` exactly, per `docs/design/Components.md`. `@expo/ui`'s `Picker`/`SegmentedControl` would replace that with the native platform look and the native platform's own animation curve — losing the "springs, not fixed curves" motion identity this app is built around (`CLAUDE.md`'s Design section), in exchange for a more "authentically native" chrome. Not worth it without a deliberate call.
- **`Switch`** — RN's built-in `Switch` (already used in the reminder toggle) does the same job; no reason to add a dependency for parity.

## iOS-only or Android-only pieces, not universal

Several of the examples repo's flashier demos are single-platform only, meaning adopting them means real `Platform.OS` branches or `.ios.tsx`/`.android.tsx` splits — the opposite of this app's one-file-per-screen approach:

- **Numeric text transitions** (`contentTransition('numericText')`, `monospacedDigit()`) — nice for animating the streak number in `StatCard`, but it's a direct `@expo/ui/swift-ui` import requiring a `Host`; **iOS 17+ only**, no Android or universal equivalent. Since the physical device this project ships to and tests on today is Android, this has zero visible effect for the primary dev loop.
- **Swift Charts** — a native chart type per native `Chart`; also iOS-only, no cross-platform chart primitive exists in the package. Our hand-rolled `HeatMap` already renders identically on both platforms — right call, keep it.
- **Liquid Glass / Siri Glow** — iOS **26+** only (`GlassEffectContainer`, `ConcentricRectangle`); this app's minimum-iOS bar isn't pinned that high anywhere in the docs, and neither effect has an Android counterpart.
- **Material You / Expressive Loaders** — Android-only (`useMaterialColors`, wallpaper-seeded palettes, Material 3 Expressive's morphing `LoadingIndicator`). Adopting the wallpaper-seeded palette would also contradict this app's fixed brand palette (`docs/design/Colors.md`) — the whole point of our flame-orange accent is that it's constant, not derived from the user's wallpaper.

---

# Recommendation

Don't adopt `@expo/ui` broadly — it would fragment the one design system this app is built around, and half its interesting pieces are single-platform anyway. If the user wants to explore it, the concrete, bounded path is:

1. Plan an Expo SDK upgrade (54 → 55+) as its own task, verified against expo-router, Reanimated/Gesture Handler, and all three build variants — not bundled with a feature change.
2. Pilot `FieldGroup`/`Section`/`SectionHeader`/`SectionFooter` on the Settings screen only, since "look like the OS's own settings" is a case where native chrome beats brand consistency.
3. Leave Today, Habits, Habit Detail, and Add/Edit Habit exactly as they are — their current hand-rolled components already match this app's motion and color system, which `@expo/ui` cannot reproduce (it renders each OS's own animation curves, not ours).

---

# Related Documents

- `03-Design-System.md` — the one-system-both-platforms premise this evaluation weighs against.
- `Components.md` — the hand-rolled components (`SegmentedControl`, `ListRow`, `Card`/`SectionHeader`/`Divider`) that `@expo/ui` would compete with.
- `android-material3.md`, `ios-hig.md` — the per-platform research this app already draws from without adopting native-only tooling.
- `docs/decisions/ADR-007.md` — the closest precedent for treating an SDK-level change as its own planned task.

---

**End of Document**
