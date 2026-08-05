import { buildSpreadsheetSheets, spreadsheetFileName } from '@/core/domain/spreadsheet';
import { strings } from '@/core/i18n';
import type { Habit } from '@/features/habits/domain/entities/habit';
import type { Reminder } from '@/features/reminders/domain/entities/reminder';

const today = '2026-08-03';

const daily: Habit = {
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

const weekdays: Habit = {
  id: 'habit-2',
  name: 'Leer',
  icon: 'book',
  color: 'blue',
  schedule: { type: 'weekdays', days: ['mon', 'wed'] },
  sortOrder: 1,
  archived: true,
  createdAt: new Date('2026-06-15T08:00:00.000Z'),
  updatedAt: new Date('2026-06-15T08:00:00.000Z'),
};

const reminder: Reminder = {
  id: 'r-1',
  habitId: 'habit-1',
  time: '07:30',
  enabled: true,
  kind: 'main',
};

describe('spreadsheetFileName', () => {
  it('names the file by the export date', () => {
    expect(spreadsheetFileName(new Date('2026-08-03T10:00:00.000Z'))).toBe(
      'habit-tracker-2026-08-03.xlsx',
    );
  });
});

describe('buildSpreadsheetSheets', () => {
  const completionsByHabit = new Map([['habit-1', ['2026-08-01', '2026-08-02', '2026-08-03']]]);

  const sheets = buildSpreadsheetSheets(
    [daily, weekdays],
    completionsByHabit,
    [reminder],
    today,
  );

  it('produces one sheet per table, named for the app language', () => {
    expect(sheets.map((sheet) => sheet.name)).toEqual([
      strings.spreadsheet.habitsSheet,
      strings.spreadsheet.completionsSheet,
      strings.spreadsheet.remindersSheet,
    ]);
  });

  it('lists every habit, including archived ones, with its computed streaks', () => {
    const habitsSheet = sheets[0].rows;
    expect(habitsSheet).toHaveLength(2);

    const correr = habitsSheet[0];
    expect(correr[strings.spreadsheet.columnName]).toBe('Correr');
    expect(correr[strings.spreadsheet.columnCurrentStreak]).toBe(3);
    expect(correr[strings.spreadsheet.columnArchived]).toBe(strings.spreadsheet.no);

    const leer = habitsSheet[1];
    expect(leer[strings.spreadsheet.columnArchived]).toBe(strings.spreadsheet.yes);
  });

  it('flattens completions into one row per date, sorted', () => {
    const completionsSheet = sheets[1].rows;
    expect(completionsSheet.map((row) => row[strings.spreadsheet.columnDate])).toEqual([
      '01/08/2026',
      '02/08/2026',
      '03/08/2026',
    ]);
    expect(completionsSheet[0][strings.spreadsheet.columnHabit]).toBe('Correr');
  });

  it('lists reminders by habit name, not id', () => {
    const remindersSheet = sheets[2].rows;
    expect(remindersSheet).toEqual([
      {
        [strings.spreadsheet.columnHabit]: 'Correr',
        [strings.spreadsheet.columnTime]: '07:30',
        [strings.spreadsheet.columnEnabled]: strings.spreadsheet.yes,
      },
    ]);
  });

  it('has nothing to export when there are no habits', () => {
    const empty = buildSpreadsheetSheets([], new Map(), [], today);
    expect(empty.every((sheet) => sheet.rows.length === 0)).toBe(true);
  });
});
