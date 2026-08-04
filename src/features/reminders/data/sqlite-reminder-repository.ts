import type { SQLiteDatabase } from 'expo-sqlite';

import type { Reminder } from '@/features/reminders/domain/entities/reminder';
import type { ReminderRepository } from '@/features/reminders/domain/repositories/reminder-repository';
import { toReminder, type ReminderRow } from '@/features/reminders/data/mappers/reminder-mapper';

export class SqliteReminderRepository implements ReminderRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async getForHabit(habitId: string): Promise<Reminder[]> {
    const rows = await this.db.getAllAsync<ReminderRow>(
      'SELECT * FROM reminders WHERE habit_id = ? ORDER BY time ASC',
      habitId,
    );
    return rows.map(toReminder);
  }

  async getAll(): Promise<Reminder[]> {
    const rows = await this.db.getAllAsync<ReminderRow>('SELECT * FROM reminders ORDER BY time ASC');
    return rows.map(toReminder);
  }

  async upsert(reminder: Reminder): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO reminders (id, habit_id, time, enabled, created_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET time = excluded.time, enabled = excluded.enabled`,
      reminder.id,
      reminder.habitId,
      reminder.time,
      reminder.enabled ? 1 : 0,
      new Date().toISOString(),
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM reminders WHERE id = ?', id);
  }

  async deleteForHabit(habitId: string): Promise<void> {
    await this.db.runAsync('DELETE FROM reminders WHERE habit_id = ?', habitId);
  }
}
