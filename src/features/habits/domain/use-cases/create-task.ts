import type { HabitColorToken } from '@/core/theme';
import type { Task } from '@/features/habits/domain/entities/task';
import { MAX_TASK_NAME_LENGTH } from '@/features/habits/domain/entities/task';
import type { TaskRepository } from '@/features/habits/domain/repositories/task-repository';
import type { HabitRepository } from '@/features/habits/domain/repositories/habit-repository';
import { newId } from '@/features/habits/domain/id';
import { capitalize } from '@/features/habits/domain/text';

export type CreateTaskInput = {
  habitId: string;
  name: string;
  color?: HabitColorToken | null;
  urgent?: boolean;
  pinned?: boolean;
  deadline?: Date | null;
  notes?: string | null;
};

export type CreateTaskResult =
  | { ok: true; task: Task }
  | { ok: false; error: 'empty-name' | 'name-too-long' | 'habit-not-found' };

export function createTaskUseCase(habits: HabitRepository, tasks: TaskRepository) {
  return async (input: CreateTaskInput): Promise<CreateTaskResult> => {
    const name = capitalize(input.name.trim());
    if (name.length === 0) return { ok: false, error: 'empty-name' };
    if (name.length > MAX_TASK_NAME_LENGTH) return { ok: false, error: 'name-too-long' };

    const habit = await habits.getById(input.habitId);
    if (!habit) return { ok: false, error: 'habit-not-found' };

    const existing = await tasks.getForHabit(input.habitId, true);
    const now = new Date();

    const task: Task = {
      id: newId(),
      habitId: input.habitId,
      name,
      sortOrder: existing.length,
      archived: false,
      color: input.color ?? null,
      urgent: input.urgent ?? false,
      pinned: input.pinned ?? false,
      deadline: input.deadline ?? null,
      notes: input.notes?.trim() || null,
      createdAt: now,
      updatedAt: now,
    };

    await tasks.upsert(task);
    return { ok: true, task };
  };
}
