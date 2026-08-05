# Expo UI (`@expo/ui`) — Applied Notes

> What `@expo/ui` is, whether it fits this project today, and the one concrete place it's worth a scoped pilot if we ever adopt it.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Expo UI — Applied Notes |
| Version | 1.1 |
| Status | Draft |
| Audience | Design, Engineering |
| Depends On | `03-Design-System.md`, `Components.md`, `android-material3.md`, `ios-hig.md` |
| Sources | https://docs.expo.dev/versions/latest/sdk/ui/, https://github.com/SchroederNathan/expo-ui-examples, `expo/expo` monorepo (`packages/expo-ui`) |

---

# Purpose

Evaluate `@expo/ui` — Expo's package of real SwiftUI / Jetpack Compose bindings — against this app's current hand-rolled design system, and give a concrete adopt/reject call per area rather than a generic "it's neat" summary.

**Correction (this revision):** an earlier version of this document argued `@expo/ui` would "fragment" a single, platform-identical design system this app is supposedly built around. That was wrong — it never checked the project's own founding documents first. `requirements/00-Project-Charter.md`'s Vision states *"the application should feel native on both iOS and Android"*, and names **Native First** as a core pillar: *"the application should behave like a native mobile application. Respect platform conventions. Do not fight the operating system."* `03-Design-System.md`'s **Platform Fidelity** section says the same thing directly: *"The system favors platform-native feel over strict pixel-parity between iOS and Android... shared components... may render with platform-appropriate details."* Rendering genuinely different, platform-correct controls is not a deviation from this project's design philosophy — it's a truer implementation of it than the current hand-rolled components, which render identically on both platforms today. The rest of this document is corrected accordingly.

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

# Performance — aligned with the Charter, not a trade-off against it

`requirements/00-Project-Charter.md`'s Performance Commitment treats 60 FPS, fast startup, and minimal unnecessary renders as product features, not nice-to-haves. `@expo/ui` renders through Fabric straight to native SwiftUI/Compose views — the platform draws its own controls directly, the same way the native Settings app does, rather than React Native re-implementing them in JS-driven styles. That is structurally *more* aligned with the performance goal than more hand-rolled Reanimated work would be, not less. The one concrete regression on record is unrelated to `@expo/ui` itself: SDK 55+'s `react-native-reanimated` (4.3+) has a known Hermes memory regression (+25–30%) from the import alone — worth watching after the SDK upgrade regardless of whether `@expo/ui` is adopted.

---

# Where it would genuinely help this app

## Settings screen — the clearest, lowest-risk starting point

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

Our `settings.tsx` currently *hand-fakes* this exact look with `Card` + `SectionHeader` + `Divider` + `ListRow` (`docs/design/Components.md`'s "Card / SectionHeader / Divider" and "ListRow" entries) — the same rendering on both platforms. Settings is the natural first pilot not because other screens shouldn't follow, but because it's the lowest-risk place to verify the whole approach (SwiftUI `Form` behavior, Android's Material 3 grouped list, the `Host`/`seedColor` theming bridge) before touching the core loop (Today) that the Charter calls sacred. Once verified, the same pattern — real platform controls instead of a hand-rolled approximation — is the right direction for Add/Edit Habit's form fields and Habit Detail's stat/segmented pieces too; they're just later in the rollout, not excluded from it.

## Reminder time picker — lateral, not worth it alone

`@expo/ui`'s `DateTimePicker` is an explicit drop-in replacement for `@react-native-community/datetimepicker`, which `habit-form.tsx` already uses. Swapping gets nothing new on its own (same native picker either way) — only worth doing as part of a broader Settings-style pilot, not standalone.

## Bottom sheet — no current use, future option

We don't have any bottom sheets today (`habit-form` is a full modal presentation). If a future feature wants one (quick-add, a swipe-action menu), `@expo/ui`'s `BottomSheet` is a real option worth remembering, since it's a drop-in for `@gorhom/bottom-sheet` and already renders natively.

---

# Trade-offs worth naming, even where the direction is right

## Adopting it broadly means real per-platform divergence — by design

`@expo/ui`'s platform-specific bindings render a SwiftUI `Form` on iOS and a Material 3 grouped list on Android — genuinely different per platform, on purpose. Per the Charter and `03-Design-System.md` (corrected above), that divergence is the *goal*, not a cost to minimize. The one thing worth being deliberate about is **staging**, not philosophy: this is a real rewrite of every screen's controls, and the Charter's own Immutable Rules include *"never ship unfinished interactions"* and treat performance/UX regressions as bugs. That argues for rolling `@expo/ui` out screen by screen, verified on real hardware each time (per this project's existing `Verifying on the device` practice in `CLAUDE.md`), not for holding back on principle.

## Our hand-rolled components — replace deliberately, not reflexively

- **`SegmentedControl`** (schedule type in Add/Edit Habit, Año/Mes in Habit Detail, Apariencia in Settings) has a spring-animated sliding pill matching `theme.motion.spring.snappy`. `@expo/ui`'s `Picker`/`SegmentedControl` would swap that for each platform's own native control and its own native animation curve — which is *more* native-first, per the Charter, not less. The trade is losing one custom detail (our specific spring feel) for the platform's own, genuinely native one. Worth doing as part of the same screen-by-screen rollout below, not left out by default.
- **`Switch`** — RN's built-in `Switch` (already used in the reminder toggle) already renders as the real native switch on each platform; `@expo/ui`'s universal `Switch` is equivalent here, so swapping it isn't a priority either way.

## iOS-only or Android-only pieces, not universal

Several of the examples repo's flashier demos are single-platform only, meaning adopting them means real `Platform.OS` branches or `.ios.tsx`/`.android.tsx` splits — the opposite of this app's one-file-per-screen approach:

- **Numeric text transitions** (`contentTransition('numericText')`, `monospacedDigit()`) — nice for animating the streak number in `StatCard`, but it's a direct `@expo/ui/swift-ui` import requiring a `Host`; **iOS 17+ only**, no Android or universal equivalent. Since the physical device this project ships to and tests on today is Android, this has zero visible effect for the primary dev loop.
- **Swift Charts** — a native chart type per native `Chart`; also iOS-only, no cross-platform chart primitive exists in the package. Our hand-rolled `HeatMap` already renders identically on both platforms — right call, keep it.
- **Liquid Glass / Siri Glow** — iOS **26+** only (`GlassEffectContainer`, `ConcentricRectangle`); this app's minimum-iOS bar isn't pinned that high anywhere in the docs, and neither effect has an Android counterpart.
- **Material You / Expressive Loaders** — Android-only (`useMaterialColors`, wallpaper-seeded palettes, Material 3 Expressive's morphing `LoadingIndicator`). Adopting the wallpaper-seeded palette would also contradict this app's fixed brand palette (`docs/design/Colors.md`) — the whole point of our flame-orange accent is that it's constant, not derived from the user's wallpaper.

---

# Recommendation

Adopt `@expo/ui` — it's the more faithful implementation of this project's own stated Native First / Platform Fidelity principles, not a departure from them. Sequence it for risk, not because the direction is in question:

1. Finish the Expo SDK upgrade (54 → 57) as its own task, verified against expo-router, Reanimated/Gesture Handler, and all three build variants — already underway on `expo-sdk-57-upgrade`.
2. Pilot `FieldGroup`/`Section`/`SectionHeader`/`SectionFooter` on the Settings screen first — lowest risk, and "should look like the OS's own settings" is the clearest case for it. Verify on real Android and iOS hardware before going further, per the Charter's performance and quality bars.
3. Once verified, extend the same native-controls approach to Add/Edit Habit's form fields and Habit Detail's stat/segmented pieces.
4. Today stays hand-rolled longest, deliberately — it's the Charter's "sacred" core loop, and its current custom motion (drag-to-reorder, swipe actions, the day-complete moment) has no `@expo/ui` equivalent to replace it with; nothing here argues for touching it soon.
5. Skip the iOS-only or Android-only showpieces (Liquid Glass, Siri Glow, Numeric Transitions, Swift Charts, Material You wallpaper theming) for now — genuinely useful later, but each needs its own platform branch, and none map to a concrete need this app has today. Material You's wallpaper-seeded palette specifically conflicts with `docs/design/Colors.md`'s fixed flame-orange brand accent — treat that one as excluded, not just deferred.

---

# Related Documents

- `00-Project-Charter.md` — Native First, Platform Fidelity, and the Performance Commitment this recommendation is built on.
- `03-Design-System.md` — the Platform Fidelity section this evaluation now correctly reflects.
- `Components.md` — the hand-rolled components (`SegmentedControl`, `ListRow`, `Card`/`SectionHeader`/`Divider`) the rollout replaces, screen by screen.
- `android-material3.md`, `ios-hig.md` — the per-platform research this app already draws from; `@expo/ui` is the implementation path for it, not an alternative to it.
- `docs/decisions/ADR-007.md` — the closest precedent for treating an SDK-level change as its own planned task.

---

**End of Document**
