import type { Habit } from '@/features/habits/domain/entities/habit';
import type { HabitRepository } from '@/features/habits/domain/repositories/habit-repository';
import { newId } from '@/features/habits/domain/id';
import type { ClockTime, Reminder, ReminderKind } from '@/features/reminders/domain/entities/reminder';
import {
  FOLLOWUP_REMINDER_OFFSET_MINUTES,
  PRE_REMINDER_OFFSET_MINUTES,
  isClockTime,
  shiftClockTime,
} from '@/features/reminders/domain/entities/reminder';
import type {
  NotificationPermission,
  NotificationScheduler,
} from '@/features/reminders/domain/notification-scheduler';
import type { ReminderRepository } from '@/features/reminders/domain/repositories/reminder-repository';

export type SetHabitReminderInput = {
  habitId: string;
  enabled: boolean;
  time: ClockTime;
  preEnabled?: boolean;
  followupEnabled?: boolean;
};

export type SetHabitReminderResult =
  | { ok: true; reminder: Reminder; permission: NotificationPermission }
  | { ok: false; error: 'invalid-time' | 'habit-not-found' };

export function daysFor(habit: Habit) {
  return habit.schedule.type === 'weekdays' ? habit.schedule.days : null;
}

export function setHabitReminderUseCase(
  habits: HabitRepository,
  reminders: ReminderRepository,
  scheduler: NotificationScheduler,
) {
  return async (input: SetHabitReminderInput): Promise<SetHabitReminderResult> => {
    if (!isClockTime(input.time)) return { ok: false, error: 'invalid-time' };

    const habit = await habits.getById(input.habitId);
    if (!habit) return { ok: false, error: 'habit-not-found' };

    const existingRows = await reminders.getForHabit(input.habitId);
    const existingMain = existingRows.find((row) => row.kind === 'main') ?? null;

    const reminder: Reminder = {
      id: existingMain?.id ?? newId(),
      habitId: input.habitId,
      time: input.time,
      enabled: input.enabled,
      kind: 'main',
    };

    await reminders.upsert(reminder);
    await scheduler.cancel(reminder.id);

    const permission = input.enabled
      ? await scheduler.requestPermission()
      : await scheduler.getPermission();

    if (input.enabled && permission === 'granted') {
      await scheduler.schedule({
        reminderId: reminder.id,
        habitId: habit.id,
        habitName: habit.name,
        time: reminder.time,
        days: daysFor(habit),
      });
    }

    // Pre-reminders and follow-ups are only offered for daily habits: a weekday
    // habit already schedules up to 7 notification slots per reminder, and iOS
    // caps an app at ~64 pending local notifications in total. Restricting the
    // multiplier to daily habits (1 slot per kind) avoids that ceiling by
    // construction instead of trying to police it with a runtime counter.
    const isDaily = habit.schedule.type === 'daily';
    const scheduleActive = input.enabled && permission === 'granted';

    await syncMultiAlertReminder({
      existing: existingRows.find((row) => row.kind === 'pre') ?? null,
      wanted: isDaily && input.enabled && Boolean(input.preEnabled),
      kind: 'pre',
      offsetMinutes: PRE_REMINDER_OFFSET_MINUTES,
      habit,
      mainTime: input.time,
      scheduleActive,
      reminders,
      scheduler,
    });

    await syncMultiAlertReminder({
      existing: existingRows.find((row) => row.kind === 'followup') ?? null,
      wanted: isDaily && input.enabled && Boolean(input.followupEnabled),
      kind: 'followup',
      offsetMinutes: FOLLOWUP_REMINDER_OFFSET_MINUTES,
      habit,
      mainTime: input.time,
      scheduleActive,
      reminders,
      scheduler,
    });

    return { ok: true, reminder, permission };
  };
}

async function syncMultiAlertReminder(params: {
  existing: Reminder | null;
  wanted: boolean;
  kind: ReminderKind;
  offsetMinutes: number;
  habit: Habit;
  mainTime: ClockTime;
  scheduleActive: boolean;
  reminders: ReminderRepository;
  scheduler: NotificationScheduler;
}) {
  const { existing, wanted, kind, offsetMinutes, habit, mainTime, scheduleActive, reminders, scheduler } =
    params;

  if (!wanted) {
    if (existing) {
      await scheduler.cancel(existing.id);
      await reminders.delete(existing.id);
    }
    return;
  }

  const row: Reminder = {
    id: existing?.id ?? newId(),
    habitId: habit.id,
    time: shiftClockTime(mainTime, offsetMinutes),
    enabled: true,
    kind,
  };

  await reminders.upsert(row);
  await scheduler.cancel(row.id);

  if (scheduleActive) {
    await scheduler.schedule({
      reminderId: row.id,
      habitId: habit.id,
      habitName: habit.name,
      time: row.time,
      days: null,
    });
  }
}
