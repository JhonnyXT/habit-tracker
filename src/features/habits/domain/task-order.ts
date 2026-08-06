import type { Task } from '@/features/habits/domain/entities/task';

export function compareTasks(a: Task, b: Task): number {
  if (a.pinned !== b.pinned) return Number(b.pinned) - Number(a.pinned);
  if (a.urgent !== b.urgent) return Number(b.urgent) - Number(a.urgent);
  return a.createdAt.getTime() - b.createdAt.getTime();
}
