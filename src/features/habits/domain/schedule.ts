import type { Schedule } from '@/features/habits/domain/entities/habit';
import { startOfWeek, weekdayOf, type ISODate } from '@/features/habits/domain/date';

export function isEligibleOn(schedule: Schedule, date: ISODate): boolean {
  switch (schedule.type) {
    case 'daily':
      return true;
    case 'weekdays':
      return schedule.days.includes(weekdayOf(date));
    case 'timesPerWeek':
      return true;
  }
}

export function isDueOn(
  schedule: Schedule,
  date: ISODate,
  completedDates: ReadonlySet<ISODate>,
): boolean {
  if (!isEligibleOn(schedule, date)) return false;
  if (schedule.type !== 'timesPerWeek') return true;

  if (completedDates.has(date)) return true;

  const weekStart = startOfWeek(date);
  let completedThisWeek = 0;
  for (const completed of completedDates) {
    if (startOfWeek(completed) === weekStart) completedThisWeek += 1;
  }

  return completedThisWeek < schedule.count;
}

export function streakUnit(schedule: Schedule): 'day' | 'week' {
  return schedule.type === 'timesPerWeek' ? 'week' : 'day';
}
