import type { Task } from '@/features/habits/domain/entities/task';

export type TaskProgress = { completedCount: number; totalCount: number };

export function groupTaskProgress(
  tasks: Task[],
  completedTaskIds: ReadonlySet<string>,
): Map<string, TaskProgress> {
  const byHabit = new Map<string, TaskProgress>();

  for (const task of tasks) {
    const current = byHabit.get(task.habitId) ?? { completedCount: 0, totalCount: 0 };
    current.totalCount += 1;
    if (completedTaskIds.has(task.id)) current.completedCount += 1;
    byHabit.set(task.habitId, current);
  }

  return byHabit;
}
