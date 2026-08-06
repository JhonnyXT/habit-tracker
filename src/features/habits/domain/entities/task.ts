import type { ISODate } from '@/features/habits/domain/date';
import type { HabitColorToken } from '@/core/theme';

export type Task = {
  id: string;
  habitId: string;
  name: string;
  sortOrder: number;
  archived: boolean;
  color: HabitColorToken | null;
  urgent: boolean;
  pinned: boolean;
  deadline: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TaskCompletion = {
  id: string;
  taskId: string;
  date: ISODate;
};

export const MAX_TASK_NAME_LENGTH = 60;
export const MAX_TASK_NOTES_LENGTH = 500;
