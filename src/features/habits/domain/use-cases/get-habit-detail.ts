import type { Habit } from '@/features/habits/domain/entities/habit';
import type {
  HabitRepository,
  CompletionRepository,
} from '@/features/habits/domain/repositories/habit-repository';
import { computeStreaks, last30Percent, type Streaks } from '@/features/habits/domain/streak';
import { today as todayDate, type ISODate } from '@/features/habits/domain/date';

export type HabitDetail = {
  habit: Habit;
  streaks: Streaks;
  completedToday: boolean;
  history: ISODate[];

  last30Percent: number;
};

export function getHabitDetailUseCase(
  habits: HabitRepository,
  completions: CompletionRepository,
) {
  return async (id: string, date: ISODate = todayDate()): Promise<HabitDetail | null> => {
    const habit = await habits.getById(id);
    if (!habit) return null;

    const history = (await completions.getHistory(id)).map((completion) => completion.date);
    const completed = new Set(history);

    return {
      habit,
      history,
      completedToday: completed.has(date),
      streaks: computeStreaks(habit.schedule, history, date),
      last30Percent: last30Percent(habit.schedule, history, date),
    };
  };
}
