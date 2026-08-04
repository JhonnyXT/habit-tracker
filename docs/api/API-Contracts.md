# API Contracts

> The internal contracts this application exposes across its architectural boundaries — there is no network API in this product.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | API Contracts |
| Version | 1.0 |
| Status | Draft |
| Audience | Engineering |
| Depends On | architecture/02-Architecture.md, api/Data-Models.md |

---

# Purpose

Clarify, explicitly, that this application has no remote/network API (per `01-PRD.md`'s Technical Constraints and NFR-2.2), and instead define the **internal contracts** that serve the same stabilizing purpose a network API would in a client-server product: the Domain layer's use case signatures, the repository interfaces, the widget's shared-data contract, and the export/import file format.

These are the boundaries most likely to be depended on by multiple parts of the system (or, in the widget's case, by a separate native runtime) — so they're documented with the same rigor a public API would get, even though nothing here is exposed over a network.

---

# Why There Is No Network API

Per the Charter and PRD: no accounts, no backend, no server-side infrastructure. All contracts below are process/runtime-internal (or, for the widget, cross-runtime-but-on-device). If a future roadmap item introduces networked sync (`requirements/Roadmap.md`, Vision Horizon 3), it requires a dedicated ADR and an update to this document before implementation — it must not be bolted on silently.

---

# Contract 1 — Use Case Signatures (Domain Layer)

These are the stable entry points the Presentation and Platform layers call, per `architecture/02-Architecture.md`'s Dependency Rule. Changing a signature here is a breaking change to every caller and must be treated with the same care as a versioned API change.

```ts
createHabit(input: {
  name: string
  icon?: string
  color?: HabitColorToken
  schedule: Schedule
}): Promise<Habit>

editHabit(id: string, changes: Partial<Omit<Habit, 'id'>>): Promise<Habit>

archiveHabit(id: string): Promise<void>
deleteHabit(id: string): Promise<void>
reorderHabits(orderedIds: string[]): Promise<void>

toggleCompletion(habitId: string, date: string): Promise<{
  completion: Completion | null   // null if toggled off
  streak: { current: number; longest: number }
}>

getTodayHabits(): Promise<Array<Habit & { completedToday: boolean; streak: number }>>

getHabitHistory(habitId: string, month: string): Promise<Completion[]>

getHabitReminder(habitId: string): Promise<Reminder | null>
setHabitReminder(input: { habitId: string; enabled: boolean; time: string }): Promise<
  | { ok: true; reminder: Reminder; permission: NotificationPermission }
  | { ok: false; error: 'invalid-time' | 'habit-not-found' }
>
syncReminders(): Promise<void>              // re-schedules every enabled reminder from SQLite
getNotificationPermission(): Promise<NotificationPermission>
requestNotificationPermission(): Promise<NotificationPermission>

exportData(): Promise<ExportFile>          // shape defined in api/Data-Models.md
importData(file: ExportFile): Promise<void> // validates fully before writing (FR-9.2)
```

- Every use case returns Domain entities (`api/Data-Models.md`), never raw database rows.
- `toggleCompletion` rejects (or is disallowed by the caller from being invoked with) any `date` later than today, per FR-2.3 — enforced inside the use case, not left to the caller to remember.

---

# Contract 2 — Repository Interfaces (Domain → Data Boundary)

```ts
interface HabitRepository {
  getAll(): Promise<Habit[]>
  getById(id: string): Promise<Habit | null>
  upsert(habit: Habit): Promise<void>
  delete(id: string): Promise<void>
}

interface CompletionRepository {
  getForDate(date: string): Promise<Completion[]>
  getHistory(habitId: string): Promise<Completion[]>
  upsert(completion: Completion): Promise<void>
  delete(habitId: string, date: string): Promise<void>
}

interface ReminderRepository {
  getForHabit(habitId: string): Promise<Reminder[]>
  getAll(): Promise<Reminder[]>
  upsert(reminder: Reminder): Promise<void>
  delete(id: string): Promise<void>
  deleteForHabit(habitId: string): Promise<void>
}

interface NotificationScheduler {
  getPermission(): Promise<NotificationPermission>
  requestPermission(): Promise<NotificationPermission>
  schedule(reminder: ScheduledReminder): Promise<void>
  cancel(reminderId: string): Promise<void>
  cancelAll(): Promise<void>
}
```

- Implemented exclusively by the Data layer (`SqliteHabitRepository`, `ExpoNotificationScheduler`, etc., per `standards/Naming-Conventions.md`). `NotificationScheduler` is a port over a platform service rather than over storage, but it crosses the same boundary and follows the same rule: the interface lives in Domain, the Expo implementation in Data.
- Consumed exclusively by Domain-layer use cases, via the composition root (`engineering/Dependency-Injection.md`) — never imported directly by Presentation or Platform code.

---

# Contract 3 — Widget Shared-Data Contract (On-Device, Cross-Runtime)

The one genuinely cross-runtime contract in this application: the native widget target and the main JS app must agree on the shape of data read from the shared-storage mechanism described in `engineering/Widgets.md`.

```ts
type WidgetSnapshot = {
  generatedAt: string   // ISO 8601
  habits: Array<{
    id: string
    name: string
    icon: string
    color: HabitColorToken
    completedToday: boolean
  }>
}
```

- This is a read-optimized projection, not the full `Habit` entity — the widget only needs what it renders.
- Any change to this shape must be made consistently in both the main app's writer and the native widget's reader — since these are two separately compiled targets, this contract is the one place in the app where a mismatch would fail silently rather than as a TypeScript compile error, and therefore the one place deserving the most caution.

---

# Contract 4 — Export/Import File Format

Fully specified in `api/Data-Models.md`'s Export File Format section — repeated here only as a pointer, since it is, functionally, this application's one "external" data contract (the file may be opened, moved, or inspected outside the app entirely).

---

# Versioning Policy

- Use case signatures and repository interfaces are internal and can evolve freely within a release cycle, as long as all callers are updated in the same change (enforced by TypeScript, not a runtime version negotiation).
- The Widget Shared-Data Contract and the Export/Import File Format are the two contracts that **do** need explicit versioning discipline, since they cross a compilation/runtime boundary (widget) or an external file boundary (export) where a mismatch cannot be caught by the compiler alone. Both should be changed only additively, with the file format's `formatVersion` field bumped on any breaking change.

---

# Related Documents

- `architecture/02-Architecture.md` — the Dependency Rule these contracts formalize.
- `api/Data-Models.md` — the entities these contracts operate over, and the export file format.
- `engineering/Dependency-Injection.md` — how repository interfaces are wired to implementations.
- `engineering/Widgets.md` — the shared-data mechanism Contract 3 formalizes.

---

**End of Document**
