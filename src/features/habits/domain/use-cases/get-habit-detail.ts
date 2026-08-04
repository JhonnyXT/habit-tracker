import type { Habit } from '@/features/habits/domain/entities/habit';
import type {
  HabitRepository,
  CompletionRepository,
} from '@/features/habits/domain/repositories/habit-repository';
import { computeStreaks, type Streaks } from '@/features/habits/domain/streak';
import { isEligibleOn } from '@/features/habits/domain/schedule';
import { addDays, today as todayDate, type ISODate } from '@/features/habits/domain/date';

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

    let scheduled = 0;
    let done = 0;
    for (let offset = 0; offset < 30; offset += 1) {
      const day = addDays(date, -offset);
      if (!isEligibleOn(habit.schedule, day)) continue;
      scheduled += 1;
      if (completed.has(day)) done += 1;
    }

    return {
      habit,
      history,
      completedToday: completed.has(date),
      streaks: computeStreaks(habit.schedule, history, date),
      last30Percent: scheduled === 0 ? 0 : Math.round((done / scheduled) * 100),
    };
  };
}
