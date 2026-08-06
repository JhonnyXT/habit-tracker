import type { HabitColorToken } from '@/core/theme';
import type { IconName } from '@/core/ui';
import type { Habit, Schedule } from '@/features/habits/domain/entities/habit';
import { MAX_HABIT_NAME_LENGTH } from '@/features/habits/domain/entities/habit';
import type { HabitRepository } from '@/features/habits/domain/repositories/habit-repository';
import { newId } from '@/features/habits/domain/id';
import { capitalize } from '@/features/habits/domain/text';

export type CreateHabitInput = {
  name: string;
  icon?: IconName;
  color?: HabitColorToken;
  schedule?: Schedule;
};

export type CreateHabitResult =
  | { ok: true; habit: Habit }
  | { ok: false; error: 'empty-name' | 'name-too-long' };

export function createHabitUseCase(habits: HabitRepository) {
  return async (input: CreateHabitInput): Promise<CreateHabitResult> => {
    const name = capitalize(input.name.trim());
    if (name.length === 0) return { ok: false, error: 'empty-name' };
    if (name.length > MAX_HABIT_NAME_LENGTH) return { ok: false, error: 'name-too-long' };

    const existing = await habits.getAll(true);
    const now = new Date();

    const habit: Habit = {
      id: newId(),
      name,
      icon: input.icon ?? 'checkCircle',
      color: input.color ?? 'blue',
      schedule: input.schedule ?? { type: 'daily' },
      sortOrder: existing.length,
      archived: false,
      createdAt: now,
      updatedAt: now,
    };

    await habits.upsert(habit);
    return { ok: true, habit };
  };
}
