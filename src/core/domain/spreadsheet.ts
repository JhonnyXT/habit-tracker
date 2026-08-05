import { strings } from '@/core/i18n';
import type { Habit, Schedule } from '@/features/habits/domain/entities/habit';
import { computeStreaks, last30Percent } from '@/features/habits/domain/streak';
import { fromISODate, today as todayDate, type ISODate } from '@/features/habits/domain/date';
import type { Reminder } from '@/features/reminders/domain/entities/reminder';

export type SpreadsheetRow = Record<string, string | number>;
export type SpreadsheetSheet = { name: string; rows: SpreadsheetRow[] };

function scheduleLabel(schedule: Schedule): string {
  switch (schedule.type) {
    case 'daily':
      return strings.schedule.daily;
    case 'weekdays':
      return schedule.days.map((day) => strings.weekdayNames[day]).join(', ');
    case 'timesPerWeek':
      return strings.schedule.timesPerWeek(schedule.count);
  }
}

function formatDate(iso: ISODate): string {
  const date = fromISODate(iso);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

function yesNo(value: boolean): string {
  return value ? strings.spreadsheet.yes : strings.spreadsheet.no;
}

export function spreadsheetFileName(exportedAt: Date): string {
  const year = exportedAt.getFullYear();
  const month = String(exportedAt.getMonth() + 1).padStart(2, '0');
  const day = String(exportedAt.getDate()).padStart(2, '0');
  return `habit-tracker-${year}-${month}-${day}.xlsx`;
}

export function buildSpreadsheetSheets(
  habits: readonly Habit[],
  completionsByHabit: ReadonlyMap<string, readonly ISODate[]>,
  reminders: readonly Reminder[],
  today: ISODate = todayDate(),
): SpreadsheetSheet[] {
  const habitsById = new Map(habits.map((habit) => [habit.id, habit]));

  const habitsSheet: SpreadsheetRow[] = habits.map((habit) => {
    const history = completionsByHabit.get(habit.id) ?? [];
    const streaks = computeStreaks(habit.schedule, history, today);
    return {
      [strings.spreadsheet.columnName]: habit.name,
      [strings.spreadsheet.columnSchedule]: scheduleLabel(habit.schedule),
      [strings.spreadsheet.columnCurrentStreak]: streaks.current,
      [strings.spreadsheet.columnLongestStreak]: streaks.longest,
      [strings.spreadsheet.columnLast30]: last30Percent(habit.schedule, history, today),
      [strings.spreadsheet.columnArchived]: yesNo(habit.archived),
      [strings.spreadsheet.columnCreatedAt]: formatDate(
        habit.createdAt.toISOString().slice(0, 10),
      ),
    };
  });

  const completionsSheet: SpreadsheetRow[] = [];
  for (const [habitId, dates] of completionsByHabit) {
    const habit = habitsById.get(habitId);
    if (!habit) continue;
    for (const date of [...dates].sort()) {
      completionsSheet.push({
        [strings.spreadsheet.columnHabit]: habit.name,
        [strings.spreadsheet.columnDate]: formatDate(date),
      });
    }
  }

  const remindersSheet: SpreadsheetRow[] = reminders.flatMap((reminder) => {
    const habit = habitsById.get(reminder.habitId);
    if (!habit) return [];
    return [
      {
        [strings.spreadsheet.columnHabit]: habit.name,
        [strings.spreadsheet.columnTime]: reminder.time,
        [strings.spreadsheet.columnEnabled]: yesNo(reminder.enabled),
      },
    ];
  });

  return [
    { name: strings.spreadsheet.habitsSheet, rows: habitsSheet },
    { name: strings.spreadsheet.completionsSheet, rows: completionsSheet },
    { name: strings.spreadsheet.remindersSheet, rows: remindersSheet },
  ];
}
