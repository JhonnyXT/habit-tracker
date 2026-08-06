import type {
  HabitRepository,
  CompletionRepository,
} from '@/features/habits/domain/repositories/habit-repository';
import type {
  TaskRepository,
  TaskCompletionRepository,
} from '@/features/habits/domain/repositories/task-repository';
import type { NotificationScheduler } from '@/features/reminders/domain/notification-scheduler';
import type { ReminderRepository } from '@/features/reminders/domain/repositories/reminder-repository';

export function deleteHabitUseCase(
  habits: HabitRepository,
  completions: CompletionRepository,
  reminders: ReminderRepository,
  scheduler: NotificationScheduler,
  tasks: TaskRepository,
  taskCompletions: TaskCompletionRepository,
) {
  return async (id: string): Promise<void> => {
    for (const reminder of await reminders.getForHabit(id)) {
      await scheduler.cancel(reminder.id);
    }

    await reminders.deleteForHabit(id);
    await completions.deleteForHabit(id);
    await taskCompletions.deleteForHabit(id);
    await tasks.deleteForHabit(id);
    await habits.delete(id);
  };
}
