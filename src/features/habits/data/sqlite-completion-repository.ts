import type { SQLiteDatabase } from 'expo-sqlite';

import type { Completion } from '@/features/habits/domain/entities/habit';
import type { CompletionRepository } from '@/features/habits/domain/repositories/habit-repository';
import type { ISODate } from '@/features/habits/domain/date';
import { toCompletion, type CompletionRow } from '@/features/habits/data/mappers/habit-mapper';

export class SqliteCompletionRepository implements CompletionRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async getForDate(date: ISODate): Promise<Completion[]> {
    const rows = await this.db.getAllAsync<CompletionRow>(
      'SELECT * FROM completions WHERE date = ?',
      date,
    );
    return rows.map(toCompletion);
  }

  async getHistory(habitId: string): Promise<Completion[]> {
    const rows = await this.db.getAllAsync<CompletionRow>(
      'SELECT * FROM completions WHERE habit_id = ? ORDER BY date ASC',
      habitId,
    );
    return rows.map(toCompletion);
  }

  async getAll(): Promise<Completion[]> {
    const rows = await this.db.getAllAsync<CompletionRow>(
      'SELECT * FROM completions ORDER BY date ASC',
    );
    return rows.map(toCompletion);
  }

  async upsert(completion: Completion): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO completions (id, habit_id, date, created_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(habit_id, date) DO NOTHING`,
      completion.id,
      completion.habitId,
      completion.date,
      new Date().toISOString(),
    );
  }

  async delete(habitId: string, date: ISODate): Promise<void> {
    await this.db.runAsync(
      'DELETE FROM completions WHERE habit_id = ? AND date = ?',
      habitId,
      date,
    );
  }

  async deleteForHabit(habitId: string): Promise<void> {
    await this.db.runAsync('DELETE FROM completions WHERE habit_id = ?', habitId);
  }
}
