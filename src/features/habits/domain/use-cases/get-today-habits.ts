import type { Habit } from '@/features/habits/domain/entities/habit';
import type {
  HabitRepository,
  CompletionRepository,
} from '@/features/habits/domain/repositories/habit-repository';
import type {
  TaskRepository,
  TaskCompletionRepository,
} from '@/features/habits/domain/repositories/task-repository';
import { isDueOn } from '@/features/habits/domain/schedule';
import { computeStreaks, type Streaks } from '@/features/habits/domain/streak';
import { groupTaskProgress, type TaskProgress } from '@/features/habits/domain/task-progress';
import { today as todayDate, type ISODate } from '@/features/habits/domain/date';

export type TodayHabit = {
  habit: Habit;
  completedToday: boolean;
  streaks: Streaks;
  taskProgress: TaskProgress | null;
};

export function getTodayHabitsUseCase(
  habits: HabitRepository,
  completions: CompletionRepository,
  tasks: TaskRepository,
  taskCompletions: TaskCompletionRepository,
) {
  return async (date: ISODate = todayDate()): Promise<TodayHabit[]> => {
    const active = await habits.getAll();
    const all = await completions.getAll();

    const byHabit = new Map<string, Set<ISODate>>();
    for (const completion of all) {
      const set = byHabit.get(completion.habitId) ?? new Set<ISODate>();
      set.add(completion.date);
      byHabit.set(completion.habitId, set);
    }

    const allTasks = await tasks.getAll();
    const completedTaskIds = new Set(
      (await taskCompletions.getForDate(date)).map((completion) => completion.taskId),
    );
    const taskProgress = groupTaskProgress(allTasks, completedTaskIds);

    return active
      .filter((habit) => isDueOn(habit.schedule, date, byHabit.get(habit.id) ?? new Set()))
      .map((habit) => {
        const dates = byHabit.get(habit.id) ?? new Set<ISODate>();
        return {
          habit,
          completedToday: dates.has(date),
          streaks: computeStreaks(habit.schedule, [...dates], date),
          taskProgress: taskProgress.get(habit.id) ?? null,
        };
      });
  };
}
