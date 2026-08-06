import type { Reminder } from '@/features/reminders/domain/entities/reminder';
import type { ReminderRepository } from '@/features/reminders/domain/repositories/reminder-repository';

export function getHabitReminderUseCase(reminders: ReminderRepository) {
  return async (habitId: string): Promise<Reminder | null> => {
    const existing = await reminders.getForHabit(habitId);
    return existing.find((reminder) => reminder.kind === 'main') ?? null;
  };
}
