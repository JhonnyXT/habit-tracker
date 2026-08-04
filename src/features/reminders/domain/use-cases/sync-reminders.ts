import type { HabitRepository } from '@/features/habits/domain/repositories/habit-repository';
import type { NotificationScheduler } from '@/features/reminders/domain/notification-scheduler';
import type { ReminderRepository } from '@/features/reminders/domain/repositories/reminder-repository';
import { daysFor } from '@/features/reminders/domain/use-cases/set-habit-reminder';

export function syncRemindersUseCase(
  habits: HabitRepository,
  reminders: ReminderRepository,
  scheduler: NotificationScheduler,
) {
  return async (): Promise<void> => {
    await scheduler.cancelAll();

    if ((await scheduler.getPermission()) !== 'granted') return;

    const enabled = (await reminders.getAll()).filter((reminder) => reminder.enabled);
    if (enabled.length === 0) return;

    const byId = new Map((await habits.getAll(true)).map((habit) => [habit.id, habit]));

    for (const reminder of enabled) {
      const habit = byId.get(reminder.habitId);
      if (!habit || habit.archived) continue;

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
