import type { HabitColorToken } from '@/core/theme';
import type { IconName } from '@/core/ui';

export const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export type Weekday = (typeof weekdays)[number];

export type Schedule =
  | { type: 'daily' }
  | { type: 'weekdays'; days: Weekday[] }
  | { type: 'timesPerWeek'; count: number };

export type Habit = {
  id: string;
  name: string;
  icon: IconName;
  color: HabitColorToken;
  schedule: Schedule;
  sortOrder: number;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Completion = {
  id: string;
  habitId: string;

  date: string;
};

export const MAX_HABIT_NAME_LENGTH = 60;
