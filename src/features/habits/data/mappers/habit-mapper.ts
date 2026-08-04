import type { HabitColorToken } from '@/core/theme';
import type { IconName } from '@/core/ui';
import type {
  Habit,
  Completion,
  Schedule,
  Weekday,
} from '@/features/habits/domain/entities/habit';

export type HabitRow = {
  id: string;
  name: string;
  icon: string;
  color: string;
  schedule_type: string;
  schedule_weekdays: string | null;
  schedule_times_per_week: number | null;
  sort_order: number;
  archived: number;
  created_at: string;
  updated_at: string;
};

export type CompletionRow = {
  id: string;
  habit_id: string;
  date: string;
  created_at: string;
};

function toSchedule(row: HabitRow): Schedule {
  switch (row.schedule_type) {
    case 'weekdays':
      return {
        type: 'weekdays',
        days: row.schedule_weekdays ? (JSON.parse(row.schedule_weekdays) as Weekday[]) : [],
      };
    case 'times_per_week':
      return { type: 'timesPerWeek', count: row.schedule_times_per_week ?? 1 };
    case 'daily':
    default:
      return { type: 'daily' };
  }
}

export function toHabit(row: HabitRow): Habit {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon as IconName,
    color: row.color as HabitColorToken,
    schedule: toSchedule(row),
    sortOrder: row.sort_order,
    archived: row.archived === 1,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function toHabitRow(habit: Habit): HabitRow {
  return {
    id: habit.id,
    name: habit.name,
    icon: habit.icon,
    color: habit.color,
    schedule_type:
      habit.schedule.type === 'timesPerWeek' ? 'times_per_week' : habit.schedule.type,
    schedule_weekdays:
      habit.schedule.type === 'weekdays' ? JSON.stringify(habit.schedule.days) : null,
    schedule_times_per_week:
      habit.schedule.type === 'timesPerWeek' ? habit.schedule.count : null,
    sort_order: habit.sortOrder,
    archived: habit.archived ? 1 : 0,
    created_at: habit.createdAt.toISOString(),
    updated_at: habit.updatedAt.toISOString(),
  };
}

export function toCompletion(row: CompletionRow): Completion {
  return { id: row.id, habitId: row.habit_id, date: row.date };
}
