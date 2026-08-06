import {
  addDays,
  fromISODate,
  startOfWeek,
  toISODate,
  today as todayDate,
  type ISODate,
} from '@/features/habits/domain/date';

export const WEEK_LENGTH = 7;

export type StripCell = { date: ISODate } | null;

export type YearStrip = {
  cells: StripCell[];
  monthColumns: { column: number; date: ISODate }[];
  columns: number;
};

export type MonthCell = { date: ISODate; day: number; future: boolean } | null;

export type MonthGrid = {
  weeks: MonthCell[][];
  month: ISODate;
  canGoNext: boolean;
};

export function buildYearStrip(end: ISODate, days: number): YearStrip {
  const firstDay = addDays(end, -(days - 1));
  const gridStart = startOfWeek(firstDay);

  const cells: StripCell[] = [];
  for (let day = gridStart; day <= end; day = addDays(day, 1)) {
    cells.push(day < firstDay ? null : { date: day });
  }
  while (cells.length % WEEK_LENGTH !== 0) cells.push(null);

  const monthColumns: { column: number; date: ISODate }[] = [];
  let lastMonth = '';
  cells.forEach((cell, index) => {
    if (!cell) return;
    const month = cell.date.slice(0, 7);
    if (month === lastMonth) return;
    lastMonth = month;
    monthColumns.push({ column: Math.floor(index / WEEK_LENGTH), date: cell.date });
  });

  return { cells, monthColumns, columns: Math.ceil(cells.length / WEEK_LENGTH) };
}

export function startOfMonth(date: ISODate): ISODate {
  return `${date.slice(0, 7)}-01`;
}

export function shiftMonth(month: ISODate, delta: number): ISODate {
  const date = fromISODate(startOfMonth(month));
  date.setMonth(date.getMonth() + delta);
  return toISODate(date);
}

export function buildMonthGrid(month: ISODate, today: ISODate = todayDate()): MonthGrid {
  const first = startOfMonth(month);
  const last = addDays(shiftMonth(first, 1), -1);
  const gridStart = startOfWeek(first);

  const weeks: MonthCell[][] = [];
  let week: MonthCell[] = [];

  for (let day = gridStart; day <= last; day = addDays(day, 1)) {
    week.push(
      day < first
        ? null
        : { date: day, day: Number(day.slice(8)), future: day > today },
    );

    if (week.length === WEEK_LENGTH) {
      weeks.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    while (week.length < WEEK_LENGTH) week.push(null);
    weeks.push(week);
  }

  return { weeks, month: first, canGoNext: first < startOfMonth(today) };
}

export type DeadlineMonthCell = { date: ISODate; day: number; past: boolean } | null;

export type DeadlineMonthGrid = {
  weeks: DeadlineMonthCell[][];
  month: ISODate;
};

// Unlike buildMonthGrid (which marks completion-history days as `future` and
// forbids navigating past the current month), a deadline is always today or
// later — so this marks days before today as `past` instead, and never
// restricts forward navigation.
export function buildDeadlineMonthGrid(month: ISODate, today: ISODate = todayDate()): DeadlineMonthGrid {
  const first = startOfMonth(month);
  const last = addDays(shiftMonth(first, 1), -1);
  const gridStart = startOfWeek(first);

  const weeks: DeadlineMonthCell[][] = [];
  let week: DeadlineMonthCell[] = [];

  for (let day = gridStart; day <= last; day = addDays(day, 1)) {
    week.push(
      day < first
        ? null
        : { date: day, day: Number(day.slice(8)), past: day < today },
    );

    if (week.length === WEEK_LENGTH) {
      weeks.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    while (week.length < WEEK_LENGTH) week.push(null);
    weeks.push(week);
  }

  return { weeks, month: first };
}
