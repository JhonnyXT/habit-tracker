import {
  backupFileName,
  backupToHabits,
  backupToTasks,
  buildBackup,
  parseBackup,
  type BackupErrorCode,
  type BackupFile,
} from '@/core/domain/backup';
import type { BackupFileStore } from '@/core/domain/backup-file-store';
import { buildSpreadsheetSheets, spreadsheetFileName } from '@/core/domain/spreadsheet';
import type { SpreadsheetFileStore } from '@/core/domain/spreadsheet-file-store';
import type {
  CompletionRepository,
  HabitRepository,
} from '@/features/habits/domain/repositories/habit-repository';
import type {
  TaskRepository,
  TaskCompletionRepository,
} from '@/features/habits/domain/repositories/task-repository';
import type { NotificationScheduler } from '@/features/reminders/domain/notification-scheduler';
import type { ReminderRepository } from '@/features/reminders/domain/repositories/reminder-repository';

export type ExportResult = { status: 'shared' } | { status: 'cancelled' } | { status: 'empty' };

export type ReadBackupResult =
  | { status: 'cancelled' }
  | { status: 'invalid'; code: BackupErrorCode }
  | { status: 'valid'; file: BackupFile };

export function exportDataUseCase(
  habits: HabitRepository,
  completions: CompletionRepository,
  reminders: ReminderRepository,
  files: BackupFileStore,
  tasks: TaskRepository,
  taskCompletions: TaskCompletionRepository,
) {
  return async (): Promise<ExportResult> => {
    const all = await habits.getAll(true);
    if (all.length === 0) return { status: 'empty' };

    const exportedAt = new Date();
    const allTasks = (
      await Promise.all(all.map((habit) => tasks.getForHabit(habit.id, true)))
    ).flat();
    const allTaskCompletions = (
      await Promise.all(allTasks.map((task) => taskCompletions.getHistory(task.id)))
    ).flat();

    const backup = buildBackup(
      all,
      await completions.getAll(),
      await reminders.getAll(),
      exportedAt,
      allTasks,
      allTaskCompletions,
    );

    const shared = await files.writeAndShare(
      backupFileName(exportedAt),
      JSON.stringify(backup, null, 2),
    );

    return shared ? { status: 'shared' } : { status: 'cancelled' };
  };
}

export function exportSpreadsheetUseCase(
  habits: HabitRepository,
  completions: CompletionRepository,
  reminders: ReminderRepository,
  files: SpreadsheetFileStore,
) {
  return async (): Promise<ExportResult> => {
    const all = await habits.getAll(true);
    if (all.length === 0) return { status: 'empty' };

    const completionsByHabit = new Map<string, string[]>();
    for (const completion of await completions.getAll()) {
      const list = completionsByHabit.get(completion.habitId) ?? [];
      list.push(completion.date);
      completionsByHabit.set(completion.habitId, list);
    }

    const sheets = buildSpreadsheetSheets(all, completionsByHabit, await reminders.getAll());
    const shared = await files.writeAndShare(spreadsheetFileName(new Date()), sheets);

    return shared ? { status: 'shared' } : { status: 'cancelled' };
  };
}

export function readBackupUseCase(files: BackupFileStore) {
  return async (): Promise<ReadBackupResult> => {
    const contents = await files.pickAndRead();
    if (contents === null) return { status: 'cancelled' };

    const parsed = parseBackup(contents);
    if (!parsed.ok) return { status: 'invalid', code: parsed.code };

    return { status: 'valid', file: parsed.file };
  };
}

export function restoreBackupUseCase(
  habits: HabitRepository,
  completions: CompletionRepository,
  reminders: ReminderRepository,
  scheduler: NotificationScheduler,
  tasks: TaskRepository,
  taskCompletions: TaskCompletionRepository,
) {
  return async (file: BackupFile): Promise<void> => {
    await scheduler.cancelAll();

    for (const habit of await habits.getAll(true)) {
      await reminders.deleteForHabit(habit.id);
      await completions.deleteForHabit(habit.id);
      await taskCompletions.deleteForHabit(habit.id);
      await tasks.deleteForHabit(habit.id);
      await habits.delete(habit.id);
    }

    for (const habit of backupToHabits(file)) {
      await habits.upsert(habit);
    }

    for (const completion of file.completions) {
      await completions.upsert(completion);
    }

    for (const reminder of file.reminders) {
      await reminders.upsert(reminder);
    }

    for (const task of backupToTasks(file)) {
      await tasks.upsert(task);
    }

    for (const taskCompletion of file.taskCompletions) {
      await taskCompletions.upsert(taskCompletion);
    }
  };
}
