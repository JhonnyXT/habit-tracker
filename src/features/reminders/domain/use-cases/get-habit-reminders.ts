import type { Reminder } from '@/features/reminders/domain/entities/reminder';
import type { ReminderRepository } from '@/features/reminders/domain/repositories/reminder-repository';

export type HabitReminders = {
  main: Reminder | null;
  pre: Reminder | null;
  followup: Reminder | null;
};

export function getHabitRemindersUseCase(reminders: ReminderRepository) {
  return async (habitId: string): Promise<HabitReminders> => {
    const existing = await reminders.getForHabit(habitId);
    return {
      main: existing.find((reminder) => reminder.kind === 'main') ?? null,
      pre: existing.find((reminder) => reminder.kind === 'pre') ?? null,
      followup: existing.find((reminder) => reminder.kind === 'followup') ?? null,
    };
  };
}
