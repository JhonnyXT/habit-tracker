import type { Task, TaskCompletion } from '@/features/habits/domain/entities/task';
import type { ISODate } from '@/features/habits/domain/date';

export interface TaskRepository {
  getForHabit(habitId: string, includeArchived?: boolean): Promise<Task[]>;
  getAll(includeArchived?: boolean): Promise<Task[]>;
  getById(id: string): Promise<Task | null>;
  upsert(task: Task): Promise<void>;
  delete(id: string): Promise<void>;

  deleteForHabit(habitId: string): Promise<void>;
}

export interface TaskCompletionRepository {
  getForDate(date: ISODate): Promise<TaskCompletion[]>;
  getHistory(taskId: string): Promise<TaskCompletion[]>;

  upsert(completion: TaskCompletion): Promise<void>;
  delete(taskId: string, date: ISODate): Promise<void>;

  deleteForTask(taskId: string): Promise<void>;
  deleteForHabit(habitId: string): Promise<void>;
}
