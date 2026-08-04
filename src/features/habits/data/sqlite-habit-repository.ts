import type { SQLiteDatabase } from 'expo-sqlite';

import type { Habit } from '@/features/habits/domain/entities/habit';
import type { HabitRepository } from '@/features/habits/domain/repositories/habit-repository';
import { toHabit, toHabitRow, type HabitRow } from '@/features/habits/data/mappers/habit-mapper';

export class SqliteHabitRepository implements HabitRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async getAll(includeArchived = false): Promise<Habit[]> {
    const rows = await this.db.getAllAsync<HabitRow>(
      includeArchived
        ? 'SELECT * FROM habits ORDER BY sort_order ASC'
        : 'SELECT * FROM habits WHERE archived = 0 ORDER BY sort_order ASC',
    );
    return rows.map(toHabit);
  }

  async getById(id: string): Promise<Habit | null> {
    const row = await this.db.getFirstAsync<HabitRow>('SELECT * FROM habits WHERE id = ?', id);
    return row ? toHabit(row) : null;
  }

  async upsert(habit: Habit): Promise<void> {
    const row = toHabitRow(habit);
    await this.db.runAsync(
      `INSERT INTO habits
         (id, name, icon, color, schedule_type, schedule_weekdays, schedule_times_per_week,
          sort_order, archived, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         icon = excluded.icon,
         color = excluded.color,
         schedule_type = excluded.schedule_type,
         schedule_weekdays = excluded.schedule_weekdays,
         schedule_times_per_week = excluded.schedule_times_per_week,
         sort_order = excluded.sort_order,
         archived = excluded.archived,
         updated_at = excluded.updated_at`,
      row.id,
      row.name,
      row.icon,
      row.color,
      row.schedule_type,
      row.schedule_weekdays,
      row.schedule_times_per_week,
      row.sort_order,
      row.archived,
      row.created_at,
      row.updated_at,
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM habits WHERE id = ?', id);
  }

  async reorder(orderedIds: string[]): Promise<void> {
    await this.db.withTransactionAsync(async () => {
      for (const [index, id] of orderedIds.entries()) {
        await this.db.runAsync('UPDATE habits SET sort_order = ? WHERE id = ?', index, id);
      }
    });
  }
}
