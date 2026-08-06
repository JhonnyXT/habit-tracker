import type {
  HabitRepository,
  CompletionRepository,
} from '@/features/habits/domain/repositories/habit-repository';
import type {
  TaskRepository,
  TaskCompletionRepository,
} from '@/features/habits/domain/repositories/task-repository';
import { isFuture, today as todayDate, type ISODate } from '@/features/habits/domain/date';
import { newId } from '@/features/habits/domain/id';

export type ToggleTaskCompletionResult =
  | { ok: true; completed: boolean; habitCompletedByTasks: boolean }
  | { ok: false; error: 'future-date' | 'task-not-found' };

export function toggleTaskCompletionUseCase(
  taskCompletions: TaskCompletionRepository,
  tasks: TaskRepository,
  habits: HabitRepository,
  completions: CompletionRepository,
) {
  return async (
    taskId: string,
    date: ISODate = todayDate(),
  ): Promise<ToggleTaskCompletionResult> => {
    if (isFuture(date)) return { ok: false, error: 'future-date' };

    const task = await tasks.getById(taskId);
    if (!task) return { ok: false, error: 'task-not-found' };

    const history = await taskCompletions.getHistory(taskId);
    const alreadyCompleted = history.some((completion) => completion.date === date);

    if (alreadyCompleted) {
      await taskCompletions.delete(taskId, date);
    } else {
      await taskCompletions.upsert({ id: newId(), taskId, date });
    }

    // A habit's daily tasks are a motivational checklist, not a requirement —
    // except for this one rule: finishing every task for the habit on a given
    // day counts as completing the habit itself, so the streak picks it up.
    // This only ever pushes a habit *toward* completed; unchecking a task
    // after hitting 100% deliberately leaves the habit completed, since a
    // habit's own completion can also be toggled independently of its tasks.
    const habitTasks = await tasks.getForHabit(task.habitId);
    const dayCompletions = await taskCompletions.getForDate(date);
    const completedIds = new Set(dayCompletions.map((completion) => completion.taskId));
    const completedCount = habitTasks.filter((entry) => completedIds.has(entry.id)).length;
    const habitCompletedByTasks = habitTasks.length > 0 && completedCount === habitTasks.length;

    if (habitCompletedByTasks) {
      const habit = await habits.getById(task.habitId);
      if (habit) await completions.upsert({ id: newId(), habitId: habit.id, date });
    }

    return { ok: true, completed: !alreadyCompleted, habitCompletedByTasks };
  };
}
