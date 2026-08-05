import {
  BACKUP_FORMAT_VERSION,
  backupFileName,
  backupToHabits,
  backupToTasks,
  buildBackup,
  parseBackup,
} from '@/core/domain/backup';
import { computeStreaks } from '@/features/habits/domain/streak';
import type { Completion, Habit } from '@/features/habits/domain/entities/habit';
import type { Reminder } from '@/features/reminders/domain/entities/reminder';
import type { Task, TaskCompletion } from '@/features/habits/domain/entities/task';

const exportedAt = new Date('2026-08-03T10:00:00.000Z');

const habit: Habit = {
  id: 'habit-1',
  name: 'Correr',
  icon: 'running',
  color: 'orange',
  schedule: { type: 'daily' },
  sortOrder: 0,
  archived: false,
  createdAt: new Date('2026-07-01T08:00:00.000Z'),
  updatedAt: new Date('2026-07-30T08:00:00.000Z'),
};

const completions: Completion[] = [
  { id: 'c-1', habitId: 'habit-1', date: '2026-07-28' },
  { id: 'c-2', habitId: 'habit-1', date: '2026-07-29' },
  { id: 'c-3', habitId: 'habit-1', date: '2026-07-30' },
];

const reminder: Reminder = {
  id: 'r-1',
  habitId: 'habit-1',
  time: '07:30',
  enabled: true,
  kind: 'main',
};

const task: Task = {
  id: 'task-1',
  habitId: 'habit-1',
  name: 'Estirar',
  sortOrder: 0,
  archived: false,
  createdAt: new Date('2026-07-01T08:00:00.000Z'),
  updatedAt: new Date('2026-07-01T08:00:00.000Z'),
};

const taskCompletions: TaskCompletion[] = [{ id: 'tc-1', taskId: 'task-1', date: '2026-07-30' }];

function serialize(overrides: Record<string, unknown> = {}) {
  return JSON.stringify({
    ...buildBackup([habit], completions, [reminder], exportedAt),
    ...overrides,
  });
}

describe('backup round trip', () => {
  it('restores habits with their dates intact', () => {
    const parsed = parseBackup(serialize());
    if (!parsed.ok) throw new Error(`expected a valid backup, got ${parsed.code}`);

    const [restored] = backupToHabits(parsed.file);
    expect(restored).toEqual(habit);
  });

  it('recomputes streaks identically to the original data (FR-9.3)', () => {
    const before = computeStreaks(
      habit.schedule,
      completions.map((completion) => completion.date),
      '2026-07-30',
    );

    const parsed = parseBackup(serialize());
    if (!parsed.ok) throw new Error(`expected a valid backup, got ${parsed.code}`);

    const after = computeStreaks(
      backupToHabits(parsed.file)[0].schedule,
      parsed.file.completions.map((completion) => completion.date),
      '2026-07-30',
    );

    expect(after).toEqual(before);
    expect(after.current).toBe(3);
  });

  it('carries archived habits and their history (FR-9.1)', () => {
    const archived: Habit = { ...habit, id: 'habit-2', archived: true };
    const file = buildBackup([habit, archived], completions, [reminder], exportedAt);

    const parsed = parseBackup(JSON.stringify(file));
    if (!parsed.ok) throw new Error(`expected a valid backup, got ${parsed.code}`);

    expect(backupToHabits(parsed.file).map((h) => h.archived)).toEqual([false, true]);
  });

  it('names the file by the export date', () => {
    expect(backupFileName(new Date(2026, 7, 3))).toBe('habit-tracker-2026-08-03.json');
  });
});

describe('backup round trip (tasks)', () => {
  it('restores tasks and their completions intact', () => {
    const file = buildBackup([habit], completions, [reminder], exportedAt, [task], taskCompletions);
    const parsed = parseBackup(JSON.stringify(file));
    if (!parsed.ok) throw new Error(`expected a valid backup, got ${parsed.code}`);

    expect(backupToTasks(parsed.file)).toEqual([task]);
    expect(parsed.file.taskCompletions).toEqual(taskCompletions);
  });

  it('does not let task completions affect the habit streak (independent by construction)', () => {
    const before = computeStreaks(
      habit.schedule,
      completions.map((completion) => completion.date),
      '2026-07-30',
    );

    const file = buildBackup([habit], completions, [reminder], exportedAt, [task], taskCompletions);
    const parsed = parseBackup(JSON.stringify(file));
    if (!parsed.ok) throw new Error(`expected a valid backup, got ${parsed.code}`);

    const after = computeStreaks(
      backupToHabits(parsed.file)[0].schedule,
      parsed.file.completions.map((completion) => completion.date),
      '2026-07-30',
    );

    expect(after).toEqual(before);
  });

  it('treats a backup written before Habit Tasks existed as having no tasks', () => {
    const file = buildBackup([habit], completions, [reminder], exportedAt) as Record<
      string,
      unknown
    >;
    delete file.tasks;
    delete file.taskCompletions;

    const parsed = parseBackup(JSON.stringify(file));
    if (!parsed.ok) throw new Error(`expected a valid backup, got ${parsed.code}`);

    expect(parsed.file.tasks).toEqual([]);
    expect(parsed.file.taskCompletions).toEqual([]);
  });

  it('treats a reminder from before multi-alert reminders existed as "main"', () => {
    const file = buildBackup([habit], completions, [reminder], exportedAt) as {
      reminders: Record<string, unknown>[];
    };
    delete file.reminders[0].kind;

    const parsed = parseBackup(JSON.stringify(file));
    if (!parsed.ok) throw new Error(`expected a valid backup, got ${parsed.code}`);

    expect(parsed.file.reminders[0].kind).toBe('main');
  });
});

describe('backup validation (FR-9.2)', () => {
  it('rejects text that is not JSON', () => {
    expect(parseBackup('not json at all')).toEqual({ ok: false, code: 'notJson' });
  });

  it('rejects JSON that is not an object', () => {
    expect(parseBackup('[1, 2, 3]')).toEqual({ ok: false, code: 'notAnObject' });
  });

  it('rejects a format version it does not understand', () => {
    expect(parseBackup(serialize({ formatVersion: BACKUP_FORMAT_VERSION + 98 }))).toEqual({
      ok: false,
      code: 'unsupportedVersion',
    });
  });

  it('rejects a file with a missing array', () => {
    expect(parseBackup(serialize({ completions: undefined }))).toEqual({
      ok: false,
      code: 'missingArrays',
    });
  });

  it('rejects a habit with an unknown icon', () => {
    const broken = [{ ...buildBackup([habit], [], [], exportedAt).habits[0], icon: 'not-an-icon' }];
    expect(parseBackup(serialize({ habits: broken, completions: [], reminders: [] }))).toEqual({
      ok: false,
      code: 'malformedHabit',
    });
  });

  it('rejects a habit with a malformed schedule', () => {
    const broken = [
      { ...buildBackup([habit], [], [], exportedAt).habits[0], schedule: { type: 'weekdays' } },
    ];
    expect(parseBackup(serialize({ habits: broken, completions: [], reminders: [] }))).toEqual({
      ok: false,
      code: 'malformedHabit',
    });
  });

  it('rejects a completion whose date is not a calendar date', () => {
    const broken = [{ id: 'c-9', habitId: 'habit-1', date: '30/07/2026' }];
    expect(parseBackup(serialize({ completions: broken }))).toEqual({
      ok: false,
      code: 'malformedCompletion',
    });
  });

  it('rejects a reminder with an impossible time', () => {
    const broken = [{ id: 'r-9', habitId: 'habit-1', time: '25:00', enabled: true }];
    expect(parseBackup(serialize({ reminders: broken }))).toEqual({
      ok: false,
      code: 'malformedReminder',
    });
  });

  it('rejects a completion pointing at a habit the file does not contain', () => {
    const orphan = [{ id: 'c-9', habitId: 'ghost', date: '2026-07-30' }];
    expect(parseBackup(serialize({ completions: orphan }))).toEqual({
      ok: false,
      code: 'orphanRecord',
    });
  });

  it('rejects a reminder with an unknown kind', () => {
    const broken = [{ id: 'r-9', habitId: 'habit-1', time: '07:30', enabled: true, kind: 'nag' }];
    expect(parseBackup(serialize({ reminders: broken }))).toEqual({
      ok: false,
      code: 'malformedReminder',
    });
  });

  it('rejects a reminder pointing at a habit the file does not contain', () => {
    const orphan = [{ id: 'r-9', habitId: 'ghost', time: '07:30', enabled: true }];
    expect(parseBackup(serialize({ reminders: orphan }))).toEqual({
      ok: false,
      code: 'orphanRecord',
    });
  });

  it('rejects a task whose name is too long', () => {
    const broken = [{ ...task, createdAt: task.createdAt.toISOString(), updatedAt: task.updatedAt.toISOString(), name: 'x'.repeat(61) }];
    expect(parseBackup(serialize({ tasks: broken }))).toEqual({
      ok: false,
      code: 'malformedTask',
    });
  });

  it('rejects a task completion whose date is not a calendar date', () => {
    const brokenTask = [{ ...task, createdAt: task.createdAt.toISOString(), updatedAt: task.updatedAt.toISOString() }];
    const broken = [{ id: 'tc-9', taskId: 'task-1', date: '30/07/2026' }];
    expect(parseBackup(serialize({ tasks: brokenTask, taskCompletions: broken }))).toEqual({
      ok: false,
      code: 'malformedTaskCompletion',
    });
  });

  it('rejects a task pointing at a habit the file does not contain', () => {
    const orphan = [
      { id: 't-9', habitId: 'ghost', name: 'Fantasma', sortOrder: 0, archived: false, createdAt: exportedAt.toISOString(), updatedAt: exportedAt.toISOString() },
    ];
    expect(parseBackup(serialize({ tasks: orphan }))).toEqual({
      ok: false,
      code: 'orphanRecord',
    });
  });

  it('rejects a task completion pointing at a task the file does not contain', () => {
    const orphan = [{ id: 'tc-9', taskId: 'ghost', date: '2026-07-30' }];
    expect(parseBackup(serialize({ taskCompletions: orphan }))).toEqual({
      ok: false,
      code: 'orphanRecord',
    });
  });
});
