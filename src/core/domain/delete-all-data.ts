import type {
  HabitRepository,
  CompletionRepository,
} from '@/features/habits/domain/repositories/habit-repository';
import type { NotificationScheduler } from '@/features/reminders/domain/notification-scheduler';
import type { ReminderRepository } from '@/features/reminders/domain/repositories/reminder-repository';

export function deleteAllDataUseCase(
  habits: HabitRepository,
  completions: CompletionRepository,
  reminders: ReminderRepository,
  scheduler: NotificationScheduler,
) {
  return async (): Promise<void> => {
    await scheduler.cancelAll();

    for (const habit of await habits.getAll(true)) {
      await reminders.deleteForHabit(habit.id);
      await completions.deleteForHabit(habit.id);
      await habits.delete(habit.id);
    }
  };
}
