import type { TaskCompletionRepository } from '@/features/habits/domain/repositories/task-repository';
import { isFuture, today as todayDate, type ISODate } from '@/features/habits/domain/date';
import { newId } from '@/features/habits/domain/id';

export type ToggleTaskCompletionResult =
  | { ok: true; completed: boolean }
  | { ok: false; error: 'future-date' };

export function toggleTaskCompletionUseCase(taskCompletions: TaskCompletionRepository) {
  return async (
    taskId: string,
    date: ISODate = todayDate(),
  ): Promise<ToggleTaskCompletionResult> => {
    if (isFuture(date)) return { ok: false, error: 'future-date' };

    const history = await taskCompletions.getHistory(taskId);
    const alreadyCompleted = history.some((completion) => completion.date === date);

    if (alreadyCompleted) {
      await taskCompletions.delete(taskId, date);
    } else {
      await taskCompletions.upsert({ id: newId(), taskId, date });
    }

    return { ok: true, completed: !alreadyCompleted };
  };
}
