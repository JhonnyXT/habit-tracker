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

    const reminder = (await reminders.getForHabit(habit.id))[0];
    if (reminder?.enabled && (await scheduler.getPermission()) === 'granted') {
      await scheduler.schedule({
        reminderId: reminder.id,
        habitId: habit.id,
        habitName: habit.name,
        time: reminder.time,
        days: daysFor(habit),
      });
    }

    return { ok: true, habit };
  };
}
