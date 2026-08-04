import type { Habit } from '@/features/habits/domain/entities/habit';
import type { HabitRepository } from '@/features/habits/domain/repositories/habit-repository';
import { newId } from '@/features/habits/domain/id';
import type { ClockTime, Reminder } from '@/features/reminders/domain/entities/reminder';
import { isClockTime } from '@/features/reminders/domain/entities/reminder';
import type {
  NotificationPermission,
  NotificationScheduler,
} from '@/features/reminders/domain/notification-scheduler';
import type { ReminderRepository } from '@/features/reminders/domain/repositories/reminder-repository';

export type SetHabitReminderInput = {
  habitId: string;
  enabled: boolean;
  time: ClockTime;
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

    const existing = (await reminders.getForHabit(input.habitId))[0] ?? null;
    const reminder: Reminder = {
      id: existing?.id ?? newId(),
      habitId: input.habitId,
      time: input.time,
      enabled: input.enabled,
    };

    await reminders.upsert(reminder);
    await scheduler.cancel(reminder.id);

    if (!input.enabled) {
      return { ok: true, reminder, permission: await scheduler.getPermission() };
    }

    const permission = await scheduler.requestPermission();
    if (permission === 'granted') {
      await scheduler.schedule({
        reminderId: reminder.id,
        habitId: habit.id,
        habitName: habit.name,
        time: reminder.time,
        days: daysFor(habit),
      });
    }

    return { ok: true, reminder, permission };
  };
}
