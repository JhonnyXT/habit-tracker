import type { Reminder } from '@/features/reminders/domain/entities/reminder';

export interface ReminderRepository {
  getForHabit(habitId: string): Promise<Reminder[]>;
  getAll(): Promise<Reminder[]>;
  upsert(reminder: Reminder): Promise<void>;
  delete(id: string): Promise<void>;

  deleteForHabit(habitId: string): Promise<void>;
}
