import type {
  TaskRepository,
  TaskCompletionRepository,
} from '@/features/habits/domain/repositories/task-repository';

export function deleteTaskUseCase(tasks: TaskRepository, taskCompletions: TaskCompletionRepository) {
  return async (taskId: string): Promise<void> => {
    await taskCompletions.deleteForTask(taskId);
    await tasks.delete(taskId);
  };
}
