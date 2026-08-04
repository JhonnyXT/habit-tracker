import type { Habit } from '@/features/habits/domain/entities/habit';
import type {
  HabitRepository,
  CompletionRepository,
} from '@/features/habits/domain/repositories/habit-repository';
import { computeStreaks, type Streaks } from '@/features/habits/domain/streak';
import type { ISODate } from '@/features/habits/domain/date';

export type HabitSummary = {
  habit: Habit;
  streaks: Streaks;

  history: ISODate[];
};

export function getHabitsUseCase(habits: HabitRepository, completions: CompletionRepository) {
  return async (includeArchived = false): Promise<HabitSummary[]> => {
    const all = await habits.getAll(includeArchived);
    const everyCompletion = await completions.getAll();

    const byHabit = new Map<string, ISODate[]>();
    for (const completion of everyCompletion) {
      const list = byHabit.get(completion.habitId) ?? [];
      list.push(completion.date);
      byHabit.set(completion.habitId, list);
    }

    return all.map((habit) => {
      const history = byHabit.get(habit.id) ?? [];
      return { habit, history, streaks: computeStreaks(habit.schedule, history) };
    });
  };
}
