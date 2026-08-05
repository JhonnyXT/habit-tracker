import type { Habit } from '@/features/habits/domain/entities/habit';
import type {
  HabitRepository,
  CompletionRepository,
} from '@/features/habits/domain/repositories/habit-repository';
import type {
  TaskRepository,
  TaskCompletionRepository,
} from '@/features/habits/domain/repositories/task-repository';
import { computeStreaks, type Streaks } from '@/features/habits/domain/streak';
import { groupTaskProgress, type TaskProgress } from '@/features/habits/domain/task-progress';
import { today as todayDate, type ISODate } from '@/features/habits/domain/date';

export type HabitSummary = {
  habit: Habit;
  streaks: Streaks;
  history: ISODate[];
  taskProgress: TaskProgress | null;
};

export function getHabitsUseCase(
  habits: HabitRepository,
  completions: CompletionRepository,
  tasks: TaskRepository,
  taskCompletions: TaskCompletionRepository,
) {
  return async (includeArchived = false): Promise<HabitSummary[]> => {
    const all = await habits.getAll(includeArchived);
    const everyCompletion = await completions.getAll();

    const byHabit = new Map<string, ISODate[]>();
    for (const completion of everyCompletion) {
      const list = byHabit.get(completion.habitId) ?? [];
      list.push(completion.date);
      byHabit.set(completion.habitId, list);
    }

    const allTasks = await tasks.getAll();
    const completedTaskIds = new Set(
      (await taskCompletions.getForDate(todayDate())).map((completion) => completion.taskId),
    );
    const taskProgress = groupTaskProgress(allTasks, completedTaskIds);

    return all.map((habit) => {
      const history = byHabit.get(habit.id) ?? [];
      return {
        habit,
        history,
        streaks: computeStreaks(habit.schedule, history),
        taskProgress: taskProgress.get(habit.id) ?? null,
      };
    });
  };
}
