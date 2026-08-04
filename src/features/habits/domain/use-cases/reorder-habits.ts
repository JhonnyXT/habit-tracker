import type { HabitRepository } from '@/features/habits/domain/repositories/habit-repository';

export function reorderHabitsUseCase(habits: HabitRepository) {
  return async (orderedIds: string[]): Promise<void> => {
    await habits.reorder(orderedIds);
  };
}
