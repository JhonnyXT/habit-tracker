import type { Task } from '@/features/habits/domain/entities/task';
import { MAX_TASK_NAME_LENGTH } from '@/features/habits/domain/entities/task';
import type { TaskRepository } from '@/features/habits/domain/repositories/task-repository';

export type EditTaskResult =
  | { ok: true; task: Task }
  | { ok: false; error: 'not-found' | 'empty-name' | 'name-too-long' };

export function editTaskUseCase(tasks: TaskRepository) {
  return async (habitId: string, taskId: string, name: string): Promise<EditTaskResult> => {
    const existing = (await tasks.getForHabit(habitId, true)).find((task) => task.id === taskId);
    if (!existing) return { ok: false, error: 'not-found' };

    const trimmed = name.trim();
    if (trimmed.length === 0) return { ok: false, error: 'empty-name' };
    if (trimmed.length > MAX_TASK_NAME_LENGTH) return { ok: false, error: 'name-too-long' };

    const task: Task = { ...existing, name: trimmed, updatedAt: new Date() };
    await tasks.upsert(task);
    return { ok: true, task };
  };
}
