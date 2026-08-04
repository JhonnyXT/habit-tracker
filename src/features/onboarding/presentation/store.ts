import { create } from 'zustand';

import { getUseCases } from '@/core/di';

type OnboardingState = {
  pending: boolean;
  wantsFirstHabit: boolean;

  start: (pending: boolean) => void;
  complete: (wantsFirstHabit: boolean) => Promise<void>;
  takeFirstHabitIntent: () => boolean;
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  pending: false,
  wantsFirstHabit: false,

  start: (pending) => set({ pending }),

  complete: async (wantsFirstHabit) => {
    const useCases = await getUseCases();
    await useCases.markOnboardingSeen();
    set({ pending: false, wantsFirstHabit });
  },

  takeFirstHabitIntent: () => {
    if (!get().wantsFirstHabit) return false;
    set({ wantsFirstHabit: false });
    return true;
  },
}));
