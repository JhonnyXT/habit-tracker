import { groupTaskProgress } from '@/features/habits/domain/task-progress';
import type { Task } from '@/features/habits/domain/entities/task';

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: 't-1',
    habitId: 'habit-1',
    name: 'Estirar',
    sortOrder: 0,
    archived: false,
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    updatedAt: new Date('2026-08-01T00:00:00.000Z'),
    ...overrides,
  };
}

describe('groupTaskProgress', () => {
  it('counts completed vs total per habit', () => {
    const tasks = [
      makeTask({ id: 't-1', habitId: 'habit-1' }),
      makeTask({ id: 't-2', habitId: 'habit-1' }),
      makeTask({ id: 't-3', habitId: 'habit-2' }),
    ];

    const result = groupTaskProgress(tasks, new Set(['t-1']));

    expect(result.get('habit-1')).toEqual({ completedCount: 1, totalCount: 2 });
    expect(result.get('habit-2')).toEqual({ completedCount: 0, totalCount: 1 });
  });

  it('returns an empty map for a habit with no tasks', () => {
    expect(groupTaskProgress([], new Set())).toEqual(new Map());
  });

  it('never counts a completed id belonging to a different task', () => {
    const tasks = [makeTask({ id: 't-1', habitId: 'habit-1' })];
    const result = groupTaskProgress(tasks, new Set(['ghost-id']));

    expect(result.get('habit-1')).toEqual({ completedCount: 0, totalCount: 1 });
  });
});
