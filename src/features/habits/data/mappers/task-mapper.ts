import type { Task, TaskCompletion } from '@/features/habits/domain/entities/task';

export type TaskRow = {
  id: string;
  habit_id: string;
  name: string;
  sort_order: number;
  archived: number;
  created_at: string;
  updated_at: string;
};

export type TaskCompletionRow = {
  id: string;
  task_id: string;
  date: string;
  created_at: string;
};

export function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    habitId: row.habit_id,
    name: row.name,
    sortOrder: row.sort_order,
    archived: row.archived === 1,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function toTaskRow(task: Task): TaskRow {
  return {
    id: task.id,
    habit_id: task.habitId,
    name: task.name,
    sort_order: task.sortOrder,
    archived: task.archived ? 1 : 0,
    created_at: task.createdAt.toISOString(),
    updated_at: task.updatedAt.toISOString(),
  };
}

export function toTaskCompletion(row: TaskCompletionRow): TaskCompletion {
  return { id: row.id, taskId: row.task_id, date: row.date };
}
