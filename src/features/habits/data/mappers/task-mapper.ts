import type { HabitColorToken } from '@/core/theme';
import type { Task, TaskCompletion } from '@/features/habits/domain/entities/task';

export type TaskRow = {
  id: string;
  habit_id: string;
  name: string;
  sort_order: number;
  archived: number;
  color: string | null;
  urgent: number;
  pinned: number;
  deadline: string | null;
  notes: string | null;
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
    color: (row.color as HabitColorToken | null) ?? null,
    urgent: row.urgent === 1,
    pinned: row.pinned === 1,
    deadline: row.deadline ? new Date(row.deadline) : null,
    notes: row.notes,
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
    color: task.color,
    urgent: task.urgent ? 1 : 0,
    pinned: task.pinned ? 1 : 0,
    deadline: task.deadline ? task.deadline.toISOString() : null,
    notes: task.notes,
    created_at: task.createdAt.toISOString(),
    updated_at: task.updatedAt.toISOString(),
  };
}

export function toTaskCompletion(row: TaskCompletionRow): TaskCompletion {
  return { id: row.id, taskId: row.task_id, date: row.date };
}
