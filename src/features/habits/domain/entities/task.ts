import type { ISODate } from '@/features/habits/domain/date';

export type Task = {
  id: string;
  habitId: string;
  name: string;
  sortOrder: number;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type TaskCompletion = {
  id: string;
  taskId: string;
  date: ISODate;
};

export const MAX_TASK_NAME_LENGTH = 60;
