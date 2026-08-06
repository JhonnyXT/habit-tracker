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

    const habitReminders = (await reminders.getForHabit(id)).filter((reminder) => reminder.enabled);
    if (habitReminders.length === 0) return;

    if (archived) {
      for (const reminder of habitReminders) {
        await scheduler.cancel(reminder.id);
      }
      return;
    }

    if ((await scheduler.getPermission()) === 'granted') {
      for (const reminder of habitReminders) {
        await scheduler.schedule({
          reminderId: reminder.id,
          habitId: habit.id,
          habitName: habit.name,
          time: reminder.time,
          days: daysFor(habit),
        });
      }
    }
  };
}
