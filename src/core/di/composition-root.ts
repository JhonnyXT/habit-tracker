import { getDatabase } from '@/core/data';
import { deleteAllDataUseCase } from '@/core/domain/delete-all-data';
import { SqlitePreferencesRepository } from '@/core/data/sqlite-preferences-repository';
import {
  hasSeenOnboardingUseCase,
  markOnboardingSeenUseCase,
} from '@/core/domain/onboarding';
import { SqliteHabitRepository } from '@/features/habits/data/sqlite-habit-repository';
import { SqliteCompletionRepository } from '@/features/habits/data/sqlite-completion-repository';
import { createHabitUseCase } from '@/features/habits/domain/use-cases/create-habit';
import { editHabitUseCase } from '@/features/habits/domain/use-cases/edit-habit';
import { archiveHabitUseCase } from '@/features/habits/domain/use-cases/archive-habit';
import { deleteHabitUseCase } from '@/features/habits/domain/use-cases/delete-habit';
import { reorderHabitsUseCase } from '@/features/habits/domain/use-cases/reorder-habits';
import { toggleCompletionUseCase } from '@/features/habits/domain/use-cases/toggle-completion';
import { getTodayHabitsUseCase } from '@/features/habits/domain/use-cases/get-today-habits';
import { getHabitsUseCase } from '@/features/habits/domain/use-cases/get-habits';
import { getHabitDetailUseCase } from '@/features/habits/domain/use-cases/get-habit-detail';
import { SqliteReminderRepository } from '@/features/reminders/data/sqlite-reminder-repository';
import { ExpoNotificationScheduler } from '@/features/reminders/data/expo-notification-scheduler';
import { getHabitReminderUseCase } from '@/features/reminders/domain/use-cases/get-habit-reminder';
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
  const reminders = new SqliteReminderRepository(db);
  const preferences = new SqlitePreferencesRepository(db);
  const scheduler = new ExpoNotificationScheduler();

  return {
    createHabit: createHabitUseCase(habits),
    editHabit: editHabitUseCase(habits, reminders, scheduler),
    archiveHabit: archiveHabitUseCase(habits, reminders, scheduler),
    deleteHabit: deleteHabitUseCase(habits, completions, reminders, scheduler),
    reorderHabits: reorderHabitsUseCase(habits),
    toggleCompletion: toggleCompletionUseCase(habits, completions),
    getTodayHabits: getTodayHabitsUseCase(habits, completions),
    getHabits: getHabitsUseCase(habits, completions),
    getHabitDetail: getHabitDetailUseCase(habits, completions),

    getHabitReminder: getHabitReminderUseCase(reminders),
    setHabitReminder: setHabitReminderUseCase(habits, reminders, scheduler),
    syncReminders: syncRemindersUseCase(habits, reminders, scheduler),
    getNotificationPermission: getNotificationPermissionUseCase(scheduler),
    requestNotificationPermission: requestNotificationPermissionUseCase(scheduler),

    deleteAllData: deleteAllDataUseCase(habits, completions, reminders, scheduler),

    hasSeenOnboarding: hasSeenOnboardingUseCase(preferences),
    markOnboardingSeen: markOnboardingSeenUseCase(preferences),
  };
}

export type UseCases = Awaited<ReturnType<typeof build>>;

let cached: Promise<UseCases> | null = null;

export function getUseCases(): Promise<UseCases> {
  if (!cached) cached = build();
  return cached;
}
