import { habitColorTokens, type HabitColorToken } from '@/core/theme/colors';
import { icons } from '@/core/ui/icons';
import {
  weekdays,
  MAX_HABIT_NAME_LENGTH,
  type Completion,
  type Habit,
  type Schedule,
  type Weekday,
} from '@/features/habits/domain/entities/habit';
import { isClockTime, type Reminder } from '@/features/reminders/domain/entities/reminder';

export const BACKUP_FORMAT_VERSION = 1;

export type BackupHabit = Omit<Habit, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

export type BackupFile = {
  formatVersion: number;
  exportedAt: string;
  habits: BackupHabit[];
  completions: Completion[];
  reminders: Reminder[];
};

export type BackupErrorCode =
  | 'notJson'
  | 'notAnObject'
  | 'unsupportedVersion'
  | 'missingArrays'
  | 'malformedHabit'
  | 'malformedCompletion'
  | 'malformedReminder'
  | 'orphanRecord';

export type BackupParseResult =
  | { ok: true; file: BackupFile }
  | { ok: false; code: BackupErrorCode };

export function buildBackup(
  habits: Habit[],
  completions: Completion[],
  reminders: Reminder[],
  exportedAt: Date,
): BackupFile {
  return {
    formatVersion: BACKUP_FORMAT_VERSION,
    exportedAt: exportedAt.toISOString(),
    habits: habits.map((habit) => ({
      ...habit,
      createdAt: habit.createdAt.toISOString(),
      updatedAt: habit.updatedAt.toISOString(),
    })),
    completions,
    reminders,
  };
}

export function backupToHabits(file: BackupFile): Habit[] {
  return file.habits.map((habit) => ({
    ...habit,
    createdAt: new Date(habit.createdAt),
    updatedAt: new Date(habit.updatedAt),
  }));
}

export function backupFileName(exportedAt: Date): string {
  const year = exportedAt.getFullYear();
  const month = String(exportedAt.getMonth() + 1).padStart(2, '0');
  const day = String(exportedAt.getDate()).padStart(2, '0');
  return `habit-tracker-${year}-${month}-${day}.json`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isISODateTime(value: unknown): boolean {
  return isNonEmptyString(value) && !Number.isNaN(Date.parse(value));
}

function isISODate(value: unknown): boolean {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isSchedule(value: unknown): value is Schedule {
  if (!isRecord(value)) return false;

  if (value.type === 'daily') return true;

  if (value.type === 'weekdays') {
    return (
      Array.isArray(value.days) &&
      value.days.length > 0 &&
      value.days.every((day) => weekdays.includes(day as Weekday))
    );
  }

  if (value.type === 'timesPerWeek') {
    return typeof value.count === 'number' && value.count >= 1 && value.count <= 7;
  }

  return false;
}

function isBackupHabit(value: unknown): value is BackupHabit {
  if (!isRecord(value)) return false;

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.name) &&
    value.name.length <= MAX_HABIT_NAME_LENGTH &&
    isNonEmptyString(value.icon) &&
    value.icon in icons &&
    habitColorTokens.includes(value.color as HabitColorToken) &&
    isSchedule(value.schedule) &&
    typeof value.sortOrder === 'number' &&
    typeof value.archived === 'boolean' &&
    isISODateTime(value.createdAt) &&
    isISODateTime(value.updatedAt)
  );
}

function isCompletion(value: unknown): value is Completion {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.habitId) &&
    isISODate(value.date)
  );
}

function isReminder(value: unknown): value is Reminder {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.habitId) &&
    typeof value.time === 'string' &&
    isClockTime(value.time) &&
    typeof value.enabled === 'boolean'
  );
}

export function parseBackup(raw: string): BackupParseResult {
  let value: unknown;

  try {
    value = JSON.parse(raw);
  } catch {
    return { ok: false, code: 'notJson' };
  }

  if (!isRecord(value)) return { ok: false, code: 'notAnObject' };

  if (value.formatVersion !== BACKUP_FORMAT_VERSION) {
    return { ok: false, code: 'unsupportedVersion' };
  }

  if (
    !Array.isArray(value.habits) ||
    !Array.isArray(value.completions) ||
    !Array.isArray(value.reminders)
  ) {
    return { ok: false, code: 'missingArrays' };
  }

  if (!value.habits.every(isBackupHabit)) return { ok: false, code: 'malformedHabit' };
  if (!value.completions.every(isCompletion)) return { ok: false, code: 'malformedCompletion' };
  if (!value.reminders.every(isReminder)) return { ok: false, code: 'malformedReminder' };

  const habitIds = new Set(value.habits.map((habit) => habit.id));
  const referencesKnownHabit = (record: { habitId: string }) => habitIds.has(record.habitId);

  if (
    !value.completions.every(referencesKnownHabit) ||
    !value.reminders.every(referencesKnownHabit)
  ) {
    return { ok: false, code: 'orphanRecord' };
  }

  return {
    ok: true,
    file: {
      formatVersion: BACKUP_FORMAT_VERSION,
      exportedAt: isISODateTime(value.exportedAt)
        ? (value.exportedAt as string)
        : new Date(0).toISOString(),
      habits: value.habits,
      completions: value.completions,
      reminders: value.reminders,
    },
  };
}
