import { weekdays, type Weekday } from '@/features/habits/domain/entities/habit';

export type ISODate = string;

export function toISODate(date: Date): ISODate {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function fromISODate(iso: ISODate): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function today(): ISODate {
  return toISODate(new Date());
}

export function addDays(iso: ISODate, days: number): ISODate {
  const date = fromISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function isFuture(iso: ISODate): boolean {
  return iso > today();
}

export function weekdayOf(iso: ISODate): Weekday {
  const day = fromISODate(iso).getDay();
  return weekdays[(day + 6) % 7];
}

export function startOfWeek(iso: ISODate): ISODate {
  const date = fromISODate(iso);
  const offset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - offset);
  return toISODate(date);
}

export function daysBetween(a: ISODate, b: ISODate): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = fromISODate(b).getTime() - fromISODate(a).getTime();
  return Math.round(diff / msPerDay);
}
