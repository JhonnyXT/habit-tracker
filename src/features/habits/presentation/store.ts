import { create } from 'zustand';

import { getUseCases } from '@/core/di';
import type { TodayHabit } from '@/features/habits/domain/use-cases/get-today-habits';
import type { HabitSummary } from '@/features/habits/domain/use-cases/get-habits';
import type { CreateHabitInput } from '@/features/habits/domain/use-cases/create-habit';
import type { EditHabitInput } from '@/features/habits/domain/use-cases/edit-habit';
import type { CreateTaskInput } from '@/features/habits/domain/use-cases/create-task';
import type { EditTaskUpdates } from '@/features/habits/domain/use-cases/edit-task';
import type { ISODate } from '@/features/habits/domain/date';

type HabitsState = {
  today: TodayHabit[];
  habits: HabitSummary[];
  archived: HabitSummary[];

  isLoading: boolean;

  loadToday: () => Promise<void>;
  loadHabits: () => Promise<void>;
  toggle: (habitId: string, date?: ISODate) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<void>;
  editTask: (
    habitId: string,
    taskId: string,
    name: string,
    updates?: EditTaskUpdates,
  ) => Promise<boolean>;
  create: (input: CreateHabitInput) => Promise<string | null>;
  edit: (id: string, changes: EditHabitInput) => Promise<boolean>;
  archive: (id: string, archived?: boolean) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reorder: (orderedIds: string[]) => Promise<void>;
};

export const useHabitsStore = create<HabitsState>((set, get) => ({
  today: [],
  habits: [],
  archived: [],
  isLoading: true,

  loadToday: async () => {
    const useCases = await getUseCases();
    set({ today: await useCases.getTodayHabits(), isLoading: false });
  },

  loadHabits: async () => {
    const useCases = await getUseCases();
    const all = await useCases.getHabits(true);

    set({
      habits: all.filter((entry) => !entry.habit.archived),
      archived: all.filter((entry) => entry.habit.archived),
      isLoading: false,
    });
  },

  toggle: async (habitId, date) => {
    const isToday = date === undefined;
    const before = get().today;

    if (isToday) {
      set({
        today: before.map((entry) =>
          entry.habit.id === habitId
            ? { ...entry, completedToday: !entry.completedToday }
            : entry,
        ),
      });
    }

    const useCases = await getUseCases();
    const result = await useCases.toggleCompletion(habitId, date);

    if (!result.ok) {
      if (isToday) set({ today: before });
      return;
    }

    set({
      today: get().today.map((entry) =>
        entry.habit.id === habitId
          ? { ...entry, completedToday: result.completed, streaks: result.streaks }
          : entry,
      ),
    });
  },

  toggleTask: async (taskId) => {
    const before = get().today;
    const patchTask = (entries: TodayHabit[], completedToday: boolean) =>
      entries.map((entry) => {
        if (!entry.tasks.some((task) => task.id === taskId)) return entry;
        const tasks = entry.tasks.map((task) =>
          task.id === taskId ? { ...task, completedToday } : task,
        );
        const taskProgress = entry.taskProgress
          ? {
              ...entry.taskProgress,
              completedCount: tasks.filter((task) => task.completedToday).length,
            }
          : entry.taskProgress;
        return { ...entry, tasks, taskProgress };
      });

    const optimisticNext = before.find((entry) => entry.tasks.some((task) => task.id === taskId))
      ?.tasks.find((task) => task.id === taskId);
    set({ today: patchTask(before, !(optimisticNext?.completedToday ?? false)) });

    const useCases = await getUseCases();
    const result = await useCases.toggleTaskCompletion(taskId);

    if (!result.ok) {
      set({ today: before });
      return;
    }

    if (result.habitCompletedByTasks) {
      await get().loadToday();
      return;
    }

    set({ today: patchTask(get().today, result.completed) });
  },

  createTask: async (input) => {
    const useCases = await getUseCases();
    const result = await useCases.createTask(input);
    if (!result.ok) return false;
    await get().loadToday();
    return true;
  },

  deleteTask: async (taskId) => {
    const useCases = await getUseCases();
    await useCases.deleteTask(taskId);

    set({
      today: get().today.map((entry) => {
        if (!entry.tasks.some((task) => task.id === taskId)) return entry;
        const tasks = entry.tasks.filter((task) => task.id !== taskId);
        const taskProgress = entry.taskProgress
          ? {
              ...entry.taskProgress,
              totalCount: tasks.length,
              completedCount: tasks.filter((task) => task.completedToday).length,
            }
          : entry.taskProgress;
        return { ...entry, tasks, taskProgress };
      }),
    });
  },

  editTask: async (habitId, taskId, name, updates) => {
    const useCases = await getUseCases();
    const result = await useCases.editTask(habitId, taskId, name, updates);
    if (!result.ok) return false;
    await get().loadToday();
    return true;
  },

  create: async (input) => {
    const useCases = await getUseCases();
    const result = await useCases.createHabit(input);
    if (!result.ok) return null;
    await Promise.all([get().loadToday(), get().loadHabits()]);
    return result.habit.id;
  },

  edit: async (id, changes) => {
    const useCases = await getUseCases();
    const result = await useCases.editHabit(id, changes);
    if (!result.ok) return false;
    await Promise.all([get().loadToday(), get().loadHabits()]);
    return true;
  },

  archive: async (id, archived = true) => {
    const useCases = await getUseCases();
    await useCases.archiveHabit(id, archived);
    await Promise.all([get().loadToday(), get().loadHabits()]);
  },

  remove: async (id) => {
    const useCases = await getUseCases();
    await useCases.deleteHabit(id);
    await Promise.all([get().loadToday(), get().loadHabits()]);
  },

  reorder: async (orderedIds) => {
    const useCases = await getUseCases();
    await useCases.reorderHabits(orderedIds);
    await Promise.all([get().loadToday(), get().loadHabits()]);
  },
}));
