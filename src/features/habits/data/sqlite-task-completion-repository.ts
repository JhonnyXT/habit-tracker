import type { SQLiteDatabase } from 'expo-sqlite';

import type { TaskCompletion } from '@/features/habits/domain/entities/task';
import type { TaskCompletionRepository } from '@/features/habits/domain/repositories/task-repository';
import type { ISODate } from '@/features/habits/domain/date';
import {
  toTaskCompletion,
  type TaskCompletionRow,
} from '@/features/habits/data/mappers/task-mapper';

export class SqliteTaskCompletionRepository implements TaskCompletionRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async getForDate(date: ISODate): Promise<TaskCompletion[]> {
    const rows = await this.db.getAllAsync<TaskCompletionRow>(
      'SELECT * FROM task_completions WHERE date = ?',
      date,
    );
    return rows.map(toTaskCompletion);
  }

  async getHistory(taskId: string): Promise<TaskCompletion[]> {
    const rows = await this.db.getAllAsync<TaskCompletionRow>(
      'SELECT * FROM task_completions WHERE task_id = ? ORDER BY date ASC',
      taskId,
    );
    return rows.map(toTaskCompletion);
  }

  async upsert(completion: TaskCompletion): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO task_completions (id, task_id, date, created_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(task_id, date) DO NOTHING`,
      completion.id,
      completion.taskId,
      completion.date,
      new Date().toISOString(),
    );
  }

  async delete(taskId: string, date: ISODate): Promise<void> {
    await this.db.runAsync(
      'DELETE FROM task_completions WHERE task_id = ? AND date = ?',
      taskId,
      date,
    );
  }

  async deleteForTask(taskId: string): Promise<void> {
    await this.db.runAsync('DELETE FROM task_completions WHERE task_id = ?', taskId);
  }

  async deleteForHabit(habitId: string): Promise<void> {
    await this.db.runAsync(
      `DELETE FROM task_completions
       WHERE task_id IN (SELECT id FROM tasks WHERE habit_id = ?)`,
      habitId,
    );
  }
}
