import { create } from 'zustand';

import { getUseCases } from '@/core/di';
import type { TodayHabit } from '@/features/habits/domain/use-cases/get-today-habits';
import type { HabitSummary } from '@/features/habits/domain/use-cases/get-habits';
import type { CreateHabitInput } from '@/features/habits/domain/use-cases/create-habit';
import type { EditHabitInput } from '@/features/habits/domain/use-cases/edit-habit';
import type { ISODate } from '@/features/habits/domain/date';

type HabitsState = {
  today: TodayHabit[];
  habits: HabitSummary[];
  archived: HabitSummary[];

  isLoading: boolean;

  loadToday: () => Promise<void>;
  loadHabits: () => Promise<void>;
  toggle: (habitId: string, date?: ISODate) => Promise<void>;
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
