import type { Habit, Completion } from '@/features/habits/domain/entities/habit';
import type { ISODate } from '@/features/habits/domain/date';

export interface HabitRepository {
  getAll(includeArchived?: boolean): Promise<Habit[]>;
  getById(id: string): Promise<Habit | null>;
  upsert(habit: Habit): Promise<void>;
  delete(id: string): Promise<void>;

  reorder(orderedIds: string[]): Promise<void>;
}

export interface CompletionRepository {
  getForDate(date: ISODate): Promise<Completion[]>;
  getHistory(habitId: string): Promise<Completion[]>;

  getAll(): Promise<Completion[]>;
  upsert(completion: Completion): Promise<void>;
  delete(habitId: string, date: ISODate): Promise<void>;

  deleteForHabit(habitId: string): Promise<void>;
}
