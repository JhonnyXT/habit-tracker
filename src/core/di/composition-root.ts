import { getDatabase } from '@/core/data';
import { deleteAllDataUseCase } from '@/core/domain/delete-all-data';
import { SqlitePreferencesRepository } from '@/core/data/sqlite-preferences-repository';
import { ExpoBackupFileStore } from '@/core/data/expo-backup-file-store';
import { ExpoSpreadsheetFileStore } from '@/core/data/expo-spreadsheet-file-store';
import {
  exportDataUseCase,
  exportSpreadsheetUseCase,
  readBackupUseCase,
  restoreBackupUseCase,
} from '@/core/domain/backup-use-cases';
import {
  hasSeenOnboardingUseCase,
  markOnboardingSeenUseCase,
} from '@/core/domain/onboarding';
import { getAppearanceUseCase, setAppearanceUseCase } from '@/core/domain/appearance';
import { SqliteHabitRepository } from '@/features/habits/data/sqlite-habit-repository';
import { SqliteCompletionRepository } from '@/features/habits/data/sqlite-completion-repository';
import { SqliteTaskRepository } from '@/features/habits/data/sqlite-task-repository';
import { SqliteTaskCompletionRepository } from '@/features/habits/data/sqlite-task-completion-repository';
import { createHabitUseCase } from '@/features/habits/domain/use-cases/create-habit';
import { editHabitUseCase } from '@/features/habits/domain/use-cases/edit-habit';
import { archiveHabitUseCase } from '@/features/habits/domain/use-cases/archive-habit';
import { deleteHabitUseCase } from '@/features/habits/domain/use-cases/delete-habit';
import { reorderHabitsUseCase } from '@/features/habits/domain/use-cases/reorder-habits';
import { toggleCompletionUseCase } from '@/features/habits/domain/use-cases/toggle-completion';
import { getTodayHabitsUseCase } from '@/features/habits/domain/use-cases/get-today-habits';
import { getHabitsUseCase } from '@/features/habits/domain/use-cases/get-habits';
import { getHabitUseCase } from '@/features/habits/domain/use-cases/get-habit';
import { getHabitDetailUseCase } from '@/features/habits/domain/use-cases/get-habit-detail';
import { getHabitTasksUseCase } from '@/features/habits/domain/use-cases/get-habit-tasks';
import { toggleTaskCompletionUseCase } from '@/features/habits/domain/use-cases/toggle-task-completion';
import { createTaskUseCase } from '@/features/habits/domain/use-cases/create-task';
import { editTaskUseCase } from '@/features/habits/domain/use-cases/edit-task';
import { deleteTaskUseCase } from '@/features/habits/domain/use-cases/delete-task';
import { SqliteReminderRepository } from '@/features/reminders/data/sqlite-reminder-repository';
import { ExpoNotificationScheduler } from '@/features/reminders/data/expo-notification-scheduler';
import { getHabitReminderUseCase } from '@/features/reminders/domain/use-cases/get-habit-reminder';
import { getHabitRemindersUseCase } from '@/features/reminders/domain/use-cases/get-habit-reminders';
import { setHabitReminderUseCase } from '@/features/reminders/domain/use-cases/set-habit-reminder';
import { syncRemindersUseCase } from '@/features/reminders/domain/use-cases/sync-reminders';
import {
  getNotificationPermissionUseCase,
  requestNotificationPermissionUseCase,
} from '@/features/reminders/domain/use-cases/notification-permission';

async function build() {
  const db = await getDatabase();

  const habits = new SqliteHabitRepository(db);
  const completions = new SqliteCompletionRepository(db);
  const tasks = new SqliteTaskRepository(db);
  const taskCompletions = new SqliteTaskCompletionRepository(db);
  const reminders = new SqliteReminderRepository(db);
  const preferences = new SqlitePreferencesRepository(db);
  const scheduler = new ExpoNotificationScheduler();
  const backupFiles = new ExpoBackupFileStore();
  const spreadsheetFiles = new ExpoSpreadsheetFileStore();

  return {
    createHabit: createHabitUseCase(habits),
    editHabit: editHabitUseCase(habits, reminders, scheduler),
    archiveHabit: archiveHabitUseCase(habits, reminders, scheduler),
    deleteHabit: deleteHabitUseCase(habits, completions, reminders, scheduler, tasks, taskCompletions),
    reorderHabits: reorderHabitsUseCase(habits),
    toggleCompletion: toggleCompletionUseCase(habits, completions),
    getTodayHabits: getTodayHabitsUseCase(habits, completions, tasks, taskCompletions),
    getHabits: getHabitsUseCase(habits, completions, tasks, taskCompletions),
    getHabit: getHabitUseCase(habits),
    getHabitDetail: getHabitDetailUseCase(habits, completions),

    getHabitTasks: getHabitTasksUseCase(tasks, taskCompletions),
    toggleTaskCompletion: toggleTaskCompletionUseCase(taskCompletions),
    createTask: createTaskUseCase(habits, tasks),
    editTask: editTaskUseCase(tasks),
    deleteTask: deleteTaskUseCase(tasks, taskCompletions),

    getHabitReminder: getHabitReminderUseCase(reminders),
    getHabitReminders: getHabitRemindersUseCase(reminders),
    setHabitReminder: setHabitReminderUseCase(habits, reminders, scheduler),
    syncReminders: syncRemindersUseCase(habits, reminders, scheduler),
    getNotificationPermission: getNotificationPermissionUseCase(scheduler),
    requestNotificationPermission: requestNotificationPermissionUseCase(scheduler),

    deleteAllData: deleteAllDataUseCase(habits, completions, reminders, scheduler, tasks, taskCompletions),

    exportData: exportDataUseCase(habits, completions, reminders, backupFiles, tasks, taskCompletions),
    exportSpreadsheet: exportSpreadsheetUseCase(habits, completions, reminders, spreadsheetFiles),
    readBackup: readBackupUseCase(backupFiles),
    restoreBackup: restoreBackupUseCase(habits, completions, reminders, scheduler, tasks, taskCompletions),

    hasSeenOnboarding: hasSeenOnboardingUseCase(preferences),
    markOnboardingSeen: markOnboardingSeenUseCase(preferences),

    getAppearance: getAppearanceUseCase(preferences),
    setAppearance: setAppearanceUseCase(preferences),
  };
}

export type UseCases = Awaited<ReturnType<typeof build>>;

let cached: Promise<UseCases> | null = null;

export function getUseCases(): Promise<UseCases> {
  if (!cached) cached = build();
  return cached;
}
