import type { HabitColorToken } from '@/core/theme';
import type { Task } from '@/features/habits/domain/entities/task';
import { MAX_TASK_NAME_LENGTH } from '@/features/habits/domain/entities/task';
import type { TaskRepository } from '@/features/habits/domain/repositories/task-repository';
import { capitalize } from '@/features/habits/domain/text';

export type EditTaskResult =
  | { ok: true; task: Task }
  | { ok: false; error: 'not-found' | 'empty-name' | 'name-too-long' };

export type EditTaskUpdates = {
  color?: HabitColorToken | null;
  urgent?: boolean;
  pinned?: boolean;
  deadline?: Date | null;
  notes?: string | null;
};

export function editTaskUseCase(tasks: TaskRepository) {
  return async (
    habitId: string,
    taskId: string,
    name: string,
    updates: EditTaskUpdates = {},
  ): Promise<EditTaskResult> => {
    const existing = (await tasks.getForHabit(habitId, true)).find((task) => task.id === taskId);
    if (!existing) return { ok: false, error: 'not-found' };

    const trimmed = capitalize(name.trim());
    if (trimmed.length === 0) return { ok: false, error: 'empty-name' };
    if (trimmed.length > MAX_TASK_NAME_LENGTH) return { ok: false, error: 'name-too-long' };

    const task: Task = {
      ...existing,
      name: trimmed,
      color: updates.color !== undefined ? updates.color : existing.color,
      urgent: updates.urgent !== undefined ? updates.urgent : existing.urgent,
      pinned: updates.pinned !== undefined ? updates.pinned : existing.pinned,
      deadline: updates.deadline !== undefined ? updates.deadline : existing.deadline,
      notes:
        updates.notes !== undefined ? updates.notes?.trim() || null : existing.notes,
      updatedAt: new Date(),
    };
    await tasks.upsert(task);
    return { ok: true, task };
  };
}
