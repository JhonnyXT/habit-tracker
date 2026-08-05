import type { Task } from '@/features/habits/domain/entities/task';
import type {
  TaskRepository,
  TaskCompletionRepository,
} from '@/features/habits/domain/repositories/task-repository';
import { today as todayDate, type ISODate } from '@/features/habits/domain/date';

export type TaskWithState = Task & { completedToday: boolean };

export type HabitTasks = {
  tasks: TaskWithState[];
  completedCount: number;
  totalCount: number;
};

export function getHabitTasksUseCase(tasks: TaskRepository, taskCompletions: TaskCompletionRepository) {
  return async (habitId: string, date: ISODate = todayDate()): Promise<HabitTasks> => {
    const habitTasks = await tasks.getForHabit(habitId);
    const completedToday = new Set(
      (await taskCompletions.getForDate(date))
        .filter((completion) => habitTasks.some((task) => task.id === completion.taskId))
        .map((completion) => completion.taskId),
    );

    const withState = habitTasks.map((task) => ({
      ...task,
      completedToday: completedToday.has(task.id),
    }));

    return {
      tasks: withState,
      completedCount: withState.filter((task) => task.completedToday).length,
      totalCount: withState.length,
    };
  };
}
