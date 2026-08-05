import type { Habit } from '@/features/habits/domain/entities/habit';
import type { HabitRepository } from '@/features/habits/domain/repositories/habit-repository';

export function getHabitUseCase(habits: HabitRepository) {
  return (id: string): Promise<Habit | null> => habits.getById(id);
}
