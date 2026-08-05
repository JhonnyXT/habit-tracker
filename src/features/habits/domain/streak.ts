import type { Schedule } from '@/features/habits/domain/entities/habit';
import { isEligibleOn, streakUnit } from '@/features/habits/domain/schedule';
import {
  addDays,
  startOfWeek,
  today as todayDate,
  type ISODate,
} from '@/features/habits/domain/date';

export type Streaks = {
  current: number;
  longest: number;
  unit: 'day' | 'week';
};

export function last30Percent(
  schedule: Schedule,
  completionDates: readonly ISODate[],
  today: ISODate = todayDate(),
): number {
  const completed = new Set(completionDates);

  let scheduled = 0;
  let done = 0;
  for (let offset = 0; offset < 30; offset += 1) {
    const day = addDays(today, -offset);
    if (!isEligibleOn(schedule, day)) continue;
    scheduled += 1;
    if (completed.has(day)) done += 1;
  }

  return scheduled === 0 ? 0 : Math.round((done / scheduled) * 100);
}

export function computeStreaks(
  schedule: Schedule,
  completionDates: readonly ISODate[],
  today: ISODate = todayDate(),
): Streaks {
  const completed = new Set(completionDates);
  const unit = streakUnit(schedule);

  if (unit === 'week') {
    return computeWeeklyStreaks(schedule, completed, today);
  }

  return computeDailyStreaks(schedule, completed, today);
}

function computeDailyStreaks(
  schedule: Schedule,
  completed: ReadonlySet<ISODate>,
  today: ISODate,
): Streaks {
  let cursor = today;
  if (isEligibleOn(schedule, today) && !completed.has(today)) {
    cursor = addDays(today, -1);
  }

  let current = 0;

  const oldest = earliest(completed);
  while (oldest && cursor >= oldest) {
    if (!isEligibleOn(schedule, cursor)) {
      cursor = addDays(cursor, -1);
      continue;
    }
    if (!completed.has(cursor)) break;
    current += 1;
    cursor = addDays(cursor, -1);
  }

  return { current, longest: Math.max(current, longestDaily(schedule, completed)), unit: 'day' };
}

function longestDaily(schedule: Schedule, completed: ReadonlySet<ISODate>): number {
  const sorted = [...completed].sort();
  if (sorted.length === 0) return 0;

  let longest = 0;
  let run = 0;
  let cursor = sorted[0];
  const last = sorted[sorted.length - 1];

  while (cursor <= last) {
    if (isEligibleOn(schedule, cursor)) {
      if (completed.has(cursor)) {
        run += 1;
        longest = Math.max(longest, run);
      } else {
        run = 0;
      }
    }
    cursor = addDays(cursor, 1);
  }

  return longest;
}

function computeWeeklyStreaks(
  schedule: Schedule,
  completed: ReadonlySet<ISODate>,
  today: ISODate,
): Streaks {
  const target = schedule.type === 'timesPerWeek' ? schedule.count : 1;

  const perWeek = new Map<ISODate, number>();
  for (const date of completed) {
    const week = startOfWeek(date);
    perWeek.set(week, (perWeek.get(week) ?? 0) + 1);
  }

  const currentWeek = startOfWeek(today);

  let cursor = currentWeek;
  if ((perWeek.get(currentWeek) ?? 0) < target) {
    cursor = addDays(currentWeek, -7);
  }

  let current = 0;
  while ((perWeek.get(cursor) ?? 0) >= target) {
    current += 1;
    cursor = addDays(cursor, -7);
  }

  const metWeeks = [...perWeek.entries()]
    .filter(([, count]) => count >= target)
    .map(([week]) => week)
    .sort();

  let longest = 0;
  let run = 0;
  let previous: ISODate | null = null;
  for (const week of metWeeks) {
    run = previous !== null && week === addDays(previous, 7) ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = week;
  }

  return { current, longest: Math.max(current, longest), unit: 'week' };
}

function earliest(completed: ReadonlySet<ISODate>): ISODate | null {
  let min: ISODate | null = null;
  for (const date of completed) {
    if (min === null || date < min) min = date;
  }
  return min;
}
