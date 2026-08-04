import type { HabitRepository } from '@/features/habits/domain/repositories/habit-repository';
import type { NotificationScheduler } from '@/features/reminders/domain/notification-scheduler';
import type { ReminderRepository } from '@/features/reminders/domain/repositories/reminder-repository';
import { daysFor } from '@/features/reminders/domain/use-cases/set-habit-reminder';

export function archiveHabitUseCase(
  habits: HabitRepository,
  reminders: ReminderRepository,
  scheduler: NotificationScheduler,
) {
  return async (id: string, archived = true): Promise<void> => {
    const existing = await habits.getById(id);
    if (!existing) return;

    const habit = { ...existing, archived, updatedAt: new Date() };
    await habits.upsert(habit);

    const reminder = (await reminders.getForHabit(id))[0];
    if (!reminder?.enabled) return;

    if (archived) {
      await scheduler.cancel(reminder.id);
      return;
    }

    if ((await scheduler.getPermission()) === 'granted') {
      await scheduler.schedule({
        reminderId: reminder.id,
        habitId: habit.id,
        habitName: habit.name,
        time: reminder.time,
        days: daysFor(habit),
      });
    }
  };
}
