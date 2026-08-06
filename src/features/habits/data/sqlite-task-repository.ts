import type { SQLiteDatabase } from 'expo-sqlite';

import type { Task } from '@/features/habits/domain/entities/task';
import type { TaskRepository } from '@/features/habits/domain/repositories/task-repository';
import { toTask, toTaskRow, type TaskRow } from '@/features/habits/data/mappers/task-mapper';

export class SqliteTaskRepository implements TaskRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async getForHabit(habitId: string, includeArchived = false): Promise<Task[]> {
    const rows = await this.db.getAllAsync<TaskRow>(
      includeArchived
        ? 'SELECT * FROM tasks WHERE habit_id = ? ORDER BY sort_order ASC'
        : 'SELECT * FROM tasks WHERE habit_id = ? AND archived = 0 ORDER BY sort_order ASC',
      habitId,
    );
    return rows.map(toTask);
  }

  async getAll(includeArchived = false): Promise<Task[]> {
    const rows = await this.db.getAllAsync<TaskRow>(
      includeArchived
        ? 'SELECT * FROM tasks ORDER BY sort_order ASC'
        : 'SELECT * FROM tasks WHERE archived = 0 ORDER BY sort_order ASC',
    );
    return rows.map(toTask);
  }

  async getById(id: string): Promise<Task | null> {
    const row = await this.db.getFirstAsync<TaskRow>('SELECT * FROM tasks WHERE id = ?', id);
    return row ? toTask(row) : null;
  }

  async upsert(task: Task): Promise<void> {
    const row = toTaskRow(task);
    await this.db.runAsync(
      `INSERT INTO tasks (id, habit_id, name, sort_order, archived, color, urgent, pinned, deadline, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         sort_order = excluded.sort_order,
         archived = excluded.archived,
         color = excluded.color,
         urgent = excluded.urgent,
         pinned = excluded.pinned,
         deadline = excluded.deadline,
         notes = excluded.notes,
         updated_at = excluded.updated_at`,
      row.id,
      row.habit_id,
      row.name,
      row.sort_order,
      row.archived,
      row.color,
      row.urgent,
      row.pinned,
      row.deadline,
      row.notes,
      row.created_at,
      row.updated_at,
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM tasks WHERE id = ?', id);
  }

  async deleteForHabit(habitId: string): Promise<void> {
    await this.db.runAsync('DELETE FROM tasks WHERE habit_id = ?', habitId);
  }
}
