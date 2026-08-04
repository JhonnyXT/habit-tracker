import type {
  HabitRepository,
  CompletionRepository,
} from '@/features/habits/domain/repositories/habit-repository';
import { isFuture, today as todayDate, type ISODate } from '@/features/habits/domain/date';
import { computeStreaks, type Streaks } from '@/features/habits/domain/streak';
import { newId } from '@/features/habits/domain/id';

export type ToggleCompletionResult =
  | { ok: true; completed: boolean; streaks: Streaks }
  | { ok: false; error: 'future-date' | 'habit-not-found' };

export function toggleCompletionUseCase(
  habits: HabitRepository,
  completions: CompletionRepository,
) {
  return async (habitId: string, date: ISODate = todayDate()): Promise<ToggleCompletionResult> => {
    if (isFuture(date)) return { ok: false, error: 'future-date' };

    const habit = await habits.getById(habitId);
    if (!habit) return { ok: false, error: 'habit-not-found' };

    const history = await completions.getHistory(habitId);
    const alreadyCompleted = history.some((completion) => completion.date === date);

    if (alreadyCompleted) {
      await completions.delete(habitId, date);
    } else {
      await completions.upsert({
        id: newId(),
        habitId,
        date,
      });
    }

    const dates = history
      .map((completion) => completion.date)
      .filter((existing) => existing !== date);
    if (!alreadyCompleted) dates.push(date);

    return {
      ok: true,
      completed: !alreadyCompleted,
      streaks: computeStreaks(habit.schedule, dates),
    };
  };
}
