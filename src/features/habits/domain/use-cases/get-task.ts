import type { Task } from '@/features/habits/domain/entities/task';
import type { TaskRepository } from '@/features/habits/domain/repositories/task-repository';

export function getTaskUseCase(tasks: TaskRepository) {
  return async (id: string): Promise<Task | null> => tasks.getById(id);
}
