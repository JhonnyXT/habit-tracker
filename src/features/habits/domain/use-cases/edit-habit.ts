import type { HabitColorToken } from '@/core/theme';
import type { IconName } from '@/core/ui';
import type { Habit, Schedule } from '@/features/habits/domain/entities/habit';
import { MAX_HABIT_NAME_LENGTH } from '@/features/habits/domain/entities/habit';
import type { HabitRepository } from '@/features/habits/domain/repositories/habit-repository';
import type { NotificationScheduler } from '@/features/reminders/domain/notification-scheduler';
import type { ReminderRepository } from '@/features/reminders/domain/repositories/reminder-repository';
import { daysFor } from '@/features/reminders/domain/use-cases/set-habit-reminder';

export type EditHabitInput = {
  name?: string;
  icon?: IconName;
  color?: HabitColorToken;
  schedule?: Schedule;
};

export type EditHabitResult =
  | { ok: true; habit: Habit }
  | { ok: false; error: 'not-found' | 'empty-name' | 'name-too-long' };

export function editHabitUseCase(
  habits: HabitRepository,
  reminders: ReminderRepository,
  scheduler: NotificationScheduler,
) {
  return async (id: string, changes: EditHabitInput): Promise<EditHabitResult> => {
    const existing = await habits.getById(id);
    if (!existing) return { ok: false, error: 'not-found' };

    let name = existing.name;
    if (changes.name !== undefined) {
      name = changes.name.trim();
      if (name.length === 0) return { ok: false, error: 'empty-name' };
      if (name.length > MAX_HABIT_NAME_LENGTH) return { ok: false, error: 'name-too-long' };
    }

    const habit: Habit = {
      ...existing,
      name,
      icon: changes.icon ?? existing.icon,
      color: changes.color ?? existing.color,
      schedule: changes.schedule ?? existing.schedule,
      updatedAt: new Date(),
    };

    await habits.upsert(habit);

    let habitReminders = await reminders.getForHabit(habit.id);

    // Pre-reminders and follow-ups only exist for daily habits (see
    // set-habit-reminder.ts) — if the schedule changed away from daily,
    // drop them instead of letting them get rescheduled below multiplied
    // across the new weekday set.
    if (habit.schedule.type !== 'daily') {
      for (const reminder of habitReminders) {
        if (reminder.kind === 'main') continue;
        await scheduler.cancel(reminder.id);
        await reminders.delete(reminder.id);
      }
      habitReminders = habitReminders.filter((reminder) => reminder.kind === 'main');
    }

    const permission = await scheduler.getPermission();
    if (permission === 'granted') {
      for (const reminder of habitReminders.filter((entry) => entry.enabled)) {
        await scheduler.schedule({
          reminderId: reminder.id,
          habitId: habit.id,
          habitName: habit.name,
          time: reminder.time,
          days: reminder.kind === 'main' ? daysFor(habit) : null,
        });
      }
    }

    return { ok: true, habit };
  };
}
