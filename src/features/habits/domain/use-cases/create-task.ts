import type { Task } from '@/features/habits/domain/entities/task';
import { MAX_TASK_NAME_LENGTH } from '@/features/habits/domain/entities/task';
import type { TaskRepository } from '@/features/habits/domain/repositories/task-repository';
import type { HabitRepository } from '@/features/habits/domain/repositories/habit-repository';
import { newId } from '@/features/habits/domain/id';

export type CreateTaskInput = {
  habitId: string;
  name: string;
};

export type CreateTaskResult =
  | { ok: true; task: Task }
  | { ok: false; error: 'empty-name' | 'name-too-long' | 'habit-not-found' };

export function createTaskUseCase(habits: HabitRepository, tasks: TaskRepository) {
  return async (input: CreateTaskInput): Promise<CreateTaskResult> => {
    const name = input.name.trim();
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
      createdAt: now,
      updatedAt: now,
    };

    await tasks.upsert(task);
    return { ok: true, task };
  };
}
